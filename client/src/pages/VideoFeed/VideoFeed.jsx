import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { fetchVideos } from '../../api/videos.js';
import VideoCard from '../../components/VideoCard/VideoCard.jsx';
import FilterBar from '../../components/FilterBar/FilterBar.jsx';
import SearchBar from '../../components/SearchBar/SearchBar.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import VideoModal from '../../components/VideoModal/VideoModal.jsx';
import { useBookmarks } from '../../hooks/useBookmarks.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import './VideoFeed.css';

const DEFAULT_FILTERS = { platform: 'all', category: 'all' };
const PAGE_SIZE = 6;

export default function VideoFeed() {
    const [videos, setVideos] = useState([]);
    const [total, setTotal] = useState(0);
    const [mode, setMode] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [visibleSavedCount, setVisibleSavedCount] = useState(PAGE_SIZE);
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const sentinelRef = useRef(null);

    const {
        bookmarks,
        bookmarksCount,
        isBookmarked,
        toggleBookmark,
    } = useBookmarks();

    const { settings } = useSettings();

    // Scroll listener for "Back to Top" button
    useEffect(() => {
        function handleScroll() {
            if (window.scrollY > 400) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initial page load
    const loadInitialVideos = useCallback(async () => {
        setStatus('loading');
        setErrorMsg('');
        setVisibleSavedCount(PAGE_SIZE);
        try {
            const data = await fetchVideos({
                ...filters,
                search: searchQuery,
                limit: PAGE_SIZE,
                skip: 0,
            });
            setVideos(data.videos || []);
            setTotal(data.total || 0);
            setMode(data.mode);
            setHasMore(
                data.hasMore !== undefined
                    ? data.hasMore
                    : (data.videos || []).length < (data.total || 0)
            );
            setStatus('success');
        } catch (err) {
            console.error('Failed to fetch videos:', err);
            setErrorMsg(err.message || 'Failed to load videos.');
            setStatus('error');
        }
    }, [filters, searchQuery, retryCount]);

    useEffect(() => {
        loadInitialVideos();
    }, [loadInitialVideos]);

    // Filter bookmarks for saved mode
    const filteredBookmarks = useMemo(() => {
        if (!showSavedOnly) return [];
        const q = searchQuery.trim().toLowerCase();

        return bookmarks.filter((v) => {
            if (filters.platform !== 'all' && v.platform !== filters.platform) {
                return false;
            }
            if (filters.category !== 'all' && v.category !== filters.category) {
                return false;
            }
            if (q) {
                const titleMatch = v.title?.toLowerCase().includes(q);
                const creatorMatch =
                    v.creator?.name?.toLowerCase().includes(q) ||
                    v.creator?.handle?.toLowerCase().includes(q);
                const aiDescMatch = v.aiDescription?.toLowerCase().includes(q);
                const descMatch = v.description?.toLowerCase().includes(q);
                const tagsMatch =
                    Array.isArray(v.tags) &&
                    v.tags.some((t) => t.toLowerCase().includes(q));

                if (!titleMatch && !creatorMatch && !aiDescMatch && !descMatch && !tagsMatch) {
                    return false;
                }
            }
            return true;
        });
    }, [showSavedOnly, bookmarks, filters, searchQuery]);

    // Clips to display
    const displayVideos = useMemo(() => {
        const base = showSavedOnly ? filteredBookmarks.slice(0, visibleSavedCount) : videos;
        if (settings?.velocityThreshold > 0) {
            return base.filter((v) => (v.metrics?.viewVelocity || 0) >= settings.velocityThreshold);
        }
        return base;
    }, [showSavedOnly, filteredBookmarks, visibleSavedCount, videos, settings?.velocityThreshold]);

    const canLoadMore = showSavedOnly
        ? filteredBookmarks.length > visibleSavedCount
        : hasMore && !isLoadingMore;

    // Load next page
    const handleLoadMore = useCallback(async () => {
        if (showSavedOnly) {
            setVisibleSavedCount((prev) => prev + PAGE_SIZE);
            return;
        }

        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        try {
            const nextSkip = videos.length;
            const data = await fetchVideos({
                ...filters,
                search: searchQuery,
                limit: PAGE_SIZE,
                skip: nextSkip,
            });

            setVideos((prev) => [...prev, ...(data.videos || [])]);
            setTotal(data.total || 0);
            setHasMore(
                data.hasMore !== undefined
                    ? data.hasMore
                    : nextSkip + (data.videos || []).length < (data.total || 0)
            );
        } catch (err) {
            console.error('Failed to load more clips:', err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [showSavedOnly, isLoadingMore, hasMore, videos.length, filters, searchQuery]);

    // IntersectionObserver for Infinite Scroll
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !canLoadMore || isLoadingMore || status !== 'success') return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleLoadMore();
                }
            },
            { rootMargin: '250px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [canLoadMore, isLoadingMore, status, handleLoadMore]);

    function handleFiltersChange(newFilters) {
        setFilters(newFilters);
    }

    function handleRetry() {
        setRetryCount((c) => c + 1);
    }

    function handleToggleSaved() {
        setShowSavedOnly((prev) => !prev);
    }

    function handleClearSearch() {
        setSearchQuery('');
    }

    const currentTotalCount = showSavedOnly ? filteredBookmarks.length : total;

    return (
        <div className="video-feed">
            {/* Header */}
            <header className="video-feed__header">
                <div className="video-feed__logo">
                    <span className="video-feed__logo-icon">📡</span>
                    Clip<span>Radar</span>
                </div>
                <p className="video-feed__tagline">
                    Discover the most interesting clips from public social media personalities — curated and described by AI.
                </p>
                {mode === 'demo' && (
                    <span className="video-feed__mode-badge">⚡ Demo Mode</span>
                )}
                {mode === 'live' && (
                    <span className="video-feed__mode-badge video-feed__mode-badge--live">🔴 Live YouTube Feed</span>
                )}
                {mode === 'production' && (
                    <span className="video-feed__mode-badge video-feed__mode-badge--live">🟢 MongoDB Live</span>
                )}

                {/* Search Bar */}
                <div className="video-feed__search-wrapper">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search creators, titles, AI summaries, or tags…"
                    />
                </div>
            </header>

            {/* Filters & Favorites Bar */}
            <FilterBar
                platform={filters.platform}
                category={filters.category}
                onChange={handleFiltersChange}
                showSavedOnly={showSavedOnly}
                savedCount={bookmarksCount}
                onToggleSaved={handleToggleSaved}
            />

            {/* Results count & status bar */}
            {status === 'success' && (
                <div className="video-feed__results-bar">
                    <span>
                        {showSavedOnly
                            ? `Showing ${displayVideos.length} of ${filteredBookmarks.length} saved clip${
                                  filteredBookmarks.length === 1 ? '' : 's'
                              }`
                            : searchQuery
                            ? `Showing ${displayVideos.length} of ${total} result${
                                  total === 1 ? '' : 's'
                              } for "${searchQuery}"`
                            : displayVideos.length === 0
                            ? 'No videos found'
                            : `Showing ${displayVideos.length} of ${total} videos`}
                    </span>
                    {(searchQuery || showSavedOnly) && (
                        <div>
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="video-feed__clear-link"
                                    onClick={handleClearSearch}
                                >
                                    Clear search
                                </button>
                            )}
                            {showSavedOnly && (
                                <button
                                    type="button"
                                    className="video-feed__clear-link"
                                    onClick={() => setShowSavedOnly(false)}
                                    style={{ marginLeft: '12px' }}
                                >
                                    View all clips
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Main grid */}
            <main
                className={`video-feed__grid ${settings?.feedDensity === 'cinematic' ? 'video-feed__grid--cinematic' : ''}`}
                id="video-grid"
                aria-label="Video results"
            >
                {/* Initial Loading */}
                {status === 'loading' && (
                    <div className="video-feed__state">
                        <Spinner label="Finding clips…" />
                    </div>
                )}

                {/* Error */}
                {status === 'error' && (
                    <div className="video-feed__state" role="alert">
                        <span className="video-feed__state-icon">⚠️</span>
                        <h2 className="video-feed__state-title">Something went wrong</h2>
                        <p className="video-feed__state-msg">{errorMsg}</p>
                        <button
                            className="video-feed__retry"
                            onClick={handleRetry}
                            id="retry-button"
                        >
                            🔄 Try again
                        </button>
                    </div>
                )}

                {/* Empty State: Saved tab has no bookmarks */}
                {status === 'success' && showSavedOnly && bookmarksCount === 0 && (
                    <div className="video-feed__state">
                        <span className="video-feed__state-icon">❤️</span>
                        <h2 className="video-feed__state-title">No saved clips yet</h2>
                        <p className="video-feed__state-msg">
                            Click the heart icon on any video card to save your favorite clips here.
                        </p>
                        <button
                            type="button"
                            className="video-feed__action-btn"
                            onClick={() => setShowSavedOnly(false)}
                        >
                            Explore Clips
                        </button>
                    </div>
                )}

                {/* Empty State: Search or filters returned 0 */}
                {status === 'success' &&
                    displayVideos.length === 0 &&
                    (!showSavedOnly || bookmarksCount > 0) && (
                        <div className="video-feed__state">
                            <span className="video-feed__state-icon">🔍</span>
                            <h2 className="video-feed__state-title">No clips found</h2>
                            <p className="video-feed__state-msg">
                                {searchQuery
                                    ? `No clips matched "${searchQuery}". Try a different search term or clear the filter.`
                                    : 'Try adjusting your platform or category filters, or check back after a refresh.'}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="video-feed__action-btn"
                                    onClick={handleClearSearch}
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}

                {/* Videos */}
                {status === 'success' &&
                    displayVideos.map((video) => (
                        <VideoCard
                            key={`${video.platform}-${video.platformVideoId}`}
                            video={video}
                            onSelectVideo={setSelectedVideo}
                            isBookmarked={isBookmarked(video)}
                            onToggleBookmark={toggleBookmark}
                        />
                    ))}
            </main>

            {/* Pagination & Infinite Scroll Controls */}
            {status === 'success' && displayVideos.length > 0 && (
                <div className="video-feed__pagination">
                    {/* Loading More Spinner */}
                    {isLoadingMore && (
                        <div className="video-feed__loading-more" role="status">
                            <div className="spinner-ring" />
                            <span>Loading more clips…</span>
                        </div>
                    )}

                    {/* Manual Load More Button & Intersection Sentinel */}
                    {canLoadMore && !isLoadingMore && (
                        <>
                            <button
                                type="button"
                                className="video-feed__load-more-btn"
                                onClick={handleLoadMore}
                                id="load-more-button"
                            >
                                ↓ Load More Clips ({displayVideos.length} of {currentTotalCount})
                            </button>
                            <div
                                ref={sentinelRef}
                                className="video-feed__sentinel"
                                aria-hidden="true"
                            />
                        </>
                    )}

                    {/* All Caught Up Indicator */}
                    {!canLoadMore && (
                        <div className="video-feed__end-message">
                            <span>
                                ✨ You're all caught up! Viewed all {displayVideos.length} clip
                                {displayVideos.length === 1 ? '' : 's'}.
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Back to Top Button */}
            {showBackToTop && (
                <button
                    type="button"
                    className="video-feed__back-to-top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Scroll back to top"
                >
                    ↑ Top
                </button>
            )}

            {/* Preview Modal */}
            {selectedVideo && (
                <VideoModal
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    isBookmarked={isBookmarked(selectedVideo)}
                    onToggleBookmark={toggleBookmark}
                />
            )}

            <footer className="video-feed__footer">
                <p>
                    ClipRadar surfaces publicly available video metadata via official APIs.
                    All videos link to their original platform. No videos are hosted or scraped.
                </p>
            </footer>
        </div>
    );
}
