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
            creator: { name: 'Spice Network' },
            thumbnailUrl: 'https://picsum.photos/seed/spice/640/360',
            videoUrl: 'https://www.youtube.com/watch?v=test_yt_01',
        },
        {
            platform: 'youtube',
            platformVideoId: 'test_yt_02',
            title: 'Crazy 100-Hour Wilderness Survival',
            aiDescription: 'MrBeast style endurance challenge deep in the wilderness.',
            category: 'Challenge',
            viewCount: 22000000,
            velocityViewsPerHour: 40000,
            durationSeconds: 60,
            creator: { name: 'Extreme Creators' },
            thumbnailUrl: 'https://picsum.photos/seed/wild/640/360',
            videoUrl: 'https://www.youtube.com/watch?v=test_yt_02',
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
                theme: 'Freshly Rolled Daily YouTube Batch',
                videos: [
                    {
                        ...mockDropData.videos[0],
                        title: 'Freshly Generated Comedy Moment',
                    },
                ],
            },
        });
    });

    it('renders the daily drop section header, formatted date, countdown, and video cards', async () => {
        render(
            <BrowserRouter>
                <DailyRadarSection onPreview={vi.fn()} />
            </BrowserRouter>
        );

        // Header and badges
        expect(await screen.findByText(/daily radar drop/i)).toBeInTheDocument();
        expect(screen.getByText(/wednesday, nov 4, 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/celebrity reactions & insane challenges/i)).toBeInTheDocument();

        // Cards rendered
        expect(screen.getByText('Hilarious Hot Ones Spice Challenge')).toBeInTheDocument();
        expect(screen.getByText('Crazy 100-Hour Wilderness Survival')).toBeInTheDocument();
        expect(screen.getByText(/15.0M views/i)).toBeInTheDocument();
        expect(screen.getByText(/25K\/hr/i)).toBeInTheDocument();
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

        const generateBtn = await screen.findByRole('button', { name: /generate fresh youtube video drop/i });
        fireEvent.click(generateBtn);

        await waitFor(() => {
            expect(api.generateFreshDailyDrop).toHaveBeenCalled();
            expect(screen.getByText('Freshly Generated Comedy Moment')).toBeInTheDocument();
            expect(screen.getByText(/brand new fresh youtube batch generated for today/i)).toBeInTheDocument();
        });
    });
});
