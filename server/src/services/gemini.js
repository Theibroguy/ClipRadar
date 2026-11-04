/**
 * Gemini AI Service
 *
 * Enriches video metadata with an AI-generated description and category
 * using Google Gemini. Requires a valid GEMINI_API_KEY env var.
 *
 * If the key is missing the function gracefully returns empty strings
 * so the rest of the app continues to work.
 */
import { GoogleGenAI } from '@google/genai';

let client = null;

function getClient() {
    if (!client) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return null;
        client = new GoogleGenAI({ apiKey });
    }
    return client;
}

/**
 * @param {object} videoMeta - basic metadata about the video
 * @param {string} videoMeta.title
 * @param {string} videoMeta.description - original platform description
 * @param {string} videoMeta.creator - creator name / handle
 * @param {string} videoMeta.platform
 * @returns {Promise<{aiDescription: string, category: string}>}
 */
export async function enrichVideoWithAI(videoMeta) {
    const gemini = getClient();
    if (!gemini) {
        console.warn('GEMINI_API_KEY not set — skipping AI enrichment.');
        return { aiDescription: '', category: 'Uncategorized' };
    }

    const prompt = `
You are a content curator for ClipRadar, a social video discovery app.
Given the following video metadata, write a concise 2-sentence description (max 60 words)
that captures what makes the clip interesting or entertaining. Also pick the best single
category from this list: Comedy, Challenge, Tech, Entertainment, Science & Tech, Lifestyle,
Sports, News, Music, Other.

Platform: ${videoMeta.platform}
Creator: ${videoMeta.creator}
Title: ${videoMeta.title}
Description: ${videoMeta.description}

Reply strictly in this JSON format (no markdown, no extra keys):
{"aiDescription": "...", "category": "..."}
`.trim();

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

    try {
        const response = await gemini.models.generateContent({
            model,
            contents: prompt,
        });
        const text = response.text ? response.text.trim() : '';
        let cleanText = text;
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        }
        const parsed = JSON.parse(cleanText);
        return {
            aiDescription: parsed.aiDescription || '',
            category: parsed.category || 'Uncategorized',
        };
    } catch (err) {
        console.error('Gemini enrichment failed:', err.message);
        return { aiDescription: '', category: 'Uncategorized' };
    }
}

/**
 * Generate fallback catchy moments if AI is unavailable or fails.
 */
function generateFallbackMoments({ title = 'Viral Video Clip', duration = 30 }) {
    const totalSec = Math.max(8, Math.round(Number(duration) || 30));
    const safeTitle = (title || 'Viral Clip').replace(/\.[^/.]+$/, '').trim();

    const templates = [
        {
            title: 'Explosive Opening Hook',
            headline: `Watch what happened when **${safeTitle}** started with this **unbelievable intro**`,
            relativeStart: 0,
            relativeDuration: Math.min(10, Math.max(5, Math.round(totalSec * 0.25))),
            score: 98,
            reason: 'Instant curiosity gap right at the 0s mark driving maximum viewer retention.',
            tags: ['Hook', 'Retention', 'Trending'],
        },
        {
            title: 'Unexpected Plot Twist',
            headline: `Nobody anticipated what **${safeTitle}** did right in the **middle of the scene**`,
            relativeStart: Math.max(4, Math.round(totalSec * 0.32)),
            relativeDuration: Math.min(15, Math.max(6, Math.round(totalSec * 0.3))),
            score: 95,
            reason: 'Sudden narrative or visual shift that spikes comments, shares, and re-watches.',
            tags: ['Twist', 'Shocking', 'Viral'],
        },
        {
            title: 'Peak Climax & Reaction',
            headline: `The exact moment **${safeTitle}** caused the **entire audience to lose it**`,
            relativeStart: Math.max(8, Math.round(totalSec * 0.65)),
            relativeDuration: Math.min(18, Math.max(6, Math.round(totalSec * 0.25))),
            score: 92,
            reason: 'Emotional peak and high energy reaction optimal for TikTok/Reels loops.',
            tags: ['Climax', 'Reaction', 'Peak Energy'],
        },
    ];

    if (totalSec >= 45) {
        templates.push({
            title: 'Golden Final Punchline',
            headline: `The unexpected ending of **${safeTitle}** had everyone **talking in the comments**`,
            relativeStart: Math.max(15, Math.round(totalSec * 0.85)),
            relativeDuration: Math.min(15, Math.max(5, totalSec - Math.round(totalSec * 0.85))),
            score: 89,
            reason: 'Humorous or memorable closing payoff that encourages video looping.',
            tags: ['Punchline', 'Payoff', 'Loop'],
        });
    }

    return templates.map((tmpl, idx) => {
        const start = Math.min(tmpl.relativeStart, Math.max(0, totalSec - 4));
        const end = Math.min(totalSec, Math.max(start + 4, start + tmpl.relativeDuration));
        return {
            id: `moment-${idx + 1}`,
            title: tmpl.title,
            startTime: start,
            endTime: end,
            duration: Math.max(3, end - start),
            headline: tmpl.headline,
            score: tmpl.score,
            reason: tmpl.reason,
            tags: tmpl.tags,
        };
    });
}

/**
 * Extract multiple catchy moments from video metadata and duration using Gemini AI.
 *
 * @param {object} params
 * @param {string} [params.title]
 * @param {string} [params.description]
 * @param {string} [params.transcript]
 * @param {number} [params.duration]
 * @returns {Promise<Array<{id: string, title: string, startTime: number, endTime: number, duration: number, headline: string, score: number, reason: string, tags: string[]}>>}
 */
export async function extractMomentsWithAI({ title = '', description = '', transcript = '', duration = 30 } = {}) {
    const totalDuration = Math.max(5, Math.round(Number(duration) || 30));
    const gemini = getClient();

    if (!gemini) {
        return generateFallbackMoments({ title, duration: totalDuration });
    }

    const prompt = `
You are a viral social media editor and content curator specialized in TikTok, YouTube Shorts, and Instagram Reels.
Analyze the following video details and identify ALL distinct catchy, viral, or high-engagement moments in the video.
A single video can have multiple catchy moments (e.g., strong opening hooks, surprising twists, funny punchlines, emotional peaks, or intense reactions).

Video Title: ${title || 'Untitled Social Clip'}
Description: ${description || 'None'}
Transcript / Dialogue: ${transcript || 'None provided'}
Total Video Duration: ${totalDuration} seconds

Rules:
1. Identify between 2 and 5 catchy moments (or more if the video duration is long).
2. Each moment MUST have a realistic startTime and endTime within [0, ${totalDuration}].
3. Each moment duration should be between 4 and 45 seconds (ideal for a 9:16 short).
4. headline: Provide an engaging, punchy headline hook. Wrap 2 to 4 key words or names in **double asterisks** for bold blue highlight formatting (e.g. "When **MrBeast** dropped the **biggest surprise** of the century").
5. score: An integer viral score between 80 and 99.
6. reason: A brief 1-sentence note explaining why this moment is engaging.
7. tags: An array of 2-3 short tags.

Respond ONLY with valid JSON in this exact structure (no markdown fences, no extra commentary):
{
  "moments": [
    {
      "id": "moment-1",
      "title": "Shocking Reaction",
      "startTime": 0,
      "endTime": 12,
      "headline": "Watch what happened when **Dua Lipa** entered the **red carpet**",
      "score": 96,
      "reason": "Sudden visual surprise and high retention hook.",
      "tags": ["Hook", "Reaction"]
    }
  ]
}
`.trim();

    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    try {
        const response = await gemini.models.generateContent({
            model,
            contents: prompt,
        });

        const raw = response.text ? response.text.trim() : '';
        let cleanText = raw;
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed?.moments) && parsed.moments.length > 0) {
            return parsed.moments.map((m, idx) => {
                const s = Math.max(0, Math.min(totalDuration - 2, Math.round(Number(m.startTime) || 0)));
                const e = Math.min(totalDuration, Math.max(s + 3, Math.round(Number(m.endTime) || s + 10)));
                return {
                    id: m.id || `moment-${idx + 1}`,
                    title: m.title || `Catchy Moment #${idx + 1}`,
                    startTime: s,
                    endTime: e,
                    duration: e - s,
                    headline: m.headline || `Highlight from **${title || 'Viral Video'}**`,
                    score: Math.min(99, Math.max(70, Math.round(Number(m.score) || 90))),
                    reason: m.reason || 'High engagement moment detected by AI.',
                    tags: Array.isArray(m.tags) ? m.tags : ['Viral', 'Shorts'],
                };
            });
        }
        return generateFallbackMoments({ title, duration: totalDuration });
    } catch (err) {
        console.warn('Gemini moments extraction error, using fallback moments:', err.message);
        return generateFallbackMoments({ title, duration: totalDuration });
    }
}
