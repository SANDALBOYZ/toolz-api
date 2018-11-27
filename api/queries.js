import dotenv from 'dotenv'

dotenv.config()

/**
 *  Constants
 */

export const EASYPOST_LOCATION_ID = process.env.EASYPOST_LOCATION_ID

/**
 *  Queries
 */

export const getProductVariantQuery = (barcode) => `
  query ProductVariants {
    productVariants(
      first: 2,
      query: "barcode:'${barcode}' location:'${EASYPOST_LOCATION_ID}' tag:'Online'"
    ) {
      edges {
        node {
          displayName
          id
          inventoryQuantity
          inventoryItem {
            id
          }
        }
      }
    }
  }
`

/**
 *  Mutations
 */

export const inventoryAdjustQuantityMutation = `
  mutation inventoryAdjustQuantity($input: InventoryAdjustQuantityInput!) {
    inventoryAdjustQuantity(input: $input) {
      userErrors {
        field
        message
      }
      inventoryLevel {
        id
        available
      }
    }
  }
`

export const inventoryBulkAdjustQuantityAtLocationMutation = `
  mutation inventoryBulkAdjustQuantityAtLocation($inventoryItemAdjustments: [InventoryAdjustItemInput!]!, $locationId: ID!) {
    inventoryBulkAdjustQuantityAtLocation(inventoryItemAdjustments: $inventoryItemAdjustments, locationId: $locationId) {
      userErrors {
        field
        message
      }
      inventoryLevels {
        id
        available
      }
    }
  }
`
