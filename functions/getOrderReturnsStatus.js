import axios from 'axios'
import { stripIndent, stripIndents } from 'common-tags'
import { parseString } from 'xml2js'
import { easyPostApiClient } from '../api'

const USER_ID = process.env.USPS_API_USER_ID
const USPS_API_URL = process.env.USPS_API_URL || 'https://secure.shippingapis.com/shippingapi.dll'

export const getOrderReturnsStatusHandler = async (event, context) => {
  console.log('Fetching `order_returns` from EasyPost')
  const orderReturnsResponse = await easyPostApiClient.get('/order_returns', {
    params: {
      limit: 50,
      per_page: 50
    }
  })

  // name: `order_returns[x].order.name`
  // origin zip: `order_returns[x].origin_address.zip`
  // origin city: `order_returns[x].origin_address.city`
  // tracking: `order_returns[x].tracking_code`
  // items: `order_returns[x].line_items[].product.title` or `order_returns[x].line_items[].product.barcode`

  const trackIdXmlString = orderReturnsResponse.data.order_returns.reduce((xmlString, orderReturn) => {
    return stripIndents`
      ${xmlString}
      <TrackID ID="${orderReturn.tracking_code}" />
    `
  }, '')

  // const trackId = '9405536895357093744150'
  // const xmlRequest = stripIndent`
  //   <TrackRequest USERID="${USER_ID}">
  //     <TrackID ID="${trackId}" />
  //   </TrackRequest>
  // `

  const xmlRequestBody = stripIndent`
    <TrackFieldRequest USERID="${USER_ID}">
      <Revision>1</Revision>
      <ClientIp>111.0.0.1</ClientIp>
      <SourceId>XYZ Corp</SourceId>
      ${trackIdXmlString}
    </TrackFieldRequest>
  `

  console.log(`Fetching tracking information for ${orderReturnsResponse.data.order_returns.length} shipments from USPS API`)
  const response = await axios.get(`${USPS_API_URL}?API=TrackV2&XML=${xmlRequestBody}`)

  console.log('Parsing XML...')

  let trackingResult
  parseString(response.data, (err, result) => {
    console.log(err)
    console.log(result)
    trackingResult = result
  })

  console.log('\n\n\n')

  return {
    statusCode: 200,
    body: JSON.stringify(trackingResult)
  }
}
