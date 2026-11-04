import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import VideoFeed from './pages/VideoFeed/VideoFeed.jsx';
import VideoStudio from './pages/VideoStudio/VideoStudio.jsx';

export default function App() {
    return (
        <div className="app-container">
            <Navbar />
            <Routes>
                <Route path="/" element={<VideoFeed />} />
                <Route path="/studio" element={<VideoStudio />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}
