import { Request, Response, NextFunction } from 'express';
import convertService from '../service/convertService';

/**
 * POST /convert
 * body: { filename: string, target: 'mp3' | 'wav' }
 */
export const handleConvert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename, target } = req.body as { filename?: string; target?: string };
    if (!filename || !target) {
      res.status(400).json({ message: 'filename and target are required' });
      return;
    }

    if (target !== 'mp3' && target !== 'wav') {
      res.status(400).json({ message: 'target must be mp3 or wav' });
      return;
    }

    const out = await convertService.convertFile(filename, target as any);
    res.json({ message: 'converted', output: out });
  } catch (err) {
    next(err);
  }
};

export default { handleConvert };