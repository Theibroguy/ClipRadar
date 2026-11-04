import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { fetchDailyDrop, generateFreshDailyDrop } from '../../api/videos.js';
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
 * DailyRadarSection — Displays the daily curated batch of viral YouTube clips.
 *
 * Props:
 *   onPreview {function} - Callback when clicking "Preview" on a video
 */
export default function DailyRadarSection({ onPreview }) {
    const navigate = useSafeNavigate();
    const [dailyData, setDailyData] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdownSec, setCountdownSec] = useState(0);
    const [toastMessage, setToastMessage] = useState('');

    // Load daily drop
    const loadDrop = useCallback(async (date = null) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const data = await fetchDailyDrop(date);
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
            const res = await generateFreshDailyDrop();
            if (res.drop) {
                setDailyData(res.drop);
                setSelectedDate(res.drop.date);
                setCountdownSec(res.drop.nextDropCountdownSeconds || 0);
                setToastMessage('✨ Brand new fresh YouTube batch generated for today!');
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

    const videos = useMemo(() => dailyData?.videos || [], [dailyData]);

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
                            <span className="daily-radar__fire-badge">🔥 Daily Radar Drop</span>
                            {dailyData?.formattedDate && (
                                <span className="daily-radar__date-badge">
                                    📅 {dailyData.formattedDate}
                                </span>
                            )}
                            <span className="daily-radar__countdown-badge" title="Time until next daily batch">
                                ⏳ Next Drop in {formatCountdown(countdownSec)}
                            </span>
                        </div>
                        <h2 className="daily-radar__title">
                            Today's Viral YouTube Picks
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
                                            {index === 0 ? `🔥 Today (${d})` : `📅 ${d}`}
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
                            title="Generate a completely new batch of YouTube videos for today"
                            aria-label="Generate fresh YouTube video drop"
                        >
                            <span className="daily-radar__refresh-icon">{isRefreshing ? '⏳' : '⚡'}</span>
                            <span>{isRefreshing ? 'Grabbing New Clips…' : 'Generate New Batch'}</span>
                        </button>
                    </div>
                </div>

                {/* Video Cards Grid */}
                {isLoading ? (
                    <div className="daily-radar__loading">
                        <div className="daily-radar__skeleton-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="daily-radar__skeleton-card skeleton" />
                            ))}
                        </div>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="daily-radar__empty">
                        <p>No daily drops available for this date.</p>
                        <button type="button" onClick={() => handleForceRefresh()} className="daily-radar__action-btn">
                            ⚡ Fetch Fresh Batch Now
                        </button>
                    </div>
                ) : (
                    <div className="daily-radar__grid" role="list">
                        {videos.map((video) => (
                            <article
                                key={video.platformVideoId || video.videoUrl}
                                className="daily-card"
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
                                        src={video.thumbnailUrl || 'https://picsum.photos/seed/yt/640/360'}
                                        alt={video.title}
                                        loading="lazy"
                                        className="daily-card__thumb-img"
                                    />
                                    <span className="daily-card__platform-badge">YouTube Short</span>
                                    {video.durationSeconds && (
                                        <span className="daily-card__duration-badge">
                                            {Math.floor(video.durationSeconds / 60)}:
                                            {String(video.durationSeconds % 60).padStart(2, '0')}
                                        </span>
                                    )}
                                    <div className="daily-card__play-overlay">
                                        <span className="daily-card__play-icon" aria-hidden="true">▶</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="daily-card__content">
                                    <div className="daily-card__meta-top">
                                        <span className="daily-card__category">{video.category || 'Viral'}</span>
                                        {video.velocityViewsPerHour && (
                                            <span className="daily-card__velocity">
                                                ⚡ {formatViews(video.velocityViewsPerHour)}/hr
                                            </span>
                                        )}
                                        <span className="daily-card__views">
                                            👀 {formatViews(video.viewCount)} views
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
                                            <div className="daily-card__creator-avatar">
                                                {video.creator?.name ? video.creator.name.charAt(0) : 'Y'}
                                            </div>
                                            <span className="daily-card__creator-name">
                                                {video.creator?.name || 'YouTube Creator'}
                                            </span>
                                        </div>

                                        <div className="daily-card__actions">
                                            <button
                                                type="button"
                                                className="daily-card__preview-btn"
                                                onClick={() => onPreview && onPreview(video)}
                                                title="Preview full video with embedded player"
                                            >
                                                🎬 Preview
                                            </button>
                                            <button
                                                type="button"
                                                className="daily-card__studio-btn"
                                                onClick={() => handleSendToStudio(video)}
                                                title="Remix and generate viral short in Video Studio"
                                            >
                                                ✂️ Studio
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
