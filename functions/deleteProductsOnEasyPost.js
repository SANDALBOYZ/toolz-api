import { get } from 'lodash'
import { easyPostApiClient } from '../api'

/**
 * Given an array of barcode prefixes, this function will delete all products with that prefix on EasyPost.
 * @param {Array<String>} barcodePrefixes
 */
async function deleteProductsOnEasyPost (barcodePrefixes) {
  const barcodeRegEx = new RegExp(`^(${barcodePrefixes.join('|')})`)

  console.log(`barcodeRegEx: ${barcodeRegEx}`)

  const productsResponse = await easyPostApiClient.get('/products', {
    params: {
      limit: 250,
      per_page: 250
    }
  })

  const products = get(productsResponse, 'data.products')

  const productsToDelete = products.filter(product =>
    barcodeRegEx.test(product.barcode)
  )

  productsToDelete.forEach(async (product) => {
    console.log(`Deleting ${product.title}, ${product.barcode}`)
    try {
      await easyPostApiClient.delete(`/products/${product.id}`)
      console.log('✅')
    } catch (e) {
      console.log(`Error deleting product! ${e}`)
    }
  })
}

export const deleteProductsOnEasyPostHandler = async (event, context) => {
  await deleteProductsOnEasyPost(event.multiValueQueryStringParameters.barcodePrefixes)

  return {
    statusCode: 200
  }
}
