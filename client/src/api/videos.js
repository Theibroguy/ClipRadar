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
 * @param {{ platform?: string, category?: string, limit?: number, skip?: number }} params
 */
export async function fetchVideos(params = {}) {
    const query = new URLSearchParams();
    if (params.platform && params.platform !== 'all') query.set('platform', params.platform);
    if (params.category && params.category !== 'all') query.set('category', params.category);
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
