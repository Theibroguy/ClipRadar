import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ChannelDashboard from '../src/pages/ChannelDashboard/ChannelDashboard.jsx';
import * as api from '../src/api/videos.js';

const mockAnalyticsResponse = {
    success: true,
    channel: {
        id: 'UC_test_123',
        name: 'ClipRadar Official',
        handle: '@ClipRadarOfficial',
        description: 'Official YouTube Shorts & Viral Clips channel.',
        avatarUrl: 'https://picsum.photos/seed/cr/200/200',
        subscriberCount: 125000,
        totalViews: 4800000,
        videoCount: 84,
        isLive: false,
    },
    kpis: {
        avgViewsPerVideo: 64000,
        avgLikesPerVideo: 5100,
        avgCommentsPerVideo: 340,
        engagementRate: 8.5,
        shortsRatio: 83,
        viewsGrowth30dPct: '+31.4%',
        subsGrowth30dPct: '+18.6%',
        topOutlierMultiplier: '3.15x',
    },
    timeSeries: {
        days7: [
            { date: '2026-11-08', label: 'Nov 8', views: 24000, subscribersGained: 210, watchHours: 260, engagementRate: 8.2 },
            { date: '2026-11-09', label: 'Nov 9', views: 31000, subscribersGained: 290, watchHours: 340, engagementRate: 8.8 },
        ],
        days30: [
            { date: '2026-11-01', label: 'Nov 1', views: 22000, subscribersGained: 190, watchHours: 240, engagementRate: 8.0 },
            { date: '2026-11-09', label: 'Nov 9', views: 31000, subscribersGained: 290, watchHours: 340, engagementRate: 8.8 },
        ],
        days90: [
            { date: '2026-09-01', label: 'Wk 1', views: 150000, subscribersGained: 1200, watchHours: 1600, engagementRate: 7.9 },
        ],
    },
    videos: [
        {
            id: 'vid_1',
            platformVideoId: 'vid_1',
            title: 'Nobody Expected This Reaction at the Final Second!',
            durationSeconds: 34,
            viewCount: 201600,
            likeCount: 16900,
            commentCount: 1300,
            outlierMultiplier: 3.15,
            engagementRate: 9.0,
            thumbnailUrl: 'https://picsum.photos/seed/v1/640/360',
        },
        {
            id: 'vid_2',
            platformVideoId: 'vid_2',
            title: 'Weekly Channel Vlog & Setup Update #14',
            durationSeconds: 195,
            viewCount: 24300,
            likeCount: 1000,
            commentCount: 55,
            outlierMultiplier: 0.38,
            engagementRate: 4.3,
            thumbnailUrl: 'https://picsum.photos/seed/v2/640/360',
        },
    ],
    bestPostingTimes: [
        { day: 'Thu', bestWindow: '6:00 PM – 9:00 PM', score: 96, avgVelocity: '35,000/hr' },
    ],
    milestoneForecast: {
        currentSubs: 125000,
        nextSubMilestone: 250000,
        subsRemaining: 125000,
        dailySubVelocity: 450,
        estimatedDaysToSubMilestone: 278,
        subProgressPct: 50,
        currentViews: 4800000,
        nextViewMilestone: 5000000,
        viewsRemaining: 200000,
        dailyViewVelocity: 25000,
        estimatedDaysToViewMilestone: 8,
        viewProgressPct: 96,
    },
    aiAssessment: {
        healthScore: 88,
        grade: 'A+',
        pillars: {
            hookRetention: 90,
            ctrPackaging: 86,
            consistency: 82,
            engagement: 92,
            shortsVelocity: 89,
        },
        executiveSummary: 'Your channel shows strong viral outlier velocity on short-form content.',
        strengths: ['High 3.15x outlier multiplier on reaction Shorts'],
        bottlenecks: ['Vlog-style titles underperform baseline by 62%'],
        actionPlan: [
            {
                id: 'action-1',
                priority: 'High Impact',
                title: 'Replicate Your Top Outlier Formula Within 48 Hours',
                description: 'Film a spin-off using the same 3-second visual hook.',
                expectedLift: '+40% to +65% Views',
            },
        ],
        nextVideoIdeas: [
            {
                id: 'idea-1',
                title: 'The Unseen Angle Everyone Missed',
                hook: 'Watch the **top right corner** at the **exact moment** the crowd reacts',
                concept: 'Slow-motion zoom into a viral reaction clip.',
                durationSeconds: 32,
                predictedMultiplier: '2.8x – 4.2x',
                category: 'Entertainment',
            },
        ],
    },
};

const mockVideoAuditResponse = {
    success: true,
    assessment: {
        videoId: 'vid_1',
        title: 'Nobody Expected This Reaction at the Final Second!',
        overallScore: 92,
        verdict: '🔥 Viral Outlier — Double Down on This Format',
        pillars: {
            hookScore: 95,
            packagingScore: 91,
            pacingScore: 90,
            viralityScore: 92,
        },
        summary: 'Outperformed channel average by 3.15x due to immediate curiosity gap.',
        whatWorked: ['Optimal 34s Short duration'],
        whatToImprove: ['Add a pinned debate question in comments'],
        titleRewrites: [
            'Why 99% of People Missed What Happened at 0:18...',
            'Watch What Happens When the Mic Stays On!',
        ],
        hookRewrite: 'As **the broadcast** rolled live on air, nobody was ready for the **shocking twist**',
    },
};

describe('ChannelDashboard Page', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.spyOn(api, 'fetchChannelAnalytics').mockResolvedValue(mockAnalyticsResponse);
        vi.spyOn(api, 'assessChannelVideo').mockResolvedValue(mockVideoAuditResponse);
        vi.spyOn(api, 'refreshChannelCoach').mockResolvedValue({
            success: true,
            aiAssessment: {
                ...mockAnalyticsResponse.aiAssessment,
                executiveSummary: 'Refreshed AI executive diagnosis for your channel.',
            },
        });
    });

    it('renders channel profile, health score gauge, KPIs, charts, AI video audit, and growth checklist', async () => {
        render(
            <BrowserRouter>
                <ChannelDashboard />
            </BrowserRouter>
        );

        // Channel header & health score
        expect(await screen.findByText('ClipRadar Official')).toBeInTheDocument();
        expect(screen.getByText('Grade A+')).toBeInTheDocument();

        // KPI metrics
        expect(screen.getByText('125K')).toBeInTheDocument();
        expect(screen.getByText('4.8M')).toBeInTheDocument();
        expect(screen.getByText('8.5%')).toBeInTheDocument();

        // AI Channel Coach section
        expect(screen.getByText(/how to make your youtube account better/i)).toBeInTheDocument();
        expect(screen.getByText('Replicate Your Top Outlier Formula Within 48 Hours')).toBeInTheDocument();

        // Per-Video AI Assessment section
        expect(await screen.findByText(/viral outlier — double down on this format/i)).toBeInTheDocument();
        expect(screen.getByText('Why 99% of People Missed What Happened at 0:18...')).toBeInTheDocument();

        // Next Video Ideas section
        expect(screen.getByText('The Unseen Angle Everyone Missed')).toBeInTheDocument();
    });

    it('switches linked channel when clicking a preset or submitting a handle', async () => {
        render(
            <BrowserRouter>
                <ChannelDashboard />
            </BrowserRouter>
        );

        await screen.findByText('ClipRadar Official');

        const mrBeastPreset = screen.getByRole('button', { name: '@MrBeast' });
        fireEvent.click(mrBeastPreset);

        await waitFor(() => {
            expect(api.fetchChannelAnalytics).toHaveBeenCalledWith('@MrBeast');
        });
    });

    it('toggles action items in the optimization checklist and switches chart time ranges', async () => {
        render(
            <BrowserRouter>
                <ChannelDashboard />
            </BrowserRouter>
        );

        await screen.findByText('ClipRadar Official');

        // Toggle checklist item
        expect(screen.getByText('0 of 1 completed')).toBeInTheDocument();
        const checkboxItem = screen.getByRole('checkbox');
        fireEvent.click(checkboxItem);
        expect(screen.getByText('1 of 1 completed')).toBeInTheDocument();

        // Switch chart time range to 7D and 90D
        const btn7d = screen.getByRole('button', { name: '7D' });
        fireEvent.click(btn7d);
        expect(btn7d).toHaveClass('active');

        const btn90d = screen.getByRole('button', { name: '90D' });
        fireEvent.click(btn90d);
        expect(btn90d).toHaveClass('active');
    });
});

