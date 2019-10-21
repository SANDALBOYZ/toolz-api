import dotenv from 'dotenv'
import axios from 'axios'
import { GraphQLClient } from 'graphql-request'

dotenv.config()

const EASYPOST_URL = 'https://api.easypost.com/fulfillment/vendor/v2'
const EASYPOST_ACCESS_TOKEN = process.env.EASYPOST_ACCESS_TOKEN

export const easyPostApiClient = axios.create({
  baseURL: EASYPOST_URL,
  auth: {
    username: EASYPOST_ACCESS_TOKEN
  }
})

const SHOPIFY_URL = 'https://sandalboyz-2.myshopify.com/admin/api/graphql.json'
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

export const shopifyApiClient = new GraphQLClient(SHOPIFY_URL, {
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
  }
})
