import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import VideoStudio from '../src/pages/VideoStudio/VideoStudio.jsx';

describe('VideoStudio Component', () => {
    beforeAll(() => {
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();
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
});
