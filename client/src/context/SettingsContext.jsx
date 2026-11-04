import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'clipradar_app_settings';

export const DEFAULT_SETTINGS = {
    defaultLandingPage: 'feed', // 'feed' | 'studio'
    feedDensity: 'grid', // 'grid' (3-4 cols) | 'cinematic' (2 cols)
    velocityThreshold: 0, // 0 (all) | 1000 | 2500 | 5000 views/hr
    autoplayOnHover: true,
    startMuted: true,
    defaultStudioAspect: '9:16', // '9:16' | '1:1' | '16:9'
    defaultStudioFps: 60, // 60 | 30
    customGeminiApiKey: '',
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
        } catch (e) {
            console.error('Failed to load settings from localStorage', e);
            return DEFAULT_SETTINGS;
        }
    });

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save settings to localStorage', e);
        }
    }, [settings]);

    const updateSettings = useCallback((updates) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        try {
            localStorage.removeItem(SETTINGS_KEY);
        } catch (e) {
            console.error('Failed to reset settings', e);
        }
    }, []);

    const openSettings = useCallback(() => setIsSettingsOpen(true), []);
    const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

    // Export user data (bookmarks + settings + studio videos) as JSON backup
    const exportAllData = useCallback(() => {
        try {
            const bookmarksRaw = localStorage.getItem('clipradar_bookmarks');
            const brandKitRaw = localStorage.getItem('clipradar_brand_kit');
            const bookmarks = bookmarksRaw ? JSON.parse(bookmarksRaw) : [];
            const brandKit = brandKitRaw ? JSON.parse(brandKitRaw) : null;

            const exportPayload = {
                version: '1.0',
                appName: 'ClipRadar',
                exportedAt: new Date().toISOString(),
                settings,
                brandKit,
                bookmarks,
            };

            const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
                type: 'application/json',
            });
            const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(blob) : 'mock-blob-url';
            const a = document.createElement('a');
            a.href = url;
            a.download = `clipradar-backup-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (typeof URL.revokeObjectURL === 'function') {
                URL.revokeObjectURL(url);
            }
            return true;
        } catch (err) {
            console.error('Failed to export data:', err);
            return false;
        }
    }, [settings]);

    // Clear user cached data safely
    const clearAllCache = useCallback(() => {
        try {
            localStorage.removeItem('clipradar_bookmarks');
            localStorage.removeItem('clipradar_brand_kit');
            localStorage.removeItem(SETTINGS_KEY);
            setSettings(DEFAULT_SETTINGS);
            return true;
        } catch (err) {
            console.error('Failed to clear cache:', err);
            return false;
        }
    }, []);

    const value = {
        settings,
        updateSettings,
        resetSettings,
        isSettingsOpen,
        openSettings,
        closeSettings,
        exportAllData,
        clearAllCache,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        return {
            settings: DEFAULT_SETTINGS,
            updateSettings: () => {},
            resetSettings: () => {},
            isSettingsOpen: false,
            openSettings: () => {},
            closeSettings: () => {},
            exportAllData: () => false,
            clearAllCache: () => false,
        };
    }
    return context;
}
