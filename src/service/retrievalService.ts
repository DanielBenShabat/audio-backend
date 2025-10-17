import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client, { BUCKET_NAME } from '../config/s3Config';

/**
 * Generates a presigned URL for accessing a private file in DigitalOcean Spaces
 * @param fileKey - The key/name of the file in the bucket
 * @param expirationSeconds - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise<string> - The presigned URL
 */
export const generatePresignedUrl = async (
  fileKey: string,
  expirationSeconds: number = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate file access URL');
  }
};

/**
 * Validates if a file key exists in the bucket (optional utility function)
 * @param fileKey - The key/name of the file to check
 * @returns Promise<boolean> - Whether the file exists
 */
export const validateFileExists = async (fileKey: string): Promise<boolean> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Lists all objects in the bucket and returns 3 random ones
 * @param count - Number of random songs to return (default: 3)
 * @returns Promise<Array<{key: string, size: number, lastModified: Date}>> - Array of random song objects
 */
export const getRandomSongs = async (count: number = 3): Promise<Array<{key: string, size: number, lastModified: Date}>> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000, // Get up to 1000 objects to have a good selection for randomization
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      return [];
    }

    // Filter out any non-audio files (optional, based on file extensions)
    const audioFiles = response.Contents.filter(obj => {
      const key = obj.Key || '';
      return key.match(/\.(mp3|wav|flac|m4a|aac|ogg)$/i);
    });

    if (audioFiles.length === 0) {
      return [];
    }

    // Shuffle the array and take the requested number
    const shuffled = audioFiles.sort(() => 0.5 - Math.random());
    const selectedCount = Math.min(count, shuffled.length);
    
    return shuffled.slice(0, selectedCount).map(obj => ({
      key: obj.Key!,
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
    }));

  } catch (error) {
    console.error('Error listing random songs:', error);
    throw new Error('Failed to retrieve random songs from bucket');
  }
};
