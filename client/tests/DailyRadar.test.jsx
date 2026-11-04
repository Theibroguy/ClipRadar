import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DailyRadarSection from '../src/components/DailyRadarSection/DailyRadarSection.jsx';
import * as api from '../src/api/videos.js';
import { BrowserRouter } from 'react-router-dom';

const mockDropData = {
    date: '2026-11-04',
    formattedDate: 'Wednesday, Nov 4, 2026',
    theme: 'Celebrity Reactions & Insane Challenges',
    nextDropCountdownSeconds: 3600,
    total: 2,
    history: ['2026-11-04', '2026-11-03'],
    videos: [
        {
            platform: 'youtube',
            platformVideoId: 'test_yt_01',
            title: 'Hilarious Hot Ones Spice Challenge',
            aiDescription: 'Celebrities struggle with extreme hot wings in an unforgettable interview.',
            category: 'Comedy',
            viewCount: 15000000,
            velocityViewsPerHour: 25000,
            durationSeconds: 45,
            creator: { name: 'Spice Network', handle: '@spicenetwork' },
            thumbnailUrl: 'https://picsum.photos/seed/spice/640/360',
            videoUrl: 'https://www.youtube.com/watch?v=test_yt_01',
        },
        {
            platform: 'twitter',
            platformVideoId: '1798432198012345678',
            title: 'Starship Orbital Separation Flight Test Drone 4K',
            aiDescription: 'Elon Musk shares breathtaking aerial view of SpaceX Starship.',
            category: 'Science & Tech',
            viewCount: 42500000,
            velocityViewsPerHour: 88000,
            durationSeconds: 42,
            creator: { name: 'Elon Musk', handle: '@elonmusk' },
            thumbnailUrl: 'https://picsum.photos/seed/starship/640/360',
            videoUrl: 'https://x.com/elonmusk/status/1798432198012345678',
        },
    ],
};

describe('DailyRadarSection Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(api, 'fetchDailyDrop').mockResolvedValue(mockDropData);
        vi.spyOn(api, 'generateFreshDailyDrop').mockResolvedValue({
            success: true,
            drop: {
                ...mockDropData,
                theme: 'Freshly Rolled Daily Radar Batch',
                videos: [
                    {
                        ...mockDropData.videos[0],
                        title: 'Freshly Generated Comedy Moment',
                    },
                ],
            },
        });
    });

    it('renders the daily drop section header, formatted date, countdown, and both YouTube and Twitter video cards', async () => {
        render(
            <BrowserRouter>
                <DailyRadarSection onPreview={vi.fn()} />
            </BrowserRouter>
        );

        // Header and badges
        expect(await screen.findByText(/daily radar drop/i)).toBeInTheDocument();
        expect(screen.getByText(/wednesday, nov 4, 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/celebrity reactions & insane challenges/i)).toBeInTheDocument();

        // Cards rendered for both platforms
        expect(screen.getByText('Hilarious Hot Ones Spice Challenge')).toBeInTheDocument();
        expect(screen.getByText('Starship Orbital Separation Flight Test Drone 4K')).toBeInTheDocument();
        expect(screen.getByText(/15.0M views/i)).toBeInTheDocument();
        expect(screen.getByText(/42.5M impressions/i)).toBeInTheDocument();

        // Platform badges & handles
        expect(screen.getByText('YouTube Short')).toBeInTheDocument();
        expect(screen.getByText(/post/i)).toBeInTheDocument();
        expect(screen.getByText('@elonmusk')).toBeInTheDocument();
    });

    it('filters videos between All, YouTube Shorts, and X / Twitter Clips tabs', async () => {
        render(
            <BrowserRouter>
                <DailyRadarSection onPreview={vi.fn()} />
            </BrowserRouter>
        );

        expect(await screen.findByText('Hilarious Hot Ones Spice Challenge')).toBeInTheDocument();
        expect(screen.getByText('Starship Orbital Separation Flight Test Drone 4K')).toBeInTheDocument();

        // Switch to Twitter tab
        const twitterTab = screen.getByRole('tab', { name: /twitter clips/i });
        fireEvent.click(twitterTab);

        expect(screen.getByText('Starship Orbital Separation Flight Test Drone 4K')).toBeInTheDocument();
        expect(screen.queryByText('Hilarious Hot Ones Spice Challenge')).not.toBeInTheDocument();
        expect(screen.getByText("Today's Viral X / Twitter Clips")).toBeInTheDocument();

        // Switch to YouTube tab
        const youtubeTab = screen.getByRole('tab', { name: /youtube shorts/i });
        fireEvent.click(youtubeTab);

        expect(screen.getByText('Hilarious Hot Ones Spice Challenge')).toBeInTheDocument();
        expect(screen.queryByText('Starship Orbital Separation Flight Test Drone 4K')).not.toBeInTheDocument();
        expect(screen.getByText("Today's Viral YouTube Shorts")).toBeInTheDocument();

        // Switch back to All Drops
        const allTab = screen.getByRole('tab', { name: /all drops/i });
        fireEvent.click(allTab);

        expect(screen.getByText('Hilarious Hot Ones Spice Challenge')).toBeInTheDocument();
        expect(screen.getByText('Starship Orbital Separation Flight Test Drone 4K')).toBeInTheDocument();
    });

    it('triggers the onPreview callback when clicking the preview button or thumbnail', async () => {
        const onPreviewMock = vi.fn();
        render(
            <BrowserRouter>
                <DailyRadarSection onPreview={onPreviewMock} />
            </BrowserRouter>
        );

        const previewBtns = await screen.findAllByRole('button', { name: /preview/i });
        fireEvent.click(previewBtns[0]);

        expect(onPreviewMock).toHaveBeenCalledWith(mockDropData.videos[0]);
    });

    it('generates a fresh batch on demand when clicking Generate New Batch', async () => {
        render(
            <BrowserRouter>
                <DailyRadarSection onPreview={vi.fn()} />
            </BrowserRouter>
        );

        const generateBtn = await screen.findByRole('button', { name: /generate fresh.*drop/i });
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(api.generateFreshDailyDrop).toHaveBeenCalled();
            expect(screen.getByText('Freshly Generated Comedy Moment')).toBeInTheDocument();
            expect(screen.getByText(/brand new fresh.*batch generated for today/i)).toBeInTheDocument();
        });
    });
});
