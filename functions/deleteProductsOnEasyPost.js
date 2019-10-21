/**
 * Given an array of barcode prefixes, this function will delete all products with that prefix on EasyPost.
 * @param {Array<String>} barcodePrefixes
 */
async function deleteProductsOnEasyPost (barcodePrefixes) {
  console.log(barcodePrefixes)
}

export const deleteProductsOnEasyPostHandler = async (event, context) => {
  console.log(event)
  console.log(context)

  return {
    statusCode: 200
  }
}
