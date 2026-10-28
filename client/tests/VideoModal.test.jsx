/**
 * VideoModal component tests
 * Vitest + @testing-library/react
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoModal from '../src/components/VideoModal/VideoModal.jsx';

const sampleVideoWithEmbed = {
    platform: 'demo',
    platformVideoId: 'demo-yt-001',
    creator: {
        name: 'MrBeast',
        handle: '@MrBeast',
        avatarUrl: 'https://example.com/avatar.jpg',
        profileUrl: 'https://www.youtube.com/@MrBeast',
    },
    title: 'I Survived 7 Days in an Ancient Forest',
    description: 'Original wilderness caption.',
    aiDescription: 'AI analysis: An intense survival challenge.',
    category: 'Challenge',
    tags: ['survival', 'challenge'],
    thumbnailUrl: 'https://example.com/thumb.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=0e3GPea1Tyg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/0e3GPea1Tyg',
    durationSeconds: 872,
    publishedAt: '2024-05-12T12:00:00Z',
    viewCount: 48200000,
    likeCount: 3100000,
};

const sampleVideoWithoutEmbed = {
    platform: 'twitter',
    platformVideoId: 'tw-123',
    creator: {
        name: 'Elon Musk',
        handle: '@elonmusk',
        avatarUrl: '',
        profileUrl: 'https://x.com/elonmusk',
    },
    title: 'SpaceX Starship Flight',
    description: 'Starship test flight.',
    aiDescription: 'AI analysis: SpaceX Starship test.',
    category: 'Science',
    tags: ['spacex'],
    thumbnailUrl: 'https://example.com/rocket.jpg',
    videoUrl: 'https://x.com/elonmusk/status/123',
    embedUrl: '',
    durationSeconds: 60,
    publishedAt: '2024-06-15T20:30:00Z',
    viewCount: 1500000,
    likeCount: 95000,
};

describe('VideoModal', () => {
    it('renders iframe for videos with embedUrl', () => {
        render(<VideoModal video={sampleVideoWithEmbed} onClose={vi.fn()} />);

        const iframe = screen.getByTitle('I Survived 7 Days in an Ancient Forest');
        expect(iframe).toBeInTheDocument();
        expect(iframe.tagName.toLowerCase()).toBe('iframe');
        expect(iframe.src).toContain('youtube-nocookie.com/embed/0e3GPea1Tyg');
    });

    it('renders creator info, AI description and stats', () => {
        render(<VideoModal video={sampleVideoWithEmbed} onClose={vi.fn()} />);

        expect(screen.getByText('MrBeast')).toBeInTheDocument();
        expect(screen.getByText('@MrBeast')).toBeInTheDocument();
        expect(screen.getByText(/An intense survival challenge/i)).toBeInTheDocument();
        expect(screen.getByText('48.2M')).toBeInTheDocument();
        expect(screen.getByText('3.1M')).toBeInTheDocument();
        expect(screen.getByText('#survival')).toBeInTheDocument();
    });

    it('renders fallback notice when no embed is available', () => {
        render(<VideoModal video={sampleVideoWithoutEmbed} onClose={vi.fn()} />);

        expect(
            screen.getByText(/Direct in-app embed is restricted by X/i)
        ).toBeInTheDocument();
        const cta = screen.getAllByRole('link', { name: /watch.*x/i });
        expect(cta.length).toBeGreaterThan(0);
    });

    it('calls onClose when clicking close button', () => {
        const onClose = vi.fn();
        render(<VideoModal video={sampleVideoWithEmbed} onClose={onClose} />);

        const closeBtn = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when pressing Escape key', () => {
        const onClose = vi.fn();
        render(<VideoModal video={sampleVideoWithEmbed} onClose={onClose} />);

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when clicking backdrop', () => {
        const onClose = vi.fn();
        render(<VideoModal video={sampleVideoWithEmbed} onClose={onClose} />);

        const backdrop = screen.getByTestId('video-modal-backdrop');
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

