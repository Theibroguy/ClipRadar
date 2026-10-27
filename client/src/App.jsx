import { Routes, Route, Navigate } from 'react-router-dom';
import VideoFeed from './pages/VideoFeed/VideoFeed.jsx';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<VideoFeed />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
