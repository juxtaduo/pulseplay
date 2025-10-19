import mongoose, { Schema, type Document } from 'mongoose';
import type { WeeklySummary } from '../types/index.js';

/**
 * Mongoose document interface for WeeklySummary
 */
export interface WeeklySummaryDocument extends WeeklySummary, Document {}

/**
 * WeeklySummary schema
 * Stores AI-generated weekly summaries for users
 */
const weeklySummarySchema = new Schema<WeeklySummaryDocument>(
	{
		userIdHash: {
			type: String,
			required: true,
			index: true,
			validate: {
				validator: (v: string) => /^[a-f0-9]{64}$/i.test(v),
				message: 'userIdHash must be a valid SHA-256 hash',
			},
		},
		weekStart: {
			type: Date,
			required: true,
			index: true,
		},
		weekEnd: {
			type: Date,
			required: true,
		},
		totalSessions: {
			type: Number,
			required: true,
			min: 0,
		},
		totalMinutes: {
			type: Number,
			required: true,
			min: 0,
		},
		dominantMood: {
			type: String,
			enum: ['deep-focus', 'melodic-flow', 'jazz-harmony', 'thousand-years', 'kiss-the-rain', 'river-flows', 'gurenge'],
			required: true,
		},
		averageSessionMinutes: {
			type: Number,
			required: true,
			min: 0,
		},
		moodDistribution: {
			type: Map,
			of: Number,
			required: true,
		},
		rhythmInsights: {
			type: String,
			required: true,
			maxlength: 2000,
		},
	},
	{
		timestamps: true,
		collection: 'weekly_summaries',
	},
);

// Compound index for unique weekly summaries per user
weeklySummarySchema.index({ userIdHash: 1, weekStart: 1 }, { unique: true });
// TTL index: Remove summaries after 180 days
weeklySummarySchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 }); // 180 days

// Ensure JSON output excludes internal fields
weeklySummarySchema.set('toJSON', {
	transform: (_doc, ret: any) => {
		delete ret._id;
		delete ret.__v;
		return ret;
	},
});

export const WeeklySummaryModel = mongoose.model<WeeklySummaryDocument>(
	'WeeklySummary',
	weeklySummarySchema,
);
