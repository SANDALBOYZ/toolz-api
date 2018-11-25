import serverless from 'serverless-http'
import express from 'express'
import axios from 'axios'
import { GraphQLClient } from 'graphql-request'
import { get } from 'lodash'
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

app.get('/', async (req, res) => {
  try {
    const productsResponse = await easypostApiClient.get('/products', {
      params: {
        limit: 10,
        per_page: 10
      }
    })

    const products = get(productsResponse, 'data.products')

    const productIds = products.map(product => product.id)

    const inventoriesResponse = await easypostApiClient.get('/inventories', {
      params: {
        product_ids: productIds,
        includes: ['product']
      }
    })

    const inventories = inventoriesResponse.data.inventories

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

    console.log('Inventory quantities were updated.')

    res.send('')
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
