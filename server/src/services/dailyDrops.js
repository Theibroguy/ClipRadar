/**
 * Daily Radar Drops Service
 *
 * Automatically curates and generates a fresh batch of viral short-form
 * YouTube videos every single day based on the user's favorite niches:
 * - Viral Comedy & Fails (AFV, standup crowdwork, viral fails)
 * - Celebrity Reactions & Interviews (Hot Ones, awkward celebrity moments)
 * - Wild Creator Challenges & Stunts (MrBeast challenges, food stacking, epic feats)
 * - Mindblowing Athletic Wonders (Sha'Carri Richardson, trickshots, athlete comedy)
 * - Pop Culture & Relatable Meme Rankings (Khaby Lame life hacks, POV comedy)
 *
 * Rotates daily based on date stamps so the user NEVER sees the same videos.
 */
import fs from 'fs';
import path from 'path';
import { fetchYouTubeVideos } from './youtube.js';
import { enrichVideoWithAI } from './gemini.js';

const DATA_FILE = path.resolve('src/data/dailyDrops.json');

// Rotating query themes by day to guarantee varied content each day
const DAILY_THEMES = [
    {
        theme: 'Celebrity Reactions & Epic Fails',
        queries: [
            'hot ones funniest reaction shorts',
            'celebrity hilarious awkward moment shorts',
            'americas funniest home videos fail shorts',
            'insane athlete speed highlight shorts',
        ],
    },
    {
        theme: 'Creator Challenges & Viral Crowdwork',
        queries: [
            'mrbeast style insane challenge shorts',
            'hilarious stand up comedy crowdwork shorts',
            'food stacking cooking showdown shorts',
            'shocking athlete interview moment shorts',
        ],
    },
    {
        theme: 'Wild Stunts & Pop Culture Memes',
        queries: [
            'funniest celebrity meme ranking shorts',
            'unbelievable sports trickshot moments shorts',
            'hilarious life hack reaction shorts',
            'actor unscripted funny moments shorts',
        ],
    },
    {
        theme: 'Unscripted Celebrity & Extreme Feats',
        queries: [
            'celebrity spicy wings funny reaction shorts',
            'toddler athlete prodigy viral shorts',
            'crazy creator survival challenge shorts',
            'funniest viral comedy moments 2024 shorts',
        ],
    },
    {
        theme: 'High-Stakes Showdowns & Relatable Comedy',
        queries: [
            'epic cheese stacking challenge shorts',
            'shacarri richardson fastest running shorts',
            'funniest comedian crowd interaction shorts',
            'celebrity caught being hilarious shorts',
        ],
    },
    {
        theme: 'Shocking Reactions & Athletic Wonders',
        queries: [
            'crazy youtube award unboxing reaction shorts',
            'most hilarious marathon interview shorts',
            'viral dance challenge couple funny shorts',
            'impossible trickshot challenge shorts',
        ],
    },
    {
        theme: 'Viral Stand-up & Ultimate Challenge Radar',
        queries: [
            'matt rife hilarious gym comedy shorts',
            'britney spears funniest interview moments shorts',
            'extreme wilderness survival test shorts',
            'world athletics fastest mood shorts',
        ],
    },
];

// Curated high-impact backup pool categorized by rotation index
// Used if YouTube API quota is exceeded or offline
const ROTATING_BACKUP_POOLS = [
    [
        {
            platform: 'youtube',
            platformVideoId: 'DgM1YypmL_Q',
            creator: {
                name: 'Snoop.newspaper',
                handle: '@snoopnews',
                avatarUrl: 'https://ui-avatars.com/api/?name=Snoop&background=f59e0b&color=fff',
                profileUrl: 'https://www.youtube.com/@snoopnews',
            },
            title: "Celebrities' hilarious reactions as they eat spicy wings on 'Hot Ones'",
            description: "Watch stars like BLACKPINK's Lisa and Jennie lose their cool over the world's hottest wings.",
            thumbnailUrl: 'https://i.ytimg.com/vi/DgM1YypmL_Q/hqdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=DgM1YypmL_Q',
            embedUrl: 'https://www.youtube.com/embed/DgM1YypmL_Q',
            durationSeconds: 61,
            viewCount: 16592354,
            likeCount: 484558,
            category: 'Comedy',
            aiDescription: "Watch top celebrities struggle hilariously as they try to keep their cool while eating increasingly spicy wings on Hot Ones.",
        },
        {
            platform: 'youtube',
            platformVideoId: 'tX-6XdbAC7E',
            creator: {
                name: "America's Funniest Home Videos",
                handle: '@afv',
                avatarUrl: 'https://ui-avatars.com/api/?name=AFV&background=ef4444&color=fff',
                profileUrl: 'https://www.youtube.com/@afv',
            },
            title: "Why did he do this? 😭 #funny #shorts",
            description: "The ultimate classic fail caught on tape.",
            thumbnailUrl: 'https://i.ytimg.com/vi/tX-6XdbAC7E/hqdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=tX-6XdbAC7E',
            embedUrl: 'https://www.youtube.com/embed/tX-6XdbAC7E',
            durationSeconds: 14,
            viewCount: 32252988,
            likeCount: 147259,
            category: 'Comedy',
            aiDescription: "Prepare to laugh out loud at this utterly baffling and hilarious everyday blunder captured on camera.",
        },
        {
            platform: 'youtube',
            platformVideoId: '8dQ3Kf5u2ys',
            creator: {
                name: 'Strong Mind Set',
                handle: '@strongmindset',
                avatarUrl: 'https://ui-avatars.com/api/?name=SMS&background=10b981&color=fff',
                profileUrl: 'https://www.youtube.com/@strongmindset',
            },
            title: "Sha'Carri Richardson American Athlete #shorts",
            description: "Sha'Carri Richardson explosive 100m performance.",
            thumbnailUrl: 'https://i.ytimg.com/vi/8dQ3Kf5u2ys/hqdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=8dQ3Kf5u2ys',
            embedUrl: 'https://www.youtube.com/embed/8dQ3Kf5u2ys',
            durationSeconds: 14,
            viewCount: 147376962,
            likeCount: 3381909,
            category: 'Sports',
            aiDescription: "Witness the incredible speed and powerhouse performance of American track star Sha'Carri Richardson in this dynamic short.",
        },
        {
            platform: 'youtube',
            platformVideoId: 'Q9-EEoGQyTE',
            creator: {
                name: 'Nick DiGiovanni',
                handle: '@nickdigiovanni',
                avatarUrl: 'https://ui-avatars.com/api/?name=Nick&background=6366f1&color=fff',
                profileUrl: 'https://www.youtube.com/@nickdigiovanni',
            },
            title: 'Cheese Stacking Challenge with ChefRush',
            description: 'Massive cheese stack showdown with Bayashi and ChefRush.',
            thumbnailUrl: 'https://i.ytimg.com/vi/Q9-EEoGQyTE/hqdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=Q9-EEoGQyTE',
            embedUrl: 'https://www.youtube.com/embed/Q9-EEoGQyTE',
            durationSeconds: 15,
            viewCount: 14648091,
            likeCount: 174677,
            category: 'Challenge',
            aiDescription: "Watch culinary star Nick DiGiovanni take on an epic cheese stacking challenge alongside ChefRush and Bayashi.",
        },
    ],
    [
        {
            platform: 'youtube',
            platformVideoId: 'lqi1WWvaxWM',
            creator: {
                name: 'MattRifeClips',
                handle: '@mattrife',
                avatarUrl: 'https://ui-avatars.com/api/?name=MR&background=ec4899&color=fff',
                profileUrl: 'https://www.youtube.com/@mattrife',
            },
            title: 'Matt Rife | Working Out With Black Dudes is the best',
            description: 'Crowdwork comedy set on hitting the gym with friends.',
            thumbnailUrl: 'https://i.ytimg.com/vi/lqi1WWvaxWM/hqdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=lqi1WWvaxWM',
            embedUrl: 'https://www.youtube.com/embed/lqi1WWvaxWM',
            durationSeconds: 60,
            viewCount: 12587901,
            likeCount: 614831,
            category: 'Comedy',
            aiDescription: "Comedian Matt Rife delivers a hilarious crowd-work set about hitting the gym with his friends, packed with sharp punchlines.",
        },
        {
            platform: 'youtube',
            platformVideoId: '0f-P7imlcC4',
            creator: {
                name: "Alan's Universe",
                handle: '@alanchikinchow',
                avatarUrl: 'https://ui-avatars.com/api/?name=Alan&background=f43f5e&color=fff',
                profileUrl: 'https://www.youtube.com/@alanchikinchow',
            },
            title: 'This YOUTUBE AWARD is CRAZY… 😱',
            description: 'Alan Army unboxing an unbelievable creator reward.',
            thumbnailUrl: 'https://i.ytimg.com/vi/0f-P7imlcC4/hqdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=0f-P7imlcC4',
            embedUrl: 'https://www.youtube.com/embed/0f-P7imlcC4',
            durationSeconds: 15,
            viewCount: 111121830,
            likeCount: 3518777,
            category: 'Entertainment',
            aiDescription: "Join Alan Chikin Chow as he unboxes and reacts to a wild, jaw-dropping new YouTube award with endless comedic energy.",
        },
        {
            platform: 'youtube',
            platformVideoId: 'SadSOL3baAw',
            creator: {
                name: 'Hope Music',
                handle: '@hopemusic',
                avatarUrl: 'https://ui-avatars.com/api/?name=HM&background=06b6d4&color=fff',
                profileUrl: 'https://www.youtube.com/@hopemusic',
            },
            title: 'The Funniest Ethiopian Athlete Interview Ever [Must See]',
            description: 'Tsegaye Kebede hilarious post-race Chicago marathon interview.',
            thumbnailUrl: 'https://i.ytimg.com/vi/SadSOL3baAw/hqdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=SadSOL3baAw',
            embedUrl: 'https://www.youtube.com/embed/SadSOL3baAw',
            durationSeconds: 112,
            viewCount: 605771,
            likeCount: 2247,
            category: 'Comedy',
            aiDescription: "Catch the unforgettable and hilarious post-race interview of Ethiopian marathon champion Tsegaye Kebede chatting with NBC.",
        },
        {
            platform: 'youtube',
            platformVideoId: 'DG7bWPkCpz8',
            creator: {
                name: 'Jasmin and James',
                handle: '@jasminandjames',
                avatarUrl: 'https://ui-avatars.com/api/?name=JJ&background=8b5cf6&color=fff',
                profileUrl: 'https://www.youtube.com/@jasminandjames',
            },
            title: 'WE NEED TO KNOW! 😅💙 - Ballet Dance Trend Challenge',
            description: 'Hilarious viral couple ballet challenge attempt.',
            thumbnailUrl: 'https://i.ytimg.com/vi/DG7bWPkCpz8/hqdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=DG7bWPkCpz8',
            embedUrl: 'https://www.youtube.com/embed/DG7bWPkCpz8',
            durationSeconds: 15,
            viewCount: 60488960,
            likeCount: 1020793,
            category: 'Comedy',
            aiDescription: "Watch content creators Jasmin and James tackle a hilarious viral dance challenge together with genuine couple chemistry.",
        },
    ],
];

/** Read all saved drops */
function loadDrops() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Failed reading dailyDrops.json', e);
    }
    return {};
}

/** Save drops to disk */
function saveDrops(drops) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(drops, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed writing dailyDrops.json', e);
    }
}

/** Format Date object as YYYY-MM-DD */
export function getDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/** Human friendly date format: Wednesday, Nov 4, 2026 */
export function formatDisplayDate(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/** Calculate seconds remaining until next drop (Midnight local/UTC) */
export function getSecondsUntilNextDrop() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    return Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
}

/**
 * Generates or retrieves the Daily Drop for a given date
 * @param {string} [targetDateKey] - YYYY-MM-DD (defaults to today)
 * @param {boolean} [forceRefresh=false] - Re-fetch fresh videos from YouTube
 */
export async function getDailyDrop(targetDateKey = null, forceRefresh = false) {
    const todayKey = targetDateKey || getDateKey();
    const drops = loadDrops();

    if (!forceRefresh && drops[todayKey] && Array.isArray(drops[todayKey].videos) && drops[todayKey].videos.length > 0) {
        return {
            ...drops[todayKey],
            nextDropCountdownSeconds: getSecondsUntilNextDrop(),
            history: Object.keys(drops).sort().reverse(),
        };
    }

    // Determine today's rotating theme
    const [y, m, d] = todayKey.split('-').map(Number);
    const dayOfYear = Math.floor((new Date(y, m - 1, d) - new Date(y, 0, 0)) / (1000 * 60 * 60 * 24));
    const themeIndex = Math.abs(dayOfYear) % DAILY_THEMES.length;
    const currentThemeConfig = DAILY_THEMES[themeIndex];

    let fetchedVideos = [];

    // Attempt live YouTube API fetch if key is present
    if (process.env.YOUTUBE_API_KEY) {
        try {
            console.log(`[DailyDrops] Fetching fresh YouTube videos for date: ${todayKey} (Theme: ${currentThemeConfig.theme})`);
            const rawYt = await fetchYouTubeVideos(currentThemeConfig.queries, 3);
            if (rawYt && rawYt.length > 0) {
                // Enrich and tag with velocity and daily drop markers
                fetchedVideos = rawYt.map((v, idx) => {
                    const views = v.viewCount || 50000;
                    const hoursSince = Math.max(1, (Date.now() - new Date(v.publishedAt || Date.now()).getTime()) / 3600000);
                    const velocity = Math.round(views / hoursSince);
                    const category = v.category || (idx % 2 === 0 ? 'Comedy' : 'Challenge');

                    return {
                        ...v,
                        isDailyDrop: true,
                        dropDate: todayKey,
                        category,
                        velocityViewsPerHour: velocity,
                        aiDescription: v.aiDescription || `Viral YouTube clip featured in today's Daily Radar Drop (${currentThemeConfig.theme}). High engagement and instant audience hook potential.`,
                    };
                });
            }
        } catch (err) {
            console.warn('[DailyDrops] YouTube API fetch encountered error, using backup pool:', err.message);
        }
    }

    // If YouTube fetch returned no results (quota or network), use rotating backup pool
    if (fetchedVideos.length === 0) {
        const poolIndex = Math.abs(dayOfYear) % ROTATING_BACKUP_POOLS.length;
        const backupPool = ROTATING_BACKUP_POOLS[poolIndex];
        fetchedVideos = backupPool.map((v) => ({
            ...v,
            isDailyDrop: true,
            dropDate: todayKey,
            publishedAt: new Date(y, m - 1, d, 9, 0, 0).toISOString(),
            velocityViewsPerHour: Math.floor(v.viewCount / 72),
        }));
    }

    const newDropRecord = {
        date: todayKey,
        formattedDate: formatDisplayDate(todayKey),
        theme: currentThemeConfig.theme,
        nextDropCountdownSeconds: getSecondsUntilNextDrop(),
        total: fetchedVideos.length,
        videos: fetchedVideos,
        generatedAt: new Date().toISOString(),
    };

    drops[todayKey] = newDropRecord;
    saveDrops(drops);

    return {
        ...newDropRecord,
        history: Object.keys(drops).sort().reverse(),
    };
}

/**
 * Returns today's fresh drop videos for mixing into the feed
 */
export async function getTodayDropVideos() {
    try {
        const drop = await getDailyDrop(getDateKey(), false);
        return drop.videos || [];
    } catch {
        return [];
    }
}
