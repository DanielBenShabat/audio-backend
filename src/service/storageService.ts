import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';

/**
 * Ensures the uploads directory exists before writing files.
 */
const resolveUploadsDir = (): string => {
  const uploadsPath = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  return uploadsPath;
};

const storage = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    cb(null, resolveUploadsDir());
  },
  filename: (_req: Request, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/**
 * Multer middleware that stores a single audio file under the `audio` field.
 */
export const uploadSingleAudio = multer({ storage }).single('audio');
