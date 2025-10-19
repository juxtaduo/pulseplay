import mongoose, { Schema, type Document } from 'mongoose';
import type { MoodInsight } from '../types/index.js';

/**
 * Mongoose document interface for MoodInsight
 */
export interface MoodInsightDocument extends Omit<MoodInsight, 'sessionId'>, Document {
	sessionId: mongoose.Types.ObjectId;
}

/**
 * MoodInsight schema
 * Stores AI-generated insights for focus sessions
 */
const moodInsightSchema = new Schema<MoodInsightDocument>(
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
		collection: 'mood_insights',
	},
);

// Indexes
moodInsightSchema.index({ sessionId: 1 }, { unique: true });
moodInsightSchema.index({ generatedAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

// Ensure JSON output excludes internal fields
moodInsightSchema.set('toJSON', {
	transform: (_doc, ret: any) => {
		ret.sessionId = ret.sessionId.toString();
		delete ret._id;
		delete ret.__v;
		return ret;
	},
});

export const MoodInsightModel = mongoose.model<MoodInsightDocument>(
	'MoodInsight',
	moodInsightSchema,
);
