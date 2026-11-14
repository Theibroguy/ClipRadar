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
    getChannelAnalyticsController,
    assessChannelVideoController,
    refreshChannelCoachController,
    grabXVideoController,
} from '../controllers/videos.js';

const router = Router();

router.get('/health', healthCheck);
router.get('/videos', getVideos);
router.post('/videos', createStudioVideo);
router.post('/videos/refresh', refreshVideos);
router.post('/videos/x-grab', grabXVideoController);
router.post('/studio/moments', extractMoments);
router.post('/studio/hook', generateHook);
router.post('/studio/save', createStudioVideo);

// Daily Radar Drops Routes
router.get('/daily-drops', getDailyDropsController);
router.post('/daily-drops/generate', generateDailyDropController);

// YouTube Channel Analytics & AI Growth Coach Routes
router.get('/channel/analytics', getChannelAnalyticsController);
router.post('/channel/assess-video', assessChannelVideoController);
router.post('/channel/coach', refreshChannelCoachController);

export default router;
