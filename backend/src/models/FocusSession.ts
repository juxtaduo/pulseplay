import mongoose, { Schema, type Document } from 'mongoose';
import type { FocusSession } from '../types/index.js';

/**
 * Mongoose document interface for FocusSession
 */
export interface FocusSessionDocument extends Omit<FocusSession, 'sessionId'>, Document {
	_id: mongoose.Types.ObjectId;
}

/**
 * Rhythm data subdocument schema
 */
const rhythmSampleSchema = new Schema(
	{
		timestamp: { type: Date, required: true },
		keysPerMinute: { type: Number, required: true, min: 0 },
		intensity: { type: Number, required: true, min: 0, max: 1 },
	},
	{ _id: false },
);

const rhythmDataSchema = new Schema(
	{
		averageKeysPerMinute: { type: Number, required: true, default: 0, min: 0 },
		rhythmType: {
			type: String,
			enum: ['energetic', 'steady', 'thoughtful'],
			required: true,
			default: 'steady',
		},
		peakIntensity: { type: Number, required: true, default: 0, min: 0, max: 1 },
		samples: { type: [rhythmSampleSchema], default: [] },
	},
	{ _id: false },
);

/**
 * FocusSession schema
 * Stores user focus sessions with typing rhythm data
 */
const focusSessionSchema = new Schema<FocusSessionDocument>(
	{
		userIdHash: {
			type: String,
			required: true,
			index: true,
			validate: {
				validator: (v: string) => /^[a-f0-9]{64}$/i.test(v),
				message: 'userIdHash must be a valid SHA-256 hash (64 hex characters)',
			},
		},
		mood: {
			type: String,
			enum: ['deep-focus', 'creative-flow', 'calm-reading', 'energized-coding'],
			required: true,
		},
		startTime: { type: Date, required: true, default: Date.now },
		endTime: { type: Date, default: null },
		totalDurationMinutes: { type: Number, min: 0, default: null },
		rhythmData: { type: rhythmDataSchema, required: true },
		state: {
			type: String,
			enum: ['active', 'paused', 'completed'],
			required: true,
			default: 'active',
		},
	},
	{
		timestamps: true,
		collection: 'focus_sessions',
	},
);

// Indexes for efficient queries
focusSessionSchema.index({ userIdHash: 1, createdAt: -1 });
focusSessionSchema.index({ state: 1, updatedAt: -1 });
focusSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

// Virtual for sessionId (uses MongoDB _id)
focusSessionSchema.virtual('sessionId').get(function (this: FocusSessionDocument) {
	return this._id.toString();
});

// Ensure virtuals are included in JSON output
focusSessionSchema.set('toJSON', {
	virtuals: true,
	transform: (_doc, ret: any) => {
		delete ret._id;
		delete ret.__v;
		return ret;
	},
});

/**
 * Calculate total duration before saving if session is completed
 */
focusSessionSchema.pre('save', function (next) {
	if (this.state === 'completed' && this.endTime && !this.totalDurationMinutes) {
		const durationMs = this.endTime.getTime() - this.startTime.getTime();
		this.totalDurationMinutes = Math.round(durationMs / 60000);
	}
	next();
});

export const FocusSessionModel = mongoose.model<FocusSessionDocument>(
	'FocusSession',
	focusSessionSchema,
);
