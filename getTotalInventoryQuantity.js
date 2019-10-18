import { get } from 'lodash'
import {
  easypostApiClient
} from './api'
import { getInventories } from './helpers'

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
