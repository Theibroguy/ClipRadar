import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'clipradar_bookmarks';

/**
 * Custom hook to manage user favorites / bookmarks with localStorage persistence.
 */
export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error('Failed to read bookmarks from localStorage', e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        } catch (e) {
            console.error('Failed to write bookmarks to localStorage', e);
        }
    }, [bookmarks]);

    const getVideoId = (video) =>
        video ? `${video.platform}-${video.platformVideoId}` : '';

    const isBookmarked = useCallback(
        (video) => {
            if (!video) return false;
            const targetId = getVideoId(video);
            return bookmarks.some((b) => getVideoId(b) === targetId);
        },
        [bookmarks]
    );

    const toggleBookmark = useCallback((video) => {
        if (!video) return;
        const targetId = getVideoId(video);
        setBookmarks((prev) => {
            const exists = prev.some((b) => getVideoId(b) === targetId);
            if (exists) {
                return prev.filter((b) => getVideoId(b) !== targetId);
            }
            return [video, ...prev];
        });
    }, []);

    const clearBookmarks = useCallback(() => {
        setBookmarks([]);
    }, []);

    return {
        bookmarks,
        bookmarksCount: bookmarks.length,
        isBookmarked,
        toggleBookmark,
        clearBookmarks,
    };
}

