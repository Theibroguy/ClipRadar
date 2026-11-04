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
 * @param {{ platform?: string, category?: string, search?: string, limit?: number, skip?: number }} params
 */
export async function fetchVideos(params = {}) {
    const query = new URLSearchParams();
    if (params.platform && params.platform !== 'all') query.set('platform', params.platform);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search && params.search.trim()) query.set('search', params.search.trim());
    if (params.limit) query.set('limit', params.limit);
    if (params.skip) query.set('skip', params.skip);

    const url = `${BASE}/api/videos${query.toString() ? `?${query}` : ''}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }

    return res.json(); // { videos, total, mode }
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

