import { Router } from 'express';
import { handleFileRetrieval, handleRandomSongs } from '../controller/retrievalController';

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
 * Lists random songs from the bucket
 * 
 * Query parameters:
 * - count: Number of random songs to return (default: 3, max: 10)
 * 
 * Example: GET /files/random?count=5
 */
router.get('/random', handleRandomSongs);

export default router;
