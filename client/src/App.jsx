import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import VideoFeed from './pages/VideoFeed/VideoFeed.jsx';
import VideoStudio from './pages/VideoStudio/VideoStudio.jsx';
import SettingsModal from './components/SettingsModal/SettingsModal.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { FeedFilterProvider } from './context/FeedFilterContext.jsx';
import './App.css';

export default function App() {
    return (
        <SettingsProvider>
            <FeedFilterProvider>
                <div className="app-container">
                    <Navbar />
                    <div className="app-body">
                        <Sidebar />
                        <div className="app-main-content">
                            <Routes>
                                <Route path="/" element={<VideoFeed pagePlatform="youtube" />} />
                                <Route path="/youtube" element={<VideoFeed pagePlatform="youtube" />} />
                                <Route path="/twitter" element={<VideoFeed pagePlatform="twitter" />} />
                                <Route path="/instagram" element={<VideoFeed pagePlatform="instagram" />} />
                                <Route path="/tiktok" element={<VideoFeed pagePlatform="tiktok" />} />
                                <Route path="/studio-shorts" element={<VideoFeed pagePlatform="studio" />} />
                                <Route path="/studio" element={<VideoStudio />} />
                                <Route path="*" element={<Navigate to="/youtube" replace />} />
                            </Routes>
                        </div>
                    </div>
                    <SettingsModal />
                </div>
            </FeedFilterProvider>
        </SettingsProvider>
    );
}
