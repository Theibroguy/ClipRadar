import { Router } from 'express';
import { getVideos, refreshVideos, healthCheck, extractMoments, generateHook } from '../controllers/videos.js';

const router = Router();

router.get('/health', healthCheck);
router.get('/videos', getVideos);
router.post('/videos/refresh', refreshVideos);
router.post('/studio/moments', extractMoments);
router.post('/studio/hook', generateHook);

export default router;
