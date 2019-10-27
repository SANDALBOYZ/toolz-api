import axios from 'axios'
import { stripIndent, stripIndents } from 'common-tags'
import { get } from 'lodash'
import { parseString } from 'xml2js'
import { easyPostApiClient } from '../api'

const USER_ID = process.env.USPS_API_USER_ID
const USPS_API_URL =
  process.env.USPS_API_URL || 'https://secure.shippingapis.com/shippingapi.dll'

export const getOrderReturnsStatusHandler = async (event, context) => {
  try {
    console.log('Fetching `order_returns` from EasyPost')
    const orderReturnsResponse = await easyPostApiClient.get('/order_returns', {
      params: {
        limit: 30,
        per_page: 30
      }
    })

    // name: `order_returns[x].order.name`
    // origin zip: `order_returns[x].origin_address.zip`
    // origin city: `order_returns[x].origin_address.city`
    // tracking: `order_returns[x].tracking_code`
    // items: `order_returns[x].line_items[].product.title` or `order_returns[x].line_items[].product.barcode`

    const trackIdXmlString = orderReturnsResponse.data.order_returns.reduce(
      (xmlString, orderReturn) => {
        return stripIndents`
        ${xmlString}
        <TrackID ID="${orderReturn.tracking_code}" />
      `
      },
      ''
    )

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

    console.log(
      `Fetching tracking information for ${
        orderReturnsResponse.data.order_returns.length
      } shipments from USPS API`
    )
    const response = await axios.get(
      `${USPS_API_URL}?API=TrackV2&XML=${xmlRequestBody}`
    )

    console.log('Parsing XML...')

    let trackingResults
    parseString(response.data, (err, result) => {
      console.log(err)
      console.log(result)
      trackingResults = result
    })

    const orderReturnStatus = orderReturnsResponse.data.order_returns.map(
      orderReturn => {
        const trackingResult = trackingResults.TrackResponse.TrackInfo.find(
          trackInfo => {
            console.log(trackInfo)
            return trackInfo.$.ID === orderReturn.tracking_code
          }
        )

        return {
          id: orderReturn.tracking_code,
          name: orderReturn.order.name,
          origin: `${orderReturn.origin_address.city}, ${
            orderReturn.origin_address.zip
          }`,
          tracking: orderReturn.tracking_code,
          items: orderReturn.line_items
            .map(lineItem => lineItem.product.title)
            .join(', '),
          status: get(trackingResult, 'Status[0]') || 'Unavailable'
        }
      }
    )

    return {
      statusCode: 200,
      body: JSON.stringify(orderReturnStatus)
    }
  } catch (e) {
    console.error(e)
    return {
      statusCode: 500
    }
  }
}
