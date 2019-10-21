import dotenv from 'dotenv'
import axios from 'axios'
import { GraphQLClient } from 'graphql-request'

dotenv.config()

const EASYPOST_API_URL = process.env.EASYPOST_API_URL || 'https://api.easypost.com/fulfillment/vendor/v2'
const EASYPOST_ACCESS_TOKEN = process.env.EASYPOST_ACCESS_TOKEN

export const easyPostApiClient = axios.create({
  baseURL: EASYPOST_API_URL,
  auth: {
    username: EASYPOST_ACCESS_TOKEN
  }
})

const SHOPIFY_ADMIN_API_URL = process.env.SHOPIFY_ADMIN_API_URL
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN

export const shopifyApiClient = new GraphQLClient(SHOPIFY_ADMIN_API_URL, {
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN
  }
})
