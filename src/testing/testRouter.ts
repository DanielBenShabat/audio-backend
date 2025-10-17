import { Router } from 'express';
import { handleS3Test } from './s3TestController';

/**
 * Testing routes for debugging and development
 */
const router = Router();

/**
 * GET /test/s3
 * Test endpoint to debug S3 connection and bucket status
 * 
 * Example: GET /test/s3
 */
router.get('/s3', handleS3Test);

export default router;
