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
        expect(res.body.videos.every((v) => v.category === 'Comedy')).toBe(true);
    });

    it('searches by keyword', async () => {
        const res = await request(app).get('/api/videos?q=MrBeast');
        expect(res.status).toBe(200);
        expect(res.body.videos.length).toBeGreaterThan(0);
        expect(
            res.body.videos.some(
                (v) =>
                    v.title?.includes('MrBeast') ||
                    v.creator?.name?.includes('MrBeast')
            )
        ).toBe(true);
    });

    it('supports pagination limit and skip', async () => {
        const res1 = await request(app).get('/api/videos?limit=2&skip=0');
        const res2 = await request(app).get('/api/videos?limit=2&skip=2');
        expect(res1.status).toBe(200);
        expect(res2.status).toBe(200);
        expect(res1.body.videos.length).toBe(2);
        expect(res2.body.videos.length).toBe(2);
        // The two pages should not have the same first video
        expect(res1.body.videos[0].platformVideoId).not.toBe(
            res2.body.videos[0].platformVideoId
        );
    });
});

describe('POST /api/videos/refresh in demo mode', () => {
    it('returns 403 Forbidden because demo mode is read-only', async () => {
        const res = await request(app).post('/api/videos/refresh');
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('error');
    });
});

describe('POST /api/studio/moments', () => {
    it('extracts multiple viral highlights with start/end time and scores', async () => {
        const res = await request(app)
            .post('/api/studio/moments')
            .send({
                title: 'Crazy Survival Challenge',
                description: 'Surviving 7 days in the wilderness',
                duration: 60,
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.moments)).toBe(true);
        expect(res.body.moments.length).toBeGreaterThan(0);

        const firstMoment = res.body.moments[0];
        expect(firstMoment).toHaveProperty('id');
        expect(firstMoment).toHaveProperty('title');
        expect(firstMoment).toHaveProperty('startTime');
        expect(firstMoment).toHaveProperty('endTime');
        expect(firstMoment).toHaveProperty('headline');
        expect(firstMoment).toHaveProperty('score');
        expect(firstMoment).toHaveProperty('reason');
        expect(firstMoment.endTime).toBeGreaterThan(firstMoment.startTime);
    });
});

describe('POST /api/studio/hook', () => {
    it('generates a viral headline hook based on requested style', async () => {
        const res = await request(app)
            .post('/api/studio/hook')
            .send({
                title: 'MrBeast Island Challenge',
                context: '100 people fighting for 1 million dollars',
                style: 'shock',
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.style).toBe('shock');
        expect(typeof res.body.headline).toBe('string');
        expect(res.body.headline.length).toBeGreaterThan(10);
    });
});

describe('POST /api/videos', () => {
    it('saves a studio-generated 9:16 short and makes it available in the feed', async () => {
        const payload = {
            title: 'Viral Dua Lipa Red Carpet Short',
            headline: 'Everyone agreed **Dua Lipa** looked **stunning**',
            durationSeconds: 15,
            channelName: 'Viral Clips TV',
            channelHandle: '@viralclips',
        };

        const postRes = await request(app).post('/api/videos').send(payload);
        expect(postRes.status).toBe(201);
        expect(postRes.body.success).toBe(true);
        expect(postRes.body.video.platform).toBe('studio');
        expect(postRes.body.video.title).toBe('Viral Dua Lipa Red Carpet Short');

        // Verify it appears in GET /api/videos with platform=studio
        const getRes = await request(app).get('/api/videos?platform=studio');
        expect(getRes.status).toBe(200);
        expect(getRes.body.videos.some((v) => v.platformVideoId === postRes.body.video.platformVideoId)).toBe(true);
    });
});

describe('Daily Radar Drops API', () => {
    it('returns today curated viral YouTube and Twitter drop with countdown and videos', async () => {
        const res = await request(app).get('/api/daily-drops');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('date');
        expect(res.body).toHaveProperty('formattedDate');
        expect(res.body).toHaveProperty('theme');
        expect(res.body).toHaveProperty('videos');
        expect(Array.isArray(res.body.videos)).toBe(true);
        expect(res.body.videos.length).toBeGreaterThan(0);
        expect(res.body.videos[0].platform).toBe('youtube');
        expect(res.body.videos.some((v) => v.platform === 'twitter')).toBe(true);
    });

    it('returns drops filtered by platform=twitter', async () => {
        const res = await request(app).get('/api/daily-drops?platform=twitter');
        expect(res.status).toBe(200);
        expect(res.body.videos.length).toBeGreaterThan(0);
        expect(res.body.videos.every((v) => v.platform === 'twitter')).toBe(true);
    });

    it('returns drops filtered by platform=youtube', async () => {
        const res = await request(app).get('/api/daily-drops?platform=youtube');
        expect(res.status).toBe(200);
        expect(res.body.videos.length).toBeGreaterThan(0);
        expect(res.body.videos.every((v) => v.platform === 'youtube')).toBe(true);
    });

    it('supports generating a fresh batch on demand via POST /api/daily-drops/generate', async () => {
        const res = await request(app).post('/api/daily-drops/generate');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.drop).toBeDefined();
        expect(Array.isArray(res.body.drop.videos)).toBe(true);
    });
});

describe('Unknown route', () => {
    it('returns 404', async () => {
        const res = await request(app).get('/api/does-not-exist');
        expect(res.status).toBe(404);
    });
});
