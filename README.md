Branch `master`

[![CircleCI](https://circleci.com/gh/SANDALBOYZ/toolz-api/tree/master.svg?style=svg)](https://circleci.com/gh/SANDALBOYZ/toolz-api/tree/master)

# toolz-api

This is a collection of small functions — lambdas — that are used to manage various interactions between services that SANDALBOYZ uses.
One might refer to this collection of lambdas as a "serverless backend API".

## Stack 🍔

- [serverless](https://serverless.com/)
- webpack + Babel
- AWS Lambda

## References

- [EasyPost API](https://gist.github.com/att14/ff68a0f2684c711444864dcb1ebf6030)
- [Shopify GraphQL Admin API](https://help.shopify.com/en/api/graphql-admin-api)
- [USPS API](https://www.usps.com/business/web-tools-apis/)

## Development 🚧

1. Use `yarn` to install dependencies.
2. Then, run `yarn dev` to host the services locally.
3. Hit an endpoint by going to `localhost:3000`.

## Deployment 🚀

```
sls deploy --aws-profile <AWS_PROFILE_NAME>
```
