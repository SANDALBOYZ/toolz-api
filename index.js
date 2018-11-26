import serverless from 'serverless-http'
import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('index.js')
})

export const handler = serverless(app)

export const hello = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event
    })
  }
}
