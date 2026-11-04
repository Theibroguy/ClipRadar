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

        global.fetch = vi.fn().mockImplementation((url, opts) => {
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
            if (url.includes('/api/studio/hook')) {
                const body = opts?.body ? JSON.parse(opts.body) : {};
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            success: true,
                            style: body.style || 'curiosity',
                            headline: `AI Generated **${body.style || 'curiosity'}** Hook for **${body.title || 'Video'}**`,
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

    it('generates hook styles and re-rolls hooks with Gemini AI', async () => {
        render(<VideoStudio />);

        // Verify hook tone pills exist
        expect(screen.getByRole('button', { name: /curiosity/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /shock & drama/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /humorous/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /question/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /re-roll hook/i })).toBeInTheDocument();

        // Click on "Shock & Drama" tone pill
        const shockBtn = screen.getByRole('button', { name: /shock & drama/i });
        fireEvent.click(shockBtn);

        // Verify headline textarea was updated with shock hook
        await waitFor(() => {
            const textarea = screen.getByLabelText(/headline \/ hook text/i);
            expect(textarea.value).toContain('shock');
        });

        // Click "Re-Roll Hook" button
        const rerollBtn = screen.getByRole('button', { name: /re-roll hook/i });
        fireEvent.click(rerollBtn);

        await waitFor(() => {
            expect(screen.getByText(/generated new shock hook/i)).toBeInTheDocument();
        });
    });

    it('allows selecting text and clicking chips to highlight words in blue', async () => {
        render(<VideoStudio />);

        // Verify Highlight Selection button exists
        expect(screen.getByRole('button', { name: /highlight selection/i })).toBeInTheDocument();
        const textarea = screen.getByLabelText(/headline \/ hook text/i);

        // Find an active word chip (Dua is highlighted by default)
        const duaChip = screen.getByTitle(/click to remove blue highlight on "Dua"/i);
        expect(duaChip).toHaveClass('studio-word-chip--active');

        // Click it to un-highlight
        fireEvent.click(duaChip);
        expect(screen.getByTitle(/click to highlight "Dua" in blue/i)).toBeInTheDocument();

        // Click "Clear all highlights"
        const clearBtn = screen.getByRole('button', { name: /clear all highlights/i });
        fireEvent.click(clearBtn);
        expect(textarea.value).not.toContain('**');
    });

    it('provides interactive dual-handle timeline trimmer with quick presets and nudge controls', () => {
        render(<VideoStudio />);

        // Verify trimmer section and controls
        expect(screen.getByLabelText(/video trimming timeline/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /play cut range/i })).toBeInTheDocument();
        expect(screen.getByRole('slider', { name: /trim start time/i })).toBeInTheDocument();
        expect(screen.getByRole('slider', { name: /trim end time/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /first 15s/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /middle 30s/i })).toBeInTheDocument();

        // Adjust Start Cut slider
        const startSlider = screen.getByRole('slider', { name: /trim start time/i });
        fireEvent.change(startSlider, { target: { value: 2 } });
        expect(screen.getByLabelText(/cut start in seconds/i).value).toBe('2');

        // Adjust End Cut slider
        const endSlider = screen.getByRole('slider', { name: /trim end time/i });
        fireEvent.change(endSlider, { target: { value: 12 } });
        expect(screen.getByLabelText(/cut end in seconds/i).value).toBe('12');

        // Click preset "First 15s"
        const preset15 = screen.getByRole('button', { name: /first 15s/i });
        fireEvent.click(preset15);
        expect(screen.getByLabelText(/cut start in seconds/i).value).toBe('0');
        expect(screen.getByLabelText(/cut end in seconds/i).value).toBe('15');
    });
});

