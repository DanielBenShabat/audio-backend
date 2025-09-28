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

app.post('/upload', upload.single('audio'), (req, res) => {
  res.json({ message: 'File uploaded successfully', file: req.file });
});

app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
