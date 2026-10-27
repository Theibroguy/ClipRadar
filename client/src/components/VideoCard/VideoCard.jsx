import './VideoCard.css';

const PLATFORM_LABELS = {
    youtube: 'YouTube',
    twitter: 'X',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    demo: 'Demo',
};

/** Format view count: 1500000 → "1.5M" */
function formatCount(n) {
    if (!n) return null;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
}

/** Format seconds: 872 → "14:32" */
function formatDuration(sec) {
    if (!sec) return null;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

/** Format ISO date → "May 12, 2024" */
function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * VideoCard — displays a single video item.
 *
 * Props:
 *   video {object} — a video document from the API
 */
export default function VideoCard({ video }) {
    const {
        platform,
        creator = {},
        title,
        aiDescription,
        category,
        thumbnailUrl,
        videoUrl,
        durationSeconds,
        publishedAt,
        viewCount,
    } = video;

    const badgeClass = `video-card__platform-badge badge-${platform || 'demo'}`;
    const platformLabel = PLATFORM_LABELS[platform] || platform;

    return (
        <article className="video-card" aria-label={title}>
            {/* Thumbnail */}
            <div className="video-card__thumb">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={`Thumbnail for ${title}`} loading="lazy" />
                ) : (
                    <div className="video-card__thumb-placeholder" aria-hidden="true">🎬</div>
                )}
                <span className={badgeClass}>{platformLabel}</span>
                {formatDuration(durationSeconds) && (
                    <span className="video-card__duration">
                        {formatDuration(durationSeconds)}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="video-card__body">
                {/* Creator */}
                <div className="video-card__creator">
                    {creator.avatarUrl ? (
                        <img
                            src={creator.avatarUrl}
                            alt={creator.name || 'Creator'}
                            className="video-card__avatar"
                        />
                    ) : (
                        <div
                            className="video-card__avatar skeleton"
                            aria-hidden="true"
                            style={{ flexShrink: 0 }}
                        />
                    )}
                    <div className="video-card__creator-info">
                        <span className="video-card__creator-name">
                            {creator.name || 'Unknown Creator'}
                        </span>
                        {creator.handle && (
                            <span className="video-card__creator-handle">{creator.handle}</span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h2 className="video-card__title">{title}</h2>

                {/* AI Description */}
                {aiDescription && (
                    <p className="video-card__ai-desc">{aiDescription}</p>
                )}

                {/* Footer */}
                <div className="video-card__footer">
                    {category && (
                        <span className="video-card__category">{category}</span>
                    )}
                    <div className="video-card__meta">
                        {formatCount(viewCount) && (
                            <span className="video-card__views">
                                👁 {formatCount(viewCount)}
                            </span>
                        )}
                        {formatDate(publishedAt) && (
                            <span>{formatDate(publishedAt)}</span>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="video-card__cta"
                    aria-label={`Watch "${title}" on ${platformLabel}`}
                >
                    ▶ Watch on {platformLabel}
                </a>
            </div>
        </article>
    );
}
