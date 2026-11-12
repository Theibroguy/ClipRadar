import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useFeedFilters } from '../../context/FeedFilterContext.jsx';
import { useBookmarks } from '../../hooks/useBookmarks.js';
import {
    IconGlobe,
    IconFlame,
    IconYouTube,
    IconX,
    IconInstagram,
    IconTikTok,
    IconScissors,
    IconBolt,
    IconSparkles,
    IconComedy,
    IconLaptop,
    IconPopcorn,
    IconTrophy,
    IconMusic,
    IconNewspaper,
    IconLifestyle,
    IconFolder,
    IconCompass,
    IconRadar,
    IconHeart,
    IconCheck,
    IconSun,
    IconMoon,
    IconSettings,
    IconClose,
} from '../common/Icons.jsx';
import './Sidebar.css';

const PLATFORMS = [
    { value: 'youtube', path: '/youtube', label: 'YouTube Shorts', IconComponent: IconYouTube, dot: 'dot-youtube' },
    { value: 'twitter', path: '/twitter', label: 'X / Twitter Clips', IconComponent: IconX, dot: 'dot-twitter' },
    { value: 'instagram', path: '/instagram', label: 'Instagram Reels', IconComponent: IconInstagram, dot: 'dot-instagram' },
    { value: 'tiktok', path: '/tiktok', label: 'TikTok Videos', IconComponent: IconTikTok, dot: 'dot-tiktok' },
    { value: 'studio', path: '/studio-shorts', label: 'AI Studio Shorts', IconComponent: IconScissors, dot: 'dot-studio' },
];

const CATEGORIES = [
    { value: 'all', label: 'All Categories', IconComponent: IconSparkles },
    { value: 'Comedy', label: 'Comedy & Laughs', IconComponent: IconComedy },
    { value: 'Challenge', label: 'Challenges & Feats', IconComponent: IconBolt },
    { value: 'Science & Tech', label: 'Science & Tech', IconComponent: IconLaptop },
    { value: 'Entertainment', label: 'Entertainment', IconComponent: IconPopcorn },
    { value: 'Sports', label: 'Sports & Stunts', IconComponent: IconTrophy },
    { value: 'Music', label: 'Music & Dance', IconComponent: IconMusic },
    { value: 'News', label: 'News & Culture', IconComponent: IconNewspaper },
    { value: 'Lifestyle', label: 'Lifestyle & POV', IconComponent: IconLifestyle },
    { value: 'Other', label: 'Other Moments', IconComponent: IconFolder },
];

const PLATFORM_ROUTES = {
    youtube: '/youtube',
    twitter: '/twitter',
    instagram: '/instagram',
    tiktok: '/tiktok',
    studio: '/studio-shorts',
};

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isSidebarOpen, closeSidebar, openSettings, theme, toggleTheme } = useSettings();
    const feedFilters = useFeedFilters();
    const { bookmarksCount } = useBookmarks();

    const currentPlatform = feedFilters?.filters?.platform || 'youtube';
    const currentCategory = feedFilters?.filters?.category || 'all';
    const showSavedOnly = !!feedFilters?.showSavedOnly;

    // Helper to safely navigate to active platform page if on studio
    function ensureOnFeed(targetPlatform = currentPlatform) {
        const route = PLATFORM_ROUTES[targetPlatform] || '/youtube';
        if (location.pathname === '/studio') {
            navigate(route);
        }
    }

    function handleSelectPlatform(pVal) {
        const targetRoute = PLATFORM_ROUTES[pVal] || '/youtube';
        if (location.pathname !== targetRoute) {
            navigate(targetRoute);
        }
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
                            <span className="sidebar__header-icon">
                                <IconCompass size={20} />
                            </span>
                            <span>Social Media Pages</span>
                        </div>
                        <button
                            type="button"
                            className="sidebar__close-btn"
                            onClick={closeSidebar}
                            aria-label="Close sidebar"
                            title="Close sidebar"
                        >
                            <IconClose size={18} />
                        </button>
                    </div>

                    {/* Section: Dedicated Social Media Pages */}
                    <div className="sidebar__section">
                        <div className="sidebar__section-header">
                            <span className="sidebar__section-label">Platforms</span>
                        </div>
                        <div className="sidebar__nav-list">
                            {PLATFORMS.map((p) => {
                                const isActive =
                                    location.pathname !== '/studio' &&
                                    !showSavedOnly &&
                                    currentPlatform === p.value;
                                const PlatformIcon = p.IconComponent;
                                return (
                                    <button
                                        key={p.value}
                                        type="button"
                                        className={`sidebar__nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleSelectPlatform(p.value)}
                                        aria-pressed={isActive}
                                    >
                                        <span className={`sidebar__platform-dot ${p.dot}`} aria-hidden="true" />
                                        <span className="sidebar__nav-icon">
                                            <PlatformIcon size={18} />
                                        </span>
                                        <span className="sidebar__nav-text">{p.label}</span>
                                        {isActive && (
                                            <span className="sidebar__active-check">
                                                <IconCheck size={16} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section: Library & Studio */}
                    <div className="sidebar__section">
                        <span className="sidebar__section-label">Feeds & Views</span>
                        <div className="sidebar__nav-list">
                            <button
                                type="button"
                                className={`sidebar__nav-item ${
                                    location.pathname !== '/studio' && showSavedOnly ? 'active' : ''
                                }`}
                                onClick={handleSelectSaved}
                            >
                                <span className="sidebar__nav-icon">
                                    <IconHeart size={18} filled={true} />
                                </span>
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
                                <span className="sidebar__nav-icon">
                                    <IconScissors size={18} />
                                </span>
                                <span className="sidebar__nav-text">AI Video Studio</span>
                                <span className="sidebar__badge-pill">Creator 9:16</span>
                            </NavLink>
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
                                const CategoryIcon = c.IconComponent;
                                return (
                                    <button
                                        key={c.value}
                                        type="button"
                                        className={`sidebar__nav-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleSelectCategory(c.value)}
                                        aria-pressed={isActive}
                                    >
                                        <span className="sidebar__nav-icon">
                                            <CategoryIcon size={18} />
                                        </span>
                                        <span className="sidebar__nav-text">{c.label}</span>
                                        {isActive && (
                                            <span className="sidebar__active-check">
                                                <IconCheck size={16} />
                                            </span>
                                        )}
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
                            <span>
                                {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                            </span>
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
                            <span>
                                <IconSettings size={18} />
                            </span>
                            <span>Settings</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

