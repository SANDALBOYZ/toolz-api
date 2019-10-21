/* eslint-env jest */
import faker from 'faker'
import { getInventories } from './helpers'
import { easyPostApiClient } from '../api'

describe('getInventories', () => {
  it('gets inventories for an array of product ids', async () => {
    easyPostApiClient.get = jest.fn(() => {
      return {
        data: {
          inventories: [
            {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            },
            {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            },
            {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            },
            {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            },
            {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            },
            {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            },
            {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            },
            {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            }
          ]
        }
      }
    })

    const productIds = Array(8).fill().map((_, i) => `prod_${faker.random.number()}`)

    const inventories = await getInventories(productIds)

    expect(easyPostApiClient.get).toHaveBeenCalled()
    expect(easyPostApiClient.get.mock.calls.length).toEqual(1)
    expect(inventories.length).toEqual(productIds.length)
  })

  it('gets inventories for an array of product ids (over 28) by chunking', async () => {
    // Mock this to return 28 objects in an array each time it is called. Must match the `productIds` below!
    easyPostApiClient.get = jest.fn(() => {
      return {
        data: {
          inventories: Array(28).fill().map((_, i) => {
            return {
              warehouse_id: 'wh_d2928d2c96254f55988ce064e8b87ea2',
              product: {
                id: 'prod_94699466b46f4c6ba00d7c1d5779f9c5'
              },
              quantity: 0
            }
          })
        }
      }
    })

    const productIds = Array(56).fill().map((_, i) => `prod_${faker.random.number()}`)

    const inventories = await getInventories(productIds)

    expect(easyPostApiClient.get).toHaveBeenCalled()
    expect(easyPostApiClient.get.mock.calls.length).toEqual(2)
    expect(inventories.length).toEqual(productIds.length)
  })
})
