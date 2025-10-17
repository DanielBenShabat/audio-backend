import { NextFunction, Request, Response } from 'express';
import { uploadSingleAudio, uploadToS3 } from '../service/storageService';
import { insertSong } from '../service/databaseService';

/**
 * Sends a quick health message for uptime checks.
 */
export const healthCheck = (_req: Request, res: Response): void => {
  res.send('Audio upload backend is running.');
};

/**
 * Handles the upload request lifecycle before delegating to storage.
 * After successful S3 upload, saves song metadata to Neon database.
 */
export const handleUpload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  uploadSingleAudio(req, res, async (err?: unknown) => {
    if (err) {
      next(err);
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No audio file provided' });
      return;
    }

    try {
      // Extract metadata from the uploaded file
      const { originalname, buffer, mimetype } = req.file;
      
      // Get file size from buffer (now available since we're using memory storage)
      const fileSize = buffer.length;
      
      // Parse artist and song name from filename (basic implementation)
      // TODO: Extract from audio metadata tags if needed
      const filenameParts = originalname.replace(/\.[^/.]+$/, '').split(' - ');
      const artist = filenameParts.length > 1 ? filenameParts[0].trim() : 'Unknown Artist';
      const songName = filenameParts.length > 1 ? filenameParts[1].trim() : filenameParts[0].trim();
      
      // Determine compression type from file extension
      const extension = originalname.split('.').pop()?.toLowerCase();
      const compressionType = extension || 'unknown';
      
      // Upload to S3 and get the key
      const s3Key = await uploadToS3(req.file);
      
      // Save song metadata to database
      const songRecord = await insertSong({
        artist,
        song_name: songName,
        file_name: originalname,
        compression_type: compressionType,
        created_by: 'web-user',
        file_size: fileSize,
        s3_key: s3Key,
        mime_type: mimetype,
        metadata: {
          original_filename: originalname,
          upload_timestamp: new Date().toISOString()
        }
      });

      res.json({ 
        message: 'File uploaded successfully', 
        file: {
          originalname,
          size: fileSize,
          mimetype,
          key: s3Key
        },
        song: songRecord
      });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      res.status(500).json({ 
        message: 'Upload failed',
        error: uploadError instanceof Error ? uploadError.message : 'Unknown error'
      });
    }
  });
};
