const express = require('express');
const cors = require('cors');
const uploadRouter = require('./routers/uploadRouter');

/**
 * Factory that builds the configured Express app.
 */
const createApp = () => {
  const app = express();
  app.use(cors());
  app.use('/', uploadRouter);
  return app;
};

module.exports = createApp;
