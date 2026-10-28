/**
 * Formatting utilities for video metadata.
 */

/** Format view or like count: 1500000 → "1.5M", 25000 → "25K" */
export function formatCount(n) {
    if (n === null || n === undefined || isNaN(n)) return null;
    const num = Number(n);
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return String(num);
}

/** Format seconds to mm:ss or hh:mm:ss: 872 → "14:32", 3665 → "1:01:05" */
export function formatDuration(sec) {
    if (!sec || isNaN(sec)) return null;
    const totalSec = Math.floor(Number(sec));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const pad = (v) => String(v).padStart(2, '0');

    if (h > 0) {
        return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${m}:${pad(s)}`;
}

/** Format ISO date → "May 12, 2024" */
export function formatDate(dateStr) {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

