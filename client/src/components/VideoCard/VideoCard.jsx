import { formatCount, formatDuration, formatDate } from '../../utils/formatters.js';
import {
    IconFilm,
    IconHeart,
    IconPlay,
    IconEye,
    IconExternalLink,
} from '../common/Icons.jsx';
import './VideoCard.css';

const PLATFORM_LABELS = {
    youtube: 'YouTube',
    twitter: 'X',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    demo: 'Demo',
    studio: 'AI Studio',
};

/**
 * VideoCard — displays a single video item with preview triggers and favorites.
 *
 * Props:
 *   video {object} — a video document from the API
 *   onSelectVideo {function} — optional callback when clicking preview
 *   isBookmarked {boolean} — whether this video is favorited
 *   onToggleBookmark {function} — callback to toggle favorite
 */
export default function VideoCard({
    video,
    index = 0,
    onSelectVideo,
    isBookmarked = false,
    onToggleBookmark,
}) {
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

    function handlePreview() {
        if (onSelectVideo) {
            onSelectVideo(video);
        }
    }

    return (
        <article
            className="video-card"
            aria-label={title}
            style={{ '--card-index': index % 6 }}
        >
            {/* Thumbnail with Preview Click */}
            <div
                className="video-card__thumb"
                onClick={handlePreview}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePreview();
                    }
                }}
                aria-label={`Preview "${title}"`}
            >
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={`Thumbnail for ${title}`} loading="lazy" />
                ) : (
                    <div className="video-card__thumb-placeholder" aria-hidden="true">
                        <IconFilm size={32} />
                    </div>
                )}
                <span className={badgeClass}>{platformLabel}</span>
                {formatDuration(durationSeconds) && (
                    <span className="video-card__duration">
                        {formatDuration(durationSeconds)}
                    </span>
                )}

                {/* Bookmark / Favorite Button */}
                {onToggleBookmark && (
                    <button
                        type="button"
                        className={`video-card__bookmark-btn ${isBookmarked ? 'active' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(video);
                        }}
                        aria-label={
                            isBookmarked
                                ? `Remove "${title}" from favorites`
                                : `Save "${title}" to favorites`
                        }
                        aria-pressed={isBookmarked}
                        title={isBookmarked ? 'Remove from favorites' : 'Save to favorites'}
                    >
                        <IconHeart size={18} filled={isBookmarked} />
                    </button>
                )}

                {/* Hover Play Overlay */}
                <div className="video-card__play-overlay" aria-hidden="true">
                    <span className="video-card__play-icon">
                        <IconPlay size={20} fill="#ffffff" color="#ffffff" />
                    </span>
                    <span className="video-card__play-label">Preview</span>
                </div>
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
                <h2
                    className="video-card__title"
                    onClick={handlePreview}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handlePreview();
                        }
                    }}
                >
                    {title}
                </h2>

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
                                <IconEye size={13} /> {formatCount(viewCount)}
                            </span>
                        )}
                        {formatDate(publishedAt) && (
                            <span>{formatDate(publishedAt)}</span>
                        )}
                    </div>
                </div>

                {/* CTA Row */}
                <div className="video-card__cta-row">
                    <button
                        type="button"
                        className="video-card__preview-btn"
                        onClick={handlePreview}
                        aria-label={`Preview "${title}" in modal`}
                    >
                        <IconPlay size={13} fill="currentColor" /> In-App Preview
                    </button>
                    <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="video-card__cta"
                        aria-label={`Watch "${title}" on ${platformLabel}`}
                    >
                        Watch on {platformLabel} <IconExternalLink size={13} />
                    </a>
                </div>
            </div>
        </article>
    );
}
