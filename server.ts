import createApp from './src/app';

/**
 * Boots the Express app and starts listening on the configured port.
 */
const app = createApp();
const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
