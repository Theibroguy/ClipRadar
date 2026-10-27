/**
 * VideoCard component tests
 * Vitest + @testing-library/react
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VideoCard from '../src/components/VideoCard/VideoCard.jsx';

const sampleVideo = {
    platform: 'demo',
    platformVideoId: 'demo-001',
    creator: {
        name: 'Test Creator',
        handle: '@testcreator',
        avatarUrl: '',
        profileUrl: 'https://example.com',
    },
    title: 'A Very Funny Clip',
    aiDescription: 'This is a funny and entertaining clip from a popular creator.',
    category: 'Comedy',
    thumbnailUrl: '',
    videoUrl: 'https://example.com/video/1',
    durationSeconds: 120,
    publishedAt: '2024-06-01T12:00:00Z',
    viewCount: 500000,
    likeCount: 25000,
};

describe('VideoCard', () => {
    it('renders the video title', () => {
        render(<VideoCard video={sampleVideo} />);
        expect(screen.getByText('A Very Funny Clip')).toBeInTheDocument();
    });

    it('renders the creator name', () => {
        render(<VideoCard video={sampleVideo} />);
        expect(screen.getByText('Test Creator')).toBeInTheDocument();
    });

    it('renders the creator handle', () => {
        render(<VideoCard video={sampleVideo} />);
        expect(screen.getByText('@testcreator')).toBeInTheDocument();
    });

    it('renders the AI description', () => {
        render(<VideoCard video={sampleVideo} />);
        expect(
            screen.getByText(/funny and entertaining clip/i)
        ).toBeInTheDocument();
    });

    it('renders the category badge', () => {
        render(<VideoCard video={sampleVideo} />);
        expect(screen.getByText('Comedy')).toBeInTheDocument();
    });

    it('renders a link to the video URL', () => {
        render(<VideoCard video={sampleVideo} />);
        const link = screen.getByRole('link', { name: /watch/i });
        expect(link).toHaveAttribute('href', 'https://example.com/video/1');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders the platform badge', () => {
        render(<VideoCard video={sampleVideo} />);
        expect(screen.getByText('Demo')).toBeInTheDocument();
    });

    it('renders formatted duration', () => {
        render(<VideoCard video={sampleVideo} />);
        expect(screen.getByText('2:00')).toBeInTheDocument();
    });

    it('renders formatted view count', () => {
        render(<VideoCard video={sampleVideo} />);
        expect(screen.getByText(/500\.0K|500K/)).toBeInTheDocument();
    });
});
