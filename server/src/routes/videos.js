import { Router } from 'express';
import {
    getVideos,
    createStudioVideo,
    refreshVideos,
    healthCheck,
    extractMoments,
    generateHook,
    getDailyDropsController,
    generateDailyDropController,
} from '../controllers/videos.js';

const router = Router();

router.get('/health', healthCheck);
router.get('/videos', getVideos);
router.post('/videos', createStudioVideo);
router.post('/videos/refresh', refreshVideos);
router.post('/studio/moments', extractMoments);
router.post('/studio/hook', generateHook);
router.post('/studio/save', createStudioVideo);

// Daily Radar Drops Routes
router.get('/daily-drops', getDailyDropsController);
router.post('/daily-drops/generate', generateDailyDropController);

export default router;
