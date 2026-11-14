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
    const [leftBottomTab, setLeftBottomTab] = useState('outliers'); // 'outliers' | 'pillars' | 'schedule'

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
        const formatted =
            trimmed.startsWith('@') || trimmed.startsWith('http') || trimmed.startsWith('UC')
                ? trimmed
                : `@${trimmed}`;
        setHandleInput(formatted);
        setLinkedHandle(formatted);
        try {
            localStorage.setItem(STORAGE_CHANNEL_KEY, formatted);
        } catch {
            // ignore
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
        setTimeout(() => setCopiedText(''), 2000);
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
        const width = 560;
        const height = 148;
        const padLeft = 14;
        const padRight = 14;
        const padTop = 14;
        const padBottom = 18;
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
    const circumference = 2 * Math.PI * 24;
    const strokeDashoffset = circumference - (healthScore / 100) * circumference;

    const actionList = aiAssessment.actionPlan || [];
    const completedCount = actionList.filter((a) => completedActions[a.id]).length;

    // Sanitize verdict badge so a long sentence from AI never stretches into a giant circle
    const rawVerdict = videoAuditResult?.verdict || '';
    const displayVerdictBadge =
        rawVerdict.length > 52 ? 'AI Packaging & Retention Audit' : rawVerdict;
    const displayAuditSummary =
        rawVerdict.length > 52 && (!videoAuditResult?.summary || videoAuditResult.summary === rawVerdict)
            ? rawVerdict
            : videoAuditResult?.summary || rawVerdict;

    return (
        <div className="channel-dashboard">
            {/* Top Laser Sweep Bar */}
            <div key={linkedHandle} className="channel-dashboard__laser" aria-hidden="true" />

            {/* Top Command Bar: Identity + KPIs + Properly Fitted Channel Linker */}
            <header className="cd-topbar">
                {/* Left: Channel Identity + Health Ring */}
                <div className="cd-topbar__identity">
                    {status === 'success' ? (
                        <>
                            <img
                                src={channel.avatarUrl}
                                alt={channel.name}
                                className="cd-topbar__avatar"
                            />
                            <div className="cd-topbar__meta">
                                <div className="cd-topbar__title-row">
                                    <h1>{channel.name}</h1>
                                    <span className="cd-topbar__handle">{channel.handle}</span>
                                    <span className={`cd-topbar__mode ${channel.isLive ? 'live' : ''}`}>
                                        {channel.isLive ? 'Live API' : 'Simulated'}
                                    </span>
                                </div>
                                <p className="cd-topbar__sub">YouTube Performance & AI Growth Command Center</p>
                            </div>

                            {/* Compact Health Ring */}
                            <div
                                className="cd-topbar__health"
                                aria-label={`Channel Health Score ${healthScore} out of 100`}
                            >
                                <div className="cd-topbar__ring">
                                    <svg width="58" height="58" viewBox="0 0 58 58">
                                        <circle
                                            cx="29"
                                            cy="29"
                                            r="24"
                                            fill="none"
                                            stroke="rgba(148, 163, 184, 0.2)"
                                            strokeWidth="5"
                                        />
                                        <circle
                                            cx="29"
                                            cy="29"
                                            r="24"
                                            fill="none"
                                            stroke="url(#cdMiniRingGrad)"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            transform="rotate(-90 29 29)"
                                        />
                                        <defs>
                                            <linearGradient id="cdMiniRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#10b981" />
                                                <stop offset="50%" stopColor="#6c63ff" />
                                                <stop offset="100%" stopColor="#ec4899" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <span className="cd-topbar__ring-val">{healthScore}</span>
                                </div>
                                <div className="cd-topbar__health-meta">
                                    <strong>Grade {aiAssessment.grade || 'A'}</strong>
                                    <span>AI Health</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="cd-topbar__meta">
                            <h1>YouTube Channel Analytics</h1>
                            <p className="cd-topbar__sub">Loading channel intelligence…</p>
                        </div>
                    )}
                </div>

                {/* Center: 4 Compact KPI Strip Cards */}
                {status === 'success' && (
                    <div className="cd-topbar__kpis" aria-label="Key Performance Indicators">
                        <div className="cd-mini-kpi">
                            <div className="cd-mini-kpi__head">
                                <span>Subscribers</span>
                                <IconUsers size={14} />
                            </div>
                            <div className="cd-mini-kpi__val">{formatCount(channel.subscriberCount) || '0'}</div>
                            <div className="cd-mini-kpi__foot positive">
                                {kpis.subsGrowth30dPct || '+18.6%'} · Goal {formatCount(milestone.nextSubMilestone)}
                            </div>
                        </div>

                        <div className="cd-mini-kpi">
                            <div className="cd-mini-kpi__head">
                                <span>Total Views</span>
                                <IconEye size={14} />
                            </div>
                            <div className="cd-mini-kpi__val">{formatCount(channel.totalViews) || '0'}</div>
                            <div className="cd-mini-kpi__foot positive">
                                {kpis.viewsGrowth30dPct || '+31.4%'} velocity
                            </div>
                        </div>

                        <div className="cd-mini-kpi">
                            <div className="cd-mini-kpi__head">
                                <span>Avg Views/Vid</span>
                                <IconFlame size={14} />
                            </div>
                            <div className="cd-mini-kpi__val">{formatCount(kpis.avgViewsPerVideo) || '0'}</div>
                            <div className="cd-mini-kpi__foot outlier">
                                Top Hit: {kpis.topOutlierMultiplier || '3.1x'}
                            </div>
                        </div>

                        <div className="cd-mini-kpi">
                            <div className="cd-mini-kpi__head">
                                <span>Engagement</span>
                                <IconAward size={14} />
                            </div>
                            <div className="cd-mini-kpi__val">{kpis.engagementRate}%</div>
                            <div className="cd-mini-kpi__foot positive">
                                Shorts: {kpis.shortsRatio}%
                            </div>
                        </div>
                    </div>
                )}

                {/* Right: Unified Channel Linker Pill (Button Snugly Fitted Inside Background) */}
                <div className="cd-topbar__linker">
                    <form onSubmit={handleLinkChannelSubmit} className="cd-linker-pill">
                        <IconYouTube size={16} />
                        <input
                            id="yt-channel-handle-input"
                            type="text"
                            value={handleInput}
                            onChange={(e) => setHandleInput(e.target.value)}
                            placeholder="@YourChannel or URL"
                            aria-label="Linked YouTube Account (@handle or URL)"
                            className="cd-linker-pill__input"
                        />
                        <button type="submit" className="cd-linker-pill__btn">
                            <IconBolt size={13} />
                            <span>Analyze Channel</span>
                        </button>
                    </form>
                    <div className="cd-linker-presets">
                        {PRESET_CHANNELS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                className={`cd-preset-chip ${
                                    linkedHandle.toLowerCase() === preset.toLowerCase() ? 'active' : ''
                                }`}
                                onClick={() => handleSelectPresetChannel(preset)}
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Full-Screen Single-Viewport Bento Workspace (No Page Scroll) */}
            <div className="cd-workspace">
                {status === 'loading' && (
                    <div className="cd-workspace__state" role="status">
                        <IconRefresh size={28} spinning={true} />
                        <span>Loading YouTube Channel Intelligence…</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="cd-workspace__state" role="alert">
                        <IconAlert size={32} color="#ef4444" />
                        <h3>Could not load channel analytics</h3>
                        <p>{errorMsg}</p>
                        <button
                            type="button"
                            className="cd-linker-pill__btn"
                            onClick={() => setLinkedHandle(linkedHandle)}
                        >
                            <IconRefresh size={14} /> Retry
                        </button>
                    </div>
                )}

                {status === 'success' && (
                    <div className="cd-bento-grid">
                        {/* COLUMN 1: Performance Charts, Outlier Detector & 5-Pillar Scorecard */}
                        <section className="cd-panel cd-panel--charts" aria-label="Performance Charts">
                            <div className="cd-panel__header">
                                <div className="cd-panel__title-group">
                                    <IconChart size={16} />
                                    <h3>Performance Trajectory</h3>
                                </div>
                                <div className="cd-panel__controls">
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
                                            Subs
                                        </button>
                                        <button
                                            type="button"
                                            className={`cd-pill-btn ${chartMetric === 'watchHours' ? 'active' : ''}`}
                                            onClick={() => setChartMetric('watchHours')}
                                        >
                                            Hours
                                        </button>
                                    </div>
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
                                    viewBox="0 0 560 148"
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

                                    {[0.25, 0.5, 0.75].map((ratio, idx) => (
                                        <line
                                            key={idx}
                                            x1="14"
                                            x2="546"
                                            y1={14 + ratio * 116}
                                            y2={14 + ratio * 116}
                                            stroke="rgba(148, 163, 184, 0.14)"
                                            strokeDasharray="4 4"
                                        />
                                    ))}

                                    {svgChartGeometry.areaPath && (
                                        <path d={svgChartGeometry.areaPath} fill="url(#cdAreaGrad)" />
                                    )}

                                    {svgChartGeometry.linePath && (
                                        <path
                                            d={svgChartGeometry.linePath}
                                            fill="none"
                                            stroke="url(#cdLineGrad)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    )}

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
                                                    r={isHovered ? 6 : 3.5}
                                                    fill={isHovered ? '#ec4899' : '#6c63ff'}
                                                    stroke="#ffffff"
                                                    strokeWidth="1.5"
                                                />
                                                <rect
                                                    x={pt.x - 10}
                                                    y="0"
                                                    width="20"
                                                    height="148"
                                                    fill="transparent"
                                                />
                                            </g>
                                        );
                                    })}
                                </svg>

                                <div className="cd-chart-readout">
                                    {hoveredPointIdx !== null && svgChartGeometry.points[hoveredPointIdx] ? (
                                        <>
                                            <strong>{svgChartGeometry.points[hoveredPointIdx].raw.label}</strong>
                                            <span>
                                                Views: <strong>{svgChartGeometry.points[hoveredPointIdx].raw.views.toLocaleString()}</strong>
                                            </span>
                                            <span>
                                                Subs: <strong>+{svgChartGeometry.points[hoveredPointIdx].raw.subscribersGained.toLocaleString()}</strong>
                                            </span>
                                            <span>
                                                Eng: <strong>{svgChartGeometry.points[hoveredPointIdx].raw.engagementRate}%</strong>
                                            </span>
                                        </>
                                    ) : (
                                        <span>Hover graph points to inspect daily views & subscriber velocity</span>
                                    )}
                                </div>
                            </div>

                            {/* Sub-panel Switcher: Outlier Multipliers | 5-Pillar Health | Best Times */}
                            <div className="cd-subtabs">
                                <button
                                    type="button"
                                    className={`cd-subtab-btn ${leftBottomTab === 'outliers' ? 'active' : ''}`}
                                    onClick={() => setLeftBottomTab('outliers')}
                                >
                                    Outlier Multipliers
                                </button>
                                <button
                                    type="button"
                                    className={`cd-subtab-btn ${leftBottomTab === 'pillars' ? 'active' : ''}`}
                                    onClick={() => setLeftBottomTab('pillars')}
                                >
                                    5-Pillar Health
                                </button>
                                <button
                                    type="button"
                                    className={`cd-subtab-btn ${leftBottomTab === 'schedule' ? 'active' : ''}`}
                                    onClick={() => setLeftBottomTab('schedule')}
                                >
                                    Best Post Times
                                </button>
                            </div>

                            <div className="cd-panel__scroll-area">
                                {leftBottomTab === 'outliers' && (
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
                                )}

                                {leftBottomTab === 'pillars' && (
                                    <div className="cd-pillars-list">
                                        {[
                                            { label: '3s Hook Retention', val: aiAssessment.pillars?.hookRetention || 86, color: '#10b981' },
                                            { label: 'Title & Thumbnail CTR', val: aiAssessment.pillars?.ctrPackaging || 82, color: '#6c63ff' },
                                            { label: 'Upload Consistency', val: aiAssessment.pillars?.consistency || 80, color: '#38bdf8' },
                                            { label: 'Comment & Like Velocity', val: aiAssessment.pillars?.engagement || 88, color: '#ec4899' },
                                            { label: 'Shorts Loop Conversion', val: aiAssessment.pillars?.shortsVelocity || 85, color: '#f59e0b' },
                                        ].map((pillar) => (
                                            <div key={pillar.label} className="cd-pillar-item">
                                                <div className="cd-pillar-item__top">
                                                    <span>{pillar.label}</span>
                                                    <strong>{pillar.val}/100</strong>
                                                </div>
                                                <div className="cd-pillar-item__bar">
                                                    <div
                                                        className="cd-pillar-item__fill"
                                                        style={{ width: `${pillar.val}%`, background: pillar.color }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {leftBottomTab === 'schedule' && (
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
                                )}
                            </div>
                        </section>

                        {/* COLUMN 2: Deep-Dive AI Video Auditor & CTR Title Optimizer */}
                        <section className="cd-panel cd-panel--auditor" aria-label="AI Video Assessment">
                            <div className="cd-panel__header">
                                <div className="cd-panel__title-group">
                                    <IconYouTube size={16} />
                                    <h2>AI Video Assessment & CTR Optimizer</h2>
                                </div>
                                <span className="cd-panel__hint">Click any video to audit</span>
                            </div>

                            {/* Compact Horizontal / Scrollable Video Selector Strip */}
                            <div className="cd-video-selector-strip">
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
                                                <h4 title={v.title}>{v.title}</h4>
                                                <div className="cd-video-item__stats">
                                                    <span>{formatCount(v.viewCount)} views</span>
                                                    <span>·</span>
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

                            {/* Active Video AI Audit Detail Box */}
                            <div className="cd-audit-detail-card">
                                {isAuditingVideo ? (
                                    <div className="cd-audit-loading" role="status">
                                        <IconRefresh size={22} spinning={true} />
                                        <p>Auditing "{selectedVideoForAudit?.title}"…</p>
                                    </div>
                                ) : videoAuditResult ? (
                                    <div key={videoAuditResult.videoId || videoAuditResult.title} className="cd-audit-content">
                                        <div className="cd-audit-header">
                                            <div className="cd-audit-header__left">
                                                <span className="cd-audit-verdict">{displayVerdictBadge}</span>
                                                <h3 title={videoAuditResult.title}>{videoAuditResult.title}</h3>
                                            </div>
                                            <div className="cd-audit-score-badge">
                                                <span>{videoAuditResult.overallScore}</span>
                                                <small>/100</small>
                                            </div>
                                        </div>

                                        <p className="cd-audit-summary">{displayAuditSummary}</p>

                                        {/* 4 Pillar Scores */}
                                        <div className="cd-audit-pillars">
                                            <div className="cd-audit-pillar">
                                                <span>3s Hook</span>
                                                <strong>{videoAuditResult.pillars?.hookScore}/100</strong>
                                            </div>
                                            <div className="cd-audit-pillar">
                                                <span>CTR Title</span>
                                                <strong>{videoAuditResult.pillars?.packagingScore}/100</strong>
                                            </div>
                                            <div className="cd-audit-pillar">
                                                <span>Retention</span>
                                                <strong>{videoAuditResult.pillars?.pacingScore}/100</strong>
                                            </div>
                                            <div className="cd-audit-pillar">
                                                <span>Virality</span>
                                                <strong>{videoAuditResult.pillars?.viralityScore}/100</strong>
                                            </div>
                                        </div>

                                        {/* What Worked vs What to Fix */}
                                        <div className="cd-audit-columns">
                                            <div className="cd-audit-col">
                                                <h4>What Worked</h4>
                                                <ul>
                                                    {(videoAuditResult.whatWorked || []).slice(0, 2).map((pt, i) => (
                                                        <li key={i}>
                                                            <IconCheck size={13} color="#10b981" />
                                                            <span>{pt}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="cd-audit-col">
                                                <h4>Fixes to Boost Reach</h4>
                                                <ul>
                                                    {(videoAuditResult.whatToImprove || []).slice(0, 2).map((pt, i) => (
                                                        <li key={i}>
                                                            <IconBolt size={13} color="#f59e0b" />
                                                            <span>{pt}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* AI High-CTR Title Rewrites */}
                                        <div className="cd-audit-rewrites">
                                            <div className="cd-audit-rewrites__top">
                                                <h4>AI High-CTR Title Rewrites (Click to Copy)</h4>
                                                {videoAuditResult.hookRewrite && (
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
                                                        <IconScissors size={12} /> Open in Studio
                                                    </button>
                                                )}
                                            </div>
                                            <div className="cd-audit-rewrites__list">
                                                {(videoAuditResult.titleRewrites || []).slice(0, 3).map((t, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        className="cd-rewrite-btn"
                                                        onClick={() => handleCopyText(t, `title-${idx}`)}
                                                    >
                                                        <span className="cd-rewrite-btn__text">{t}</span>
                                                        <span className="cd-rewrite-btn__action">
                                                            {copiedText === `title-${idx}` ? 'Copied!' : 'Copy'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </section>

                        {/* COLUMN 3: AI Growth Coach Checklist & What to Post Next */}
                        <section className="cd-panel cd-panel--coach" aria-label="AI Channel Feedback and Growth Plan">
                            <div className="cd-panel__header">
                                <div className="cd-panel__title-group">
                                    <IconSparkles size={16} />
                                    <h2>How to Make Your YouTube Account Better</h2>
                                </div>
                                <button
                                    type="button"
                                    className="cd-coach-refresh-btn"
                                    onClick={handleRefreshCoach}
                                    disabled={isRefreshingCoach}
                                    title="Refresh AI Channel Coach"
                                >
                                    <IconRefresh size={13} spinning={isRefreshingCoach} />
                                    <span>{isRefreshingCoach ? 'Analyzing…' : 'Refresh AI'}</span>
                                </button>
                            </div>

                            <div className="cd-panel__scroll-area">
                                <p className="cd-coach-summary">{aiAssessment.executiveSummary}</p>

                                {/* Compact Strengths & Bottlenecks */}
                                <div className="cd-diagnosis-compact">
                                    <div className="cd-diagnosis-pill cd-diagnosis-pill--good">
                                        <IconCheck size={13} color="#10b981" />
                                        <span>{(aiAssessment.strengths || [])[0]}</span>
                                    </div>
                                    <div className="cd-diagnosis-pill cd-diagnosis-pill--warn">
                                        <IconAlert size={13} color="#f59e0b" />
                                        <span>{(aiAssessment.bottlenecks || [])[0]}</span>
                                    </div>
                                </div>

                                {/* Interactive Optimization Checklist */}
                                <div className="cd-action-plan">
                                    <div className="cd-action-plan__header">
                                        <h3>Actionable Optimization Checklist</h3>
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
                                                        {isDone && <IconCheck size={12} color="#ffffff" />}
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

                                {/* What to Post Next Ideas */}
                                <div className="cd-ideas-compact">
                                    <div className="cd-ideas-compact__header">
                                        <IconFlame size={14} />
                                        <h3>What to Post Next (AI Short Concepts)</h3>
                                    </div>
                                    <div className="cd-ideas-compact__list">
                                        {(aiAssessment.nextVideoIdeas || []).map((idea) => (
                                            <div key={idea.id || idea.title} className="cd-idea-card">
                                                <div className="cd-idea-card__top">
                                                    <h3>{idea.title}</h3>
                                                    <span className="cd-idea-card__mult">
                                                        {idea.predictedMultiplier || '2.5x+'}
                                                    </span>
                                                </div>
                                                <p className="cd-idea-card__concept">{idea.concept}</p>
                                                <div className="cd-idea-card__footer">
                                                    <span>{idea.durationSeconds || 35}s Short</span>
                                                    <button
                                                        type="button"
                                                        className="cd-studio-jump-btn"
                                                        onClick={() => handleSendIdeaToStudio(idea)}
                                                    >
                                                        <IconScissors size={12} /> Create in Studio
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
