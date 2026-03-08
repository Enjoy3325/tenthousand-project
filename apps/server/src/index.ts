import { ApolloServer } from '@apollo/server'
import cors from 'cors'
import express from 'express'
import { expressMiddleware } from '@as-integrations/express5'
import { resolvers } from './resolvers/index.js';
import { typeDefs } from '@tenthousand/shared';

const app = express()

async function startServer(): Promise<void> {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  try {
    await server.start()

    app.use(
      '/graphql',
      cors<cors.CorsRequest>({ origin: 'http://localhost:5173' }),
      express.json(),
      expressMiddleware(server)
    )

    app.listen(4000, () => {
      console.log('🚀 Server ready at http://localhost:4000/graphql')
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

await startServer()