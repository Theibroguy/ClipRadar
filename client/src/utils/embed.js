/**
 * Helper to determine how a video should be embedded in the preview modal.
 *
 * @param {object} video
 * @returns {{ type: 'iframe' | 'video' | 'none', url: string | null }}
 */
export function getEmbedInfo(video) {
    if (!video) return { type: 'none', url: null };

    const { embedUrl, videoUrl } = video;

    // 1. Direct explicit embedUrl
    if (embedUrl) {
        // Direct HTML5 video stream (e.g., X/Twitter video.twimg.com .mp4 or local/blob video)
        if (
            /\.(mp4|webm|ogg)($|\?)/i.test(embedUrl) ||
            embedUrl.includes('video.twimg.com') ||
            embedUrl.startsWith('blob:') ||
            embedUrl.startsWith('data:video')
        ) {
            return { type: 'video', url: embedUrl };
        }

        // If it's a YouTube embed URL, ensure autoplay
        if (embedUrl.includes('youtube.com') || embedUrl.includes('youtube-nocookie.com')) {
            const separator = embedUrl.includes('?') ? '&' : '?';
            const url = embedUrl.includes('autoplay=')
                ? embedUrl
                : `${embedUrl}${separator}autoplay=1&rel=0`;
            return { type: 'iframe', url };
        }
        return { type: 'iframe', url: embedUrl };
    }

    // 2. Parse YouTube URL (watch?v=, youtu.be, shorts)
    if (videoUrl) {
        const ytMatch = videoUrl.match(
            /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        if (ytMatch && ytMatch[1]) {
            return {
                type: 'iframe',
                url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
            };
        }

        // Direct HTML5 video file (.mp4, .webm, .ogg), X/Twitter video CDN, or blob / data URL
        if (
            /\.(mp4|webm|ogg)($|\?)/i.test(videoUrl) ||
            videoUrl.includes('video.twimg.com') ||
            (videoUrl && (videoUrl.startsWith('blob:') || videoUrl.startsWith('data:video')))
        ) {
            return { type: 'video', url: videoUrl };
        }
    }

    return { type: 'none', url: null };
}
