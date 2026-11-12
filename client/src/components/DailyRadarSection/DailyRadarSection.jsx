import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { fetchDailyDrop, generateFreshDailyDrop } from '../../api/videos.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    IconFlame,
    IconCalendar,
    IconClock,
    IconRefresh,
    IconChevron,
    IconYouTube,
    IconX,
    IconTarget,
    IconClose,
    IconTag,
    IconPlay,
    IconScissors,
    IconBolt,
    IconEye,
    IconSparkles,
} from '../common/Icons.jsx';
import './DailyRadarSection.css';

function useSafeNavigate() {
    const inRouter = useInRouterContext();
    const navigate = inRouter ? useNavigate() : null;
    return inRouter && navigate ? navigate : () => {};
}

/**
 * Format countdown seconds into HH:MM:SS string
 */
function formatCountdown(totalSec) {
    if (totalSec <= 0) return '00h 00m 00s';
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Format view numbers into compact notation (e.g. 1.2M, 45K)
 */
function formatViews(views) {
    if (!views) return '0';
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${Math.round(views / 1_000)}K`;
    return String(views);
}

/**
 * DailyRadarSection — Displays the daily curated batch of viral YouTube and X (Twitter) clips.
 *
 * Props:
 *   onPreview {function} - Callback when clicking "Preview" on a video
 */
export default function DailyRadarSection({ onPreview, platform = 'youtube', onSelectPlatform }) {
    const navigate = useSafeNavigate();
    const {
        settings,
        addTrackedCreator,
        removeTrackedCreator,
        addTrackedHashtag,
        removeTrackedHashtag,
    } = useSettings();

    const trackedTwitterCreators = settings?.trackedTwitterCreators || [];
    const trackedTwitterHashtags = settings?.trackedTwitterHashtags || [];

    const [dailyData, setDailyData] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [activePlatform, setActivePlatform] = useState(
        platform === 'twitter' ? 'twitter' : 'youtube'
    ); // 'youtube' | 'twitter'
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdownSec, setCountdownSec] = useState(0);
    const [toastMessage, setToastMessage] = useState('');
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (platform === 'twitter' || platform === 'youtube') {
            setActivePlatform(platform);
        }
    }, [platform]);

    function handleSwitchPlatform(targetPlatform) {
        setActivePlatform(targetPlatform);
        if (onSelectPlatform) {
            onSelectPlatform(targetPlatform);
        }
    }

    // Load daily drop (all platforms loaded together for instantaneous client tab switching)
    const loadDrop = useCallback(async (date = null) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const data = await fetchDailyDrop(date, 'all');
            setDailyData(data);
            setSelectedDate(data.date);
            setCountdownSec(data.nextDropCountdownSeconds || 0);
        } catch (err) {
            console.error('Failed to load daily drop:', err);
            setErrorMessage('Unable to load today\'s daily drop.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDrop();
    }, [loadDrop]);

    // Live countdown timer ticking every second
    useEffect(() => {
        if (countdownSec <= 0) return;
        const timer = setInterval(() => {
            setCountdownSec((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [countdownSec]);

    // Force fetch fresh batch on demand
    async function handleForceRefresh() {
        setIsRefreshing(true);
        try {
            const res = await generateFreshDailyDrop('all');
            if (res.drop) {
                setDailyData(res.drop);
                setSelectedDate(res.drop.date);
                setCountdownSec(res.drop.nextDropCountdownSeconds || 0);
                const platformLabel =
                    activePlatform === 'twitter'
                        ? 'X / Twitter'
                        : activePlatform === 'youtube'
                        ? 'YouTube'
                        : 'Radar';
                setToastMessage(`✨ Brand new fresh ${platformLabel} batch generated for today!`);
                setTimeout(() => setToastMessage(''), 4000);
            }
        } catch (err) {
            console.error('Failed to generate fresh drop:', err);
            setToastMessage('⚠️ Could not refresh drop. Please try again.');
            setTimeout(() => setToastMessage(''), 4000);
        } finally {
            setIsRefreshing(false);
        }
    }

    function handleDateChange(e) {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        loadDrop(newDate);
    }

    function handleSendToStudio(video) {
        navigate('/studio', { state: { preloadedVideo: video } });
    }

    function handleAddCustomItem(e) {
        e?.preventDefault();
        const trimmed = customInput.trim();
        if (!trimmed) return;
        if (trimmed.startsWith('#')) {
            addTrackedHashtag(trimmed);
            setToastMessage(`✨ Added ${trimmed} to tracked hashtags!`);
        } else {
            const handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
            addTrackedCreator(handle);
            setToastMessage(`✨ Added ${handle} to favorite creators!`);
        }
        setCustomInput('');
        setTimeout(() => setToastMessage(''), 3000);
    }

    const allVideos = useMemo(() => dailyData?.videos || [], [dailyData]);

    const visibleVideos = useMemo(() => {
        if (activePlatform === 'all') return allVideos;
        return allVideos.filter((v) => v.platform === activePlatform);
    }, [allVideos, activePlatform]);

    const platformCounts = useMemo(
        () => ({
            all: allVideos.length,
            youtube: allVideos.filter((v) => v.platform === 'youtube').length,
            twitter: allVideos.filter((v) => v.platform === 'twitter').length,
        }),
        [allVideos]
    );

    const sectionTitle = useMemo(() => {
        if (activePlatform === 'twitter') return "Today's Viral X / Twitter Clips";
        if (activePlatform === 'youtube') return "Today's Viral YouTube Shorts";
        return "Today's Viral Radar Picks";
    }, [activePlatform]);

    if (errorMessage && !dailyData) {
        return (
            <section className="daily-radar-section daily-radar-section--error" aria-label="Daily Radar Drops">
                <div className="daily-radar__container">
                    <div className="daily-radar__error-box">
                        <span>⚠️ {errorMessage}</span>
                        <button type="button" onClick={() => loadDrop()} className="daily-radar__retry-btn">
                            Retry
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="daily-radar-section" aria-label="Daily Radar Drops">
            <div className="daily-radar__container">
                {/* Notification Toast */}
                {toastMessage && (
                    <div className="daily-radar__toast" role="status">
                        <span>{toastMessage}</span>
                    </div>
                )}

                {/* Section Header */}
                <div className="daily-radar__header">
                    <div className="daily-radar__header-left">
                        <div className="daily-radar__badge-row">
                            <span className="daily-radar__fire-badge">
                                <IconFlame size={16} /> Daily Radar Drop
                            </span>
                            {dailyData?.formattedDate && (
                                <span className="daily-radar__date-badge">
                                    <IconCalendar size={14} /> {dailyData.formattedDate}
                                </span>
                            )}
                            <span className="daily-radar__countdown-badge" title="Time until next daily batch">
                                <IconClock size={14} /> Next Drop in {formatCountdown(countdownSec)}
                            </span>
                        </div>
                        <h2 className="daily-radar__title">
                            {sectionTitle}
                        </h2>
                        {dailyData?.theme && (
                            <p className="daily-radar__subtitle">
                                <span className="daily-radar__theme-label">Theme:</span> {dailyData.theme}
                            </p>
                        )}
                    </div>

                    <div className="daily-radar__header-right">
                        {/* History Selector Dropdown */}
                        {dailyData?.history && dailyData.history.length > 1 && (
                            <div className="daily-radar__history-select-wrap">
                                <label htmlFor="daily-history-select" className="sr-only">Select Daily Drop Date</label>
                                <select
                                    id="daily-history-select"
                                    className="daily-radar__history-select"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                >
                                    {dailyData.history.map((d, index) => (
                                        <option key={d} value={d}>
                                            {index === 0 ? `Today (${d})` : d}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Force Refresh Button */}
                        <button
                            type="button"
                            className={`daily-radar__refresh-btn ${isRefreshing ? 'daily-radar__refresh-btn--loading' : ''}`}
                            onClick={handleForceRefresh}
                            disabled={isRefreshing || isLoading}
                            title="Generate a completely new batch of videos for today"
                            aria-label="Generate fresh video drop"
                        >
                            <span className="daily-radar__refresh-icon">
                                <IconRefresh size={16} spinning={isRefreshing} />
                            </span>
                            <span>{isRefreshing ? 'Grabbing New Clips…' : 'Generate New Batch'}</span>
                        </button>

                        {/* Minimize / Expand Toggle */}
                        <button
                            type="button"
                            className="daily-radar__collapse-btn"
                            onClick={() => setIsCollapsed((prev) => !prev)}
                            aria-expanded={!isCollapsed}
                            title={isCollapsed ? "Expand Daily Drops Section" : "Collapse Daily Drops Section"}
                        >
                            <IconChevron direction={isCollapsed ? 'down' : 'up'} size={15} />
                            <span>{isCollapsed ? "Show Drops" : "Hide Drops"}</span>
                        </button>
                    </div>
                </div>

                {!isCollapsed && (
                    <>
                        {/* Platform Filter Tabs & Customizer Button */}
                        <div className="daily-radar__controls-row">
                    <div className="daily-radar__platform-tabs" role="tablist" aria-label="Filter daily drops by platform">
                        <button
                            type="button"
                            role="tab"
                            id="tab-youtube"
                            aria-selected={activePlatform === 'youtube'}
                            className={`daily-radar__tab-btn ${activePlatform === 'youtube' ? 'active' : ''}`}
                            onClick={() => handleSwitchPlatform('youtube')}
                        >
                            <IconYouTube size={16} />
                            <span>YouTube Shorts</span>
                            {platformCounts.youtube > 0 && (
                                <span className="daily-radar__tab-count">{platformCounts.youtube}</span>
                            )}
                        </button>
                        <button
                            type="button"
                            role="tab"
                            id="tab-twitter"
                            aria-selected={activePlatform === 'twitter'}
                            className={`daily-radar__tab-btn ${activePlatform === 'twitter' ? 'active' : ''}`}
                            onClick={() => handleSwitchPlatform('twitter')}
                        >
                            <IconX size={15} />
                            <span>Twitter Clips</span>
                            {platformCounts.twitter > 0 && (
                                <span className="daily-radar__tab-count">{platformCounts.twitter}</span>
                            )}
                        </button>
                    </div>

                    <button
                        type="button"
                        className={`daily-radar__customize-btn ${showCustomizer ? 'daily-radar__customize-btn--active' : ''}`}
                        onClick={() => setShowCustomizer((prev) => !prev)}
                        aria-expanded={showCustomizer}
                        title="Customize tracked X/Twitter creators and hashtags"
                    >
                        <IconTarget size={16} />
                        <span>Tracked Creators & Tags</span>
                        <span className="daily-radar__customize-count">
                            {trackedTwitterCreators.length + trackedTwitterHashtags.length}
                        </span>
                    </button>
                </div>

                {/* Customizer Drawer Panel */}
                {showCustomizer && (
                    <div className="daily-radar__customizer" aria-label="Customize Tracked Creators & Hashtags">
                        <div className="daily-radar__customizer-header">
                            <div>
                                <h3 className="daily-radar__customizer-title">
                                    <IconTarget size={18} /> Tracked X/Twitter Creators & Hashtags
                                </h3>
                                <p className="daily-radar__customizer-subtitle">
                                    Prioritize drops and viral moments from your favorite accounts and topics.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="daily-radar__customizer-close"
                                onClick={() => setShowCustomizer(false)}
                                aria-label="Close customizer"
                            >
                                <IconClose size={18} />
                            </button>
                        </div>

                        {/* Add Input Form */}
                        <form onSubmit={handleAddCustomItem} className="daily-radar__customizer-form">
                            <input
                                type="text"
                                className="daily-radar__customizer-input"
                                placeholder="Type @handle or #hashtag (e.g. @MrBeast, @FabrizioRomano, #gaming)..."
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                            />
                            <button type="submit" className="daily-radar__customizer-add-btn">
                                + Add
                            </button>
                        </form>

                        {/* Tracked Creators Chips */}
                        <div className="daily-radar__chips-section">
                            <span className="daily-radar__chips-label">
                                <IconX size={14} /> Favorite Creators ({trackedTwitterCreators.length}):
                            </span>
                            <div className="daily-radar__chips-list">
                                {trackedTwitterCreators.map((handle) => (
                                    <span key={handle} className="daily-radar__chip daily-radar__chip--creator">
                                        <span>{handle}</span>
                                        <button
                                            type="button"
                                            className="daily-radar__chip-del"
                                            onClick={() => removeTrackedCreator(handle)}
                                            aria-label={`Remove ${handle}`}
                                        >
                                            <IconClose size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tracked Hashtags Chips */}
                        <div className="daily-radar__chips-section">
                            <span className="daily-radar__chips-label">
                                <IconTag size={14} /> Tracked Hashtags ({trackedTwitterHashtags.length}):
                            </span>
                            <div className="daily-radar__chips-list">
                                {trackedTwitterHashtags.map((tag) => (
                                    <span key={tag} className="daily-radar__chip daily-radar__chip--hashtag">
                                        <span>{tag}</span>
                                        <button
                                            type="button"
                                            className="daily-radar__chip-del"
                                            onClick={() => removeTrackedHashtag(tag)}
                                            aria-label={`Remove ${tag}`}
                                        >
                                            <IconClose size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Quick Suggestion Presets */}
                        <div className="daily-radar__presets">
                            <span className="daily-radar__presets-label">
                                <IconBolt size={14} /> Quick Presets:
                            </span>
                            <div className="daily-radar__presets-list">
                                {['@MrBeast', '@FabrizioRomano', '@overtime', '@redbull', '@IGN', '#gaming', '#ufc', '#memes'].map((item) => {
                                    const isAdded = item.startsWith('@')
                                        ? trackedTwitterCreators.includes(item)
                                        : trackedTwitterHashtags.includes(item);
                                    if (isAdded) return null;
                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            className="daily-radar__preset-btn"
                                            onClick={() => {
                                                if (item.startsWith('@')) addTrackedCreator(item);
                                                else addTrackedHashtag(item);
                                            }}
                                        >
                                            + {item}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Video Cards Grid */}
                {isLoading ? (
                    <div className="daily-radar__loading">
                        <div className="daily-radar__skeleton-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="daily-radar__skeleton-card skeleton" />
                            ))}
                        </div>
                    </div>
                ) : visibleVideos.length === 0 ? (
                    <div className="daily-radar__empty">
                        <p>No daily {activePlatform === 'all' ? '' : activePlatform} drops available for this date.</p>
                        <button type="button" onClick={() => handleForceRefresh()} className="daily-radar__action-btn">
                            <IconRefresh size={16} /> Fetch Fresh Batch Now
                        </button>
                    </div>
                ) : (
                    <div className="daily-radar__grid" role="list">
                        {visibleVideos.map((video) => {
                            const isTwitter = video.platform === 'twitter';
                            return (
                                <article
                                    key={video.platformVideoId || video.videoUrl}
                                    className={`daily-card daily-card--${video.platform || 'youtube'}`}
                                    role="listitem"
                                >
                                    {/* Thumbnail */}
                                    <div
                                        className="daily-card__thumb-wrap"
                                        onClick={() => onPreview && onPreview(video)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && onPreview && onPreview(video)}
                                        aria-label={`Preview video: ${video.title}`}
                                    >
                                        <img
                                            src={video.thumbnailUrl || (isTwitter ? 'https://picsum.photos/seed/tw/640/360' : 'https://picsum.photos/seed/yt/640/360')}
                                            alt={video.title}
                                            loading="lazy"
                                            className="daily-card__thumb-img"
                                        />
                                        <span
                                            className={`daily-card__platform-badge daily-card__platform-badge--${isTwitter ? 'twitter' : 'youtube'}`}
                                        >
                                            {isTwitter ? <><IconX size={12} /> Post</> : <><IconYouTube size={12} /> YouTube Short</>}
                                        </span>
                                        {video.durationSeconds && (
                                            <span className="daily-card__duration-badge">
                                                {Math.floor(video.durationSeconds / 60)}:
                                                {String(video.durationSeconds % 60).padStart(2, '0')}
                                            </span>
                                        )}
                                        <div className="daily-card__play-overlay">
                                            <span className="daily-card__play-icon" aria-hidden="true">
                                                <IconPlay size={20} fill="#ffffff" color="#ffffff" />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="daily-card__content">
                                        <div className="daily-card__meta-top">
                                            <span className="daily-card__category">{video.category || 'Viral'}</span>
                                            {video.velocityViewsPerHour && (
                                                <span className="daily-card__velocity">
                                                    <IconBolt size={12} /> {formatViews(video.velocityViewsPerHour)}/hr
                                                </span>
                                            )}
                                            <span className="daily-card__views">
                                                <IconEye size={12} /> {formatViews(video.viewCount)} {isTwitter ? 'impressions' : 'views'}
                                            </span>
                                        </div>

                                        <h3
                                            className="daily-card__title"
                                            onClick={() => onPreview && onPreview(video)}
                                            title={video.title}
                                        >
                                            {video.title}
                                        </h3>

                                        <p className="daily-card__desc">
                                            {video.aiDescription || video.description}
                                        </p>

                                        {/* Creator & Actions */}
                                        <div className="daily-card__footer">
                                            <div className="daily-card__creator">
                                                <div
                                                    className={`daily-card__creator-avatar daily-card__creator-avatar--${isTwitter ? 'twitter' : 'youtube'}`}
                                                >
                                                    {video.creator?.avatarUrl ? (
                                                        <img
                                                            src={video.creator.avatarUrl}
                                                            alt=""
                                                            className="daily-card__creator-img"
                                                        />
                                                    ) : (
                                                        <span>{video.creator?.name ? video.creator.name.charAt(0) : (isTwitter ? <IconX size={12} /> : 'Y')}</span>
                                                    )}
                                                </div>
                                                <div className="daily-card__creator-info">
                                                    <span className="daily-card__creator-name" title={video.creator?.name}>
                                                        {video.creator?.name || (isTwitter ? 'X Creator' : 'YouTube Creator')}
                                                    </span>
                                                    {video.creator?.handle && (
                                                        <span className="daily-card__creator-handle" title={video.creator.handle}>
                                                            {video.creator.handle}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="daily-card__actions">
                                                <button
                                                    type="button"
                                                    className="daily-card__preview-btn"
                                                    onClick={() => onPreview && onPreview(video)}
                                                    title="Preview full video with embedded player"
                                                >
                                                    <IconPlay size={13} fill="currentColor" /> Preview
                                                </button>
                                                <button
                                                    type="button"
                                                    className="daily-card__studio-btn"
                                                    onClick={() => handleSendToStudio(video)}
                                                    title="Remix and generate viral short in Video Studio"
                                                >
                                                    <IconScissors size={13} /> Studio
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
                    </>
                )}
            </div>
        </section>
    );
}
