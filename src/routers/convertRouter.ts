import { Router } from 'express';
import { handleConvert } from '../controller/convertController';

const router = Router();

router.post('/', handleConvert);

export default router;
