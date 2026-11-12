import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useFeedFilters } from '../../context/FeedFilterContext.jsx';
import { useBookmarks } from '../../hooks/useBookmarks.js';
import './Sidebar.css';

const PLATFORMS = [
    { value: 'all', label: 'All Platforms', icon: '🌐', dot: 'dot-all' },
    { value: 'daily', label: 'Daily Drops', icon: '🔥', dot: 'dot-daily' },
    { value: 'youtube', label: 'YouTube Shorts', icon: '📺', dot: 'dot-youtube' },
    { value: 'twitter', label: 'X / Twitter Clips', icon: '𝕏', dot: 'dot-twitter' },
    { value: 'instagram', label: 'Instagram Reels', icon: '📸', dot: 'dot-instagram' },
    { value: 'tiktok', label: 'TikTok Videos', icon: '🎵', dot: 'dot-tiktok' },
    { value: 'studio', label: 'AI Studio Shorts', icon: '✂️', dot: 'dot-studio' },
    { value: 'demo', label: 'Demo Archive', icon: '⚡', dot: 'dot-demo' },
];

const CATEGORIES = [
    { value: 'all', label: 'All Categories', icon: '✨' },
    { value: 'Comedy', label: 'Comedy & Laughs', icon: '🎭' },
    { value: 'Challenge', label: 'Challenges & Feats', icon: '⚡' },
    { value: 'Science & Tech', label: 'Science & Tech', icon: '💻' },
    { value: 'Entertainment', label: 'Entertainment', icon: '🍿' },
    { value: 'Sports', label: 'Sports & Stunts', icon: '⚽' },
    { value: 'Music', label: 'Music & Dance', icon: '🎵' },
    { value: 'News', label: 'News & Culture', icon: '📰' },
    { value: 'Lifestyle', label: 'Lifestyle & POV', icon: '🏝️' },
    { value: 'Other', label: 'Other Moments', icon: '📁' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarOpen, closeSidebar, openSettings, theme, toggleTheme } = useSettings();
    const feedFilters = useFeedFilters();
    const { bookmarksCount } = useBookmarks();

    const currentPlatform = feedFilters?.filters?.platform || 'all';
    const currentCategory = feedFilters?.filters?.category || 'all';
    const showSavedOnly = !!feedFilters?.showSavedOnly;

    // Helper to safely navigate to feed if not already there
    function ensureOnFeed() {
        if (location.pathname !== '/') {
            navigate('/');
        }
    }

    function handleSelectPlatform(pVal) {
        ensureOnFeed();
        if (feedFilters) {
            feedFilters.setShowSavedOnly(false);
            feedFilters.setPlatform(pVal);
        }
        if (window.innerWidth < 1024) closeSidebar();
    }

    function handleSelectCategory(cVal) {
        ensureOnFeed();
        if (feedFilters) {
            feedFilters.setCategory(cVal);
        }
        if (window.innerWidth < 1024) closeSidebar();
    }

    function handleSelectSaved() {
        ensureOnFeed();
        if (feedFilters) {
            feedFilters.setShowSavedOnly(true);
        }
        if (window.innerWidth < 1024) closeSidebar();
    }

    function handleResetAll() {
        ensureOnFeed();
        if (feedFilters) {
            feedFilters.resetFilters();
        }
        if (window.innerWidth < 1024) closeSidebar();
    }

    return (
        <>
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={closeSidebar}
                    aria-label="Close sidebar backdrop"
                    role="presentation"
                />
            )}

            <aside
                className={`app-sidebar ${isSidebarOpen ? 'app-sidebar--open' : 'app-sidebar--collapsed'}`}
                aria-label="Application sidebar navigation and filters"
            >
                <div className="sidebar__inner">
                    {/* Header */}
                    <div className="sidebar__header">
                        <div className="sidebar__header-title">
                            <span className="sidebar__header-icon">🧭</span>
                            <span>Navigation & Filters</span>
                        </div>
                        <button
                            type="button"
                            className="sidebar__close-btn"
                            onClick={closeSidebar}
                            aria-label="Close sidebar"
                            title="Close sidebar"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Section: Main Feeds & Studio */}
                    <div className="sidebar__section">
                        <span className="sidebar__section-label">Feeds & Views</span>
                        <div className="sidebar__nav-list">
                            <button
                                type="button"
                                className={`sidebar__nav-item ${
                                    location.pathname === '/' && !showSavedOnly && currentPlatform === 'all' && currentCategory === 'all'
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={handleResetAll}
                            >
                                <span className="sidebar__nav-icon">📡</span>
                                <span className="sidebar__nav-text">All Radar Feed</span>
                            </button>

                            <button
                                type="button"
                                className={`sidebar__nav-item ${
                                    location.pathname === '/' && currentPlatform === 'daily' ? 'active' : ''
                                }`}
                                onClick={() => handleSelectPlatform('daily')}
                            >
                                <span className="sidebar__nav-icon">🔥</span>
                                <span className="sidebar__nav-text">Daily Radar Drops</span>
                                <span className="sidebar__badge-fire">New Daily</span>
                            </button>

                            <button
                                type="button"
                                className={`sidebar__nav-item ${
                                    location.pathname === '/' && showSavedOnly ? 'active' : ''
                                }`}
                                onClick={handleSelectSaved}
                            >
                                <span className="sidebar__nav-icon">❤️</span>
                                <span className="sidebar__nav-text">Saved Favorites</span>
                                {bookmarksCount > 0 && (
                                    <span className="sidebar__badge-count">{bookmarksCount}</span>
                                )}
                            </button>

                            <NavLink
                                to="/studio"
                                className={({ isActive }) =>
                                    `sidebar__nav-item ${isActive ? 'active' : ''}`
                                }
                                onClick={() => {
                                    if (window.innerWidth < 1024) closeSidebar();
                                }}
                            >
                                <span className="sidebar__nav-icon">✂️</span>
                                <span className="sidebar__nav-text">AI Video Studio</span>
                                <span className="sidebar__badge-pill">Creator 9:16</span>
                            </NavLink>
                        </div>
                    </div>

                    {/* Section: Platforms */}
                    <div className="sidebar__section">
                        <div className="sidebar__section-header">
                            <span className="sidebar__section-label">Platforms</span>
                            {currentPlatform !== 'all' && (
                                <button
                                    type="button"
                                    className="sidebar__reset-btn"
                                    onClick={() => handleSelectPlatform('all')}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="sidebar__nav-list">
                            {PLATFORMS.map((p) => {
                                const isActive = !showSavedOnly && currentPlatform === p.value;
                                return (
                                    <button
                                        key={p.value}
                                        type="button"
                                        className={`sidebar__nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleSelectPlatform(p.value)}
                                        aria-pressed={isActive}
                                    >
                                        <span className={`sidebar__platform-dot ${p.dot}`} aria-hidden="true" />
                                        <span className="sidebar__nav-icon">{p.icon}</span>
                                        <span className="sidebar__nav-text">{p.label}</span>
                                        {isActive && <span className="sidebar__active-check">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section: Categories */}
                    <div className="sidebar__section">
                        <div className="sidebar__section-header">
                            <span className="sidebar__section-label">Categories & Topics</span>
                            {currentCategory !== 'all' && (
                                <button
                                    type="button"
                                    className="sidebar__reset-btn"
                                    onClick={() => handleSelectCategory('all')}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="sidebar__nav-list">
                            {CATEGORIES.map((c) => {
                                const isActive = currentCategory === c.value;
                                return (
                                    <button
                                        key={c.value}
                                        type="button"
                                        className={`sidebar__nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleSelectCategory(c.value)}
                                        aria-pressed={isActive}
                                    >
                                        <span className="sidebar__nav-icon">{c.icon}</span>
                                        <span className="sidebar__nav-text">{c.label}</span>
                                        {isActive && <span className="sidebar__active-check">✓</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer / Quick Preferences */}
                    <div className="sidebar__footer">
                        <button
                            type="button"
                            className="sidebar__footer-btn"
                            onClick={toggleTheme}
                            title="Toggle Light / Dark Mode"
                        >
                            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>

                        <button
                            type="button"
                            className="sidebar__footer-btn"
                            onClick={() => {
                                openSettings();
                                if (window.innerWidth < 1024) closeSidebar();
                            }}
                            title="Open Settings & Preferences"
                        >
                            <span>⚙️</span>
                            <span>Settings</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

