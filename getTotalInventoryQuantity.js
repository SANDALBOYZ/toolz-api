import chalk from 'chalk'
import { chunk, get } from 'lodash'
import {
  easypostApiClient,
  shopifyApiClient,
  getProductVariantQuery,
  inventoryBulkAdjustQuantityAtLocationMutation,
  EASYPOST_LOCATION_ID
} from './api'

// The EasyPost `/inventories` endpoint can only intake a certain amount of `product_ids`.
const EASYPOST_MAX_INVENTORIES_PRODUCT_IDS = 28

const SHOPIFY_MAX_INVENTORIES_PRODUCT_IDS = 100

/**
 *  Returns the total number of units in El Monte
 */
async function getTotalInventoryQuantity() {
  const productsResponse = await easypostApiClient.get('/products', {
    params: {
      limit: 250,
      per_page: 250
    }
  })

  const inventories = await getInventories(productIds)

  const total = inventories.reduce((memo, inventory) => {
    return memo + inventory.quantity
  }, 0)

  return total
}

export const handler = async (event, context) => {
  const total = await getTotalInventoryQuantity()

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Total units at EasyPost: ${total}`,
      input: event
    })
  }
}
