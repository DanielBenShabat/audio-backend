import { Request, Response } from 'express';
import { generatePresignedUrl, validateFileExists, getRandomSongWithUrl, getAllSongsWithUrls, getSongByIdWithUrl } from '../service/retrievalService';
import { deleteSong } from '../service/databaseService';
import { deleteFromS3 } from '../service/storageService';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client, { BUCKET_NAME } from '../config/s3Config';


/**
 * Helper function to handle errors consistently
 */
const handleError = (res: Response, error: unknown, message: string): void => {
  console.error(message, error);
  res.status(500).json({ 
    error: 'Internal server error',
    message 
  });
};

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
    handleError(res, error, 'Failed to generate file access URL');
  }
};

/**
 * Handles random songs listing requests - now returns single random song with full metadata
 */
export const handleRandomSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get a single random song with presigned URL and full metadata
    const randomSong = await getRandomSongWithUrl();

    if (!randomSong) {
      res.json({
        success: true,
        message: 'No songs found in the database',
        song: null,
        count: 0
      });
      return;
    }

    res.json({
      success: true,
      message: 'Retrieved random song with metadata',
      song: randomSong,
      count: 1
    });

  } catch (error) {
    handleError(res, error, 'Failed to retrieve random song');
  }
};

/**
 * Handles listing all songs with metadata and presigned URLs
 */
export const handleAllSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const allSongs = await getAllSongsWithUrls();

    res.json({
      success: true,
      message: `Retrieved ${allSongs.length} song(s) with metadata`,
      songs: allSongs,
      count: allSongs.length
    });

  } catch (error) {
    handleError(res, error, 'Failed to retrieve songs');
  }
};

/**
 * Handles retrieving a song by its database ID and triggers download
 */
export const handleSongById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { songId } = req.params;

    if (!songId) {
      res.status(400).json({ 
        error: 'Song ID is required',
        message: 'Please provide a song ID in the URL path' 
      });
      return;
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(songId)) {
      res.status(400).json({ 
        error: 'Invalid song ID format',
        message: 'Song ID must be a valid UUID' 
      });
      return;
    }

    const song = await getSongByIdWithUrl(songId);

    if (!song) {
      res.status(404).json({ 
        error: 'Song not found',
        message: 'No song found with the provided ID' 
      });
      return;
    }

    // Set headers to trigger download
    const filename = song.file_name || `${song.artist} - ${song.song_name}.${song.compression_type}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', song.mime_type || 'application/octet-stream');
    res.setHeader('Content-Length', song.file_size.toString());

    // Redirect to presigned URL to start download
    res.redirect(302, song.presignedUrl);

  } catch (error) {
    handleError(res, error, 'Failed to retrieve song');
  }
};

/**
 * Handles proxy download of a song by streaming it through the backend
 * This avoids CORS issues by serving files through the backend instead of redirecting to S3
 */
export const handleProxyDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { songId } = req.params;

    if (!songId) {
      res.status(400).json({ 
        error: 'Song ID is required',
        message: 'Please provide a song ID in the URL path' 
      });
      return;
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(songId)) {
      res.status(400).json({ 
        error: 'Invalid song ID format',
        message: 'Song ID must be a valid UUID' 
      });
      return;
    }

    // Get song metadata from database
    const song = await getSongByIdWithUrl(songId);
    if (!song) {
      res.status(404).json({ 
        error: 'Song not found',
        message: 'No song found with the provided ID' 
      });
      return;
    }

    // Stream file directly from S3 through backend
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: song.s3_key
    });
    
    const s3Response = await s3Client.send(command);
    
    // Set proper headers for download
    const filename = song.file_name || `${song.artist} - ${song.song_name}.${song.compression_type}`;
    res.setHeader('Content-Type', song.mime_type || 'application/octet-stream');
    res.setHeader('Content-Length', song.file_size.toString());
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    
    // Stream the file from S3 to client
    if (s3Response.Body) {
      // Convert the AWS SDK stream to a Node.js readable stream
      const stream = s3Response.Body as any;
      if (stream.pipe) {
        stream.pipe(res);
      } else {
        // Handle different stream types
        const chunks: Uint8Array[] = [];
        const reader = stream.transformToByteArray ? stream.transformToByteArray() : stream;
        
        if (reader && typeof reader.pipe === 'function') {
          reader.pipe(res);
        } else {
          // Fallback: collect chunks and send as buffer
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
          }
          res.send(Buffer.concat(chunks));
        }
      }
    } else {
      res.status(500).json({ 
        error: 'File stream unavailable',
        message: 'Unable to stream the requested file' 
      });
    }

  } catch (error) {
    handleError(res, error, 'Failed to download song');
  }
};

/**
 * Handles deleting a song by its database ID from both database and S3
 */
export const handleDeleteSong = async (req: Request, res: Response): Promise<void> => {
  try {
    const { songId } = req.params;

    if (!songId) {
      res.status(400).json({ 
        error: 'Song ID is required',
        message: 'Please provide a song ID in the URL path' 
      });
      return;
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(songId)) {
      res.status(400).json({ 
        error: 'Invalid song ID format',
        message: 'Song ID must be a valid UUID' 
      });
      return;
    }

    // First, get the song to retrieve the S3 key before deletion
    const song = await getSongByIdWithUrl(songId);
    if (!song) {
      res.status(404).json({ 
        error: 'Song not found',
        message: 'No song found with the provided ID' 
      });
      return;
    }

    // Delete from database first
    const dbDeleted = await deleteSong(songId);
    if (!dbDeleted) {
      res.status(404).json({ 
        error: 'Song not found',
        message: 'No song found with the provided ID' 
      });
      return;
    }

    // Delete from S3
    let s3Deleted = false;
    try {
      s3Deleted = await deleteFromS3(song.s3_key);
      if (!s3Deleted) {
        console.warn(`Failed to delete file from S3: ${song.s3_key}`);
      }
    } catch (s3Error) {
      console.error(`Error deleting from S3: ${song.s3_key}`, s3Error);
    }

    res.json({
      success: true,
      message: 'Song deleted successfully',
      songId,
      deletedFromDatabase: true,
      deletedFromS3: s3Deleted,
      song: {
        id: song.id,
        artist: song.artist,
        song_name: song.song_name,
        file_name: song.file_name,
        s3_key: song.s3_key
      }
    });

  } catch (error) {
    handleError(res, error, 'Failed to delete song');
  }
};
