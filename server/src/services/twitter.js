/**
 * X (Twitter) API v2 Service
 *
 * Searches for recent videos posted by public personalities.
 * Requires TWITTER_BEARER_TOKEN env var.
 *
 * Returns an empty array when the token is missing so the rest of the
 * app continues working.
 */
import axios from 'axios';

const BASE_URL = 'https://api.twitter.com/2';

function getHeaders() {
    const token = process.env.TWITTER_BEARER_TOKEN;
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
}

/**
 * Search recent tweets that contain videos.
 * Twitter API v2 Essential access does not support video media directly;
 * this returns tweet-level metadata linking to the original tweet.
 *
 * @param {string[]} queries - search terms
 * @param {number} maxResults - results per query (10-100)
 */
export async function fetchTwitterVideos(queries = [], maxResults = 10) {
    const headers = getHeaders();
    if (!headers) {
        console.warn('TWITTER_BEARER_TOKEN not set — skipping X/Twitter fetch.');
        return [];
    }

    const results = [];

    for (const query of queries) {
        try {
            const res = await axios.get(`${BASE_URL}/tweets/search/recent`, {
                headers,
                params: {
                    query: `${query} has:videos -is:retweet lang:en`,
                    max_results: Math.min(Math.max(maxResults, 10), 100),
                    'tweet.fields': 'created_at,public_metrics,author_id,attachments',
                    'user.fields': 'name,username,profile_image_url',
                    expansions: 'author_id,attachments.media_keys',
                    'media.fields': 'preview_image_url,duration_ms,type',
                },
            });

            const tweets = res.data.data || [];
            const users = keyBy(res.data.includes?.users || [], 'id');
            const media = keyBy(res.data.includes?.media || [], 'media_key');

            for (const tweet of tweets) {
                const author = users[tweet.author_id] || {};
                const mediaKeys = tweet.attachments?.media_keys || [];
                const firstVideo = mediaKeys
                    .map((k) => media[k])
                    .find((m) => m && m.type === 'video');

                results.push({
                    platform: 'twitter',
                    platformVideoId: tweet.id,
                    creator: {
                        name: author.name || '',
                        handle: author.username ? `@${author.username}` : '',
                        avatarUrl: author.profile_image_url || '',
                        profileUrl: author.username
                            ? `https://x.com/${author.username}`
                            : '',
                    },
                    title: tweet.text?.slice(0, 100) || 'Twitter Video',
                    description: tweet.text || '',
                    thumbnailUrl: firstVideo?.preview_image_url || '',
                    videoUrl: `https://x.com/i/web/status/${tweet.id}`,
                    embedUrl: '',
                    durationSeconds: firstVideo?.duration_ms
                        ? Math.round(firstVideo.duration_ms / 1000)
                        : 0,
                    publishedAt: tweet.created_at ? new Date(tweet.created_at) : null,
                    viewCount: tweet.public_metrics?.impression_count || 0,
                    likeCount: tweet.public_metrics?.like_count || 0,
                });
            }
        } catch (err) {
            console.error(`Twitter fetch failed for "${query}":`, err.message);
        }
    }

    return results;
}

function keyBy(arr, key) {
    return arr.reduce((acc, item) => {
        acc[item[key]] = item;
        return acc;
    }, {});
}
