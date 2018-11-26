import serverless from 'serverless-http'
import express from 'express'
import axios from 'axios'
import { GraphQLClient } from 'graphql-request'
import { chunk, get } from 'lodash'
import { getProductVariantQuery } from './queries'

const EASYPOST_URL = 'https://api.easypost.com/fulfillment/vendor/v2'
// TODO: Hide this token.
const EASYPOST_ACCESS_TOKEN = 'EZAKbc3be7c1d4354f94a4c367925c9f4e15BwHjsiAHjmGn0mYmXzr4Xw'

const easypostApiClient = axios.create({
  baseURL: EASYPOST_URL,
  auth: {
    username: EASYPOST_ACCESS_TOKEN
  }
})

const SHOPIFY_URL = 'https://sandalboyz-2.myshopify.com/admin/api/graphql.json'
// TODO: Hide this token.
const SHOPIFY_ACCESS_TOKEN = '6bac6225e2f221ad1262bde776b226cd'

const shopifyApiClient = new GraphQLClient(SHOPIFY_URL, {
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
  }
})

const app = express()

/**
 *  Grabs inventories from EasyPost for given `productIds`.
 *  @function
 *  @param {Array<String>} productIds - An array of EasyPost product IDs.
 *
 *  @return {Array<Object>} Returns an array of objects that correspond to the products and the warehouses they are housed at.
 */
const getInventories = async (productIds) => {
  const chunkedProductIds = chunk(productIds, 28)

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

app.get('/', async (req, res) => {
  try {
    const productsResponse = await easypostApiClient.get('/products', {
      params: {
        limit: 50,
        per_page: 50
      }
    })

    const products = get(productsResponse, 'data.products')

    const productIds = products.map(product => product.id)

    console.log(productIds)

    // const inventoriesResponse = await easypostApiClient.get('/inventories', {
    //   params: {
    //     product_ids: productIds,
    //     includes: ['product']
    //   }
    // })

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

      console.log('\n~~~ Inventory Difference ~~~')
      console.log(`~~~ ${get(productVariant, 'productVariants.edges[0].node.displayName')}`)
      console.log(`easypost: ${barcodeQuantityMap[barcode]}    shopify: ${shopifyQuantity}`)

      const correction = barcodeQuantityMap[barcode] - shopifyQuantity

      console.log(`correction (easypost quantity - shopify quantity): ${correction}`)

      if (correction) {
        console.log('fire off gql mutation to fix inventory quantity')
      }
    }

    console.log('Inventory quantities were synced.')

    res.send('Inventory quantities were synced.')
  } catch (e) {
    console.log(e)
    res.send('Oops, something broke!')
  }
})

export const handler = serverless(app)

export const hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event
    })
  }
}
