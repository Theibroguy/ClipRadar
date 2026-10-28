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

    try {
        const response = await gemini.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
        });
        const text = response.text.trim();
        const parsed = JSON.parse(text);
        return {
            aiDescription: parsed.aiDescription || '',
            category: parsed.category || 'Uncategorized',
        };
    } catch (err) {
        console.error('Gemini enrichment failed:', err.message);
        return { aiDescription: '', category: 'Uncategorized' };
    }
}
