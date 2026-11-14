import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import { fetchVideos, grabXVideos } from '../../api/videos.js';
import VideoCard from '../../components/VideoCard/VideoCard.jsx';
import SearchBar from '../../components/SearchBar/SearchBar.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import VideoModal from '../../components/VideoModal/VideoModal.jsx';
import DailyRadarSection from '../../components/DailyRadarSection/DailyRadarSection.jsx';
import { useBookmarks } from '../../hooks/useBookmarks.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useFeedFilters } from '../../context/FeedFilterContext.jsx';
import {
    IconGrid,
    IconCinematic,
    IconAlert,
    IconRefresh,
    IconHeart,
    IconSearch,
    IconClose,
    IconMenu,
    IconYouTube,
    IconX,
    IconInstagram,
    IconTikTok,
    IconScissors,
    IconBolt,
} from '../../components/common/Icons.jsx';
import './VideoFeed.css';

const DEFAULT_FILTERS = { platform: 'youtube', category: 'all' };
const PAGE_SIZE = 6;

const SOCIAL_PAGES = [
    { value: 'youtube', path: '/youtube', label: 'YouTube', IconComponent: IconYouTube },
    { value: 'twitter', path: '/twitter', label: 'X / Twitter', IconComponent: IconX },
    { value: 'instagram', path: '/instagram', label: 'Instagram', IconComponent: IconInstagram },
    { value: 'tiktok', path: '/tiktok', label: 'TikTok', IconComponent: IconTikTok },
    { value: 'studio', path: '/studio-shorts', label: 'AI Studio', IconComponent: IconScissors },
];

const PLATFORM_PAGE_META = {
    youtube: {
        title: 'YouTube Shorts & Clips',
        tagline: 'Daily viral YouTube Shorts, creator challenges, and unscripted celebrity moments.',
        IconComponent: IconYouTube,
        badgeLabel: 'YouTube Page',
    },
    twitter: {
        title: 'X / Twitter Clips',
        tagline: 'Breaking viral X videos, tech breakthroughs, sports moments, and tracked creators.',
        IconComponent: IconX,
        badgeLabel: 'X / Twitter Page',
    },
    instagram: {
        title: 'Instagram Reels',
        tagline: 'Curated viral Instagram Reels, backstage celebrity moments, and visual highlights.',
        IconComponent: IconInstagram,
        badgeLabel: 'Instagram Page',
    },
    tiktok: {
        title: 'TikTok Videos',
        tagline: 'Trending TikTok reactions, optical illusions, comedy sketches, and creator challenges.',
        IconComponent: IconTikTok,
        badgeLabel: 'TikTok Page',
    },
    studio: {
        title: 'AI Studio Shorts',
        tagline: 'Your custom-rendered 9:16 vertical shorts created in the ClipRadar Video Studio.',
        IconComponent: IconScissors,
        badgeLabel: 'AI Studio Page',
    },
};

function useSafeNavigate() {
    const inRouter = useInRouterContext();
    const navigate = inRouter ? useNavigate() : null;
    return inRouter && navigate ? navigate : () => {};
}

export default function VideoFeed({ pagePlatform }) {
    const navigate = useSafeNavigate();
    const feedContext = useFeedFilters();
    const { settings, updateSettings, isSidebarOpen, toggleSidebar } = useSettings();

    const [localFilters, setLocalFilters] = useState(() => ({
        ...DEFAULT_FILTERS,
        platform: pagePlatform || DEFAULT_FILTERS.platform,
    }));
    const [localSearch, setLocalSearch] = useState('');
    const [localSavedOnly, setLocalSavedOnly] = useState(false);

    const filters = feedContext ? feedContext.filters : localFilters;
    const setFilters = feedContext ? feedContext.setFilters : setLocalFilters;
    const searchQuery = feedContext ? feedContext.searchQuery : localSearch;
    const setSearchQuery = feedContext ? feedContext.setSearchQuery : setLocalSearch;
    const showSavedOnly = feedContext ? feedContext.showSavedOnly : localSavedOnly;
    const setShowSavedOnly = feedContext ? feedContext.setShowSavedOnly : setLocalSavedOnly;
    const resetFilters = feedContext
        ? feedContext.resetFilters
        : () => {
              setLocalFilters((prev) => ({ platform: prev.platform || 'youtube', category: 'all' }));
              setLocalSearch('');
              setLocalSavedOnly(false);
          };

    // Sync route platform prop with filter state
    useEffect(() => {
        if (pagePlatform && filters.platform !== pagePlatform) {
            setFilters((prev) => ({ ...prev, platform: pagePlatform }));
        }
    }, [pagePlatform, filters.platform, setFilters]);

    const activePlatform = filters.platform || 'youtube';
    const pageMeta = PLATFORM_PAGE_META[activePlatform] || PLATFORM_PAGE_META.youtube;
    const ActivePlatformIcon = pageMeta.IconComponent;

    function handleSwitchPlatformPage(targetPlatform) {
        const pageEntry = SOCIAL_PAGES.find((p) => p.value === targetPlatform);
        if (pageEntry) {
            navigate(pageEntry.path);
        }
        setShowSavedOnly(false);
        setFilters((prev) => ({ ...prev, platform: targetPlatform }));
    }

    const activeFilterCount = feedContext
        ? feedContext.activeFilterCount
        : (filters.category !== 'all' ? 1 : 0) +
          (showSavedOnly ? 1 : 0) +
          (searchQuery.trim() ? 1 : 0);

    const [videos, setVideos] = useState([]);
    const [total, setTotal] = useState(0);
    const [mode, setMode] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [visibleSavedCount, setVisibleSavedCount] = useState(PAGE_SIZE);
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Live X / Twitter Video Grabber State
    const [xGrabInput, setXGrabInput] = useState('');
    const [isGrabbingX, setIsGrabbingX] = useState(false);
    const [xGrabMessage, setXGrabMessage] = useState('');

    const sentinelRef = useRef(null);
    const hasLoadedOnceRef = useRef(false);

    const {
        bookmarks,
        bookmarksCount,
        isBookmarked,
        toggleBookmark,
    } = useBookmarks();

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

    // Initial & filter-change page load with smooth crossfade
    const loadInitialVideos = useCallback(async () => {
        if (!hasLoadedOnceRef.current) {
            setStatus('loading');
        } else {
            setIsTransitioning(true);
        }
        setErrorMsg('');
        setVisibleSavedCount(PAGE_SIZE);
        try {
            const data = await fetchVideos({
                ...filters,
                platform: filters.platform === 'daily' ? 'all' : filters.platform,
                dailyOnly: filters.platform === 'daily',
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
            hasLoadedOnceRef.current = true;
            setStatus('success');
        } catch (err) {
            console.error('Failed to fetch videos:', err);
            setErrorMsg(err.message || 'Failed to load videos.');
            setStatus('error');
        } finally {
            setIsTransitioning(false);
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
                platform: filters.platform === 'daily' ? 'all' : filters.platform,
                dailyOnly: filters.platform === 'daily',
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

    function handleRetry() {
        setRetryCount((c) => c + 1);
    }

    function handleClearSearch() {
        setSearchQuery('');
    }

    async function handleGrabFromX(e, overrideInput = null) {
        if (e) e.preventDefault();
        if (isGrabbingX) return;
        const queryVal = overrideInput !== null ? overrideInput : xGrabInput.trim();
        setIsGrabbingX(true);
        setXGrabMessage('');
        try {
            const res = await grabXVideos({
                input: queryVal,
                creators: settings?.trackedTwitterCreators || [],
                hashtags: settings?.trackedTwitterHashtags || [],
            });
            const grabbedList = res?.videos || [];
            if (grabbedList.length > 0) {
                setVideos((prev) => {
                    const existingIds = new Set(prev.map((v) => v.platformVideoId));
                    const fresh = grabbedList.filter((v) => !existingIds.has(v.platformVideoId));
                    return [...fresh, ...prev];
                });
                setTotal((prev) => prev + grabbedList.length);
                if (res.mode === 'post' && grabbedList[0]) {
                    setSelectedVideo(grabbedList[0]);
                }
                setXGrabInput('');
                setXGrabMessage(`✨ Grabbed ${grabbedList.length} live X video clip${grabbedList.length > 1 ? 's' : ''} into your feed!`);
                setTimeout(() => setXGrabMessage(''), 4000);
            }
        } catch (err) {
            setXGrabMessage(`⚠️ ${err.message || 'Could not grab X video.'}`);
            setTimeout(() => setXGrabMessage(''), 4000);
        } finally {
            setIsGrabbingX(false);
        }
    }

    const currentTotalCount = showSavedOnly ? filteredBookmarks.length : total;
    const stageKey = `${activePlatform}-${filters.category}-${showSavedOnly ? 'saved' : 'feed'}-${settings?.feedDensity || 'grid'}`;

    return (
        <div className="video-feed">
            {/* Top Laser Transition Sweep Bar */}
            <div
                key={`laser-${stageKey}`}
                className={`video-feed__laser-bar video-feed__laser-bar--${activePlatform}`}
                aria-hidden="true"
            />

            {/* Header */}
            <header className={`video-feed__header video-feed__header--${activePlatform}`}>
                <div key={activePlatform} className="video-feed__hero-identity">
                    <div className="video-feed__logo">
                        <span className="video-feed__logo-icon">
                            <ActivePlatformIcon size={28} />
                        </span>
                        <span>{pageMeta.title}</span>
                    </div>
                    <p className="video-feed__tagline">
                        {pageMeta.tagline}
                    </p>
                </div>

                {/* Social Media Page Switcher */}
                <nav className="video-feed__platform-pages" aria-label="Social Media Pages">
                    {SOCIAL_PAGES.map((p) => {
                        const PageIcon = p.IconComponent;
                        const isActive = activePlatform === p.value && !showSavedOnly;
                        return (
                            <button
                                key={p.value}
                                type="button"
                                className={`video-feed__platform-page-btn ${isActive ? 'active' : ''}`}
                                onClick={() => handleSwitchPlatformPage(p.value)}
                            >
                                <PageIcon size={16} />
                                <span>{p.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {mode === 'demo' && (
                    <span className="video-feed__mode-badge">Demo Mode</span>
                )}
                {mode === 'live' && (
                    <span className="video-feed__mode-badge video-feed__mode-badge--live">Live Feed</span>
                )}
                {mode === 'production' && (
                    <span className="video-feed__mode-badge video-feed__mode-badge--live">MongoDB Live</span>
                )}

                {/* Search Bar */}
                <div className="video-feed__search-wrapper">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={`Search ${pageMeta.title.toLowerCase()}, creators, AI summaries, or tags…`}
                    />
                </div>

                {/* Live X / Twitter Video & Creator Grabber Bar */}
                {activePlatform === 'twitter' && (
                    <div className="video-feed__x-grabber" aria-label="Grab X Videos by Post URL, Creator, or Hashtag">
                        <form onSubmit={(e) => handleGrabFromX(e)} className="video-feed__x-grabber-pill">
                            <span className="video-feed__x-grabber-badge">
                                <IconX size={14} />
                                <span>Live X Video Grabber</span>
                            </span>
                            <input
                                type="text"
                                value={xGrabInput}
                                onChange={(e) => setXGrabInput(e.target.value)}
                                placeholder="Paste X post URL (https://x.com/.../status/...), @creator handle, or #hashtag…"
                                className="video-feed__x-grabber-input"
                                aria-label="X post URL, creator handle, or hashtag"
                            />
                            <button
                                type="submit"
                                className="video-feed__x-grabber-btn"
                                disabled={isGrabbingX}
                            >
                                <IconBolt size={14} />
                                <span>{isGrabbingX ? 'Grabbing from X…' : 'Grab X Videos'}</span>
                            </button>
                        </form>
                        {xGrabMessage && (
                            <div className="video-feed__x-grabber-toast" role="status">
                                {xGrabMessage}
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Daily Radar Drops Section (on YouTube and X/Twitter pages) */}
            {!showSavedOnly && !searchQuery && (activePlatform === 'youtube' || activePlatform === 'twitter') && (
                <DailyRadarSection
                    platform={activePlatform}
                    onSelectPlatform={handleSwitchPlatformPage}
                    onPreview={(video) => setSelectedVideo(video)}
                />
            )}

            {/* Clean Modern Toolbar: Sidebar Toggle & Active Filters */}
            <div className="video-feed__toolbar">
                <div className="video-feed__toolbar-left">
                    <button
                        type="button"
                        className={`video-feed__sidebar-toggle-btn ${isSidebarOpen ? 'active' : ''}`}
                        onClick={toggleSidebar}
                        aria-label={isSidebarOpen ? 'Close sidebar channels & filters' : 'Open sidebar channels & filters'}
                        title="Toggle Channels & Filters Sidebar (Ctrl+B)"
                    >
                        <span className="video-feed__toggle-icon">
                            {isSidebarOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
                        </span>
                        <span>Channels & Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="video-feed__toolbar-badge">{activeFilterCount}</span>
                        )}
                    </button>

                    {/* Active Page Indicator */}
                    <span className="video-feed__page-badge">
                        <ActivePlatformIcon size={14} />
                        <span>{pageMeta.badgeLabel}</span>
                    </span>

                    {filters.category !== 'all' && (
                        <button
                            type="button"
                            className="video-feed__active-chip"
                            onClick={() => setFilters({ ...filters, category: 'all' })}
                            title="Remove category filter"
                        >
                            <span>Category: {filters.category}</span>
                            <span className="video-feed__active-chip-del">
                                <IconClose size={12} />
                            </span>
                        </button>
                    )}

                    {showSavedOnly && (
                        <button
                            type="button"
                            className="video-feed__active-chip video-feed__active-chip--saved"
                            onClick={() => setShowSavedOnly(false)}
                            title="Show all clips"
                        >
                            <IconHeart size={14} filled={true} />
                            <span>Saved Only</span>
                            <span className="video-feed__active-chip-del">
                                <IconClose size={12} />
                            </span>
                        </button>
                    )}

                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            className="video-feed__reset-filters-btn"
                            onClick={resetFilters}
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="video-feed__toolbar-right">
                    {status === 'success' && (
                        <span className="video-feed__results-summary">
                            {showSavedOnly
                                ? `${displayVideos.length} of ${filteredBookmarks.length} saved`
                                : searchQuery
                                ? `${displayVideos.length} of ${total} for "${searchQuery}"`
                                : `${displayVideos.length} of ${total} clips`}
                        </span>
                    )}

                    {/* Grid Density Switcher */}
                    <div className="video-feed__density-group" role="group" aria-label="Layout density">
                        <button
                            type="button"
                            className={`video-feed__density-btn ${settings?.feedDensity !== 'cinematic' ? 'active' : ''}`}
                            onClick={() => updateSettings({ feedDensity: 'grid' })}
                            title="Standard 3-4 Column Grid"
                            aria-label="Standard Grid View"
                        >
                            <IconGrid size={17} />
                        </button>
                        <button
                            type="button"
                            className={`video-feed__density-btn ${settings?.feedDensity === 'cinematic' ? 'active' : ''}`}
                            onClick={() => updateSettings({ feedDensity: 'cinematic' })}
                            title="Cinematic 2 Column Grid"
                            aria-label="Cinematic View"
                        >
                            <IconCinematic size={17} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main grid */}
            <main
                key={stageKey}
                className={`video-feed__grid ${settings?.feedDensity === 'cinematic' ? 'video-feed__grid--cinematic' : ''} ${isTransitioning ? 'video-feed__grid--transitioning' : ''}`}
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
                        <span className="video-feed__state-icon">
                            <IconAlert size={36} color="#ef4444" />
                        </span>
                        <h2 className="video-feed__state-title">Something went wrong</h2>
                        <p className="video-feed__state-msg">{errorMsg}</p>
                        <button
                            className="video-feed__retry"
                            onClick={handleRetry}
                            id="retry-button"
                        >
                            <IconRefresh size={16} /> Try again
                        </button>
                    </div>
                )}

                {/* Empty State: Saved tab has no bookmarks */}
                {status === 'success' && showSavedOnly && bookmarksCount === 0 && (
                    <div className="video-feed__state">
                        <span className="video-feed__state-icon">
                            <IconHeart size={36} filled={true} />
                        </span>
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
                            <span className="video-feed__state-icon">
                                <IconSearch size={36} color="#64748b" />
                            </span>
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
                    displayVideos.map((video, idx) => (
                        <VideoCard
                            key={`${stageKey}-${video.platform}-${video.platformVideoId}`}
                            video={video}
                            index={idx}
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
