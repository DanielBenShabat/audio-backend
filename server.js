const createApp = require('./src/app');

const app = createApp();
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
