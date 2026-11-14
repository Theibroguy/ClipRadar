import React, { useState, useEffect, useMemo } from 'react';
import { useInRouterContext, useNavigate } from 'react-router-dom';
import {
    fetchChannelAnalytics,
    assessChannelVideo,
    refreshChannelCoach,
} from '../../api/videos.js';
import { formatCount, formatDuration } from '../../utils/formatters.js';
import {
    IconYouTube,
    IconSparkles,
    IconFlame,
    IconBolt,
    IconRefresh,
    IconCheck,
    IconEye,
    IconClock,
    IconScissors,
    IconChart,
    IconTrendingUp,
    IconUsers,
    IconAward,
    IconAlert,
    IconExternalLink,
} from '../../components/common/Icons.jsx';
import './ChannelDashboard.css';

const STORAGE_CHANNEL_KEY = 'clipradar_linked_yt_channel';
const STORAGE_CHECKLIST_KEY = 'clipradar_channel_checklist';

const PRESET_CHANNELS = [
    '@ClipRadarOfficial',
    '@MrBeast',
    '@MKBHD',
    '@IShowSpeed',
];

function useSafeNavigate() {
    const inRouter = useInRouterContext();
    const navigate = inRouter ? useNavigate() : null;
    return inRouter && navigate ? navigate : () => {};
}

export default function ChannelDashboard() {
    const navigate = useSafeNavigate();

    const [linkedHandle, setLinkedHandle] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_CHANNEL_KEY) || '@ClipRadarOfficial';
        } catch {
            return '@ClipRadarOfficial';
        }
    });
    const [handleInput, setHandleInput] = useState(linkedHandle);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

    // Interactive Chart States
    const [timeRange, setTimeRange] = useState('30d'); // '7d' | '30d' | '90d'
    const [chartMetric, setChartMetric] = useState('views'); // 'views' | 'subscribersGained' | 'watchHours'
    const [hoveredPointIdx, setHoveredPointIdx] = useState(null);

    // Per-Video AI Assessment State
    const [selectedVideoForAudit, setSelectedVideoForAudit] = useState(null);
    const [videoAuditResult, setVideoAuditResult] = useState(null);
    const [isAuditingVideo, setIsAuditingVideo] = useState(false);
    const [copiedText, setCopiedText] = useState('');

    // AI Coach Refresh & Action Plan Checklist State
    const [isRefreshingCoach, setIsRefreshingCoach] = useState(false);
    const [completedActions, setCompletedActions] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_CHECKLIST_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    // Load Channel Analytics
    useEffect(() => {
        let active = true;
        async function loadAnalytics() {
            setStatus('loading');
            setErrorMsg('');
            try {
                const res = await fetchChannelAnalytics(linkedHandle);
                if (!active) return;
                setAnalyticsData(res);
                setStatus('success');

                // Automatically select the first video for initial AI audit preview
                if (res.videos && res.videos.length > 0) {
                    const firstVid = res.videos[0];
                    setSelectedVideoForAudit(firstVid);
                    runVideoAudit(firstVid, res.kpis);
                }
            } catch (err) {
                if (!active) return;
                setErrorMsg(err.message || 'Failed to load YouTube channel analytics.');
                setStatus('error');
            }
        }
        loadAnalytics();
        return () => {
            active = false;
        };
    }, [linkedHandle]);

    async function runVideoAudit(video, kpisBaseline) {
        if (!video) return;
        setSelectedVideoForAudit(video);
        setIsAuditingVideo(true);
        try {
            const res = await assessChannelVideo(video, kpisBaseline || analyticsData?.kpis || {});
            setVideoAuditResult(res.assessment);
        } catch (err) {
            console.error('Video AI assessment error:', err);
        } finally {
            setIsAuditingVideo(false);
        }
    }

    function handleLinkChannelSubmit(e) {
        e.preventDefault();
        const trimmed = handleInput.trim();
        if (!trimmed) return;
        const formatted = trimmed.startsWith('@') || trimmed.startsWith('http') || trimmed.startsWith('UC')
            ? trimmed
            : `@${trimmed}`;
        setHandleInput(formatted);
        setLinkedHandle(formatted);
        try {
            localStorage.setItem(STORAGE_CHANNEL_KEY, formatted);
        } catch {
            // ignore storage errors
        }
    }

    function handleSelectPresetChannel(preset) {
        setHandleInput(preset);
        setLinkedHandle(preset);
        try {
            localStorage.setItem(STORAGE_CHANNEL_KEY, preset);
        } catch {
            // ignore
        }
    }

    async function handleRefreshCoach() {
        if (isRefreshingCoach || !analyticsData) return;
        setIsRefreshingCoach(true);
        try {
            const res = await refreshChannelCoach(linkedHandle, analyticsData);
            if (res?.aiAssessment) {
                setAnalyticsData((prev) => ({
                    ...prev,
                    aiAssessment: res.aiAssessment,
                }));
            }
        } catch (err) {
            console.error('Failed to refresh AI coach:', err);
        } finally {
            setIsRefreshingCoach(false);
        }
    }

    function toggleActionCompleted(actionId) {
        setCompletedActions((prev) => {
            const next = { ...prev, [actionId]: !prev[actionId] };
            try {
                localStorage.setItem(STORAGE_CHECKLIST_KEY, JSON.stringify(next));
            } catch {
                // ignore
            }
            return next;
        });
    }

    function handleCopyText(text, label) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => {});
        }
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2200);
    }

    function handleSendIdeaToStudio(idea) {
        try {
            sessionStorage.setItem(
                'clipradar_studio_prefill',
                JSON.stringify({
                    title: idea.title,
                    headline: idea.hook,
                    category: idea.category || 'Entertainment',
                })
            );
        } catch {
            // ignore
        }
        navigate('/studio');
    }

    // Active time-series data based on 7d / 30d / 90d selection
    const activeSeries = useMemo(() => {
        if (!analyticsData?.timeSeries) return [];
        if (timeRange === '7d') return analyticsData.timeSeries.days7 || [];
        if (timeRange === '90d') return analyticsData.timeSeries.days90 || [];
        return analyticsData.timeSeries.days30 || [];
    }, [analyticsData, timeRange]);

    // Compute SVG coordinates for the Area/Line Chart
    const svgChartGeometry = useMemo(() => {
        if (!activeSeries.length) return { points: [], areaPath: '', linePath: '', maxVal: 1, minVal: 0 };
        const width = 760;
        const height = 230;
        const padLeft = 18;
        const padRight = 18;
        const padTop = 22;
        const padBottom = 28;
        const usableW = width - padLeft - padRight;
        const usableH = height - padTop - padBottom;

        const values = activeSeries.map((d) => Number(d[chartMetric] || 0));
        const maxVal = Math.max(10, ...values);
        const minVal = Math.min(0, ...values);
        const range = Math.max(1, maxVal - minVal);

        const points = activeSeries.map((d, i) => {
            const x =
                activeSeries.length === 1
                    ? width / 2
                    : padLeft + (i / (activeSeries.length - 1)) * usableW;
            const val = Number(d[chartMetric] || 0);
            const y = padTop + usableH - ((val - minVal) / range) * usableH;
            return { x, y, val, raw: d, index: i };
        });

        const linePath = points
            .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
            .join(' ');

        const firstPt = points[0];
        const lastPt = points[points.length - 1];
        const baselineY = padTop + usableH;
        const areaPath = `${linePath} L ${lastPt.x.toFixed(1)} ${baselineY} L ${firstPt.x.toFixed(1)} ${baselineY} Z`;

        return { points, linePath, areaPath, maxVal, minVal, width, height, baselineY };
    }, [activeSeries, chartMetric]);

    const channel = analyticsData?.channel || {};
    const kpis = analyticsData?.kpis || {};
    const aiAssessment = analyticsData?.aiAssessment || {};
    const videos = analyticsData?.videos || [];
    const bestPostingTimes = analyticsData?.bestPostingTimes || [];
    const milestone = analyticsData?.milestoneForecast || {};

    const healthScore = aiAssessment.healthScore || 86;
    const circumference = 2 * Math.PI * 46;
    const strokeDashoffset = circumference - (healthScore / 100) * circumference;

    const actionList = aiAssessment.actionPlan || [];
    const completedCount = actionList.filter((a) => completedActions[a.id]).length;

    return (
        <div className="channel-dashboard">
            {/* Top Laser Sweep Bar */}
            <div key={linkedHandle} className="channel-dashboard__laser" aria-hidden="true" />

            {/* Hero Header & Account Linker */}
            <header className="channel-dashboard__hero">
                <div className="channel-dashboard__hero-inner">
                    <div className="channel-dashboard__hero-top">
                        <div className="channel-dashboard__brand-title">
                            <span className="channel-dashboard__yt-badge">
                                <IconYouTube size={24} />
                                <span>YouTube Creator Intelligence</span>
                            </span>
                            <h1>Channel Performance & AI Growth Coach</h1>
                            <p>
                                Real-time channel analytics, outlier multiplier detection, AI video audits, and actionable steps to grow your YouTube channel faster.
                            </p>
                        </div>

                        {/* Link / Switch YouTube Channel Form */}
                        <div className="channel-dashboard__linker-card">
                            <form onSubmit={handleLinkChannelSubmit} className="channel-dashboard__linker-form">
                                <label htmlFor="yt-channel-handle-input" className="channel-dashboard__linker-label">
                                    Linked YouTube Account (@handle or URL)
                                </label>
                                <div className="channel-dashboard__linker-input-row">
                                    <input
                                        id="yt-channel-handle-input"
                                        type="text"
                                        value={handleInput}
                                        onChange={(e) => setHandleInput(e.target.value)}
                                        placeholder="e.g. @YourChannel or https://youtube.com/@..."
                                        className="channel-dashboard__linker-input"
                                    />
                                    <button type="submit" className="channel-dashboard__linker-btn">
                                        <IconBolt size={15} />
                                        <span>Analyze Channel</span>
                                    </button>
                                </div>
                            </form>
                            <div className="channel-dashboard__presets">
                                <span>Quick Switch:</span>
                                {PRESET_CHANNELS.map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        className={`channel-dashboard__preset-pill ${linkedHandle.toLowerCase() === preset.toLowerCase() ? 'active' : ''}`}
                                        onClick={() => handleSelectPresetChannel(preset)}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Linked Channel Identity Banner */}
                    {status === 'success' && (
                        <div key={channel.handle} className="channel-dashboard__profile-bar">
                            <div className="channel-dashboard__profile-left">
                                <img
                                    src={channel.avatarUrl}
                                    alt={channel.name}
                                    className="channel-dashboard__avatar"
                                />
                                <div className="channel-dashboard__profile-meta">
                                    <div className="channel-dashboard__profile-name-row">
                                        <h2>{channel.name}</h2>
                                        <span className="channel-dashboard__handle-pill">{channel.handle}</span>
                                        <span className={`channel-dashboard__mode-pill ${channel.isLive ? 'live' : ''}`}>
                                            {channel.isLive ? 'Live YouTube Data API' : 'AI Simulated Channel Data'}
                                        </span>
                                    </div>
                                    <p className="channel-dashboard__profile-desc">{channel.description}</p>
                                </div>
                            </div>

                            {/* Radial Health Score Ring */}
                            <div className="channel-dashboard__health-ring-card" aria-label={`Channel Health Score ${healthScore} out of 100`}>
                                <div className="channel-dashboard__ring-wrap">
                                    <svg width="110" height="110" viewBox="0 0 110 110">
                                        <circle
                                            cx="55"
                                            cy="55"
                                            r="46"
                                            fill="none"
                                            stroke="rgba(148, 163, 184, 0.18)"
                                            strokeWidth="9"
                                        />
                                        <circle
                                            cx="55"
                                            cy="55"
                                            r="46"
                                            fill="none"
                                            stroke="url(#healthRingGrad)"
                                            strokeWidth="9"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            transform="rotate(-90 55 55)"
                                            className="channel-dashboard__ring-progress"
                                        />
                                        <defs>
                                            <linearGradient id="healthRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="50%" stopColor="#6c63ff" />
                                                <stop offset="100%" stopColor="#ec4899" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="channel-dashboard__ring-center">
                                        <span className="channel-dashboard__ring-score">{healthScore}</span>
                                        <span className="channel-dashboard__ring-grade">Grade {aiAssessment.grade || 'A'}</span>
                                    </div>
                                </div>
                                <div className="channel-dashboard__ring-text">
                                    <strong>AI Channel Health</strong>
                                    <span>5-Pillar Composite Score</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Dashboard Body */}
            <div className="channel-dashboard__container">
                {status === 'loading' && (
                    <div className="channel-dashboard__loading" role="status">
                        <div className="channel-dashboard__skeleton-row">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="channel-dashboard__skeleton-kpi skeleton" />
                            ))}
                        </div>
                        <div className="channel-dashboard__skeleton-chart skeleton" />
                    </div>
                )}

                {status === 'error' && (
                    <div className="channel-dashboard__error" role="alert">
                        <IconAlert size={36} color="#ef4444" />
                        <h3>Could not load channel analytics</h3>
                        <p>{errorMsg}</p>
                        <button
                            type="button"
                            className="channel-dashboard__linker-btn"
                            onClick={() => setLinkedHandle(linkedHandle)}
                        >
                            <IconRefresh size={16} /> Retry
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <>
                        {/* Section 1: KPI Cards + Milestone Forecaster */}
                        <section className="channel-dashboard__kpi-grid" aria-label="Key Performance Indicators">
                            <div className="cd-kpi-card">
                                <div className="cd-kpi-card__top">
                                    <span className="cd-kpi-card__label">Subscribers</span>
                                    <span className="cd-kpi-card__icon cd-kpi-card__icon--subs">
                                        <IconUsers size={18} />
                                    </span>
                                </div>
                                <div className="cd-kpi-card__value">
                                    {formatCount(channel.subscriberCount) || '0'}
                                </div>
                                <div className="cd-kpi-card__delta positive">
                                    <IconTrendingUp size={14} />
                                    <span>{kpis.subsGrowth30dPct || '+18.6%'} last 30d</span>
                                </div>
                                <div className="cd-kpi-card__milestone">
                                    <div className="cd-kpi-card__milestone-bar">
                                        <div
                                            className="cd-kpi-card__milestone-fill"
                                            style={{ width: `${milestone.subProgressPct || 75}%` }}
                                        />
                                    </div>
                                    <span>
                                        Next goal: <strong>{formatCount(milestone.nextSubMilestone)}</strong> (~{milestone.estimatedDaysToSubMilestone} days)
                                    </span>
                                </div>
                            </div>

                            <div className="cd-kpi-card">
                                <div className="cd-kpi-card__top">
                                    <span className="cd-kpi-card__label">Total Channel Views</span>
                                    <span className="cd-kpi-card__icon cd-kpi-card__icon--views">
                                        <IconEye size={18} />
                                    </span>
                                </div>
                                <div className="cd-kpi-card__value">
                                    {formatCount(channel.totalViews) || '0'}
                                </div>
                                <div className="cd-kpi-card__delta positive">
                                    <IconTrendingUp size={14} />
                                    <span>{kpis.viewsGrowth30dPct || '+31.4%'} velocity</span>
                                </div>
                                <div className="cd-kpi-card__milestone">
                                    <div className="cd-kpi-card__milestone-bar">
                                        <div
                                            className="cd-kpi-card__milestone-fill cd-kpi-card__milestone-fill--views"
                                            style={{ width: `${milestone.viewProgressPct || 80}%` }}
                                        />
                                    </div>
                                    <span>
                                        Next goal: <strong>{formatCount(milestone.nextViewMilestone)}</strong> (~{milestone.estimatedDaysToViewMilestone} days)
                                    </span>
                                </div>
                            </div>

                            <div className="cd-kpi-card">
                                <div className="cd-kpi-card__top">
                                    <span className="cd-kpi-card__label">Avg Views / Video</span>
                                    <span className="cd-kpi-card__icon cd-kpi-card__icon--outlier">
                                        <IconFlame size={18} />
                                    </span>
                                </div>
                                <div className="cd-kpi-card__value">
                                    {formatCount(kpis.avgViewsPerVideo) || '0'}
                                </div>
                                <div className="cd-kpi-card__delta outlier">
                                    <span>Top Outlier Hit: <strong>{kpis.topOutlierMultiplier || '3.1x'}</strong> baseline</span>
                                </div>
                                <div className="cd-kpi-card__subtext">
                                    Shorts Ratio: <strong>{kpis.shortsRatio}%</strong> of recent uploads
                                </div>
                            </div>

                            <div className="cd-kpi-card">
                                <div className="cd-kpi-card__top">
                                    <span className="cd-kpi-card__label">Engagement Rate</span>
                                    <span className="cd-kpi-card__icon cd-kpi-card__icon--engage">
                                        <IconAward size={18} />
                                    </span>
                                </div>
                                <div className="cd-kpi-card__value">
                                    {kpis.engagementRate}%
                                </div>
                                <div className="cd-kpi-card__delta positive">
                                    <span>Above 5.2% niche creator benchmark</span>
                                </div>
                                <div className="cd-kpi-card__subtext">
                                    Avg <strong>{formatCount(kpis.avgLikesPerVideo)}</strong> likes · <strong>{formatCount(kpis.avgCommentsPerVideo)}</strong> comments
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Interactive Performance Graphs & Charts */}
                        <section className="channel-dashboard__charts-grid" aria-label="Performance Charts">
                            {/* Left: Interactive Area/Line Trajectory Chart */}
                            <div className="cd-chart-card cd-chart-card--wide">
                                <div className="cd-chart-card__header">
                                    <div>
                                        <h3>
                                            <IconChart size={18} /> Performance Trajectory & Growth Velocity
                                        </h3>
                                        <p>Interactive time-series analysis across your channel's views, subscriber gains, and watch hours.</p>
                                    </div>

                                    <div className="cd-chart-card__controls">
                                        {/* Metric Selector */}
                                        <div className="cd-pill-group" role="group" aria-label="Chart Metric">
                                            <button
                                                type="button"
                                                className={`cd-pill-btn ${chartMetric === 'views' ? 'active' : ''}`}
                                                onClick={() => setChartMetric('views')}
                                            >
                                                Views
                                            </button>
                                            <button
                                                type="button"
                                                className={`cd-pill-btn ${chartMetric === 'subscribersGained' ? 'active' : ''}`}
                                                onClick={() => setChartMetric('subscribersGained')}
                                            >
                                                Subscribers
                                            </button>
                                            <button
                                                type="button"
                                                className={`cd-pill-btn ${chartMetric === 'watchHours' ? 'active' : ''}`}
                                                onClick={() => setChartMetric('watchHours')}
                                            >
                                                Watch Hours
                                            </button>
                                        </div>

                                        {/* Time Range Selector */}
                                        <div className="cd-pill-group" role="group" aria-label="Time Range">
                                            <button
                                                type="button"
                                                className={`cd-pill-btn ${timeRange === '7d' ? 'active' : ''}`}
                                                onClick={() => setTimeRange('7d')}
                                            >
                                                7D
                                            </button>
                                            <button
                                                type="button"
                                                className={`cd-pill-btn ${timeRange === '30d' ? 'active' : ''}`}
                                                onClick={() => setTimeRange('30d')}
                                            >
                                                30D
                                            </button>
                                            <button
                                                type="button"
                                                className={`cd-pill-btn ${timeRange === '90d' ? 'active' : ''}`}
                                                onClick={() => setTimeRange('90d')}
                                            >
                                                90D
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* SVG Area & Line Graph */}
                                <div className="cd-svg-chart-wrap">
                                    <svg
                                        viewBox="0 0 760 230"
                                        className="cd-svg-chart"
                                        role="img"
                                        aria-label={`Channel ${chartMetric} chart over ${timeRange}`}
                                    >
                                        <defs>
                                            <linearGradient id="cdAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.45" />
                                                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                                            </linearGradient>
                                            <linearGradient id="cdLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6c63ff" />
                                                <stop offset="50%" stopColor="#38bdf8" />
                                                <stop offset="100%" stopColor="#ec4899" />
                                            </linearGradient>
                                        </defs>

                                        {/* Horizontal Grid Lines */}
                                        {[0.2, 0.5, 0.8].map((ratio, idx) => (
                                            <line
                                                key={idx}
                                                x1="18"
                                                x2="742"
                                                y1={22 + ratio * 180}
                                                y2={22 + ratio * 180}
                                                stroke="rgba(148, 163, 184, 0.14)"
                                                strokeDasharray="4 4"
                                            />
                                        ))}

                                        {/* Shaded Area */}
                                        {svgChartGeometry.areaPath && (
                                            <path d={svgChartGeometry.areaPath} fill="url(#cdAreaGrad)" />
                                        )}

                                        {/* Smooth Line */}
                                        {svgChartGeometry.linePath && (
                                            <path
                                                d={svgChartGeometry.linePath}
                                                fill="none"
                                                stroke="url(#cdLineGrad)"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        )}

                                        {/* Data Points */}
                                        {svgChartGeometry.points.map((pt) => {
                                            const isHovered = hoveredPointIdx === pt.index;
                                            return (
                                                <g
                                                    key={pt.index}
                                                    onMouseEnter={() => setHoveredPointIdx(pt.index)}
                                                    onMouseLeave={() => setHoveredPointIdx(null)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <circle
                                                        cx={pt.x}
                                                        cy={pt.y}
                                                        r={isHovered ? 7 : 4}
                                                        fill={isHovered ? '#ec4899' : '#6c63ff'}
                                                        stroke="#ffffff"
                                                        strokeWidth="2"
                                                    />
                                                    <rect
                                                        x={pt.x - 12}
                                                        y="0"
                                                        width="24"
                                                        height="230"
                                                        fill="transparent"
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {/* Interactive Hover Readout Bar */}
                                    <div className="cd-chart-readout">
                                        {hoveredPointIdx !== null && svgChartGeometry.points[hoveredPointIdx] ? (
                                            <>
                                                <strong>{svgChartGeometry.points[hoveredPointIdx].raw.label}</strong>
                                                <span>
                                                    Views: <strong>{svgChartGeometry.points[hoveredPointIdx].raw.views.toLocaleString()}</strong>
                                                </span>
                                                <span>
                                                    New Subs: <strong>+{svgChartGeometry.points[hoveredPointIdx].raw.subscribersGained.toLocaleString()}</strong>
                                                </span>
                                                <span>
                                                    Watch Time: <strong>{svgChartGeometry.points[hoveredPointIdx].raw.watchHours.toLocaleString()} hrs</strong>
                                                </span>
                                                <span>
                                                    Engagement: <strong>{svgChartGeometry.points[hoveredPointIdx].raw.engagementRate}%</strong>
                                                </span>
                                            </>
                                        ) : (
                                            <span>
                                                Hover over any point on the graph to inspect daily views, subscriber velocity, and watch hours.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Outlier Multiplier Bar Comparison Chart */}
                                <div className="cd-outlier-bars">
                                    <div className="cd-outlier-bars__header">
                                        <h4>Outlier Multiplier Detector (Recent Uploads vs. 1.0x Channel Baseline)</h4>
                                        <span>Click any bar to run an AI Video Audit</span>
                                    </div>
                                    <div className="cd-outlier-bars__list">
                                        {videos.slice(0, 6).map((v) => {
                                            const mult = v.outlierMultiplier || 1;
                                            const widthPct = Math.min(100, Math.max(14, Math.round((mult / 3.5) * 100)));
                                            const isSelected = selectedVideoForAudit?.id === v.id;
                                            return (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    className={`cd-outlier-bar-row ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => runVideoAudit(v, kpis)}
                                                >
                                                    <span className="cd-outlier-bar-row__title" title={v.title}>
                                                        {v.title}
                                                    </span>
                                                    <div className="cd-outlier-bar-row__track">
                                                        <div
                                                            className={`cd-outlier-bar-row__fill ${
                                                                mult >= 1.5
                                                                    ? 'outlier-high'
                                                                    : mult < 0.75
                                                                    ? 'outlier-low'
                                                                    : 'outlier-mid'
                                                            }`}
                                                            style={{ width: `${widthPct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`cd-outlier-bar-row__badge ${mult >= 1.5 ? 'hot' : ''}`}>
                                                        {mult}x
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right: 5-Pillar Channel Health Breakdown + Best Posting Schedule */}
                            <div className="cd-chart-card">
                                <h3>
                                    <IconSparkles size={18} /> 5-Pillar AI Channel Scorecard
                                </h3>
                                <p>Breakdown of how your channel performs across YouTube algorithm signals.</p>

                                <div className="cd-pillars-list">
                                    {[
                                        { label: '3-Second Hook Retention', val: aiAssessment.pillars?.hookRetention || 86, color: '#10b981' },
                                        { label: 'Title & Thumbnail CTR Packaging', val: aiAssessment.pillars?.ctrPackaging || 82, color: '#6c63ff' },
                                        { label: 'Upload Consistency & Cadence', val: aiAssessment.pillars?.consistency || 80, color: '#38bdf8' },
                                        { label: 'Comment & Like Velocity', val: aiAssessment.pillars?.engagement || 88, color: '#ec4899' },
                                        { label: 'Shorts Feed Loop Conversion', val: aiAssessment.pillars?.shortsVelocity || 85, color: '#f59e0b' },
                                    ].map((pillar) => (
                                        <div key={pillar.label} className="cd-pillar-item">
                                            <div className="cd-pillar-item__top">
                                                <span>{pillar.label}</span>
                                                <strong>{pillar.val}/100</strong>
                                            </div>
                                            <div className="cd-pillar-item__bar">
                                                <div
                                                    className="cd-pillar-item__fill"
                                                    style={{
                                                        width: `${pillar.val}%`,
                                                        background: pillar.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Best Time to Post Schedule */}
                                <div className="cd-schedule-box">
                                    <h4>
                                        <IconClock size={16} /> Best Windows to Publish
                                    </h4>
                                    <div className="cd-schedule-grid">
                                        {bestPostingTimes.map((slot) => (
                                            <div
                                                key={slot.day}
                                                className={`cd-schedule-row ${slot.score >= 92 ? 'peak' : ''}`}
                                            >
                                                <span className="cd-schedule-row__day">{slot.day}</span>
                                                <span className="cd-schedule-row__window">{slot.bestWindow}</span>
                                                <span className="cd-schedule-row__score">{slot.score}% Match</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: AI Channel Feedback & Growth Roadmap ("How to Make the Account Better") */}
                        <section className="channel-dashboard__coach-section" aria-label="AI Channel Feedback and Growth Plan">
                            <div className="cd-coach-header">
                                <div>
                                    <span className="cd-section-tag">
                                        <IconSparkles size={14} /> Gemini AI Growth Strategist
                                    </span>
                                    <h2>How to Make Your YouTube Account Better</h2>
                                    <p className="cd-coach-summary">{aiAssessment.executiveSummary}</p>
                                </div>
                                <button
                                    type="button"
                                    className="channel-dashboard__linker-btn"
                                    onClick={handleRefreshCoach}
                                    disabled={isRefreshingCoach}
                                >
                                    <IconRefresh size={16} spinning={isRefreshingCoach} />
                                    <span>{isRefreshingCoach ? 'Analyzing Channel…' : 'Refresh AI Feedback'}</span>
                                </button>
                            </div>

                            {/* Strengths vs. Bottlenecks */}
                            <div className="cd-diagnosis-grid">
                                <div className="cd-diagnosis-card cd-diagnosis-card--strengths">
                                    <h3>What Your Channel Does Well (Strengths)</h3>
                                    <ul>
                                        {(aiAssessment.strengths || []).map((item, idx) => (
                                            <li key={idx}>
                                                <IconCheck size={16} color="#10b981" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="cd-diagnosis-card cd-diagnosis-card--bottlenecks">
                                    <h3>What Is Holding Your Growth Back (Bottlenecks)</h3>
                                    <ul>
                                        {(aiAssessment.bottlenecks || []).map((item, idx) => (
                                            <li key={idx}>
                                                <IconAlert size={16} color="#f59e0b" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Interactive Action Plan Checklist */}
                            <div className="cd-action-plan">
                                <div className="cd-action-plan__header">
                                    <h3>Prioritized Channel Optimization Checklist</h3>
                                    <span className="cd-action-plan__progress">
                                        {completedCount} of {actionList.length} completed
                                    </span>
                                </div>

                                <div className="cd-action-plan__list">
                                    {actionList.map((action) => {
                                        const isDone = !!completedActions[action.id];
                                        return (
                                            <div
                                                key={action.id}
                                                className={`cd-action-item ${isDone ? 'completed' : ''}`}
                                                onClick={() => toggleActionCompleted(action.id)}
                                                role="checkbox"
                                                aria-checked={isDone}
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        toggleActionCompleted(action.id);
                                                    }
                                                }}
                                            >
                                                <div className={`cd-action-item__check ${isDone ? 'checked' : ''}`}>
                                                    {isDone && <IconCheck size={14} color="#ffffff" />}
                                                </div>
                                                <div className="cd-action-item__body">
                                                    <div className="cd-action-item__title-row">
                                                        <span
                                                            className={`cd-priority-badge priority-${(action.priority || 'High Impact')
                                                                .toLowerCase()
                                                                .replace(/\s+/g, '-')}`}
                                                        >
                                                            {action.priority}
                                                        </span>
                                                        <h4>{action.title}</h4>
                                                        {action.expectedLift && (
                                                            <span className="cd-lift-badge">{action.expectedLift}</span>
                                                        )}
                                                    </div>
                                                    <p>{action.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Per-Video AI Assessment & CTR Rewrite Studio */}
                        <section className="channel-dashboard__video-audit-section" aria-label="AI Video Assessment">
                            <div className="cd-section-heading">
                                <span className="cd-section-tag">
                                    <IconYouTube size={14} /> Deep-Dive Video Auditor
                                </span>
                                <h2>AI Video Assessment & CTR Title Optimizer</h2>
                                <p>Select any video from your channel below to inspect its 4-pillar AI score, retention diagnosis, and high-CTR title rewrites.</p>
                            </div>

                            <div className="cd-audit-layout">
                                {/* Left: Channel Videos List */}
                                <div className="cd-video-selector-list">
                                    {videos.map((v) => {
                                        const isSelected = selectedVideoForAudit?.id === v.id;
                                        return (
                                            <div
                                                key={v.id}
                                                className={`cd-video-item ${isSelected ? 'active' : ''}`}
                                                onClick={() => runVideoAudit(v, kpis)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        runVideoAudit(v, kpis);
                                                    }
                                                }}
                                            >
                                                <div className="cd-video-item__thumb">
                                                    <img src={v.thumbnailUrl} alt={v.title} loading="lazy" />
                                                    <span className="cd-video-item__dur">
                                                        {formatDuration(v.durationSeconds)}
                                                    </span>
                                                </div>
                                                <div className="cd-video-item__info">
                                                    <h4>{v.title}</h4>
                                                    <div className="cd-video-item__stats">
                                                        <span>{formatCount(v.viewCount)} views</span>
                                                        <span>·</span>
                                                        <span>{v.engagementRate}% eng</span>
                                                        <span
                                                            className={`cd-video-item__mult ${
                                                                v.outlierMultiplier >= 1.5
                                                                    ? 'high'
                                                                    : v.outlierMultiplier < 0.75
                                                                    ? 'low'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {v.outlierMultiplier}x baseline
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="cd-video-item__audit-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        runVideoAudit(v, kpis);
                                                    }}
                                                >
                                                    AI Audit
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Right: Active Video AI Critique Card */}
                                <div className="cd-audit-detail-card">
                                    {isAuditingVideo ? (
                                        <div className="cd-audit-loading" role="status">
                                            <IconRefresh size={28} spinning={true} />
                                            <p>Running Gemini AI Video Assessment on "{selectedVideoForAudit?.title}"…</p>
                                        </div>
                                    ) : videoAuditResult ? (
                                        <div key={videoAuditResult.videoId || videoAuditResult.title} className="cd-audit-content">
                                            <div className="cd-audit-header">
                                                <div>
                                                    <span className="cd-audit-verdict">{videoAuditResult.verdict}</span>
                                                    <h3>{videoAuditResult.title}</h3>
                                                </div>
                                                <div className="cd-audit-score-badge">
                                                    <span>{videoAuditResult.overallScore}</span>
                                                    <small>/100</small>
                                                </div>
                                            </div>

                                            <p className="cd-audit-summary">{videoAuditResult.summary}</p>

                                            {/* 4 Pillar Scores */}
                                            <div className="cd-audit-pillars">
                                                <div className="cd-audit-pillar">
                                                    <span>Opening 3s Hook</span>
                                                    <strong>{videoAuditResult.pillars?.hookScore}/100</strong>
                                                </div>
                                                <div className="cd-audit-pillar">
                                                    <span>Title & CTR Packaging</span>
                                                    <strong>{videoAuditResult.pillars?.packagingScore}/100</strong>
                                                </div>
                                                <div className="cd-audit-pillar">
                                                    <span>Pacing & Retention</span>
                                                    <strong>{videoAuditResult.pillars?.pacingScore}/100</strong>
                                                </div>
                                                <div className="cd-audit-pillar">
                                                    <span>Viral Shareability</span>
                                                    <strong>{videoAuditResult.pillars?.viralityScore}/100</strong>
                                                </div>
                                            </div>

                                            {/* What Worked vs What to Fix */}
                                            <div className="cd-audit-columns">
                                                <div className="cd-audit-col">
                                                    <h4>What Worked</h4>
                                                    <ul>
                                                        {(videoAuditResult.whatWorked || []).map((pt, i) => (
                                                            <li key={i}>
                                                                <IconCheck size={14} color="#10b981" />
                                                                <span>{pt}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="cd-audit-col">
                                                    <h4>Fixes to Boost Reach</h4>
                                                    <ul>
                                                        {(videoAuditResult.whatToImprove || []).map((pt, i) => (
                                                            <li key={i}>
                                                                <IconBolt size={14} color="#f59e0b" />
                                                                <span>{pt}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* AI High-CTR Title Rewrites */}
                                            <div className="cd-audit-rewrites">
                                                <h4>AI High-CTR Title Alternatives (Click to Copy)</h4>
                                                <div className="cd-audit-rewrites__list">
                                                    {(videoAuditResult.titleRewrites || []).map((t, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            className="cd-rewrite-btn"
                                                            onClick={() => handleCopyText(t, `title-${idx}`)}
                                                        >
                                                            <span>{t}</span>
                                                            <span className="cd-rewrite-btn__action">
                                                                {copiedText === `title-${idx}` ? 'Copied!' : 'Copy Title'}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* AI 4-Line Hook Rewrite */}
                                            {videoAuditResult.hookRewrite && (
                                                <div className="cd-audit-hook-box">
                                                    <div className="cd-audit-hook-box__top">
                                                        <h4>Suggested 3-Second Viral Caption Hook</h4>
                                                        <button
                                                            type="button"
                                                            className="cd-studio-jump-btn"
                                                            onClick={() =>
                                                                handleSendIdeaToStudio({
                                                                    title: videoAuditResult.title,
                                                                    hook: videoAuditResult.hookRewrite,
                                                                    category: 'Entertainment',
                                                                })
                                                            }
                                                        >
                                                            <IconScissors size={14} /> Open in Video Studio
                                                        </button>
                                                    </div>
                                                    <p className="cd-audit-hook-text">{videoAuditResult.hookRewrite}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </section>

                        {/* Section 5: "What to Post Next" AI Video Idea & Script Hook Generator */}
                        <section className="channel-dashboard__ideas-section" aria-label="Next Video Ideas">
                            <div className="cd-section-heading">
                                <span className="cd-section-tag">
                                    <IconFlame size={14} /> Next Viral Hit Generator
                                </span>
                                <h2>What to Post Next (Tailored to Your Channel)</h2>
                                <p>AI-generated Short concepts combining your highest-converting outlier patterns with trending formats.</p>
                            </div>

                            <div className="cd-ideas-grid">
                                {(aiAssessment.nextVideoIdeas || []).map((idea) => (
                                    <div key={idea.id || idea.title} className="cd-idea-card">
                                        <div className="cd-idea-card__top">
                                            <span className="cd-idea-card__cat">{idea.category || 'Viral Short'}</span>
                                            <span className="cd-idea-card__mult">
                                                Predicted: {idea.predictedMultiplier || '2.5x+'}
                                            </span>
                                        </div>
                                        <h3>{idea.title}</h3>
                                        <p className="cd-idea-card__concept">{idea.concept}</p>
                                        <div className="cd-idea-card__hook">
                                            <small>Opening 4-Line Caption Hook:</small>
                                            <p>{idea.hook}</p>
                                        </div>
                                        <div className="cd-idea-card__footer">
                                            <span>Target Length: {idea.durationSeconds || 35}s</span>
                                            <button
                                                type="button"
                                                className="cd-studio-jump-btn"
                                                onClick={() => handleSendIdeaToStudio(idea)}
                                            >
                                                <IconScissors size={14} /> Create in Video Studio
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}

