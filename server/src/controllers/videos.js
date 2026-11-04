/**
 * Videos Controller
 *
 * Handles incoming HTTP requests for the /api/videos routes.
 * In DEMO_MODE or when MongoDB is unreachable, it serves
 * live-cached YouTube videos or demo seeds.
 * In production mode it queries MongoDB Atlas and can trigger a refresh.
 */
import fs from 'fs';
import path from 'path';
import { demoVideos } from '../data/demoVideos.js';
import { Video } from '../models/Video.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
import { fetchTwitterVideos } from '../services/twitter.js';
import { fetchInstagramVideos } from '../services/instagram.js';
import { fetchTikTokVideos } from '../services/tiktok.js';
import { enrichVideoWithAI } from '../services/gemini.js';

const isDemoMode = () => process.env.DEMO_MODE === 'true';

// Load live-cached YouTube clips if available, else demoVideos
function getFallbackVideos() {
    if (process.env.NODE_ENV === 'test') {
        return { videos: demoVideos, mode: 'demo' };
    }
    try {
        const cachePath = path.resolve('src/data/liveCache.json');
        if (fs.existsSync(cachePath)) {
            const data = fs.readFileSync(cachePath, 'utf8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return { videos: parsed, mode: 'live' };
            }
        }
    } catch {
        // ignore and fallback
    }
    return { videos: demoVideos, mode: 'demo' };
}

// Default YouTube search queries
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
        const limitNum = Number(limit);
        const skipNum = Number(skip);

        if (isDemoMode()) {
            const fallback = getFallbackVideos();
            let list = [...fallback.videos];

            if (platform && platform !== 'all') {
                list = list.filter((v) => v.platform === platform);
            }
            if (category && category !== 'all') {
                list = list.filter((v) => v.category === category);
            }
            if (searchTerm) {
                list = list.filter(
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

            const paginated = list.slice(skipNum, skipNum + limitNum);

            return res.json({
                videos: paginated,
                total: list.length,
                hasMore: skipNum + paginated.length < list.length,
                mode: fallback.mode,
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
                .skip(skipNum)
                .limit(limitNum)
                .lean(),
            Video.countDocuments(filter),
        ]);

        return res.json({
            videos,
            total,
            hasMore: skipNum + videos.length < total,
            mode: 'production',
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/videos/refresh
 * Fetches new videos from all configured platforms, enriches with AI,
 * and upserts into MongoDB.
 */
export async function refreshVideos(req, res, next) {
    if (isDemoMode()) {
        return res.status(403).json({
            error: 'Refresh is disabled in demo mode (MongoDB is not connected).',
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
        mode: isDemoMode() ? 'demo' : 'production',
        timestamp: new Date().toISOString(),
    });
}
