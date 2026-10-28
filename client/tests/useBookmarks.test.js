/**
 * useBookmarks hook tests
 * Vitest + @testing-library/react
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookmarks } from '../src/hooks/useBookmarks.js';

const mockVideo1 = { platform: 'demo', platformVideoId: '1', title: 'Video 1' };
const mockVideo2 = { platform: 'youtube', platformVideoId: '2', title: 'Video 2' };

describe('useBookmarks', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('initializes with empty bookmarks', () => {
        const { result } = renderHook(() => useBookmarks());
        expect(result.current.bookmarks).toEqual([]);
        expect(result.current.bookmarksCount).toBe(0);
        expect(result.current.isBookmarked(mockVideo1)).toBe(false);
    });

    it('toggles bookmarks adding and removing', () => {
        const { result } = renderHook(() => useBookmarks());

        // Add
        act(() => {
            result.current.toggleBookmark(mockVideo1);
        });
        expect(result.current.bookmarksCount).toBe(1);
        expect(result.current.isBookmarked(mockVideo1)).toBe(true);

        // Add another
        act(() => {
            result.current.toggleBookmark(mockVideo2);
        });
        expect(result.current.bookmarksCount).toBe(2);
        expect(result.current.isBookmarked(mockVideo2)).toBe(true);

        // Remove first
        act(() => {
            result.current.toggleBookmark(mockVideo1);
        });
        expect(result.current.bookmarksCount).toBe(1);
        expect(result.current.isBookmarked(mockVideo1)).toBe(false);
        expect(result.current.isBookmarked(mockVideo2)).toBe(true);
    });

    it('persists and loads from localStorage', () => {
        localStorage.setItem('clipradar_bookmarks', JSON.stringify([mockVideo1]));
        const { result } = renderHook(() => useBookmarks());

        expect(result.current.bookmarksCount).toBe(1);
        expect(result.current.isBookmarked(mockVideo1)).toBe(true);
    });
});

