/**
 * Videos Controller
 *
 * Handles incoming HTTP requests for the /api/videos routes.
 * In DEMO_MODE it returns local seed data; in production it
 * queries MongoDB and can trigger a platform refresh.
 */
import { demoVideos } from '../data/demoVideos.js';
import { Video } from '../models/Video.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
import { fetchTwitterVideos } from '../services/twitter.js';
import { fetchInstagramVideos } from '../services/instagram.js';
import { fetchTikTokVideos } from '../services/tiktok.js';
import { enrichVideoWithAI } from '../services/gemini.js';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Default YouTube search queries — these focus on public figures
const DEFAULT_YT_QUERIES = [
    'celebrity funny moment 2024',
    'influencer unexpected reaction',
    'famous creator challenge',
    'famous athlete funny clip',
];

/**
 * GET /api/videos
 * Query params: platform, category, q/search, limit (default 20), skip (default 0)
 */
export async function getVideos(req, res, next) {
    try {
        const { platform, category, q, search, limit = 20, skip = 0 } = req.query;
        const searchTerm = (q || search || '').trim().toLowerCase();

        if (DEMO_MODE) {
            let videos = demoVideos;

            if (platform && platform !== 'all') {
                videos = videos.filter((v) => v.platform === platform);
            }
            if (category && category !== 'all') {
                videos = videos.filter((v) => v.category === category);
            }
            if (searchTerm) {
                videos = videos.filter(
                    (v) =>
                        v.title?.toLowerCase().includes(searchTerm) ||
                        v.creator?.name?.toLowerCase().includes(searchTerm) ||
                        v.creator?.handle?.toLowerCase().includes(searchTerm) ||
                        v.aiDescription?.toLowerCase().includes(searchTerm) ||
                        v.description?.toLowerCase().includes(searchTerm) ||
                        (Array.isArray(v.tags) &&
                            v.tags.some((t) => t.toLowerCase().includes(searchTerm)))
                );
            }

            const paginated = videos.slice(Number(skip), Number(skip) + Number(limit));

            return res.json({
                videos: paginated,
                total: videos.length,
                mode: 'demo',
            });
        }

        // --- Production: query MongoDB ---
        const filter = {};
        if (platform && platform !== 'all') filter.platform = platform;
        if (category && category !== 'all') filter.category = category;
        if (searchTerm) {
            filter.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { 'creator.name': { $regex: searchTerm, $options: 'i' } },
                { 'creator.handle': { $regex: searchTerm, $options: 'i' } },
                { aiDescription: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { tags: { $in: [new RegExp(searchTerm, 'i')] } },
            ];
        }

        const [videos, total] = await Promise.all([
            Video.find(filter)
                .sort({ publishedAt: -1 })
                .skip(Number(skip))
                .limit(Number(limit))
                .lean(),
            Video.countDocuments(filter),
        ]);

        return res.json({ videos, total, mode: 'production' });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/videos/refresh
 * Fetches new videos from all configured platforms, enriches with AI,
 * and upserts into MongoDB.
 * Not available in demo mode.
 */
export async function refreshVideos(req, res, next) {
    if (DEMO_MODE) {
        return res.status(403).json({
            error: 'Refresh is disabled in demo mode.',
        });
    }

    try {
        const [ytVideos, twVideos, igVideos, ttVideos] = await Promise.all([
            fetchYouTubeVideos(DEFAULT_YT_QUERIES, 5),
            fetchTwitterVideos(['celebrity viral video', 'influencer funny clip'], 10),
            fetchInstagramVideos(10),
            fetchTikTokVideos(10),
        ]);

        const allVideos = [...ytVideos, ...twVideos, ...igVideos, ...ttVideos];
        let enriched = 0;
        let saved = 0;

        for (const video of allVideos) {
            // AI enrichment
            if (!video.aiDescription) {
                const ai = await enrichVideoWithAI({
                    platform: video.platform,
                    creator: video.creator?.name || video.creator?.handle || '',
                    title: video.title,
                    description: video.description,
                });
                video.aiDescription = ai.aiDescription;
                video.category = ai.category;
                enriched++;
            }

            // Upsert into MongoDB (won't create duplicates)
            await Video.findOneAndUpdate(
                { platform: video.platform, platformVideoId: video.platformVideoId },
                video,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            saved++;
        }

        return res.json({
            message: 'Refresh complete',
            fetched: allVideos.length,
            enriched,
            saved,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/health
 */
export function healthCheck(req, res) {
    res.json({
        status: 'ok',
        mode: DEMO_MODE ? 'demo' : 'production',
        timestamp: new Date().toISOString(),
    });
}
