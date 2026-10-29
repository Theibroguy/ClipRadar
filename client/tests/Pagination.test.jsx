/**
 * VideoFeed pagination & infinite scroll tests
 * Vitest + @testing-library/react
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoFeed from '../src/pages/VideoFeed/VideoFeed.jsx';
import * as api from '../src/api/videos.js';

// Mock intersection observer for jsdom
class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

const makeClips = (count, startId = 1) =>
    Array.from({ length: count }, (_, i) => ({
        platform: 'youtube',
        platformVideoId: `clip-${startId + i}`,
        creator: { name: `Creator ${startId + i}` },
        title: `Clip Title ${startId + i}`,
        aiDescription: `AI Description for clip ${startId + i}`,
        category: 'Comedy',
        thumbnailUrl: '',
        videoUrl: `https://youtube.com/watch?v=clip-${startId + i}`,
        embedUrl: `https://youtube.com/embed/clip-${startId + i}`,
        durationSeconds: 120,
        publishedAt: '2024-06-01T12:00:00Z',
        viewCount: 10000,
        likeCount: 500,
    }));

describe('VideoFeed Pagination', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('loads and displays initial page of clips with Load More button', async () => {
        vi.spyOn(api, 'fetchVideos').mockResolvedValueOnce({
            videos: makeClips(6, 1),
            total: 12,
            hasMore: true,
            mode: 'production',
        });

        render(<VideoFeed />);

        // Verify initial 6 clips render
        expect(await screen.findByText('Clip Title 1')).toBeInTheDocument();
        expect(screen.getByText('Clip Title 6')).toBeInTheDocument();

        // Verify Load More button is present
        const loadMoreBtn = screen.getByRole('button', { name: /load more clips/i });
        expect(loadMoreBtn).toBeInTheDocument();
        expect(loadMoreBtn).toHaveTextContent('6 of 12');
    });

    it('appends next page of clips when clicking Load More', async () => {
        vi.spyOn(api, 'fetchVideos')
            .mockResolvedValueOnce({
                videos: makeClips(6, 1),
                total: 12,
                hasMore: true,
                mode: 'production',
            })
            .mockResolvedValueOnce({
                videos: makeClips(6, 7),
                total: 12,
                hasMore: false,
                mode: 'production',
            });

        render(<VideoFeed />);

        expect(await screen.findByText('Clip Title 1')).toBeInTheDocument();

        const loadMoreBtn = screen.getByRole('button', { name: /load more clips/i });
        fireEvent.click(loadMoreBtn);

        // Next clips appear
        expect(await screen.findByText('Clip Title 7')).toBeInTheDocument();
        expect(screen.getByText('Clip Title 12')).toBeInTheDocument();

        // Previous clips are still rendered
        expect(screen.getByText('Clip Title 1')).toBeInTheDocument();

        // End message displays when caught up
        await waitFor(() => {
            expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
        });
    });
});

