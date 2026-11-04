import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'clipradar_app_settings';
const THEME_KEY = 'clipradar_theme';

export const DEFAULT_SETTINGS = {
    theme: 'dark', // 'dark' | 'light'
    defaultLandingPage: 'feed', // 'feed' | 'studio'
    feedDensity: 'grid', // 'grid' (3-4 cols) | 'cinematic' (2 cols)
    velocityThreshold: 0, // 0 (all) | 1000 | 2500 | 5000 views/hr
    autoplayOnHover: true,
    startMuted: true,
    defaultStudioAspect: '9:16', // '9:16' | '1:1' | '16:9'
    defaultStudioFps: 60, // 60 | 30
    customGeminiApiKey: '',
    trackedTwitterCreators: [
        '@elonmusk',
        '@BarstoolSports',
        '@CultureCrave',
        '@Dexerto',
        '@Tesla',
        '@MKBHD',
        '@HouseOfHighlights',
    ],
    trackedTwitterHashtags: [
        '#viral',
        '#comedy',
        '#fails',
        '#tech',
        '#sports',
        '#gaming',
    ],
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            const standaloneTheme = localStorage.getItem(THEME_KEY);
            const loaded = raw ? JSON.parse(raw) : {};
            if (!loaded.theme && standaloneTheme) {
                loaded.theme = standaloneTheme;
            }
            return { ...DEFAULT_SETTINGS, ...loaded };
        } catch (e) {
            console.error('Failed to load settings from localStorage', e);
            return DEFAULT_SETTINGS;
        }
    });

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Apply theme changes to document element & localStorage immediately
    useEffect(() => {
        const activeTheme = settings.theme || 'dark';
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', activeTheme);
            if (document.documentElement.style) {
                document.documentElement.style.colorScheme = activeTheme;
            }
        }
        try {
            localStorage.setItem(THEME_KEY, activeTheme);
        } catch (e) {
            console.error('Failed to sync theme to localStorage', e);
        }
    }, [settings.theme]);

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

    const toggleTheme = useCallback(() => {
        setSettings((prev) => {
            const nextTheme = prev.theme === 'light' ? 'dark' : 'light';
            return { ...prev, theme: nextTheme };
        });
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        try {
            localStorage.removeItem(SETTINGS_KEY);
            localStorage.removeItem(THEME_KEY);
        } catch (e) {
            console.error('Failed to reset settings', e);
        }
    }, []);

    const openSettings = useCallback(() => setIsSettingsOpen(true), []);
    const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

    // Export user data (bookmarks + settings + brand kit) as JSON backup
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
            localStorage.removeItem(THEME_KEY);
            setSettings(DEFAULT_SETTINGS);
            return true;
        } catch (err) {
            console.error('Failed to clear cache:', err);
            return false;
        }
    }, []);

    const addTrackedCreator = useCallback((rawHandle) => {
        if (!rawHandle || !rawHandle.trim()) return;
        const clean = rawHandle.trim().startsWith('@') ? rawHandle.trim() : `@${rawHandle.trim()}`;
        setSettings((prev) => {
            const current = Array.isArray(prev.trackedTwitterCreators) ? prev.trackedTwitterCreators : [];
            if (current.some((h) => h.toLowerCase() === clean.toLowerCase())) return prev;
            return { ...prev, trackedTwitterCreators: [...current, clean] };
        });
    }, []);

    const removeTrackedCreator = useCallback((handleToRemove) => {
        setSettings((prev) => {
            const current = Array.isArray(prev.trackedTwitterCreators) ? prev.trackedTwitterCreators : [];
            return {
                ...prev,
                trackedTwitterCreators: current.filter((h) => h.toLowerCase() !== handleToRemove.toLowerCase()),
            };
        });
    }, []);

    const addTrackedHashtag = useCallback((rawTag) => {
        if (!rawTag || !rawTag.trim()) return;
        const clean = rawTag.trim().startsWith('#') ? rawTag.trim() : `#${rawTag.trim()}`;
        setSettings((prev) => {
            const current = Array.isArray(prev.trackedTwitterHashtags) ? prev.trackedTwitterHashtags : [];
            if (current.some((t) => t.toLowerCase() === clean.toLowerCase())) return prev;
            return { ...prev, trackedTwitterHashtags: [...current, clean] };
        });
    }, []);

    const removeTrackedHashtag = useCallback((tagToRemove) => {
        setSettings((prev) => {
            const current = Array.isArray(prev.trackedTwitterHashtags) ? prev.trackedTwitterHashtags : [];
            return {
                ...prev,
                trackedTwitterHashtags: current.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()),
            };
        });
    }, []);

    const value = {
        settings,
        theme: settings.theme || 'dark',
        toggleTheme,
        updateSettings,
        resetSettings,
        isSettingsOpen,
        openSettings,
        closeSettings,
        exportAllData,
        clearAllCache,
        addTrackedCreator,
        removeTrackedCreator,
        addTrackedHashtag,
        removeTrackedHashtag,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        return {
            settings: DEFAULT_SETTINGS,
            theme: 'dark',
            toggleTheme: () => {},
            updateSettings: () => {},
            resetSettings: () => {},
            isSettingsOpen: false,
            openSettings: () => {},
            closeSettings: () => {},
            exportAllData: () => false,
            clearAllCache: () => false,
            addTrackedCreator: () => {},
            removeTrackedCreator: () => {},
            addTrackedHashtag: () => {},
            removeTrackedHashtag: () => {},
        };
    }
    return context;
}
