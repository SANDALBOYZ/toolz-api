import serverless from 'serverless-http'
import express from 'express'
import axios from 'axios'
import { GraphQLClient } from 'graphql-request'

const EASYPOST_URL = 'https://api.easypost.com/fulfillment/vendor/v2'
const EASYPOST_ACCESS_TOKEN = 'EZAKbc3be7c1d4354f94a4c367925c9f4e15BwHjsiAHjmGn0mYmXzr4Xw'
const EASYPOST_API = axios.create({
  baseURL: EASYPOST_URL,
  auth: {
    username: EASYPOST_ACCESS_TOKEN
  }
})

// const SHOPIFY_URL = 'https://sandalboyz-2.myshopify.com/admin/api/graphql.json'
// const SHOPIFY_ACCESS_TOKEN = '6bac6225e2f221ad1262bde776b226cd'
// const SHOPIFY_API = new GraphQLClient(SHOPIFY_URL, {
//   headers: {
//     'Content-Type': 'application/graphql',
//     'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
//   }
// })
//
// const query = `
// `

const app = express()

// app.get('/', async (req, res) => {
//   try {
//     const response = await EASYPOST_API.get('/products')
//
//     res.send(response)
//   } catch (e) {
//     res.send(e)
//   }
// })

app.get('/', async (req, res) => {
  try {
    const response = await EASYPOST_API.get('/products', {
      params: {
        limit: 1000,
        per_page: 1000
      }
    })

    console.log(response.data)

    res.send(response.data)
  } catch (e) {
    console.log(e)
    res.send('oops')
  }
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
