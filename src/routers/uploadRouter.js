/**
 * Upload routes broke out for clarity and reuse.
 */
const express = require('express');
const { healthCheck, handleUpload } = require('../controller/uploadController');

const router = express.Router();

router.get('/', healthCheck);
router.post('/upload', handleUpload);

module.exports = router;
