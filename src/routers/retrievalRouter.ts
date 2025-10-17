import { Router } from 'express';
import { handleFileRetrieval, handleRandomSongs, handleAllSongs, handleSongById, handleProxyDownload, handleDeleteSong } from '../controller/retrievalController';
import { requireAdmin } from '../middleware/authMiddleware';

/**
 * File retrieval routes for accessing files via presigned URLs
 */
const router = Router();

/**
 * GET /retrieve/:fileKey
 * Generates a presigned URL for accessing a private file
 * 
 * Query parameters:
 * - expiration: URL expiration time in seconds (default: 3600 = 1 hour)
 * 
 * Example: GET /files/retrieve/1234567890-song.mp3?expiration=7200
 */
router.get('/retrieve/:fileKey', handleFileRetrieval);

/**
 * GET /random
 * Gets a single random song with full metadata and presigned URL
 * Requires admin authentication (placeholder for now)
 * 
 * Example: GET /files/random
 */
router.get('/random', requireAdmin, handleRandomSongs);

/**
 * GET /all
 * Lists all songs with metadata and presigned URLs
 * Public endpoint - no authentication required
 * 
 * Example: GET /files/all
 */
router.get('/all', handleAllSongs);

/**
 * GET /song/:songId
 * Downloads a specific song by its database ID (triggers automatic download)
 * Public endpoint - no authentication required
 * 
 * Example: GET /files/song/123e4567-e89b-12d3-a456-426614174000
 */
router.get('/song/:songId', handleSongById);

/**
 * GET /download/:songId
 * Downloads a specific song by streaming it through the backend (CORS-safe)
 * Public endpoint - no authentication required
 * 
 * Example: GET /files/download/123e4567-e89b-12d3-a456-426614174000
 */
router.get('/download/:songId', handleProxyDownload);

/**
 * DELETE /song/:songId
 * Deletes a song by its database ID from both database and S3 bucket
 * Requires admin authentication
 * 
 * Example: DELETE /files/song/123e4567-e89b-12d3-a456-426614174000
 */
router.delete('/song/:songId', requireAdmin, handleDeleteSong);

export default router;
