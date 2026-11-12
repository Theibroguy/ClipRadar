import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext.jsx';
import { FeedFilterProvider, useFeedFilters } from '../src/context/FeedFilterContext.jsx';
import Sidebar from '../src/components/Sidebar/Sidebar.jsx';

function TestSidebarApp() {
    const { toggleSidebar, isSidebarOpen } = useSettings();
    const feed = useFeedFilters();

    return (
        <div>
            <button onClick={toggleSidebar}>Toggle Sidebar Button</button>
            <div data-testid="active-platform">{feed.filters.platform}</div>
            <div data-testid="active-category">{feed.filters.category}</div>
            <div data-testid="saved-state">{String(feed.showSavedOnly)}</div>
            <Sidebar />
        </div>
    );
}

describe('Sidebar Component & Navigation', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('renders the sidebar with dedicated Social Media Pages, Workspace, and Categories without All Platforms', () => {
        render(
            <BrowserRouter>
                <SettingsProvider>
                    <FeedFilterProvider>
                        <TestSidebarApp />
                    </FeedFilterProvider>
                </SettingsProvider>
            </BrowserRouter>
        );

        // Sections
        expect(screen.getByText(/social media pages/i)).toBeInTheDocument();
        expect(screen.getByText('Platforms')).toBeInTheDocument();
        expect(screen.getByText(/feeds & views/i)).toBeInTheDocument();
        expect(screen.getByText(/categories & topics/i)).toBeInTheDocument();

        // Ensure "All Platforms" and "All Radar Feed" do NOT exist
        expect(screen.queryByText(/all platforms/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /all radar feed/i })).not.toBeInTheDocument();

        // Dedicated Social Media Pages
        expect(screen.getByRole('button', { name: /youtube shorts/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /x \/ twitter clips/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /instagram reels/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /tiktok videos/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ai studio shorts/i })).toBeInTheDocument();

        // Workspace
        expect(screen.getByRole('button', { name: /saved favorites/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /ai video studio/i })).toBeInTheDocument();

        // Categories
        expect(screen.getByRole('button', { name: /comedy & laughs/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /science & tech/i })).toBeInTheDocument();
    });

    it('updates platform filter when clicking a platform channel', () => {
        render(
            <BrowserRouter>
                <SettingsProvider>
                    <FeedFilterProvider>
                        <TestSidebarApp />
                    </FeedFilterProvider>
                </SettingsProvider>
            </BrowserRouter>
        );

        const twitterBtn = screen.getByRole('button', { name: /x \/ twitter clips/i });
        fireEvent.click(twitterBtn);

        expect(screen.getByTestId('active-platform')).toHaveTextContent('twitter');
        expect(screen.getByTestId('saved-state')).toHaveTextContent('false');
    });

    it('updates category filter when clicking a category item', () => {
        render(
            <BrowserRouter>
                <SettingsProvider>
                    <FeedFilterProvider>
                        <TestSidebarApp />
                    </FeedFilterProvider>
                </SettingsProvider>
            </BrowserRouter>
        );

        const comedyBtn = screen.getByRole('button', { name: /comedy & laughs/i });
        fireEvent.click(comedyBtn);

        expect(screen.getByTestId('active-category')).toHaveTextContent('Comedy');
    });

    it('switches to saved favorites when clicking Saved Favorites', () => {
        render(
            <BrowserRouter>
                <SettingsProvider>
                    <FeedFilterProvider>
                        <TestSidebarApp />
                    </FeedFilterProvider>
                </SettingsProvider>
            </BrowserRouter>
        );

        const savedBtn = screen.getByRole('button', { name: /saved favorites/i });
        fireEvent.click(savedBtn);

        expect(screen.getByTestId('saved-state')).toHaveTextContent('true');
    });

    it('toggles sidebar collapse state and closes via close button', () => {
        render(
            <BrowserRouter>
                <SettingsProvider>
                    <FeedFilterProvider>
                        <TestSidebarApp />
                    </FeedFilterProvider>
                </SettingsProvider>
            </BrowserRouter>
        );

        const sidebar = screen.getByLabelText(/application sidebar/i);
        expect(sidebar).toHaveClass('app-sidebar--open');

        // Close via close button inside sidebar
        const closeBtn = screen.getByRole('button', { name: /close sidebar/i });
        fireEvent.click(closeBtn);

        expect(sidebar).toHaveClass('app-sidebar--collapsed');

        // Toggle open via toggle button
        const toggleBtn = screen.getByRole('button', { name: /toggle sidebar button/i });
        fireEvent.click(toggleBtn);

        expect(sidebar).toHaveClass('app-sidebar--open');
    });
});

