/**
 * TikTok Display API Service
 *
 * Uses the TikTok Display API (formerly Login Kit + Video Kit) to fetch
 * public video metadata for authorized users. Requires an approved
 * TikTok Developer app and an TIKTOK_ACCESS_TOKEN env var.
 *
 * NOTE: TikTok's API does not permit searching arbitrary public profiles
 * without the user granting OAuth access. This service fetches videos
 * for users who have connected their TikTok account via OAuth.
 *
 * Returns an empty array when the token is missing or the API is
 * unavailable.
 */
import axios from 'axios';

const BASE_URL = 'https://open.tiktokapis.com/v2';

function getToken() {
    return process.env.TIKTOK_ACCESS_TOKEN || null;
}

/**
 * Fetch recent videos for the authenticated TikTok user.
 * @param {number} maxCount - max videos to fetch (1–20 per TikTok limits)
 */
export async function fetchTikTokVideos(maxCount = 10) {
    const token = getToken();
    if (!token) {
        console.warn('TIKTOK_ACCESS_TOKEN not set — skipping TikTok fetch.');
        return [];
    }

    try {
        const res = await axios.post(
            `${BASE_URL}/video/list/?fields=id,title,cover_image_url,share_url,create_time,duration,view_count,like_count`,
            { max_count: Math.min(maxCount, 20) },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const videos = res.data?.data?.videos || [];

        return videos.map((v) => ({
            platform: 'tiktok',
            platformVideoId: v.id,
            creator: {
                name: '',
                handle: '',
                avatarUrl: '',
                profileUrl: '',
            },
            title: v.title || 'TikTok Video',
            description: v.title || '',
            thumbnailUrl: v.cover_image_url || '',
            videoUrl: v.share_url || '',
            embedUrl: '',
            durationSeconds: v.duration || 0,
            publishedAt: v.create_time ? new Date(v.create_time * 1000) : null,
            viewCount: v.view_count || 0,
            likeCount: v.like_count || 0,
        }));
    } catch (err) {
        console.error('TikTok fetch failed:', err.message);
        return [];
    }
}
