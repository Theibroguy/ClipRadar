import { useState } from 'react';
import './FilterBar.css';

const PLATFORMS = [
    { value: 'all', label: 'All Platforms', dot: 'dot-all' },
    { value: 'youtube', label: 'YouTube', dot: 'dot-youtube' },
    { value: 'twitter', label: 'X / Twitter', dot: 'dot-twitter' },
    { value: 'instagram', label: 'Instagram', dot: 'dot-instagram' },
    { value: 'tiktok', label: 'TikTok', dot: 'dot-tiktok' },
    { value: 'demo', label: 'Demo', dot: 'dot-demo' },
];

const CATEGORIES = [
    'all',
    'Comedy',
    'Challenge',
    'Tech',
    'Entertainment',
    'Science & Tech',
    'Lifestyle',
    'Sports',
    'News',
    'Music',
    'Other',
];

/**
 * FilterBar — lets users filter videos by platform and category.
 *
 * Props:
 *   platform {string}   — current platform filter value
 *   category {string}   — current category filter value
 *   onChange {function} — called with ({ platform, category }) on change
 */
export default function FilterBar({ platform, category, onChange }) {
    function handlePlatform(value) {
        onChange({ platform: value, category });
    }

    function handleCategory(value) {
        onChange({ platform, category: value });
    }

    return (
        <nav className="filter-bar" aria-label="Video filters">
            <div className="filter-bar__group" role="group" aria-label="Filter by platform">
                <span className="filter-bar__label">Platform</span>
                {PLATFORMS.map((p) => (
                    <button
                        key={p.value}
                        className={`filter-chip ${platform === p.value ? 'active' : ''}`}
                        onClick={() => handlePlatform(p.value)}
                        aria-pressed={platform === p.value}
                        id={`platform-filter-${p.value}`}
                    >
                        <span className={`platform-dot ${p.dot}`} aria-hidden="true" />
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="filter-bar__group" role="group" aria-label="Filter by category">
                <span className="filter-bar__label">Category</span>
                {CATEGORIES.map((c) => (
                    <button
                        key={c}
                        className={`filter-chip ${category === c ? 'active' : ''}`}
                        onClick={() => handleCategory(c)}
                        aria-pressed={category === c}
                        id={`category-filter-${c.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                        {c === 'all' ? 'All Categories' : c}
                    </button>
                ))}
            </div>
        </nav>
    );
}
