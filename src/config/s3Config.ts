import { S3Client } from '@aws-sdk/client-s3';

/**
 * S3 client configuration for DigitalOcean Spaces
 */
const s3Client = new S3Client({
  endpoint: process.env.SONG_BUCKET_ENDPOINT,
  region: process.env.SONG_BUCKET_REGION?.toLowerCase(),
  credentials: {
    accessKeyId: process.env.SONG_BUCKET_KEY!,
    secretAccessKey: process.env.SONG_BUCKET_SECRET!,
  },
  forcePathStyle: true, // Required for DigitalOcean Spaces
});

/**
 * Bucket name from environment variables
 */
export const BUCKET_NAME = process.env.SONG_BUCKET_NAME!;

export default s3Client;
