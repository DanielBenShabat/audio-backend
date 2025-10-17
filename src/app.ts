import express, { Express } from 'express';
import cors from 'cors';
import uploadRouter from './routers/uploadRouter';
import retrievalRouter from './routers/retrievalRouter';
import testRouter from './testing/testRouter';

/**
 * Factory that builds the configured Express app.
 */
const createApp = (): Express => {
  const app = express();
  app.use(cors());
  app.use('/', uploadRouter);
  app.use('/files', retrievalRouter);
  app.use('/test', testRouter);
  return app;
};

export default createApp;
