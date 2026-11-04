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
import { enrichVideoWithAI, extractMomentsWithAI, generateHookWithAI } from '../services/gemini.js';

const isDemoMode = () => process.env.DEMO_MODE === 'true';

// In-memory store for user-created Studio videos
export const studioVideosStore = [];

// Load live-cached YouTube clips if available, else demoVideos
function getFallbackVideos() {
    let base = demoVideos;
    if (process.env.NODE_ENV !== 'test') {
        try {
            const cachePath = path.resolve('src/data/liveCache.json');
            if (fs.existsSync(cachePath)) {
                const data = fs.readFileSync(cachePath, 'utf8');
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    base = parsed;
                }
            }
        } catch {
            // ignore and fallback
        }
    }
    return { videos: [...studioVideosStore, ...base], mode: isDemoMode() ? 'demo' : 'live' };
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

/**
 * POST /api/studio/moments
 * Extracts multiple viral/catchy moments from a video using Gemini AI.
 */
export async function extractMoments(req, res, next) {
    try {
        const { title, description, transcript, duration } = req.body || {};
        const parsedDuration = Math.max(5, Math.round(Number(duration) || 30));

        const moments = await extractMomentsWithAI({
            title: title || 'Social Video Clip',
            description: description || '',
            transcript: transcript || '',
            duration: parsedDuration,
        });

        return res.json({
            success: true,
            totalMoments: moments.length,
            duration: parsedDuration,
            moments,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/studio/hook
 * Generates a tailored viral headline hook with Gemini AI.
 */
export async function generateHook(req, res, next) {
    try {
        const { title, context, momentTitle, style } = req.body || {};
        const result = await generateHookWithAI({
            title: title || 'Viral Video',
            context: context || '',
            momentTitle: momentTitle || '',
            style: style || 'curiosity',
        });

        return res.json({
            success: true,
            headline: result.headline,
            style: result.style,
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/videos & POST /api/studio/save
 * Saves an AI-edited 9:16 short or moment to the ClipRadar Library.
 */
export async function createStudioVideo(req, res, next) {
    try {
        const body = req.body || {};
        const platformVideoId =
            body.platformVideoId || `studio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const newVideo = {
            platform: 'studio',
            platformVideoId,
            title: body.title || 'AI Studio Short',
            description: body.description || body.headline || 'Created in ClipRadar AI Video Studio',
            aiDescription: body.headline || body.aiDescription || 'AI-generated viral short with custom hook.',
            category: body.category || 'Viral Shorts',
            tags: Array.isArray(body.tags) && body.tags.length > 0 ? body.tags : ['Studio', 'Shorts', 'Viral'],
            creator: {
                name: body.creator?.name || body.channelName || 'Studio Creator',
                handle: body.creator?.handle || body.channelHandle || '@creator',
                avatarUrl: body.creator?.avatarUrl || body.logoUrl || '',
                profileUrl: '',
            },
            thumbnailUrl: body.thumbnailUrl || '',
            videoUrl: body.videoUrl || '',
            embedUrl: body.embedUrl || '',
            durationSeconds: Math.max(1, Math.round(Number(body.durationSeconds) || 6)),
            publishedAt: new Date(),
            viewCount: 1,
            likeCount: 0,
        };

        // Prepend to runtime store so it's instantly discoverable in the feed
        studioVideosStore.unshift(newVideo);

        // If not in demo mode, persist to MongoDB
        if (!isDemoMode()) {
            try {
                await Video.findOneAndUpdate(
                    { platform: 'studio', platformVideoId: newVideo.platformVideoId },
                    newVideo,
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            } catch (mongoErr) {
                console.warn('MongoDB save warning (saved to in-memory store):', mongoErr.message);
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Video successfully saved to ClipRadar Library!',
            video: newVideo,
        });
    } catch (err) {
        next(err);
    }
}

