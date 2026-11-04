import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import VideoFeed from './pages/VideoFeed/VideoFeed.jsx';
import VideoStudio from './pages/VideoStudio/VideoStudio.jsx';
import SettingsModal from './components/SettingsModal/SettingsModal.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';

export default function App() {
    return (
        <SettingsProvider>
            <div className="app-container">
                <Navbar />
                <Routes>
                    <Route path="/" element={<VideoFeed />} />
                    <Route path="/studio" element={<VideoStudio />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <SettingsModal />
            </div>
        </SettingsProvider>
    );
}
