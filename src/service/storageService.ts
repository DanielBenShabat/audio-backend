import multer from 'multer';
import multerS3 from 'multer-s3';
import s3Client, { BUCKET_NAME } from '../config/s3Config';

/**
 * Multer S3 storage configuration for DigitalOcean Spaces
 */
const storage = multerS3({
  s3: s3Client,
  bucket: BUCKET_NAME,
  acl: 'private',
  key: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/**
 * Multer middleware that uploads a single audio file directly to DigitalOcean Spaces.
 */
export const uploadSingleAudio = multer({ storage }).single('audio');
