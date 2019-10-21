import { chunk } from 'lodash'
import { easypostApiClient } from '../api'

const EASYPOST_MAX_INVENTORIES_PRODUCT_IDS = process.env.EASYPOST_MAX_INVENTORIES_PRODUCT_IDS || 28

/**
 *  Grabs inventories from EasyPost for given `productIds`.
 *  @param  {Array<String>} `productIds` - An array of EasyPost product IDs.
 *
 *  @return {Array<Object>} Returns an array of objects that correspond to the
 *                          products and the warehouses they are housed at.
 */
export const getInventories = async (productIds) => {
  const chunkedProductIds = chunk(productIds, EASYPOST_MAX_INVENTORIES_PRODUCT_IDS)

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
