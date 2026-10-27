/**
 * Instagram Graph API Service
 *
 * Fetches recent video media from approved business/creator accounts
 * via the Instagram Graph API. Requires INSTAGRAM_ACCESS_TOKEN env var
 * (a long-lived User Access Token with the instagram_basic and
 * instagram_manage_insights permissions).
 *
 * NOTE: The Instagram Graph API only allows access to the authenticated
 * user's own account, or accounts that have explicitly granted permission.
 * It cannot be used to crawl arbitrary public profiles.
 *
 * Returns an empty array when the token is missing.
 */
import axios from 'axios';

const BASE_URL = 'https://graph.instagram.com/v19.0';

function getToken() {
    return process.env.INSTAGRAM_ACCESS_TOKEN || null;
}

/**
 * Fetch the authenticated user's recent video media.
 * @param {number} limit - max number of items to return
 */
export async function fetchInstagramVideos(limit = 10) {
    const token = getToken();
    if (!token) {
        console.warn('INSTAGRAM_ACCESS_TOKEN not set — skipping Instagram fetch.');
        return [];
    }

    try {
        const res = await axios.get(`${BASE_URL}/me/media`, {
            params: {
                fields: 'id,caption,media_type,thumbnail_url,media_url,permalink,timestamp,username',
                limit,
                access_token: token,
            },
        });

        const items = (res.data.data || []).filter(
            (i) => i.media_type === 'VIDEO' || i.media_type === 'REELS'
        );

        return items.map((item) => ({
            platform: 'instagram',
            platformVideoId: item.id,
            creator: {
                name: item.username || '',
                handle: item.username ? `@${item.username}` : '',
                avatarUrl: '',
                profileUrl: item.username
                    ? `https://www.instagram.com/${item.username}`
                    : '',
            },
            title: (item.caption || '').slice(0, 100) || 'Instagram Reel',
            description: item.caption || '',
            thumbnailUrl: item.thumbnail_url || '',
            videoUrl: item.permalink || '',
            embedUrl: '',
            durationSeconds: 0,
            publishedAt: item.timestamp ? new Date(item.timestamp) : null,
            viewCount: 0,
            likeCount: 0,
        }));
    } catch (err) {
        console.error('Instagram fetch failed:', err.message);
        return [];
    }
}
