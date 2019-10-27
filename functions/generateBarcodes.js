import axios from 'axios'

export const generateBarcodesHandler = async (event, context) => {
  const file = await axios.get('http://www.barcode-generator.org/zint/api.php?bc_number=20&bc_data=BARCODE04&bc_download=1&bc_format=1&bc_size=l')

  console.log(file)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello!',
      input: event
    })
  }
}
