const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => {
  res.send('Audio upload backend is running.');
});

app.post('/upload', upload.single('audio'), (req, res) => {
  res.json({ message: 'File uploaded successfully', file: req.file });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
