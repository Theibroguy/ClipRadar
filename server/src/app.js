import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/videos.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// --- Security middleware ---
app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    })
);

// --- Rate limiting ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// --- Body parsing ---
app.use(express.json({ limit: '10kb' }));

// --- Routes ---
app.use('/api', apiRouter);

// --- 404 catch-all ---
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;
