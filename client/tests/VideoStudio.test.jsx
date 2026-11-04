import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import VideoStudio from '../src/pages/VideoStudio/VideoStudio.jsx';

describe('VideoStudio Component', () => {
    beforeAll(() => {
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();
        window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue();
        window.HTMLMediaElement.prototype.pause = vi.fn();

        global.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('/api/studio/moments')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            success: true,
                            totalMoments: 3,
                            moments: [
                                {
                                    id: 'moment-1',
                                    title: 'Explosive Opening Hook',
                                    startTime: 0,
                                    endTime: 10,
                                    duration: 10,
                                    headline: 'Watch what happened when **beast challenge** began',
                                    score: 98,
                                    reason: 'Instant curiosity gap right at the 0s mark.',
                                    tags: ['Hook', 'Trending'],
                                },
                                {
                                    id: 'moment-2',
                                    title: 'Unexpected Plot Twist',
                                    startTime: 12,
                                    endTime: 25,
                                    duration: 13,
                                    headline: 'Nobody anticipated what happened in the **middle**',
                                    score: 95,
                                    reason: 'Sudden narrative shift.',
                                    tags: ['Twist'],
                                },
                                {
                                    id: 'moment-3',
                                    title: 'Peak Climax & Reaction',
                                    startTime: 26,
                                    endTime: 40,
                                    duration: 14,
                                    headline: 'The exact moment **everyone** went crazy',
                                    score: 92,
                                    reason: 'Emotional peak.',
                                    tags: ['Climax'],
                                },
                            ],
                        }),
                });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
        });
    });

    it('renders the header and main sections', () => {
        render(<VideoStudio />);

        // Header
        expect(screen.getByText('AI Video Studio')).toBeInTheDocument();
        expect(screen.getByText(/transform clips into viral shorts/i)).toBeInTheDocument();

        // 4 Steps / Headings
        expect(screen.getByRole('heading', { name: /^video footage$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /^logo & branding$/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /^ai catchy moment & text$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /generate edited 9:16 video/i })).toBeInTheDocument();

        // 9:16 Phone mockup
        expect(screen.getByLabelText(/live video preview/i)).toBeInTheDocument();
        expect(screen.getByText('1080 × 1920 (9:16)')).toBeInTheDocument();
    });

    it('updates the live preview and keeps headline text visible after logo upload', () => {
        render(<VideoStudio />);

        // Change channel name
        const nameInput = screen.getByLabelText(/channel name/i);
        fireEvent.change(nameInput, { target: { value: 'VIRAL CLIPS TV' } });
        expect(screen.getByText('VIRAL CLIPS TV')).toBeInTheDocument();

        // Upload logo file
        const logoFile = new File(['dummy logo'], 'logo.png', { type: 'image/png' });
        const logoInput = screen.getByLabelText(/upload channel logo or avatar/i).querySelector('input[type="file"]');
        fireEvent.change(logoInput, { target: { files: [logoFile] } });

        // Verify logo avatar img is rendered in the preview
        expect(screen.getByAltText('VIRAL CLIPS TV')).toBeInTheDocument();

        // Verify headline text spans are STILL present in preview
        const headlineMatches = screen.getAllByText(/dua lipa/i);
        expect(headlineMatches.length).toBeGreaterThanOrEqual(1);
    });

    it('generates the video and finishes with download button', async () => {
        render(<VideoStudio />);

        // Upload dummy video so generate button is enabled
        const videoFile = new File(['dummy video'], 'clip.mp4', { type: 'video/mp4' });
        const videoInput = screen.getByLabelText(/upload raw video file/i).querySelector('input[type="file"]');
        fireEvent.change(videoInput, { target: { files: [videoFile] } });

        const generateBtn = screen.getByRole('button', { name: /generate edited 9:16 video/i });
        expect(generateBtn).not.toBeDisabled();

        // Click generate
        fireEvent.click(generateBtn);

        // Expect to finish and display success card + download button
        await waitFor(
            () => {
                expect(screen.getByText(/video generated successfully!/i)).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /download edited video/i })).toBeInTheDocument();
            },
            { timeout: 6000 }
        );
    });

    it('extracts multiple catchy moments with AI and allows previewing and downloading any moment', async () => {
        render(<VideoStudio />);

        // Upload a video
        const videoFile = new File(['dummy video'], 'beast_challenge.mp4', { type: 'video/mp4' });
        const videoInput = screen.getByLabelText(/upload raw video file/i).querySelector('input[type="file"]');
        fireEvent.change(videoInput, { target: { files: [videoFile] } });

        // Click the AI Extract button
        const extractBtn = screen.getByRole('button', { name: /ai: extract all catchy moments/i });
        expect(extractBtn).not.toBeDisabled();
        fireEvent.click(extractBtn);

        // Wait for multiple moments to be extracted and rendered
        await waitFor(() => {
            expect(screen.getByText(/moments extracted/i)).toBeInTheDocument();
        });

        // Verify multiple moment cards are rendered
        expect(screen.getByText('Explosive Opening Hook')).toBeInTheDocument();
        expect(screen.getByText('Unexpected Plot Twist')).toBeInTheDocument();
        expect(screen.getByText('Peak Climax & Reaction')).toBeInTheDocument();

        // Verify each moment has a download button
        const downloadMomentBtns = screen.getAllByRole('button', { name: /download this short/i });
        expect(downloadMomentBtns.length).toBeGreaterThanOrEqual(3);

        // Verify batch download button exists
        expect(screen.getByRole('button', { name: /download all/i })).toBeInTheDocument();

        // Preview Moment #2
        const previewBtns = screen.getAllByRole('button', { name: /preview moment/i });
        expect(previewBtns.length).toBeGreaterThanOrEqual(2);
        fireEvent.click(previewBtns[0]); // Preview moment 2

        // Download an individual moment
        fireEvent.click(downloadMomentBtns[0]);
        await waitFor(() => {
            // Verify createObjectURL was called for download
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });
});
