import { Router } from 'express';
import { getVideos, refreshVideos, healthCheck } from '../controllers/videos.js';

const router = Router();

router.get('/health', healthCheck);
router.get('/videos', getVideos);
router.post('/videos/refresh', refreshVideos);

export default router;
