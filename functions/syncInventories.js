import chalk from 'chalk'
import { chunk, get } from 'lodash'
import {
  easyPostApiClient,
  shopifyApiClient,
  getProductVariantQuery,
  inventoryBulkAdjustQuantityAtLocationMutation,
  EASYPOST_LOCATION_ID
} from '../api'
import { getInventories } from './helpers'

const SHOPIFY_MAX_INVENTORIES_PRODUCT_IDS =
  process.env.SHOPIFY_MAX_INVENTORIES_PRODUCT_IDS || 100

/**
 *  Syncs Shopify product quantities to the quantities at EasyPost.
 */
const syncInventories = async () => {
  try {
    const productsResponse = await easyPostApiClient.get('/products', {
      params: {
        limit: 300,
        per_page: 300
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

    const inventoryItemAdjustments = []

    for (const barcode in barcodeQuantityMap) {
      const productVariant = await shopifyApiClient.request(
        getProductVariantQuery(barcode)
      )
      const shopifyQuantity = get(
        productVariant,
        'productVariants.edges[0].node.inventoryQuantity'
      )

      console.log('\n')
      console.log(`~~~ ${chalk.blue.bold(barcode)}`)
      console.log(
        `~~~ ${get(
          productVariant,
          'productVariants.edges[0].node.displayName'
        )}`
      )
      console.log(
        `EasyPost: ${
          barcodeQuantityMap[barcode]
        }    Shopify: ${shopifyQuantity}`
      )

      const correction = barcodeQuantityMap[barcode] - shopifyQuantity

      console.log(`Correction (EasyPost qty - Shopify qty): ${correction}`)

      if (correction) {
        inventoryItemAdjustments.push({
          availableDelta: Number(correction),
          inventoryItemId: get(
            productVariant,
            'productVariants.edges[0].node.inventoryItem.id'
          )
        })
      }
    }

    if (inventoryItemAdjustments.length) {
      console.log('Making calls to Shopify to correct inventory! 🚀')

      chunk(
        inventoryItemAdjustments,
        SHOPIFY_MAX_INVENTORIES_PRODUCT_IDS
      ).forEach(async inventoryItemAdjustmentsChunk => {
        const result = await shopifyApiClient.request(
          inventoryBulkAdjustQuantityAtLocationMutation,
          {
            locationId: EASYPOST_LOCATION_ID,
            inventoryItemAdjustments: inventoryItemAdjustmentsChunk
          }
        )

        console.log(`\n${chalk.green('Inventory quantity chunk synced! ✅')}`)
        console.log(result)
      })
    }

    console.log(`\n${chalk.green('End of code reached.')}`)
  } catch (e) {
    console.log(`\n${chalk.red('Oops, something broke. 🧐')}`)
    console.log(e)
  }
}

export const syncInventoriesHandler = async (event, context) => {
  syncInventories()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      message:
        'EasyPost <> Shopify product inventory sync started! This is an asynchronous process. Check the logs (`sls logs -f <appName>`) for more details.',
      input: event
    })
  }
}
