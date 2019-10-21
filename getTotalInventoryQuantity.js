import { get } from 'lodash'
import {
  easypostApiClient
} from './api'
import { getInventories } from './helpers'

// Change the array below to NOT count certain barcodes.
const INVENTORY_BARCODE_BLACKLIST = [
  // Core Embroidered Sock
  '18CCSO1BL',
  '18CCSO1WH',
  '18CCSO1GR',
  // Core Rope Sock
  '18CCS2B',
  '18CCS2G',
  '18CCS2W',
  // BBC Sock
  '18BBCAOS'
]

/**
 *  Returns the total number of units in El Monte
 */
async function getTotalInventoryQuantity () {
  const productsResponse = await easypostApiClient.get('/products', {
    params: {
      limit: 250,
      per_page: 250
    }
  })
  const products = get(productsResponse, 'data.products')
  const productIds = products.map(product => product.id)

  const inventories = await getInventories(productIds)

  const total = inventories.reduce((memo, inventory) => {
    if (INVENTORY_BARCODE_BLACKLIST.includes(inventory.product.barcode)) {
      return memo
    }

    return memo + inventory.quantity
  }, 0)

  return total
}

export const handler = async (event, context) => {
  const total = await getTotalInventoryQuantity()

  console.log(`Total units at EasyPost: ${total}`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Total units at EasyPost: ${total}`,
      input: event
    })
  }
}
