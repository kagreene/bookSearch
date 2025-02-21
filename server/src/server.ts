import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import db from './config/connection.js';
// import routes from './routes/index.js';
import { typeDefs, resolvers } from './schemas/index.js';
import { authenticateToken } from './services/auth.js';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();
  await db;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server as any, 
    {context: authenticateToken as any}
  ));

    // if we're in production, serve client/dist as static assets
    if (process.env.NODE_ENV === 'production') {
      const _filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(_filename);

      app.use(express.static(path.join(__dirname, '../../client/dist')));
  
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
      });
    }
    
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
};

startApolloServer();



