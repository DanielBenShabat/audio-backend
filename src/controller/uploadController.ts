import { NextFunction, Request, Response } from 'express';
import { uploadSingleAudio } from '../service/storageService';

/**
 * Sends a quick health message for uptime checks.
 */
export const healthCheck = (_req: Request, res: Response): void => {
  res.send('Audio upload backend is running.');
};

/**
 * Handles the upload request lifecycle before delegating to storage.
 */
export const handleUpload = (req: Request, res: Response, next: NextFunction): void => {
  uploadSingleAudio(req, res, (err?: unknown) => {
    if (err) {
      next(err);
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No audio file provided' });
      return;
    }

    res.json({ message: 'File uploaded successfully', file: req.file });
  });
};
