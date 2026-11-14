import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext.jsx';
import {
    IconRadar,
    IconScissors,
    IconSun,
    IconMoon,
    IconSettings,
    IconMenu,
    IconClose,
} from '../common/Icons.jsx';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();
    const { openSettings, theme, toggleTheme, isSidebarOpen, toggleSidebar } = useSettings();
    const isFeedRoute = location.pathname !== '/studio';

    return (
        <header className="navbar" role="banner">
            <div className="navbar__container">
                <div className="navbar__left">
                    <button
                        type="button"
                        className={`navbar__sidebar-toggle ${isSidebarOpen ? 'navbar__sidebar-toggle--active' : ''}`}
                        onClick={toggleSidebar}
                        aria-label={isSidebarOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
                        title="Toggle Navigation Sidebar (Ctrl+B)"
                    >
                        <span className="navbar__sidebar-toggle-icon">
                            {isSidebarOpen ? <IconClose size={20} /> : <IconMenu size={20} />}
                        </span>
                    </button>

                    <Link to="/" className="navbar__brand" aria-label="ClipRadar Home">
                        <span className="navbar__brand-icon">
                            <IconRadar size={26} />
                        </span>
                        <span className="navbar__brand-text">
                            Clip<span>Radar</span>
                        </span>
                    </Link>
                </div>

                <div className="navbar__actions">
                    <nav className="navbar__nav" aria-label="Primary Navigation">
                        <NavLink
                            to="/"
                            className={() =>
                                `navbar__tab ${isFeedRoute ? 'navbar__tab--active' : ''}`
                            }
                        >
                            <span className="navbar__tab-icon">
                                <IconRadar size={18} />
                            </span>
                            <span className="navbar__tab-label">Radar Feed</span>
                        </NavLink>

                        <NavLink
                            to="/studio"
                            className={({ isActive }) =>
                                `navbar__tab ${isActive ? 'navbar__tab--active' : ''}`
                            }
                        >
                            <span className="navbar__tab-icon">
                                <IconScissors size={18} />
                            </span>
                            <span className="navbar__tab-label">Video Studio</span>
                            <span className="navbar__tab-badge">New</span>
                        </NavLink>
                    </nav>

                    {/* Quick Theme Toggle Button */}
                    <button
                        type="button"
                        className="navbar__theme-btn"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                        <span key={theme} className="navbar__theme-icon" aria-hidden="true">
                            {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                        </span>
                        <span className="navbar__theme-text">
                            {theme === 'dark' ? 'Light' : 'Dark'}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="navbar__settings-btn"
                        onClick={openSettings}
                        aria-label="Open Settings"
                        title="Preferences & Settings"
                    >
                        <span className="navbar__settings-icon">
                            <IconSettings size={18} />
                        </span>
                        <span className="navbar__settings-text">Settings</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
