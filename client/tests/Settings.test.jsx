import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext.jsx';
import SettingsModal from '../src/components/SettingsModal/SettingsModal.jsx';
import Navbar from '../src/components/Navbar/Navbar.jsx';
import { BrowserRouter } from 'react-router-dom';

function TestApp() {
    const { openSettings } = useSettings();
    return (
        <div>
            <button onClick={openSettings}>Open Settings Manual</button>
            <SettingsModal />
        </div>
    );
}

describe('Settings System & SettingsModal Component', () => {
    beforeAll(() => {
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();
    });

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('opens and closes the SettingsModal using Navbar and Done button', () => {
        render(
            <BrowserRouter>
                <SettingsProvider>
                    <Navbar />
                    <SettingsModal />
                </SettingsProvider>
            </BrowserRouter>
        );

        // Modal initially closed
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // Click settings button in Navbar
        const settingsBtn = screen.getByRole('button', { name: /open settings/i });
        fireEvent.click(settingsBtn);

        // Modal should now be open
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /clipradar settings/i })).toBeInTheDocument();

        // Close modal using Done button
        const doneBtn = screen.getByRole('button', { name: /done/i });
        fireEvent.click(doneBtn);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('navigates through settings tabs and updates preferences', () => {
        render(
            <SettingsProvider>
                <TestApp />
            </SettingsProvider>
        );

        fireEvent.click(screen.getByText('Open Settings Manual'));

        // Tab 1: Feed & Discovery
        expect(screen.getByLabelText(/default landing view/i)).toBeInTheDocument();
        const landingSelect = screen.getByLabelText(/default landing view/i);
        fireEvent.change(landingSelect, { target: { value: 'studio' } });
        expect(landingSelect.value).toBe('studio');

        // Toggle feed density
        const cinematicBtn = screen.getByRole('button', { name: /cinematic 2-col/i });
        fireEvent.click(cinematicBtn);
        expect(cinematicBtn).toHaveClass('settings-toggle-btn--active');

        // Tab 2: Video Playback
        const playbackTab = screen.getByRole('tab', { name: /video playback/i });
        fireEvent.click(playbackTab);
        expect(screen.getByText(/autoplay video on hover/i)).toBeInTheDocument();

        // Tab 3: Studio & AI Key
        const studioTab = screen.getByRole('tab', { name: /studio & ai key/i });
        fireEvent.click(studioTab);
        expect(screen.getByLabelText(/default studio aspect ratio/i)).toBeInTheDocument();

        // Save custom Gemini API key
        const apiKeyInput = screen.getByLabelText(/google gemini api key/i);
        fireEvent.change(apiKeyInput, { target: { value: 'AIzaSyMockKey123' } });
        const saveKeyBtn = screen.getByRole('button', { name: /save key/i });
        fireEvent.click(saveKeyBtn);

        expect(screen.getByText(/gemini api key updated/i)).toBeInTheDocument();
        expect(screen.getByText(/custom key active/i)).toBeInTheDocument();

        // Tab 4: Data & Backup
        const dataTab = screen.getByRole('tab', { name: /data & backup/i });
        fireEvent.click(dataTab);
        expect(screen.getByText(/export library & settings backup/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /download json backup/i })).toBeInTheDocument();
    });

    it('supports exporting data backup and restoring defaults', () => {
        render(
            <SettingsProvider>
                <TestApp />
            </SettingsProvider>
        );

        fireEvent.click(screen.getByText('Open Settings Manual'));

        // Switch to Data tab
        const dataTab = screen.getByRole('tab', { name: /data & backup/i });
        fireEvent.click(dataTab);

        // Click Download JSON Backup
        const exportBtn = screen.getByRole('button', { name: /download json backup/i });
        fireEvent.click(exportBtn);
        expect(screen.getByText(/data backup exported successfully/i)).toBeInTheDocument();

        // Click Restore Defaults in footer
        const restoreBtn = screen.getByRole('button', { name: /restore defaults/i });
        fireEvent.click(restoreBtn);

        // Check landing view returns to feed
        const feedTab = screen.getByRole('tab', { name: /feed & discovery/i });
        fireEvent.click(feedTab);
        expect(screen.getByLabelText(/default landing view/i).value).toBe('feed');
    });
});
