import multer from 'multer';
import s3Client, { BUCKET_NAME } from '../config/s3Config';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Multer memory storage to capture file size before S3 upload
 */
const memoryStorage = multer.memoryStorage();

/**
 * Multer middleware that stores file in memory first to get file size
 */
export const uploadSingleAudio = multer({ storage: memoryStorage }).single('audio');

/**
 * Upload file to S3 after getting file size from memory
 */
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const key = `${Date.now()}-${file.originalname}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private'
  });
  
  await s3Client.send(command);
  return key;
};

/**
 * Delete file from S3 bucket
 * @param key - The S3 key of the file to delete
 * @returns Promise<boolean> - True if file was deleted successfully
 */
export const deleteFromS3 = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    // Check if it's a "NoSuchKey" error (file doesn't exist)
    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      console.warn(`File not found in S3 (may have already been deleted): ${key}`);
      return true; // Consider this a success since the file is gone
    }
    
    console.error(`Failed to delete file from S3: ${key}`, error);
    return false;
  }
};
