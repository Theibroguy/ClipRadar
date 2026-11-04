import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import './SettingsModal.css';

const TABS = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'feed', label: 'Feed & Discovery', icon: '📡' },
    { id: 'playback', label: 'Video Playback', icon: '🎬' },
    { id: 'studio', label: 'Studio & AI Key', icon: '✂️' },
    { id: 'data', label: 'Data & Backup', icon: '💾' },
];

export default function SettingsModal() {
    const {
        settings,
        theme,
        toggleTheme,
        updateSettings,
        resetSettings,
        isSettingsOpen,
        closeSettings,
        exportAllData,
        clearAllCache,
    } = useSettings();

    const [activeTab, setActiveTab] = useState('appearance');
    const [apiKeyInput, setApiKeyInput] = useState(settings.customGeminiApiKey || '');
    const [showApiKey, setShowApiKey] = useState(false);
    const [actionMessage, setActionMessage] = useState('');

    useEffect(() => {
        setApiKeyInput(settings.customGeminiApiKey || '');
    }, [settings.customGeminiApiKey]);

    // Handle Escape key to close modal
    useEffect(() => {
        if (!isSettingsOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeSettings();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSettingsOpen, closeSettings]);

    if (!isSettingsOpen) return null;

    function handleSaveApiKey() {
        updateSettings({ customGeminiApiKey: apiKeyInput.trim() });
        setActionMessage('✨ Gemini API key updated!');
        setTimeout(() => setActionMessage(''), 3500);
    }

    function handleClearApiKey() {
        setApiKeyInput('');
        updateSettings({ customGeminiApiKey: '' });
        setActionMessage('🔄 Custom API key removed.');
        setTimeout(() => setActionMessage(''), 3500);
    }

    function handleExport() {
        const ok = exportAllData();
        if (ok) {
            setActionMessage('📥 Data backup exported successfully!');
            setTimeout(() => setActionMessage(''), 3500);
        }
    }

    function handleClearCache() {
        if (window.confirm('Are you sure you want to clear all bookmarks, brand kits, and cached settings?')) {
            clearAllCache();
            setActionMessage('🗑️ Cache cleared and reset to factory defaults.');
            setTimeout(() => setActionMessage(''), 3500);
        }
    }

    return (
        <div
            className="settings-modal-backdrop"
            onClick={closeSettings}
            role="dialog"
            aria-modal="true"
            aria-label="ClipRadar Preferences and Settings"
        >
            <div
                className="settings-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="settings-modal__header">
                    <div className="settings-modal__title-group">
                        <span className="settings-modal__icon">⚙️</span>
                        <div>
                            <h2 className="settings-modal__title">ClipRadar Settings</h2>
                            <p className="settings-modal__subtitle">Customize theme, discovery feed, playback & studio defaults</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="settings-modal__close-btn"
                        onClick={closeSettings}
                        aria-label="Close settings"
                    >
                        ✕
                    </button>
                </div>

                {/* Status Message Notification */}
                {actionMessage && (
                    <div className="settings-modal__alert" role="status">
                        <span>{actionMessage}</span>
                    </div>
                )}

                {/* Tabs Bar */}
                <div className="settings-modal__tabs" role="tablist">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            className={`settings-modal__tab ${activeTab === tab.id ? 'settings-modal__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Modal Content Body */}
                <div className="settings-modal__body">
                    {/* Tab 1: Appearance & Theme */}
                    {activeTab === 'appearance' && (
                        <div className="settings-group">
                            <div className="settings-item settings-item--vertical">
                                <div className="settings-item__info">
                                    <span className="settings-item__label">Interface Theme</span>
                                    <p className="settings-item__desc">Choose your preferred visual style across all ClipRadar pages</p>
                                </div>

                                <div className="settings-theme-selector" role="radiogroup" aria-label="Theme Selection">
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={theme === 'dark'}
                                        className={`settings-theme-card ${theme === 'dark' ? 'settings-theme-card--active' : ''}`}
                                        onClick={() => updateSettings({ theme: 'dark' })}
                                    >
                                        <div className="settings-theme-preview settings-theme-preview--dark">
                                            <div className="settings-theme-preview__bar" />
                                            <div className="settings-theme-preview__block" />
                                        </div>
                                        <div className="settings-theme-card__content">
                                            <div className="settings-theme-card__title">
                                                <span>🌙 Cyber Dark</span>
                                                {theme === 'dark' && <span className="settings-theme-card__badge">Active</span>}
                                            </div>
                                            <p className="settings-theme-card__desc">Deep obsidian background with neon violet accents (Default)</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={theme === 'light'}
                                        className={`settings-theme-card ${theme === 'light' ? 'settings-theme-card--active' : ''}`}
                                        onClick={() => updateSettings({ theme: 'light' })}
                                    >
                                        <div className="settings-theme-preview settings-theme-preview--light">
                                            <div className="settings-theme-preview__bar" />
                                            <div className="settings-theme-preview__block" />
                                        </div>
                                        <div className="settings-theme-card__content">
                                            <div className="settings-theme-card__title">
                                                <span>☀️ Clean Light</span>
                                                {theme === 'light' && <span className="settings-theme-card__badge">Active</span>}
                                            </div>
                                            <p className="settings-theme-card__desc">Bright daylight slate cards with crisp high-contrast readability</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <span className="settings-item__label">Quick Theme Toggle</span>
                                    <p className="settings-item__desc">Instant 1-click toggle between Dark and Light mode</p>
                                </div>
                                <button
                                    type="button"
                                    className="settings-theme-quick-btn"
                                    onClick={toggleTheme}
                                >
                                    <span className="settings-theme-quick-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
                                    <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Feed & Discovery */}
                    {activeTab === 'feed' && (
                        <div className="settings-group">
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <label htmlFor="pref-landing" className="settings-item__label">Default Landing View</label>
                                    <p className="settings-item__desc">Choose which screen opens when navigating to ClipRadar</p>
                                </div>
                                <select
                                    id="pref-landing"
                                    className="settings-select"
                                    value={settings.defaultLandingPage}
                                    onChange={(e) => updateSettings({ defaultLandingPage: e.target.value })}
                                >
                                    <option value="feed">📡 Viral Radar Feed</option>
                                    <option value="studio">✂️ AI Video Studio</option>
                                </select>
                            </div>

                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <label htmlFor="pref-density" className="settings-item__label">Feed Card Layout</label>
                                    <p className="settings-item__desc">Standard responsive grid or cinematic widescreen cards</p>
                                </div>
                                <div className="settings-toggle-group">
                                    <button
                                        type="button"
                                        className={`settings-toggle-btn ${settings.feedDensity === 'grid' ? 'settings-toggle-btn--active' : ''}`}
                                        onClick={() => updateSettings({ feedDensity: 'grid' })}
                                    >
                                        Standard Grid
                                    </button>
                                    <button
                                        type="button"
                                        className={`settings-toggle-btn ${settings.feedDensity === 'cinematic' ? 'settings-toggle-btn--active' : ''}`}
                                        onClick={() => updateSettings({ feedDensity: 'cinematic' })}
                                    >
                                        Cinematic 2-Col
                                    </button>
                                </div>
                            </div>

                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <label htmlFor="pref-velocity" className="settings-item__label">Minimum Viral Velocity Filter</label>
                                    <p className="settings-item__desc">Hide low-momentum videos below a specific view velocity rate</p>
                                </div>
                                <select
                                    id="pref-velocity"
                                    className="settings-select"
                                    value={settings.velocityThreshold}
                                    onChange={(e) => updateSettings({ velocityThreshold: Number(e.target.value) })}
                                >
                                    <option value={0}>Show All Momentum Levels (0+ views/hr)</option>
                                    <option value={1000}>Trending Only (1,000+ views/hr)</option>
                                    <option value={2500}>High Velocity (2,500+ views/hr)</option>
                                    <option value={5000}>Explosive Viral (5,000+ views/hr)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Video Playback */}
                    {activeTab === 'playback' && (
                        <div className="settings-group">
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <span className="settings-item__label">Autoplay Video on Hover</span>
                                    <p className="settings-item__desc">Preview video playback automatically when hovering over cards in feed</p>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.autoplayOnHover}
                                        onChange={(e) => updateSettings({ autoplayOnHover: e.target.checked })}
                                    />
                                    <span className="settings-slider" />
                                </label>
                            </div>

                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <span className="settings-item__label">Start Audio Muted</span>
                                    <p className="settings-item__desc">Keep videos muted by default until user explicitly clicks unmute</p>
                                </div>
                                <label className="settings-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.startMuted}
                                        onChange={(e) => updateSettings({ startMuted: e.target.checked })}
                                    />
                                    <span className="settings-slider" />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Studio & AI Key */}
                    {activeTab === 'studio' && (
                        <div className="settings-group">
                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <label htmlFor="pref-aspect" className="settings-item__label">Default Studio Aspect Ratio</label>
                                    <p className="settings-item__desc">Default canvas dimensions when opening Video Studio</p>
                                </div>
                                <select
                                    id="pref-aspect"
                                    className="settings-select"
                                    value={settings.defaultStudioAspect}
                                    onChange={(e) => updateSettings({ defaultStudioAspect: e.target.value })}
                                >
                                    <option value="9:16">📱 9:16 Vertical (1080×1920) — TikTok & Shorts</option>
                                    <option value="1:1">🔲 1:1 Square (1080×1080) — Instagram Feed</option>
                                    <option value="16:9">🖥️ 16:9 Landscape (1920×1080) — YouTube Widescreen</option>
                                </select>
                            </div>

                            <div className="settings-item">
                                <div className="settings-item__info">
                                    <label htmlFor="pref-fps" className="settings-item__label">Studio Render Frame Rate (FPS)</label>
                                    <p className="settings-item__desc">Target frame rate for generated MP4 short downloads</p>
                                </div>
                                <div className="settings-toggle-group">
                                    <button
                                        type="button"
                                        className={`settings-toggle-btn ${settings.defaultStudioFps === 60 ? 'settings-toggle-btn--active' : ''}`}
                                        onClick={() => updateSettings({ defaultStudioFps: 60 })}
                                    >
                                        ⚡ 60 FPS (Ultra)
                                    </button>
                                    <button
                                        type="button"
                                        className={`settings-toggle-btn ${settings.defaultStudioFps === 30 ? 'settings-toggle-btn--active' : ''}`}
                                        onClick={() => updateSettings({ defaultStudioFps: 30 })}
                                    >
                                        🎬 30 FPS (Compact)
                                    </button>
                                </div>
                            </div>

                            <div className="settings-api-key-box">
                                <div className="settings-api-key-box__header">
                                    <div className="settings-item__info">
                                        <span className="settings-item__label">Custom Google Gemini API Key</span>
                                        <p className="settings-item__desc">
                                            Optional: Bring your own Gemini API key for higher rate limits and moment extraction
                                        </p>
                                    </div>
                                    <span className={`settings-api-badge ${settings.customGeminiApiKey ? 'settings-api-badge--active' : ''}`}>
                                        {settings.customGeminiApiKey ? '✅ Custom Key Active' : '✨ Built-in AI Quota'}
                                    </span>
                                </div>

                                <div className="settings-api-input-row">
                                    <div className="settings-api-input-wrap">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            className="settings-input"
                                            value={apiKeyInput}
                                            onChange={(e) => setApiKeyInput(e.target.value)}
                                            placeholder="Paste AIzaSy... key or leave blank"
                                            aria-label="Google Gemini API Key"
                                        />
                                        <button
                                            type="button"
                                            className="settings-eye-btn"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            title={showApiKey ? 'Hide key' : 'Show key'}
                                        >
                                            {showApiKey ? '🙈' : '👁️'}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className="settings-save-btn"
                                        onClick={handleSaveApiKey}
                                    >
                                        Save Key
                                    </button>

                                    {settings.customGeminiApiKey && (
                                        <button
                                            type="button"
                                            className="settings-reset-btn"
                                            onClick={handleClearApiKey}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Data & Backup */}
                    {activeTab === 'data' && (
                        <div className="settings-group">
                            <div className="settings-data-card">
                                <h3 className="settings-data-card__title">📥 Export Library & Settings Backup</h3>
                                <p className="settings-data-card__desc">
                                    Download a JSON file containing all your bookmarked videos, custom brand kit assets, and application settings.
                                </p>
                                <button
                                    type="button"
                                    className="settings-action-btn settings-action-btn--primary"
                                    onClick={handleExport}
                                >
                                    <span>📥</span>
                                    <span>Download JSON Backup</span>
                                </button>
                            </div>

                            <div className="settings-data-card settings-data-card--danger">
                                <h3 className="settings-data-card__title">🗑️ Clear Cache & Reset</h3>
                                <p className="settings-data-card__desc">
                                    Clears saved bookmarks, custom brand kits, and restores all preferences back to factory defaults.
                                </p>
                                <button
                                    type="button"
                                    className="settings-action-btn settings-action-btn--danger"
                                    onClick={handleClearCache}
                                >
                                    <span>🗑️</span>
                                    <span>Reset All App Cache</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="settings-modal__footer">
                    <button
                        type="button"
                        className="settings-modal__reset-all-btn"
                        onClick={resetSettings}
                    >
                        Restore Defaults
                    </button>
                    <button
                        type="button"
                        className="settings-modal__done-btn"
                        onClick={closeSettings}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
