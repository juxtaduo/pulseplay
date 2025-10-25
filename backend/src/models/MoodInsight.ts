import mongoose, { type Document, Schema } from 'mongoose';
import type { SongInsight } from '../types/index.js';

/**
 * Mongoose document interface for SongInsight
 */
export interface SongInsightDocument extends Omit<SongInsight, 'sessionId'>, Document {
	sessionId: mongoose.Types.ObjectId;
}

/**
 * SongInsight schema
 * Stores AI-generated insights for focus sessions
 */
const songInsightSchema = new Schema<SongInsightDocument>(
	{
		sessionId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'FocusSession',
			index: true,
		},
		insight: {
			type: String,
			required: true,
			maxlength: 1000,
		},
		generatedAt: {
			type: Date,
			required: true,
			default: Date.now,
		},
		promptHash: {
			type: String,
			required: true,
			validate: {
				validator: (v: string) => /^[a-f0-9]{64}$/i.test(v),
				message: 'promptHash must be a valid SHA-256 hash',
			},
		},
		modelUsed: {
			type: String,
			required: true,
			default: 'gemini-2.5-flash',
		},
	},
	{
		timestamps: false,
		collection: 'song_insights',
	}
);

// Indexes
songInsightSchema.index({ sessionId: 1 }, { unique: true });
songInsightSchema.index({ generatedAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

// Ensure JSON output excludes internal fields
songInsightSchema.set('toJSON', {
	transform: (_doc, ret: Record<string, any>) => {
		ret.sessionId = ret.sessionId.toString();
		delete ret._id;
		delete ret.__v;
		return ret;
	},
});

export const SongInsightModel = mongoose.model<SongInsightDocument>(
	'SongInsight',
	songInsightSchema
);
