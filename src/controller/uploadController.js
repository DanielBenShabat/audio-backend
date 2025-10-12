/**
 * Upload controller wires request lifecycle to storage services.
 */
const { uploadSingleAudio } = require('../service/storageService');

const healthCheck = (req, res) => {
  res.send('Audio upload backend is running.');
};

const handleUpload = (req, res, next) => {
  uploadSingleAudio(req, res, (err) => {
    if (err) {
      return next(err);
    }
    res.json({ message: 'File uploaded successfully', file: req.file });
  });
};

module.exports = {
  healthCheck,
  handleUpload,
};
