/**
 * API helper for communicating with the ClipRadar backend.
 *
 * Vite's dev proxy forwards /api/* to http://localhost:3001 so
 * no absolute URL is needed in development.
 * In production, set VITE_API_BASE_URL to the deployed backend URL.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Fetch videos with optional filters.
 * @param {{ platform?: string, category?: string, search?: string, limit?: number, skip?: number, dailyOnly?: boolean }} params
 */
export async function fetchVideos(params = {}) {
    const query = new URLSearchParams();
    if (params.platform && params.platform !== 'all') query.set('platform', params.platform);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search && params.search.trim()) query.set('search', params.search.trim());
    if (params.limit) query.set('limit', params.limit);
    if (params.skip) query.set('skip', params.skip);
    if (params.dailyOnly) query.set('dailyOnly', 'true');

    const url = `${BASE}/api/videos${query.toString() ? `?${query}` : ''}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }

    return res.json(); // { videos, total, mode }
}

/**
 * Fetch today's curated Daily Radar Drop (or a specific historical date)
 * @param {string} [date] - Optional date in YYYY-MM-DD
 * @param {string} [platform='all'] - 'all' | 'youtube' | 'twitter'
 */
export async function fetchDailyDrop(date = null, platform = 'all') {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (platform && platform !== 'all') params.set('platform', platform);
    const query = params.toString();
    const url = `${BASE}/api/daily-drops${query ? `?${query}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json(); // { date, formattedDate, theme, nextDropCountdownSeconds, total, videos, history, platforms }
}

/**
 * Force generate a fresh batch of videos for today
 * @param {string} [platform='all'] - 'all' | 'youtube' | 'twitter'
 */
export async function generateFreshDailyDrop(platform = 'all') {
    const params = new URLSearchParams();
    if (platform && platform !== 'all') params.set('platform', platform);
    const query = params.toString();
    const url = `${BASE}/api/daily-drops/generate${query ? `?${query}` : ''}`;
    const res = await fetch(url, {
        method: 'POST',
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json(); // { success, message, drop }
}

/**
 * Trigger a platform data refresh (production mode only).
 */
export async function triggerRefresh() {
    const res = await fetch(`${BASE}/api/videos/refresh`, { method: 'POST' });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

/**
 * Extract multiple catchy/viral moments from a video using Gemini AI.
 * @param {{ title?: string, description?: string, transcript?: string, duration?: number }} params
 */
export async function extractCatchyMoments(params = {}) {
    const res = await fetch(`${BASE}/api/studio/moments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json(); // { success, totalMoments, duration, moments }
}

/**
 * Generate a viral headline hook with Gemini AI based on style.
 * @param {{ title?: string, context?: string, momentTitle?: string, style?: string }} params
 */
export async function generateHeadlineHook(params = {}) {
    const res = await fetch(`${BASE}/api/studio/hook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json(); // { success, headline, style }
}

/**
 * Save an AI-edited 9:16 short directly into the ClipRadar Library.
 * @param {object} videoData
 */
export async function saveVideoToLibrary(videoData = {}) {
    const res = await fetch(`${BASE}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json(); // { success, message, video }
}

/**
 * Fetch YouTube Channel Analytics, Charts, Outlier Videos, and AI Growth Review.
 * @param {string} [handle='@ClipRadarOfficial']
 */
export async function fetchChannelAnalytics(handle = '@ClipRadarOfficial') {
    const params = new URLSearchParams();
    if (handle && handle.trim()) params.set('handle', handle.trim());
    const url = `${BASE}/api/channel/analytics?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

/**
 * Run a deep-dive AI assessment & CTR rewrite on a single YouTube video.
 * @param {object} video
 * @param {object} [channelBaseline]
 */
export async function assessChannelVideo(video = {}, channelBaseline = {}) {
    const res = await fetch(`${BASE}/api/channel/assess-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video, channelBaseline }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json(); // { success, assessment }
}

/**
 * Refresh AI Channel Growth Coach action plan & "What to Post Next" ideas.
 * @param {string} handle
 * @param {object} [analytics]
 */
export async function refreshChannelCoach(handle = '@ClipRadarOfficial', analytics = null) {
    const res = await fetch(`${BASE}/api/channel/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, analytics }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json(); // { success, aiAssessment }
}

