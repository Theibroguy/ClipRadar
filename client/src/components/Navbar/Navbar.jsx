import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    return (
        <header className="navbar" role="banner">
            <div className="navbar__container">
                <Link to="/" className="navbar__brand" aria-label="ClipRadar Home">
                    <span className="navbar__brand-icon">📡</span>
                    <span className="navbar__brand-text">
                        Clip<span>Radar</span>
                    </span>
                </Link>

                <nav className="navbar__nav" aria-label="Primary Navigation">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `navbar__tab ${isActive ? 'navbar__tab--active' : ''}`
                        }
                    >
                        <span className="navbar__tab-icon">📡</span>
                        <span className="navbar__tab-label">Radar Feed</span>
                    </NavLink>

                    <NavLink
                        to="/studio"
                        className={({ isActive }) =>
                            `navbar__tab ${isActive ? 'navbar__tab--active' : ''}`
                        }
                    >
                        <span className="navbar__tab-icon">✂️</span>
                        <span className="navbar__tab-label">Video Studio</span>
                        <span className="navbar__tab-badge">New</span>
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}

