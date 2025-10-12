import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// ffmpeg-static exports a path string to a bundled ffmpeg binary.
// Set fluent-ffmpeg to use that binary so users don't need a system ffmpeg.
if (typeof ffmpegStatic === 'string' && ffmpegStatic.length) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

export type Format = 'mp3' | 'wav';

/** Ensure uploads dir exists */
const ensureUploads = (): void => {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
};

/** Build output filename next to input with requested extension. Adds a timestamp to avoid overwrites. */
const buildOutPath = (inputPath: string, target: Format): string => {
  const parsed = path.parse(inputPath);
  const ts = Date.now();
  return path.join(parsed.dir, `${parsed.name}-converted-${ts}.${target}`);
};

/** Convert an audio file to target format. Returns the output path. */
/**
 * Convert an audio file to target format. If `target` is omitted, the function
 * detects the input's extension and converts to the other format (wav <-> mp3).
 * Returns the output path placed in the same folder (uploads/) with a timestamp.
 */
export const convertFile = (inputFilename: string, target?: Format): Promise<string> => {
  ensureUploads();
  const inputPath = path.isAbsolute(inputFilename) ? inputFilename : path.join(uploadsDir, inputFilename);
  if (!fs.existsSync(inputPath)) return Promise.reject(new Error('Input file does not exist'));

  const ext = path.extname(inputPath).toLowerCase().replace('.', '');
  const detected = (ext === 'mp3' || ext === 'wav') ? (ext as Format) : null;

  if (!target) {
    if (!detected) return Promise.reject(new Error('Cannot detect input format; specify target explicitly'));
    target = detected === 'mp3' ? 'wav' : 'mp3';
  }

  // If detected and target are the same, no-op and return original path
  if (detected && detected === target) return Promise.resolve(inputPath);

  const outPath = buildOutPath(inputPath, target);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat(target)
      .on('error', (err: Error) => reject(err))
      .on('end', () => resolve(outPath))
      .save(outPath);
  });
};

export const listUploads = (): string[] => {
  ensureUploads();
  return fs.readdirSync(uploadsDir).filter((f) => fs.statSync(path.join(uploadsDir, f)).isFile());
};

export default { convertFile, listUploads };