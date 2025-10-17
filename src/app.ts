import express, { Express } from 'express';
import cors from 'cors';
import uploadRouter from './routers/uploadRouter';
import retrievalRouter from './routers/retrievalRouter';

/**
 * Factory that builds the configured Express app.
 */
const createApp = (): Express => {
  const app = express();
  app.use(cors());
  app.use('/', uploadRouter);
  app.use('/files', retrievalRouter);
  return app;
};

export default createApp;
