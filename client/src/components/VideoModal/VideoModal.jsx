import { useEffect, useRef } from 'react';
import { getEmbedInfo } from '../../utils/embed.js';
import { formatCount, formatDuration, formatDate } from '../../utils/formatters.js';
import './VideoModal.css';

const PLATFORM_LABELS = {
    youtube: 'YouTube',
    twitter: 'X',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    demo: 'Demo',
    studio: 'AI Studio',
};

/**
 * VideoModal — In-App Video Preview Modal.
 *
 * Props:
 *   video {object} - the selected video to play
 *   onClose {function} - callback when closing modal
 *   isBookmarked {boolean} - whether video is bookmarked
 *   onToggleBookmark {function} - callback to toggle bookmark
 */
export default function VideoModal({
    video,
    onClose,
    isBookmarked = false,
    onToggleBookmark,
}) {
    const modalRef = useRef(null);
    const closeBtnRef = useRef(null);

    // Close on Escape & trap body scroll
    useEffect(() => {
        if (!video) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        if (closeBtnRef.current) {
            closeBtnRef.current.focus();
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [video, onClose]);

    if (!video) return null;

    const {
        platform,
        creator = {},
        title,
        description,
        aiDescription,
        category,
        tags = [],
        thumbnailUrl,
        videoUrl,
        durationSeconds,
        publishedAt,
        viewCount,
        likeCount,
    } = video;

    const embed = getEmbedInfo(video);
    const platformLabel = PLATFORM_LABELS[platform] || platform;
    const badgeClass = `video-card__platform-badge badge-${platform || 'demo'}`;

    return (
        <div
            className="video-modal-backdrop"
            onClick={onClose}
            role="presentation"
            data-testid="video-modal-backdrop"
        >
            <div
                className="video-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="video-modal-title"
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="video-modal__header">
                    <div className="video-modal__header-tags">
                        <span className={badgeClass}>{platformLabel}</span>
                        {category && (
                            <span className="video-modal__category">{category}</span>
                        )}
                    </div>

                    <div className="video-modal__header-actions">
                        {onToggleBookmark && (
                            <button
                                type="button"
                                className={`video-modal__bookmark-btn ${
                                    isBookmarked ? 'active' : ''
                                }`}
                                onClick={() => onToggleBookmark(video)}
                                aria-label={
                                    isBookmarked
                                        ? 'Remove from favorites'
                                        : 'Save to favorites'
                                }
                                title={
                                    isBookmarked
                                        ? 'Remove from favorites'
                                        : 'Save to favorites'
                                }
                            >
                                <span aria-hidden="true">
                                    {isBookmarked ? '❤️' : '🤍'}
                                </span>
                                <span className="video-modal__bookmark-text">
                                    {isBookmarked ? 'Saved' : 'Save'}
                                </span>
                            </button>
                        )}
                        <button
                            ref={closeBtnRef}
                            type="button"
                            className="video-modal__close-btn"
                            onClick={onClose}
                            aria-label="Close preview modal"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Video Player */}
                <div className="video-modal__player-area">
                    {embed.type === 'iframe' && (
                        <div className="video-modal__iframe-wrapper">
                            <iframe
                                src={embed.url}
                                title={title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="video-modal__iframe"
                            />
                        </div>
                    )}

                    {embed.type === 'video' && (
                        <div className="video-modal__iframe-wrapper">
                            <video
                                src={embed.url}
                                controls
                                autoPlay
                                className="video-modal__native-video"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}

                    {embed.type === 'none' && (
                        <div className="video-modal__no-embed">
                            {thumbnailUrl ? (
                                <img
                                    src={thumbnailUrl}
                                    alt={`Poster for ${title}`}
                                    className="video-modal__no-embed-poster"
                                />
                            ) : (
                                <div className="video-modal__no-embed-placeholder">🎬</div>
                            )}
                            <div className="video-modal__no-embed-overlay">
                                <p className="video-modal__no-embed-msg">
                                    Direct in-app embed is restricted by {platformLabel}.
                                </p>
                                <a
                                    href={videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="video-modal__cta-btn"
                                >
                                    ▶ Watch original clip on {platformLabel}
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Body & Metadata */}
                <div className="video-modal__body">
                    <h2 id="video-modal-title" className="video-modal__title">
                        {title}
                    </h2>

                    {/* Creator Row */}
                    <div className="video-modal__creator-row">
                        <div className="video-modal__creator">
                            {creator.avatarUrl ? (
                                <img
                                    src={creator.avatarUrl}
                                    alt={creator.name || 'Creator'}
                                    className="video-modal__avatar"
                                />
                            ) : (
                                <div className="video-modal__avatar video-modal__avatar-placeholder">
                                    {(creator.name || 'C')[0]}
                                </div>
                            )}
                            <div className="video-modal__creator-details">
                                <span className="video-modal__creator-name">
                                    {creator.name || 'Unknown Creator'}
                                </span>
                                {creator.handle && (
                                    <span className="video-modal__creator-handle">
                                        {creator.handle}
                                    </span>
                                )}
                            </div>
                        </div>

                        {creator.profileUrl && (
                            <a
                                href={creator.profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-modal__creator-profile-link"
                            >
                                View Profile ↗
                            </a>
                        )}
                    </div>

                    {/* AI Description Spotlight */}
                    {aiDescription && (
                        <div className="video-modal__ai-box">
                            <div className="video-modal__ai-header">
                                <span className="video-modal__ai-sparkle">✨</span>
                                <span className="video-modal__ai-label">AI Description</span>
                            </div>
                            <p className="video-modal__ai-text">{aiDescription}</p>
                        </div>
                    )}

                    {/* Original Description */}
                    {description && description !== aiDescription && (
                        <div className="video-modal__orig-desc">
                            <span className="video-modal__section-heading">Original Caption</span>
                            <p>{description}</p>
                        </div>
                    )}

                    {/* Stats & Meta Bar */}
                    <div className="video-modal__meta-bar">
                        {formatCount(viewCount) && (
                            <div className="video-modal__stat">
                                <span className="video-modal__stat-label">Views</span>
                                <span className="video-modal__stat-val">{formatCount(viewCount)}</span>
                            </div>
                        )}
                        {formatCount(likeCount) && (
                            <div className="video-modal__stat">
                                <span className="video-modal__stat-label">Likes</span>
                                <span className="video-modal__stat-val">{formatCount(likeCount)}</span>
                            </div>
                        )}
                        {formatDuration(durationSeconds) && (
                            <div className="video-modal__stat">
                                <span className="video-modal__stat-label">Duration</span>
                                <span className="video-modal__stat-val">
                                    {formatDuration(durationSeconds)}
                                </span>
                            </div>
                        )}
                        {formatDate(publishedAt) && (
                            <div className="video-modal__stat">
                                <span className="video-modal__stat-label">Published</span>
                                <span className="video-modal__stat-val">{formatDate(publishedAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {tags && tags.length > 0 && (
                        <div className="video-modal__tags">
                            {tags.map((t) => (
                                <span key={t} className="video-modal__tag">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="video-modal__actions">
                        {onToggleBookmark && (
                            <button
                                type="button"
                                className={`video-modal__secondary-btn ${
                                    isBookmarked ? 'active' : ''
                                }`}
                                onClick={() => onToggleBookmark(video)}
                            >
                                {isBookmarked
                                    ? '❤️ Saved in Favorites'
                                    : '🤍 Save to Favorites'}
                            </button>
                        )}
                        <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="video-modal__cta-btn"
                        >
                            ▶ Watch on {platformLabel} ↗
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
