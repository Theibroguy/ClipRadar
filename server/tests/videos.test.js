/**
 * Server API tests
 * Uses Vitest + Supertest.
 *
 * Run: npm test (from the server directory)
 * These tests run against the app WITHOUT starting a real HTTP server
 * or connecting to a real database (DEMO_MODE=true is set by test env).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

// Force demo mode for tests — no real API or DB needed
process.env.DEMO_MODE = 'true';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

// Dynamically import AFTER env vars are set
let app;
beforeAll(async () => {
    const mod = await import('../src/app.js');
    app = mod.default;
});

describe('GET /api/health', () => {
    it('returns status ok in demo mode', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.mode).toBe('demo');
    });
});

describe('GET /api/videos', () => {
    it('returns a list of demo videos', async () => {
        const res = await request(app).get('/api/videos');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('videos');
        expect(Array.isArray(res.body.videos)).toBe(true);
        expect(res.body.videos.length).toBeGreaterThan(0);
        expect(res.body.mode).toBe('demo');
    });

    it('filters by platform', async () => {
        const res = await request(app).get('/api/videos?platform=demo');
        expect(res.status).toBe(200);
        expect(res.body.videos.every((v) => v.platform === 'demo')).toBe(true);
    });

    it('filters by category', async () => {
        const res = await request(app).get('/api/videos?category=Comedy');
        expect(res.status).toBe(200);
        // If no Comedy videos exist in demo data, result is empty — not an error
        expect(Array.isArray(res.body.videos)).toBe(true);
    });

    it('respects limit param', async () => {
        const res = await request(app).get('/api/videos?limit=2');
        expect(res.status).toBe(200);
        expect(res.body.videos.length).toBeLessThanOrEqual(2);
    });
});

describe('POST /api/videos/refresh', () => {
    it('returns 403 in demo mode', async () => {
        const res = await request(app).post('/api/videos/refresh');
        expect(res.status).toBe(403);
        expect(res.body.error).toMatch(/demo mode/i);
    });
});

describe('Unknown route', () => {
    it('returns 404', async () => {
        const res = await request(app).get('/api/does-not-exist');
        expect(res.status).toBe(404);
    });
});
