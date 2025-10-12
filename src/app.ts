import express, { Express } from 'express';
import cors from 'cors';
import uploadRouter from './routers/uploadRouter';

/**
 * Factory that builds the configured Express app.
 */
const createApp = (): Express => {
  const app = express();
  app.use(cors());
  app.use('/', uploadRouter);
  return app;
};

export default createApp;
