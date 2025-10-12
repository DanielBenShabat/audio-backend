import { Router } from 'express';
import { handleUpload, healthCheck } from '../controller/uploadController';

/**
 * Upload routes exported as a dedicated router.
 */
const router = Router();

router.get('/', healthCheck);
router.post('/upload', handleUpload);

export default router;
