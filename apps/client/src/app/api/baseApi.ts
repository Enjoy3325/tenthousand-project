import { GraphQLClient } from 'graphql-request'
import { createApi } from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

const client = new GraphQLClient('http://localhost:4000/graphql')

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: graphqlRequestBaseQuery({ client }),
  tagTypes: ['Form', 'Response'],
  endpoints: () => ({}),
})