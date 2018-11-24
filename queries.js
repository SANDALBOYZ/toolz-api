/**
 *  Queries
 */

export const getProductVariant = (barcode) => `
  query ProductVariants {
    productVariants(
      first: 2,
      query: "barcode:'${barcode}' location:'gid://shopify/Location/7909146740' tag:'Online'"
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

export const inventoryAdjustQuantity = `
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
