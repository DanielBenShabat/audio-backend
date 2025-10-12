/**
 * Configures Multer storage to write uploads into the uploads/ dir.
 */
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadSingleAudio = multer({ storage }).single('audio');

module.exports = {
  uploadSingleAudio,
};
