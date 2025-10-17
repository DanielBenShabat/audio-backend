import { Request, Response } from 'express';
import s3Client, { BUCKET_NAME } from '../config/s3Config';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';

/**
 * Test controller for debugging S3 connection and bucket status
 */
export const handleS3Test = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing S3 connection...');
    console.log('Bucket name:', BUCKET_NAME);
    console.log('S3 client config:', {
      endpoint: process.env.SONG_BUCKET_ENDPOINT,
      region: process.env.SONG_BUCKET_REGION,
      hasCredentials: !!(process.env.SONG_BUCKET_KEY && process.env.SONG_BUCKET_SECRET),
      accessKey: process.env.SONG_BUCKET_KEY?.substring(0, 8) + '...',
      secretKey: process.env.SONG_BUCKET_SECRET?.substring(0, 8) + '...'
    });

    // Test basic S3 connection by listing objects
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1
    });

    console.log('Attempting ListObjectsV2 with command:', {
      bucket: BUCKET_NAME,
      maxKeys: 1
    });

    const response = await s3Client.send(command);
    
    res.json({
      success: true,
      message: 'S3 connection successful',
      bucket: BUCKET_NAME,
      objectCount: response.KeyCount || 0,
      isTruncated: response.IsTruncated,
      hasContents: !!(response.Contents && response.Contents.length > 0),
      firstObject: response.Contents?.[0]?.Key || null
    });

  } catch (error) {
    console.error('S3 test error:', error);
    const errorObj = error as Error;
    res.status(500).json({
      success: false,
      error: errorObj.name || 'UnknownError',
      message: errorObj.message,
      bucket: BUCKET_NAME
    });
  }
};
