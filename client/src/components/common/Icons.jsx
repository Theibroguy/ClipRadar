import React from 'react';
import './Icons.css';

/**
 * Common icon wrapper utility to normalize sizing, colors, and accessibility
 */
function createIcon(displayName, renderPaths, defaultProps = {}) {
    const Component = ({
        size = 20,
        className = '',
        color = 'currentColor',
        strokeWidth = 2,
        ariaLabel,
        ...rest
    }) => {
        const isAriaHidden = !ariaLabel;
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`cr-icon cr-icon--${displayName.toLowerCase()} ${className}`.trim()}
                aria-hidden={isAriaHidden}
                aria-label={ariaLabel}
                role={ariaLabel ? 'img' : undefined}
                {...rest}
            >
                {renderPaths({ size, color, strokeWidth })}
            </svg>
        );
    };
    Component.displayName = displayName;
    return Component;
}

// -------------------------------------------------------------
// BRAND & PLATFORM ICONS
// -------------------------------------------------------------

/**
 * Authentic X (formerly Twitter) Geometric Logo
 */
export function IconX({ size = 20, className = '', color = 'currentColor', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            className={`cr-icon cr-icon--x ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

/**
 * Authentic YouTube Play Pill Icon with Crimson Gradient
 */
export function IconYouTube({ size = 20, className = '', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`cr-icon cr-icon--youtube ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <defs>
                <linearGradient id="yt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff0000" />
                    <stop offset="100%" stopColor="#cc0000" />
                </linearGradient>
            </defs>
            <rect x="2" y="4" width="20" height="16" rx="5" fill="url(#yt-gradient)" />
            <polygon points="10 8.5 16 12 10 15.5" fill="#ffffff" />
        </svg>
    );
}

/**
 * Authentic Instagram Camera with Sunset Gradient
 */
export function IconInstagram({ size = 20, className = '', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={`cr-icon cr-icon--instagram ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <defs>
                <radialGradient id="ig-gradient" cx="20%" cy="100%" r="130%">
                    <stop offset="0%" stopColor="#ffdc80" />
                    <stop offset="25%" stopColor="#fcaf45" />
                    <stop offset="50%" stopColor="#f77737" />
                    <stop offset="75%" stopColor="#f56040" />
                    <stop offset="90%" stopColor="#e1306c" />
                    <stop offset="100%" stopColor="#833ab4" />
                </radialGradient>
            </defs>
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="url(#ig-gradient)" strokeWidth="2" />
            <circle cx="12" cy="12" r="4.2" stroke="url(#ig-gradient)" strokeWidth="2" />
            <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-gradient)" />
        </svg>
    );
}

/**
 * Authentic TikTok Musical Note with Cyan/Magenta Offset
 */
export function IconTikTok({ size = 20, className = '', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={`cr-icon cr-icon--tiktok ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path
                d="M16.6 5.82s.51.5 1.4 1.05c1.13.7 2.45.88 3.5.88v3.1a7.4 7.4 0 0 1-3.5-.88v6.78c0 3.73-3.02 6.75-6.75 6.75A6.75 6.75 0 0 1 4.5 16.75c0-3.73 3.02-6.75 6.75-6.75.4 0 .78.04 1.15.11V13.3a3.55 3.55 0 0 0-1.15-.19 3.6 3.6 0 0 0-3.6 3.6 3.6 3.6 0 0 0 3.6 3.6 3.6 3.6 0 0 0 3.6-3.6V2.25h3.15c.1 1.4.65 2.65 1.55 3.57z"
                fill="currentColor"
            />
        </svg>
    );
}

/**
 * ClipRadar Logo Icon (High-Tech Radar Dish with Transmission Waves)
 */
export function IconRadar({ size = 22, className = '', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className={`cr-icon cr-icon--radar ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <defs>
                <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            {/* Outer wave arc */}
            <path
                d="M4.93 4.93a10 10 0 0 1 14.14 0"
                stroke="url(#radar-gradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            {/* Mid wave arc */}
            <path
                d="M7.76 7.76a6 6 0 0 1 8.48 0"
                stroke="url(#radar-gradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            {/* Inner beacon dot & pulse */}
            <circle cx="12" cy="13" r="2.5" fill="url(#radar-gradient)" />
            {/* Stand / Dish base */}
            <path
                d="M12 15.5v5.5M9 21h6"
                stroke="url(#radar-gradient)"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
        </svg>
    );
}

/**
 * Glowing Blazing Flame for Daily Drops
 */
export function IconFlame({ size = 20, className = '', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`cr-icon cr-icon--flame ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <defs>
                <linearGradient id="flame-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#ea580c" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#facc15" />
                </linearGradient>
            </defs>
            <path
                d="M12 2c-.5 2.5-2 4.5-4 6-2.5 1.8-4 4.8-4 8 0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-3-7.5-5-9.5-.5-.5-.8-1.5-.7-2.3.2-1.3-.2-2.8-1.3-3.7-.3-.2-.7.2-1 .5z"
                fill="url(#flame-gradient)"
            />
            <path
                d="M12 12c-1.5 1.5-2 3-2 4.5 0 2 1.5 3.5 3.5 3.5s3-1.5 3-3.5c0-1.5-.8-3-2-4-.5-.4-1.5-.4-2.5-.5z"
                fill="#ffffff"
                opacity="0.8"
            />
        </svg>
    );
}

/**
 * Glowing Scissors / Creator Studio Icon
 */
export function IconScissors({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--scissors ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="6" cy="6" r="3" />
            <path d="M8.12 8.12 12 12m0 0 3.88-3.88M12 12l3.88 3.88" />
            <circle cx="6" cy="18" r="3" />
            <path d="M14.8 14.8 20 20M14.8 9.2 20 4" />
        </svg>
    );
}

/**
 * Heart Icon with Filled vs Outline state
 */
export function IconHeart({ size = 20, className = '', filled = false, color, strokeWidth = 2, ...props }) {
    const activeColor = color || (filled ? '#ef4444' : 'currentColor');
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? activeColor : 'none'}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--heart ${filled ? 'cr-icon--heart-filled' : ''} ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    );
}

/**
 * Sun Icon (Theme light mode)
 */
export function IconSun({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--sun ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
    );
}

/**
 * Moon Icon (Theme dark mode)
 */
export function IconMoon({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--moon ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path
                d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
                fill="currentColor"
                fillOpacity="0.2"
            />
        </svg>
    );
}

/**
 * Settings / Gear Icon
 */
export function IconSettings({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--settings ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

/**
 * Menu / Hamburger Toggle Icon
 */
export function IconMenu({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--menu ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

/**
 * Close / Dismiss X Icon
 */
export function IconClose({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--close ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

/**
 * Search Magnifier Icon
 */
export function IconSearch({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--search ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

/**
 * Grid View Icon (Standard 3-4 Column)
 */
export function IconGrid({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--grid ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
    );
}

/**
 * Columns / Cinematic View Icon (2 Column Widescreen)
 */
export function IconCinematic({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--cinematic ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="4" width="8" height="16" rx="1.8" />
            <rect x="13" y="4" width="8" height="16" rx="1.8" />
        </svg>
    );
}

/**
 * Play Triangle Icon
 */
export function IconPlay({ size = 18, className = '', color = 'currentColor', fill = 'currentColor', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={fill}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--play ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
    );
}

/**
 * Film / Clapperboard Icon
 */
export function IconFilm({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--film ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
        </svg>
    );
}

/**
 * Globe / World Icon
 */
export function IconGlobe({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--globe ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

/**
 * Lightning Bolt / Velocity Icon
 */
export function IconBolt({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, fill = 'none', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={fill}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--bolt ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}

/**
 * Eye / Impressions Icon
 */
export function IconEye({ size = 16, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--eye ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

/**
 * Clock / Countdown Icon
 */
export function IconClock({ size = 16, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--clock ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

/**
 * Calendar Icon
 */
export function IconCalendar({ size = 16, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--calendar ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

/**
 * Sparkles / AI / Magic Icon
 */
export function IconSparkles({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--sparkles ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
            <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
        </svg>
    );
}

/**
 * Refresh / Reload Icon
 */
export function IconRefresh({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, spinning = false, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--refresh ${spinning ? 'cr-icon--spinning' : ''} ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    );
}

/**
 * Check / Verified Icon
 */
export function IconCheck({ size = 16, className = '', color = 'currentColor', strokeWidth = 2.5, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--check ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

/**
 * Target / Reticle Icon
 */
export function IconTarget({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--target ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
}

/**
 * Tag / Label Icon
 */
export function IconTag({ size = 16, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--tag ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
            <path d="M7 7h.01" strokeWidth="3" />
        </svg>
    );
}

/**
 * Compass / Discovery Icon
 */
export function IconCompass({ size = 20, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--compass ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.2" />
        </svg>
    );
}

// -------------------------------------------------------------
// CATEGORY ICONS
// -------------------------------------------------------------

/**
 * Comedy / Laughs Mask Icon
 */
export function IconComedy({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--comedy ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
        </svg>
    );
}

/**
 * Science & Tech / Laptop Icon
 */
export function IconLaptop({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--laptop ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
    );
}

/**
 * Entertainment / Popcorn Icon
 */
export function IconPopcorn({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--popcorn ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4" />
            <path d="M5 8 7 22h10l2-14" />
            <path d="M10 8v14M14 8v14" />
        </svg>
    );
}

/**
 * Sports / Trophy Icon
 */
export function IconTrophy({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--trophy ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
            <path d="M6 4h12v5a6 6 0 0 1-12 0V4Z" />
        </svg>
    );
}

/**
 * Music / Note Icon
 */
export function IconMusic({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--music ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
        </svg>
    );
}

/**
 * News / Editorial Icon
 */
export function IconNewspaper({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--newspaper ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
        </svg>
    );
}

/**
 * Lifestyle / Palm / POV Icon
 */
export function IconLifestyle({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--lifestyle ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M13 8c0-3-2-5-5-5s-5 2-5 5c3 0 5 2 5 5" />
            <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5 0 2.2-1.6 4-3.8 4.7" />
            <path d="M12 22v-9" />
            <path d="M7 22h10" />
        </svg>
    );
}

/**
 * Folder / Archive Icon
 */
export function IconFolder({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--folder ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
    );
}

/**
 * Alert / Warning Triangle Icon
 */
export function IconAlert({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--alert ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
        </svg>
    );
}

/**
 * External Link Arrow Icon
 */
export function IconExternalLink({ size = 16, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--externallink ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

/**
 * Chevron Down / Up / Right Icon
 */
export function IconChevron({ size = 16, className = '', direction = 'down', color = 'currentColor', strokeWidth = 2, ...props }) {
    const rotations = {
        down: 'rotate(0deg)',
        up: 'rotate(180deg)',
        right: 'rotate(-90deg)',
        left: 'rotate(90deg)',
    };
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: rotations[direction] || 'none', transition: 'transform 0.2s ease' }}
            className={`cr-icon cr-icon--chevron ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

/**
 * Palette / Appearance Icon
 */
export function IconPalette({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--palette ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
    );
}

/**
 * Save / Disk Icon
 */
export function IconSave({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--save ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    );
}

/**
 * Trash / Delete Icon
 */
export function IconTrash({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--trash ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

/**
 * Analytics Bar Chart Icon
 */
export function IconChart({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--chart ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

/**
 * Trending Up / Growth Line Icon
 */
export function IconTrendingUp({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--trending ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

/**
 * Users / Subscribers Icon
 */
export function IconUsers({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--users ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

/**
 * Award / Milestone Trophy Icon
 */
export function IconAward({ size = 18, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`cr-icon cr-icon--award ${className}`.trim()}
            aria-hidden="true"
            {...props}
        >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    );
}


