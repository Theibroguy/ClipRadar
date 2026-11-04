import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
    {
        // Source platform details
        platform: {
            type: String,
            enum: ['youtube', 'twitter', 'instagram', 'tiktok', 'demo', 'studio'],
            required: true,
        },
        platformVideoId: {
            type: String,
            required: true,
        },

        // Creator / channel
        creator: {
            name: { type: String, default: '' },
            handle: { type: String, default: '' },
            avatarUrl: { type: String, default: '' },
            profileUrl: { type: String, default: '' },
        },

        // Core metadata
        title: { type: String, required: true },
        description: { type: String, default: '' }, // Original platform description
        aiDescription: { type: String, default: '' }, // Gemini-generated description
        category: { type: String, default: 'Uncategorized' },
        tags: [String],

        // Media
        thumbnailUrl: { type: String, default: '' },
        videoUrl: { type: String, required: true }, // Direct link to original video
        embedUrl: { type: String, default: '' }, // Embed URL (where permitted)
        durationSeconds: { type: Number, default: 0 },

        // Dates
        publishedAt: { type: Date },
        fetchedAt: { type: Date, default: Date.now },

        // Engagement (optional — not all platforms expose these)
        viewCount: { type: Number, default: 0 },
        likeCount: { type: Number, default: 0 },
    },
    {
        timestamps: true, // adds createdAt, updatedAt
    }
);

// Prevent duplicate videos from the same platform
videoSchema.index({ platform: 1, platformVideoId: 1 }, { unique: true });

export const Video = mongoose.model('Video', videoSchema);
