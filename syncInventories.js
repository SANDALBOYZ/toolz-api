import chalk from 'chalk'
import { chunk, get } from 'lodash'
import { easypostApiClient, shopifyApiClient, getProductVariantQuery } from './api'

// The EasyPost `/inventories` endpoint can only intake a certain amount of `product_ids`.
const MAX_EASYPOST_INVENTORIES_PRODUCT_IDS = 28

/**
 *  Grabs inventories from EasyPost for given `productIds`.
 *  @param  {Array<String>} `productIds` - An array of EasyPost product IDs.
 *
 *  @return {Array<Object>} Returns an array of objects that correspond to the
 *                          products and the warehouses they are housed at.
 */
const getInventories = async (productIds) => {
  const chunkedProductIds = chunk(productIds, MAX_EASYPOST_INVENTORIES_PRODUCT_IDS)

  let inventoriesArray = []

  for (const productIdsChunk of chunkedProductIds) {
    const inventoriesResponse = await easypostApiClient.get('/inventories', {
      params: {
        product_ids: productIdsChunk,
        includes: ['product']
      }
    })

    const inventories = inventoriesResponse.data.inventories
    console.log(inventories)

    inventoriesArray = inventoriesArray.concat(inventories)
  }

  return inventoriesArray
}

const syncInventories = async () => {
  try {
    const productsResponse = await easypostApiClient.get('/products', {
      params: {
        limit: 200,
        per_page: 200
      }
    })

    const products = get(productsResponse, 'data.products')

    const productIds = products.map(product => product.id)

    console.log('Product IDs:', productIds)

    console.log('Using `getInventories`!')
    const inventories = await getInventories(productIds)

    console.log('Inventories:', inventories)

    // A map of total quantities available through EasyPost.
    const barcodeQuantityMap = inventories.reduce((memo, inventory) => {
      if (!memo[inventory.product.barcode]) {
        memo[inventory.product.barcode] = 0
      }

      memo[inventory.product.barcode] += inventory.quantity

      return memo
    }, {})

    for (let barcode in barcodeQuantityMap) {
      const productVariant = await shopifyApiClient.request(getProductVariantQuery(barcode))
      const shopifyQuantity = get(productVariant, 'productVariants.edges[0].node.inventoryQuantity')

      console.log('\n')
      console.log(`~~~ ${chalk.blue.bold(barcode)}`)
      console.log(`~~~ ${get(productVariant, 'productVariants.edges[0].node.displayName')}`)
      console.log(`EasyPost: ${barcodeQuantityMap[barcode]}    Shopify: ${shopifyQuantity}`)

      const correction = barcodeQuantityMap[barcode] - shopifyQuantity

      console.log(`Correction (EasyPost qty - Shopify qty): ${correction}`)

      if (correction) {
        console.log('Making call to Shopify to correct inventory! 🚀')
      }
    }

    console.log(`\n${chalk.green('Inventory quantities were synced! ✅')}`)
  } catch (e) {
    console.log(`\n${chalk.red('Oops, something broke. 🧐')}`)
    console.log(e)
  }
}

export const handler = async (event, context) => {
  syncInventories()

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'EasyPost <> Shopify product inventory sync started! This is an asynchronous process. Check the logs for more details.',
      input: event
    })
  }
}
