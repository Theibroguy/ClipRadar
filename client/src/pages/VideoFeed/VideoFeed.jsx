import { useState, useEffect, useCallback } from 'react';
import { fetchVideos } from '../../api/videos.js';
import VideoCard from '../../components/VideoCard/VideoCard.jsx';
import FilterBar from '../../components/FilterBar/FilterBar.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import './VideoFeed.css';

const DEFAULT_FILTERS = { platform: 'all', category: 'all' };

export default function VideoFeed() {
    const [videos, setVideos] = useState([]);
    const [total, setTotal] = useState(0);
    const [mode, setMode] = useState(null);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    const loadVideos = useCallback(async () => {
        setStatus('loading');
        setErrorMsg('');
        try {
            const data = await fetchVideos({ ...filters, limit: 20 });
            setVideos(data.videos);
            setTotal(data.total);
            setMode(data.mode);
            setStatus('success');
        } catch (err) {
            console.error('Failed to fetch videos:', err);
            setErrorMsg(err.message || 'Failed to load videos.');
            setStatus('error');
        }
    }, [filters, retryCount]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    function handleFiltersChange(newFilters) {
        setFilters(newFilters);
    }

    function handleRetry() {
        setRetryCount((c) => c + 1);
    }

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
            </header>

            {/* Filters */}
            <FilterBar
                platform={filters.platform}
                category={filters.category}
                onChange={handleFiltersChange}
            />

            {/* Results count */}
            {status === 'success' && (
                <div className="video-feed__results-bar">
                    <span>
                        {total === 0
                            ? 'No videos found'
                            : `Showing ${videos.length} of ${total} videos`}
                    </span>
                </div>
            )}

            {/* Main grid */}
            <main className="video-feed__grid" id="video-grid" aria-label="Video results">
                {/* Loading */}
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

                {/* Empty */}
                {status === 'success' && videos.length === 0 && (
                    <div className="video-feed__state">
                        <span className="video-feed__state-icon">🔍</span>
                        <h2 className="video-feed__state-title">No clips found</h2>
                        <p className="video-feed__state-msg">
                            Try adjusting your filters, or check back after a refresh.
                        </p>
                    </div>
                )}

                {/* Videos */}
                {status === 'success' &&
                    videos.map((video) => (
                        <VideoCard key={`${video.platform}-${video.platformVideoId}`} video={video} />
                    ))}
            </main>

            <footer className="video-feed__footer">
                <p>
                    ClipRadar surfaces publicly available video metadata via official APIs.
                    All videos link to their original platform. No videos are hosted or scraped.
                </p>
            </footer>
        </div>
    );
}
