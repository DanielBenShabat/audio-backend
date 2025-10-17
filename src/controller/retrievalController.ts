import { Request, Response } from 'express';
import { generatePresignedUrl, validateFileExists, getRandomSongs } from '../service/retrievalService';

/**
 * Handles file retrieval requests by generating presigned URLs
 */
export const handleFileRetrieval = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileKey } = req.params;
    const { expiration } = req.query;

    if (!fileKey) {
      res.status(400).json({ 
        error: 'File key is required',
        message: 'Please provide a file key in the URL path' 
      });
      return;
    }

    // Validate file exists before generating URL
    const fileExists = await validateFileExists(fileKey);
    if (!fileExists) {
      res.status(404).json({ 
        error: 'File not found',
        message: 'The requested file does not exist in the bucket' 
      });
      return;
    }

    // Parse expiration time (default: 1 hour)
    const expirationSeconds = expiration 
      ? parseInt(expiration as string, 10) 
      : 3600;

    if (isNaN(expirationSeconds) || expirationSeconds <= 0) {
      res.status(400).json({ 
        error: 'Invalid expiration time',
        message: 'Expiration must be a positive number of seconds' 
      });
      return;
    }

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(fileKey, expirationSeconds);

    res.json({
      success: true,
      fileKey,
      presignedUrl,
      expirationSeconds,
      expiresAt: new Date(Date.now() + expirationSeconds * 1000).toISOString(),
    });

  } catch (error) {
    console.error('Error in file retrieval:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate file access URL' 
    });
  }
};

/**
 * Handles random songs listing requests
 */
export const handleRandomSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { count } = req.query;
    
    // Parse count parameter (default: 3, max: 10)
    const songCount = count 
      ? Math.min(Math.max(parseInt(count as string, 10), 1), 10)
      : 3;

    if (isNaN(songCount) || songCount <= 0) {
      res.status(400).json({ 
        error: 'Invalid count parameter',
        message: 'Count must be a positive number between 1 and 10' 
      });
      return;
    }

    // Get random songs from the bucket
    const randomSongs = await getRandomSongs(songCount);

    if (randomSongs.length === 0) {
      res.json({
        success: true,
        message: 'No audio files found in the bucket',
        songs: [],
        count: 0
      });
      return;
    }

    res.json({
      success: true,
      message: `Retrieved ${randomSongs.length} random song(s)`,
      songs: randomSongs,
      count: randomSongs.length
    });

  } catch (error) {
    console.error('Error in random songs retrieval:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve random songs' 
    });
  }
};
