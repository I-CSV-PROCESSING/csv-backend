import { Router } from 'express';
import { uploadCSV, searchItems } from '../controllers/dataController';
import uploadMiddleware from '../middleware/uploadFile';


const router = Router();
router.post('/csv-upload', uploadMiddleware, uploadCSV);
router.post('/search', searchItems);

export default router;