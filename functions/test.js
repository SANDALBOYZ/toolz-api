import axios from 'axios'
import { stripIndent } from 'common-tags'
import { parseString } from 'xml2js'

export const testHandler = async (event, context) => {
  const USER_ID = '130SANDA3365'
  const USPS_API_URL = 'https://secure.shippingapis.com/shippingapi.dll?API=TrackV2&XML='

  const requestTracking = (xmlRequest) => `${USPS_API_URL}${xmlRequest}`

  const trackId = '9405536895357093744150'
  // const xmlRequest = stripIndent`
  //   <TrackRequest USERID="${USER_ID}">
  //     <TrackID ID="${trackId}" />
  //   </TrackRequest>
  // `

  const xmlRequest = stripIndent`
    <TrackFieldRequest USERID="${USER_ID}">
      <Revision>1</Revision>
      <ClientIp>111.0.0.1</ClientIp>
      <SourceId>XYZ Corp</SourceId>
      <TrackID ID="${trackId}" />
    </TrackFieldRequest>
  `

  console.log(xmlRequest)

  console.log(requestTracking(xmlRequest))

  const response = await axios.get(requestTracking(xmlRequest))

  console.log(response)

  console.log('\n\n\n')

  parseString(response.data, (err, result) => {
    console.log(err)
    console.log(result)
  })

  console.log(response.data)

  console.log('\n\n\n')

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello, world!',
      input: event
    })
  }
}
