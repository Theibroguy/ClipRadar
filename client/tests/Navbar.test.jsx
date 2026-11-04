import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Navbar from '../src/components/Navbar/Navbar.jsx';

describe('Navbar Component', () => {
    it('renders the brand logo and navigation links', () => {
        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        // Brand logo
        expect(screen.getByRole('link', { name: /clipradar home/i })).toBeInTheDocument();

        // Tabs
        const feedTab = screen.getByRole('link', { name: /radar feed/i });
        const studioTab = screen.getByRole('link', { name: /video studio/i });

        expect(feedTab).toBeInTheDocument();
        expect(studioTab).toBeInTheDocument();

        // Check attributes
        expect(feedTab).toHaveAttribute('href', '/');
        expect(studioTab).toHaveAttribute('href', '/studio');
    });

    it('renders the "New" badge on Video Studio tab', () => {
        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText('New')).toBeInTheDocument();
    });
});

