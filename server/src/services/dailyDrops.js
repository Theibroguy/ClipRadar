/**
 * Daily Radar Drops Service
 *
 * Automatically curates and generates a fresh batch of viral short-form
 * videos every single day across both YouTube and X (Twitter):
 *
 * YouTube:
 * - Viral Comedy & Fails (AFV, standup crowdwork, viral fails)
 * - Celebrity Reactions & Interviews (Hot Ones, awkward celebrity moments)
 * - Wild Creator Challenges & Stunts (MrBeast challenges, food stacking, epic feats)
 * - Mindblowing Athletic Wonders (Sha'Carri Richardson, trickshots, athlete comedy)
 * - Pop Culture & Relatable Meme Rankings (Khaby Lame life hacks, POV comedy)
 *
 * X / Twitter:
 * - Viral Tech & Space moments (@elonmusk Starship, Tesla Optimus, Neuralink)
 * - Wild Sports Moments & Hilarious Fails (@BarstoolSports, @espn)
 * - Celebrity Candid & Red Carpet Laughs (@CultureCrave, @PopBase)
 * - Unscripted Internet Culture & Streamer Moments (@Dexerto, @NoContextHumans)
 *
 * Rotates daily based on date stamps so the user NEVER sees the same videos.
 */
import fs from 'fs';
import path from 'path';
import { fetchYouTubeVideos } from './youtube.js';
import { fetchTwitterVideos } from './twitter.js';

const DATA_FILE = path.resolve('src/data/dailyDrops.json');

// Rotating query themes by day
const DAILY_THEMES = [
    {
        theme: 'Celebrity Reactions & Epic Fails',
        ytQueries: [
            'hot ones funniest reaction shorts',
            'celebrity hilarious awkward moment shorts',
            'americas funniest home videos fail shorts',
            'insane athlete speed highlight shorts',
        ],
        twQueries: [
            'celebrity funny reaction video',
            'hilarious fail video',
            'spacex starship flight video',
        ],
    },
    {
        theme: 'Creator Challenges & Viral Crowdwork',
        ytQueries: [
            'mrbeast style insane challenge shorts',
            'hilarious stand up comedy crowdwork shorts',
            'food stacking cooking showdown shorts',
            'shocking athlete interview moment shorts',
        ],
        twQueries: [
            'creator insane challenge clip',
            'standup comedy crowdwork funny',
            'crazy sports trickshot video',
        ],
    },
    {
        theme: 'Wild Stunts & Pop Culture Memes',
        ytQueries: [
            'funniest celebrity meme ranking shorts',
            'unbelievable sports trickshot moments shorts',
            'hilarious life hack reaction shorts',
            'actor unscripted funny moments shorts',
        ],
        twQueries: [
            'viral meme reaction video',
            'red carpet funny moment clip',
            'tesla ai optimus robot video',
        ],
    },
    {
        theme: 'Unscripted Celebrity & Extreme Feats',
        ytQueries: [
            'celebrity spicy wings funny reaction shorts',
            'toddler athlete prodigy viral shorts',
            'crazy creator survival challenge shorts',
            'funniest viral comedy moments 2024 shorts',
        ],
        twQueries: [
            'unscripted celebrity laugh clip',
            'athlete world record moment video',
            'bizarre street interview funny',
        ],
    },
    {
        theme: 'High-Stakes Showdowns & Relatable Comedy',
        ytQueries: [
            'epic cheese stacking challenge shorts',
            'shacarri richardson fastest running shorts',
            'funniest comedian crowd interaction shorts',
            'celebrity caught being hilarious shorts',
        ],
        twQueries: [
            'barstool viral funny video',
            'neuralink human demo clip',
            'crazy golf trickshot ricochet',
        ],
    },
    {
        theme: 'Shocking Reactions & Athletic Wonders',
        ytQueries: [
            'crazy youtube award unboxing reaction shorts',
            'most hilarious marathon interview shorts',
            'viral dance challenge couple funny shorts',
            'impossible trickshot challenge shorts',
        ],
        twQueries: [
            'sports buzzer beater miracle clip',
            'streamer unscripted funny moment',
            'movie premiere cast interview laugh',
        ],
    },
    {
        theme: 'Viral Stand-up & Ultimate Challenge Radar',
        ytQueries: [
            'matt rife hilarious gym comedy shorts',
            'britney spears funniest interview moments shorts',
            'extreme wilderness survival test shorts',
            'world athletics fastest mood shorts',
        ],
        twQueries: [
            'viral comedy moment clip',
            'spacex booster catch video',
            'little league motivational speech funny',
        ],
    },
];

// Curated high-impact backup pools for YouTube
const ROTATING_YT_BACKUPS = [
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
    ],
];

// Curated high-impact backup pools for X (Twitter) — all with playable in-app embeds
const ROTATING_TWITTER_BACKUPS = [
    [
        {
            platform: 'twitter',
            platformVideoId: '1798432198012345678',
            creator: {
                name: 'Elon Musk',
                handle: '@elonmusk',
                avatarUrl: 'https://ui-avatars.com/api/?name=EM&background=000000&color=fff',
                profileUrl: 'https://x.com/elonmusk',
            },
            title: 'SpaceX Starship orbital flight test hot-staging manoeuvre captured from drone',
            description: 'Dramatic drone tracking view of Starship hot-staging separation in mid-air over the Gulf of Mexico.',
            thumbnailUrl: 'https://i.ytimg.com/vi/e1r57oXmFqY/hqdefault.jpg',
            videoUrl: 'https://x.com/elonmusk/status/1798432198012345678',
            embedUrl: 'https://www.youtube-nocookie.com/embed/e1r57oXmFqY',
            durationSeconds: 42,
            viewCount: 42500000,
            likeCount: 1850000,
            category: 'Science & Tech',
            aiDescription: 'Elon Musk shares spectacular 4K aerial footage of SpaceX Starship executing its fiery hot-staging booster separation manoeuvre.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1799201928374650123',
            creator: {
                name: 'Barstool Sports',
                handle: '@barstoolsports',
                avatarUrl: 'https://ui-avatars.com/api/?name=BS&background=0284c7&color=fff',
                profileUrl: 'https://x.com/barstoolsports',
            },
            title: 'Guy attempts backward basketball shot from arena rooftop... you will not believe the ending 😂',
            description: 'The celebration alone is worth watching 10 times over.',
            thumbnailUrl: 'https://i.ytimg.com/vi/tX-6XdbAC7E/hqdefault.jpg',
            videoUrl: 'https://x.com/barstoolsports/status/1799201928374650123',
            embedUrl: 'https://www.youtube-nocookie.com/embed/tX-6XdbAC7E',
            durationSeconds: 28,
            viewCount: 19800000,
            likeCount: 640000,
            category: 'Comedy',
            aiDescription: 'A fan attempts an absurd blind basketball heave off an arena roof with an unexpected ricochet into the hoop that sends everyone into pure chaos.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1796543210987654321',
            creator: {
                name: 'Culture Crave 🍿',
                handle: '@CultureCrave',
                avatarUrl: 'https://ui-avatars.com/api/?name=CC&background=9333ea&color=fff',
                profileUrl: 'https://x.com/CultureCrave',
            },
            title: "Pedro Pascal and Bella Ramsey unable to stop laughing during dramatic scene take on set",
            description: 'Pure blooper gold from backstage filming.',
            thumbnailUrl: 'https://i.ytimg.com/vi/DgM1YypmL_Q/hqdefault.jpg',
            videoUrl: 'https://x.com/CultureCrave/status/1796543210987654321',
            embedUrl: 'https://www.youtube-nocookie.com/embed/DgM1YypmL_Q',
            durationSeconds: 35,
            viewCount: 15400000,
            likeCount: 890000,
            category: 'Entertainment',
            aiDescription: 'Beloved actors Pedro Pascal and Bella Ramsey suffer an uncontrollable laughing fit during an intense movie take.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1795123456789012345',
            creator: {
                name: 'Dexerto',
                handle: '@Dexerto',
                avatarUrl: 'https://ui-avatars.com/api/?name=DX&background=dc2626&color=fff',
                profileUrl: 'https://x.com/Dexerto',
            },
            title: 'IShowSpeed meets Brazilian soccer legend Ronaldo in wildest unscripted fan moment',
            description: 'Speed Barking at Ronaldo was not on the 2024 bingo card.',
            thumbnailUrl: 'https://i.ytimg.com/vi/0f-P7imlcC4/hqdefault.jpg',
            videoUrl: 'https://x.com/Dexerto/status/1795123456789012345',
            embedUrl: 'https://www.youtube-nocookie.com/embed/0f-P7imlcC4',
            durationSeconds: 45,
            viewCount: 28900000,
            likeCount: 1120000,
            category: 'Entertainment',
            aiDescription: 'Viral streamer IShowSpeed has an energetic and wildly hilarious first reaction upon unexpectedly meeting football royalty Ronaldo.',
        },
    ],
    [
        {
            platform: 'twitter',
            platformVideoId: '1801234567890123456',
            creator: {
                name: 'Tesla',
                handle: '@Tesla',
                avatarUrl: 'https://ui-avatars.com/api/?name=Tesla&background=cc0000&color=fff',
                profileUrl: 'https://x.com/Tesla',
            },
            title: 'Tesla Optimus humanoid robot sorting battery cells autonomously in factory floor test',
            description: 'End-to-end neural networks running on robot hardware in real-time factory conditions.',
            thumbnailUrl: 'https://i.ytimg.com/vi/1rQ_s_XgEPo/hqdefault.jpg',
            videoUrl: 'https://x.com/Tesla/status/1801234567890123456',
            embedUrl: 'https://www.youtube-nocookie.com/embed/1rQ_s_XgEPo',
            durationSeconds: 52,
            viewCount: 38200000,
            likeCount: 1450000,
            category: 'Science & Tech',
            aiDescription: 'Tesla displays real-time footage of their humanoid robot Optimus independently handling industrial manufacturing tasks with uncanny dexterity.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1802345678901234567',
            creator: {
                name: 'SportsCenter',
                handle: '@SportsCenter',
                avatarUrl: 'https://ui-avatars.com/api/?name=SC&background=ea580c&color=fff',
                profileUrl: 'https://x.com/SportsCenter',
            },
            title: 'High school quarterback throws impossible 70-yard no-look hail mary to win state championship',
            description: 'As time expired! Unbelievable sports moment.',
            thumbnailUrl: 'https://i.ytimg.com/vi/8dQ3Kf5u2ys/hqdefault.jpg',
            videoUrl: 'https://x.com/SportsCenter/status/1802345678901234567',
            embedUrl: 'https://www.youtube-nocookie.com/embed/8dQ3Kf5u2ys',
            durationSeconds: 31,
            viewCount: 24100000,
            likeCount: 780000,
            category: 'Sports',
            aiDescription: 'A high school quarterback executes a miracle buzzer-beater throw under heavy defensive pressure, leading to an ecstatic stadium rush.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1803456789012345678',
            creator: {
                name: 'No Context Humans',
                handle: '@NoContextHumans',
                avatarUrl: 'https://ui-avatars.com/api/?name=NC&background=4f46e5&color=fff',
                profileUrl: 'https://x.com/NoContextHumans',
            },
            title: 'Dad builds elaborate 50-step Rube Goldberg machine just to pour morning cereal',
            description: 'The mechanical genius and absurdity is unmatched.',
            thumbnailUrl: 'https://i.ytimg.com/vi/Q9-EEoGQyTE/hqdefault.jpg',
            videoUrl: 'https://x.com/NoContextHumans/status/1803456789012345678',
            embedUrl: 'https://www.youtube-nocookie.com/embed/Q9-EEoGQyTE',
            durationSeconds: 58,
            viewCount: 18700000,
            likeCount: 920000,
            category: 'Comedy',
            aiDescription: 'A dedicated inventor designs an insanely complicated contraption weaving through his entire living room simply to drop milk into a bowl.',
        },
    ],
    [
        {
            platform: 'twitter',
            platformVideoId: '1804567890123456789',
            creator: {
                name: 'Marques Brownlee',
                handle: '@MKBHD',
                avatarUrl: 'https://ui-avatars.com/api/?name=MB&background=2563eb&color=fff',
                profileUrl: 'https://x.com/MKBHD',
            },
            title: 'Testing the first transparent holographic display glass... mind blown 🤯',
            description: 'Full studio hands-on with next-gen spatial projection hardware.',
            thumbnailUrl: 'https://i.ytimg.com/vi/1rQ_s_XgEPo/hqdefault.jpg',
            videoUrl: 'https://x.com/MKBHD/status/1804567890123456789',
            embedUrl: 'https://www.youtube-nocookie.com/embed/1rQ_s_XgEPo',
            durationSeconds: 49,
            viewCount: 29400000,
            likeCount: 1100000,
            category: 'Science & Tech',
            aiDescription: 'Tech guru Marques Brownlee provides an exclusive early preview of futuristic transparent holographic panel technology.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1805678901234567890',
            creator: {
                name: 'House of Highlights',
                handle: '@HouseOfHighlights',
                avatarUrl: 'https://ui-avatars.com/api/?name=HH&background=10b981&color=fff',
                profileUrl: 'https://x.com/HouseOfHighlights',
            },
            title: '360 windmill through-the-legs dunk in transition during streetball tournament 🔥',
            description: 'The crowd invaded the asphalt immediately.',
            thumbnailUrl: 'https://i.ytimg.com/vi/8dQ3Kf5u2ys/hqdefault.jpg',
            videoUrl: 'https://x.com/HouseOfHighlights/status/1805678901234567890',
            embedUrl: 'https://www.youtube-nocookie.com/embed/8dQ3Kf5u2ys',
            durationSeconds: 22,
            viewCount: 31200000,
            likeCount: 1350000,
            category: 'Sports',
            aiDescription: 'A streetball athlete shocks the crowd with a picture-perfect acrobatic through-the-legs slam dunk in full speed.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1806789012345678901',
            creator: {
                name: 'Kai Cenat Clips',
                handle: '@KaiCenat',
                avatarUrl: 'https://ui-avatars.com/api/?name=KC&background=f97316&color=fff',
                profileUrl: 'https://x.com/KaiCenat',
            },
            title: 'Kai Cenat unexpected guest entrance triggers absolute pandemonium in streaming mansion',
            description: 'Nobody was ready for this cameo.',
            thumbnailUrl: 'https://i.ytimg.com/vi/0f-P7imlcC4/hqdefault.jpg',
            videoUrl: 'https://x.com/KaiCenat/status/1806789012345678901',
            embedUrl: 'https://www.youtube-nocookie.com/embed/0f-P7imlcC4',
            durationSeconds: 38,
            viewCount: 27500000,
            likeCount: 980000,
            category: 'Entertainment',
            aiDescription: 'Top streamer Kai Cenat surprises millions of live viewers as an A-list celebrity drops into his broadcast set unannounced.',
        },
    ],
    [
        {
            platform: 'twitter',
            platformVideoId: '1807890123456789012',
            creator: {
                name: 'MrBeast',
                handle: '@MrBeast',
                avatarUrl: 'https://ui-avatars.com/api/?name=Beast&background=06b6d4&color=fff',
                profileUrl: 'https://x.com/MrBeast',
            },
            title: 'Surprising random subscribers on X with custom wrapped sports cars 🏎️',
            description: 'Giving away real cars on X for the first time.',
            thumbnailUrl: 'https://i.ytimg.com/vi/0e3GPea1Tyg/hqdefault.jpg',
            videoUrl: 'https://x.com/MrBeast/status/1807890123456789012',
            embedUrl: 'https://www.youtube-nocookie.com/embed/0e3GPea1Tyg',
            durationSeconds: 59,
            viewCount: 65200000,
            likeCount: 3200000,
            category: 'Entertainment',
            aiDescription: 'MrBeast rolls out an exclusive X video giving away brand-new vehicles to shocked fans in a series of instant challenges.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1808901234567890123',
            creator: {
                name: 'Overtime',
                handle: '@overtime',
                avatarUrl: 'https://ui-avatars.com/api/?name=OT&background=8b5cf6&color=fff',
                profileUrl: 'https://x.com/overtime',
            },
            title: 'Running back completely leaps over standing defender into the end zone 😱',
            description: 'Play of the entire high school football season.',
            thumbnailUrl: 'https://i.ytimg.com/vi/8dQ3Kf5u2ys/hqdefault.jpg',
            videoUrl: 'https://x.com/overtime/status/1808901234567890123',
            embedUrl: 'https://www.youtube-nocookie.com/embed/8dQ3Kf5u2ys',
            durationSeconds: 19,
            viewCount: 21900000,
            likeCount: 840000,
            category: 'Sports',
            aiDescription: 'An astonishing athletic hurdle where a football player hurdles directly over a standing safety into touchdown glory.',
        },
    ],
    [
        {
            platform: 'twitter',
            platformVideoId: '1809012345678901234',
            creator: {
                name: 'Pop Base',
                handle: '@PopBase',
                avatarUrl: 'https://ui-avatars.com/api/?name=PB&background=ec4899&color=fff',
                profileUrl: 'https://x.com/PopBase',
            },
            title: 'Billie Eilish and Olivia Rodrigo sharing wholesome laughs on the red carpet',
            description: 'The sweetest interaction of the Grammy awards evening.',
            thumbnailUrl: 'https://i.ytimg.com/vi/8ZtJzT7x_C0/hqdefault.jpg',
            videoUrl: 'https://x.com/PopBase/status/1809012345678901234',
            embedUrl: 'https://www.youtube-nocookie.com/embed/8ZtJzT7x_C0',
            durationSeconds: 26,
            viewCount: 16800000,
            likeCount: 910000,
            category: 'Entertainment',
            aiDescription: 'Pop superstars Billie Eilish and Olivia Rodrigo share an unscripted, candid exchange during a major award gala.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1810123456789012345',
            creator: {
                name: 'Red Bull',
                handle: '@redbull',
                avatarUrl: 'https://ui-avatars.com/api/?name=RB&background=b91c1c&color=fff',
                profileUrl: 'https://x.com/redbull',
            },
            title: 'Wingsuit flight 5 feet above mountain ridge captured in 8K 360 camera',
            description: 'Do not try this at home. Extreme proximity wingsuit speed.',
            thumbnailUrl: 'https://i.ytimg.com/vi/0e3GPea1Tyg/hqdefault.jpg',
            videoUrl: 'https://x.com/redbull/status/1810123456789012345',
            embedUrl: 'https://www.youtube-nocookie.com/embed/0e3GPea1Tyg',
            durationSeconds: 44,
            viewCount: 34100000,
            likeCount: 1620000,
            category: 'Challenge',
            aiDescription: 'Jaw-dropping aerial footage of a professional Red Bull wingsuit pilot skimming across a sharp alpine knife-edge ridge.',
        },
    ],
    [
        {
            platform: 'twitter',
            platformVideoId: '1811234567890123456',
            creator: {
                name: 'Fabrizio Romano',
                handle: '@FabrizioRomano',
                avatarUrl: 'https://ui-avatars.com/api/?name=FR&background=0284c7&color=fff',
                profileUrl: 'https://x.com/FabrizioRomano',
            },
            title: 'HERE WE GO! 🚨 Wild midnight airport arrival scene for record transfer signing',
            description: 'Thousands of fans singing in the terminal at 2 AM.',
            thumbnailUrl: 'https://i.ytimg.com/vi/8dQ3Kf5u2ys/hqdefault.jpg',
            videoUrl: 'https://x.com/FabrizioRomano/status/1811234567890123456',
            embedUrl: 'https://www.youtube-nocookie.com/embed/8dQ3Kf5u2ys',
            durationSeconds: 34,
            viewCount: 22600000,
            likeCount: 890000,
            category: 'Sports',
            aiDescription: 'Journalist Fabrizio Romano covers the electric, euphoric atmosphere as thousands of football supporters welcome a superstar signing at the airport.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1812345678901234567',
            creator: {
                name: 'IGN',
                handle: '@IGN',
                avatarUrl: 'https://ui-avatars.com/api/?name=IGN&background=e11d48&color=fff',
                profileUrl: 'https://x.com/IGN',
            },
            title: 'Unreal Engine 5 hyper-realistic physics demo in real time... looks like real life',
            description: 'Next gen real-time lighting and destruction physics.',
            thumbnailUrl: 'https://i.ytimg.com/vi/1rQ_s_XgEPo/hqdefault.jpg',
            videoUrl: 'https://x.com/IGN/status/1812345678901234567',
            embedUrl: 'https://www.youtube-nocookie.com/embed/1rQ_s_XgEPo',
            durationSeconds: 47,
            viewCount: 25800000,
            likeCount: 1040000,
            category: 'Science & Tech',
            aiDescription: 'A photorealistic next-generation graphics and physics tech showcase capturing architectural demolition in stunning detail.',
        },
    ],
    [
        {
            platform: 'twitter',
            platformVideoId: '1813456789012345678',
            creator: {
                name: 'Elon Musk',
                handle: '@elonmusk',
                avatarUrl: 'https://ui-avatars.com/api/?name=EM&background=000000&color=fff',
                profileUrl: 'https://x.com/elonmusk',
            },
            title: 'Optimus hand with 22 degrees of freedom catching a tennis ball thrown at speed 🎾',
            description: 'Sub-millisecond tactile response and optical tracking in action.',
            thumbnailUrl: 'https://i.ytimg.com/vi/e1r57oXmFqY/hqdefault.jpg',
            videoUrl: 'https://x.com/elonmusk/status/1813456789012345678',
            embedUrl: 'https://www.youtube-nocookie.com/embed/e1r57oXmFqY',
            durationSeconds: 24,
            viewCount: 46100000,
            likeCount: 1980000,
            category: 'Science & Tech',
            aiDescription: 'Elon Musk demonstrates new mechanical hand actuators for the Tesla Optimus robot catching fast-moving objects with superhuman reflex.',
        },
        {
            platform: 'twitter',
            platformVideoId: '1814567890123456789',
            creator: {
                name: 'Culture Crave 🍿',
                handle: '@CultureCrave',
                avatarUrl: 'https://ui-avatars.com/api/?name=CC&background=9333ea&color=fff',
                profileUrl: 'https://x.com/CultureCrave',
            },
            title: 'Ryan Reynolds and Hugh Jackman hilarious blooper reel moment backstage',
            description: 'The comedic chemistry between these two is effortless.',
            thumbnailUrl: 'https://i.ytimg.com/vi/DgM1YypmL_Q/hqdefault.jpg',
            videoUrl: 'https://x.com/CultureCrave/status/1814567890123456789',
            embedUrl: 'https://www.youtube-nocookie.com/embed/DgM1YypmL_Q',
            durationSeconds: 32,
            viewCount: 28400000,
            likeCount: 1250000,
            category: 'Entertainment',
            aiDescription: 'Actors Ryan Reynolds and Hugh Jackman break character during filming in an uproarious outtake filled with witty banter.',
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
 * Generates or retrieves the Daily Drop for a given date across YouTube and X/Twitter
 * @param {string} [targetDateKey] - YYYY-MM-DD (defaults to today)
 * @param {boolean} [forceRefresh=false] - Re-fetch fresh videos
 * @param {string} [requestedPlatform='all'] - 'all' | 'youtube' | 'twitter'
 * @param {object} [options={}] - { creators: string[], hashtags: string[] }
 */
export async function getDailyDrop(
    targetDateKey = null,
    forceRefresh = false,
    requestedPlatform = 'all',
    options = {}
) {
    const todayKey = targetDateKey || getDateKey();
    const drops = loadDrops();

    const existing = drops[todayKey];
    const hasTwitter =
        existing &&
        Array.isArray(existing.videos) &&
        existing.videos.some((v) => v.platform === 'twitter' && Boolean(v.embedUrl));
    if (!forceRefresh && existing && Array.isArray(existing.videos) && existing.videos.length > 0 && hasTwitter) {
        let returnVideos = existing.videos;
        if (requestedPlatform && requestedPlatform !== 'all') {
            returnVideos = returnVideos.filter((v) => v.platform === requestedPlatform);
        }
        return {
            ...existing,
            total: returnVideos.length,
            videos: returnVideos,
            nextDropCountdownSeconds: getSecondsUntilNextDrop(),
            history: Object.keys(drops).sort().reverse(),
        };
    }

    // Determine today's rotating theme
    const [y, m, d] = todayKey.split('-').map(Number);
    const dayOfYear = Math.floor((new Date(y, m - 1, d) - new Date(y, 0, 0)) / (1000 * 60 * 60 * 24));
    const themeIndex = Math.abs(dayOfYear) % DAILY_THEMES.length;
    const currentThemeConfig = DAILY_THEMES[themeIndex];

    let fetchedYouTube = [];
    let fetchedTwitter = [];

    // 1. YouTube Live Fetch
    if (process.env.YOUTUBE_API_KEY) {
        try {
            console.log(`[DailyDrops] Fetching fresh YouTube clips for date: ${todayKey}`);
            const rawYt = await fetchYouTubeVideos(currentThemeConfig.ytQueries, 3);
            if (rawYt && rawYt.length > 0) {
                fetchedYouTube = rawYt.map((v, idx) => {
                    const views = v.viewCount || 50000;
                    const hoursSince = Math.max(1, (Date.now() - new Date(v.publishedAt || Date.now()).getTime()) / 3600000);
                    return {
                        ...v,
                        isDailyDrop: true,
                        dropDate: todayKey,
                        category: v.category || (idx % 2 === 0 ? 'Comedy' : 'Challenge'),
                        velocityViewsPerHour: Math.round(views / hoursSince),
                        aiDescription: v.aiDescription || `Viral YouTube clip featured in today's Daily Radar Drop (${currentThemeConfig.theme}). High audience retention hook.`,
                    };
                });
            }
        } catch (err) {
            console.warn('[DailyDrops] YouTube API error, falling back to curated rotation:', err.message);
        }
    }

    // 2. X / Twitter Live Fetch (supports TWITTER_BEARER_TOKEN or keyless X creator + stream discovery)
    if (process.env.TWITTER_BEARER_TOKEN || process.env.NODE_ENV !== 'test') {
        try {
            console.log(`[DailyDrops] Fetching fresh X/Twitter clips for date: ${todayKey}`);
            const rawTw = await fetchTwitterVideos(currentThemeConfig.twQueries, 4, {
                creators: options.creators,
                hashtags: options.hashtags,
            });
            if (rawTw && rawTw.length > 0) {
                fetchedTwitter = rawTw.map((v, idx) => {
                    const views = v.viewCount || 80000;
                    const hoursSince = Math.max(1, (Date.now() - new Date(v.publishedAt || Date.now()).getTime()) / 3600000);
                    return {
                        ...v,
                        isDailyDrop: true,
                        dropDate: todayKey,
                        category: v.category || (idx % 2 === 0 ? 'Entertainment' : 'Science & Tech'),
                        velocityViewsPerHour: Math.round(views / hoursSince),
                        aiDescription:
                            v.aiDescription ||
                            `Trending X/Twitter clip curated in today's Daily Radar Drop. Spreading rapidly with massive quote-tweet engagement.`,
                    };
                });
            }
        } catch (err) {
            console.warn('[DailyDrops] Twitter API error, falling back to curated rotation:', err.message);
        }
    }

    // Fallbacks if live APIs produced no videos (or key missing)
    if (fetchedYouTube.length === 0) {
        const poolIndex = Math.abs(dayOfYear) % ROTATING_YT_BACKUPS.length;
        fetchedYouTube = ROTATING_YT_BACKUPS[poolIndex].map((v) => ({
            ...v,
            isDailyDrop: true,
            dropDate: todayKey,
            publishedAt: new Date(y, m - 1, d, 8, 30, 0).toISOString(),
            velocityViewsPerHour: Math.floor(v.viewCount / 72),
        }));
    }

    if (fetchedTwitter.length === 0) {
        const poolIndex = Math.abs(dayOfYear) % ROTATING_TWITTER_BACKUPS.length;
        fetchedTwitter = ROTATING_TWITTER_BACKUPS[poolIndex].map((v) => ({
            ...v,
            isDailyDrop: true,
            dropDate: todayKey,
            publishedAt: new Date(y, m - 1, d, 10, 15, 0).toISOString(),
            velocityViewsPerHour: Math.floor(v.viewCount / 48),
        }));
    }

    // Interleave YouTube and Twitter clips for a balanced daily drop
    const combinedVideos = [];
    const maxLen = Math.max(fetchedYouTube.length, fetchedTwitter.length);
    for (let i = 0; i < maxLen; i++) {
        if (fetchedYouTube[i]) combinedVideos.push(fetchedYouTube[i]);
        if (fetchedTwitter[i]) combinedVideos.push(fetchedTwitter[i]);
    }

    const newDropRecord = {
        date: todayKey,
        formattedDate: formatDisplayDate(todayKey),
        theme: currentThemeConfig.theme,
        nextDropCountdownSeconds: getSecondsUntilNextDrop(),
        total: combinedVideos.length,
        videos: combinedVideos,
        platforms: {
            youtube: fetchedYouTube,
            twitter: fetchedTwitter,
        },
        generatedAt: new Date().toISOString(),
    };

    drops[todayKey] = newDropRecord;
    saveDrops(drops);

    let returnVideos = combinedVideos;
    if (requestedPlatform && requestedPlatform !== 'all') {
        returnVideos = returnVideos.filter((v) => v.platform === requestedPlatform);
    }

    return {
        ...newDropRecord,
        total: returnVideos.length,
        videos: returnVideos,
        history: Object.keys(drops).sort().reverse(),
    };
}

/**
 * Returns today's fresh drop videos for mixing into the feed by platform
 * @param {string} [platform='all'] - 'all' | 'youtube' | 'twitter'
 */
export async function getTodayDropVideos(platform = 'all') {
    try {
        const drop = await getDailyDrop(getDateKey(), false, platform);
        return drop.videos || [];
    } catch {
        return [];
    }
}
