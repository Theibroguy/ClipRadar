/**
 * YouTube Data API v3 Service
 *
 * Fetches short-form or noteworthy videos by public personalities.
 * Requires YOUTUBE_API_KEY env var.
 *
 * Returns an array of objects shaped to match the Video model.
 */
import { google } from 'googleapis';

const youtube = google.youtube('v3');

/**
 * Search YouTube for recent clips from popular creators.
 * @param {string[]} queries - search terms e.g. ["MrBeast funny", "MKBHD reaction"]
 * @param {number} maxResults - results per query (default 5)
 */
export async function fetchYouTubeVideos(queries = [], maxResults = 5) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        console.warn('YOUTUBE_API_KEY not set — skipping YouTube fetch.');
        return [];
    }

    const results = [];

    for (const query of queries) {
        try {
            // Step 1: search for video IDs
            const searchRes = await youtube.search.list({
                key: apiKey,
                part: ['id', 'snippet'],
                q: query,
                type: ['video'],
                maxResults,
                order: 'relevance',
                videoDuration: 'short', // prefer short clips
            });

            const items = searchRes.data.items || [];
            const videoIds = items.map((i) => i.id.videoId).filter(Boolean);

            if (videoIds.length === 0) continue;

            // Step 2: fetch statistics for those IDs
            const statsRes = await youtube.videos.list({
                key: apiKey,
                part: ['statistics', 'contentDetails'],
                id: videoIds,
            });

            const statsMap = {};
            for (const v of statsRes.data.items || []) {
                statsMap[v.id] = v;
            }

            // Step 3: normalise to Video model shape
            for (const item of items) {
                const videoId = item.id.videoId;
                if (!videoId) continue;
                const snippet = item.snippet;
                const stats = statsMap[videoId];
                const duration = stats?.contentDetails?.duration
                    ? parseDuration(stats.contentDetails.duration)
                    : 0;

                results.push({
                    platform: 'youtube',
                    platformVideoId: videoId,
                    creator: {
                        name: snippet.channelTitle || '',
                        handle: '',
                        avatarUrl: '',
                        profileUrl: `https://www.youtube.com/channel/${snippet.channelId}`,
                    },
                    title: snippet.title || '',
                    description: snippet.description || '',
                    thumbnailUrl:
                        snippet.thumbnails?.high?.url ||
                        snippet.thumbnails?.default?.url ||
                        '',
                    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    durationSeconds: duration,
                    publishedAt: snippet.publishedAt ? new Date(snippet.publishedAt) : null,
                    viewCount: parseInt(stats?.statistics?.viewCount || '0', 10),
                    likeCount: parseInt(stats?.statistics?.likeCount || '0', 10),
                });
            }
        } catch (err) {
            console.error(`YouTube fetch failed for query "${query}":`, err.message);
        }
    }

    return results;
}

/** Convert ISO 8601 duration (PT4M13S) to seconds */
function parseDuration(iso) {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const h = parseInt(match[1] || '0', 10);
    const m = parseInt(match[2] || '0', 10);
    const s = parseInt(match[3] || '0', 10);
    return h * 3600 + m * 60 + s;
}
