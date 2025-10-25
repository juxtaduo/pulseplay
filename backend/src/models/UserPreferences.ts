import mongoose, { type Document, Schema } from 'mongoose';
import type { UserPreferences } from '../types/index.js';

/**
 * Mongoose document interface for UserPreferences
 */
export interface UserPreferencesDocument extends Omit<UserPreferences, 'userIdHash'>, Document {
	userIdHash: string;
}

/**
 * UserPreferences schema
 * Stores user preferences for music generation and UI settings
 */
const userPreferencesSchema = new Schema<UserPreferencesDocument>(
	{
		userIdHash: {
			type: String,
			required: true,
			unique: true,
			index: true,
			validate: {
				validator: (v: string) => /^[a-f0-9]{64}$/i.test(v),
				message: 'userIdHash must be a valid SHA-256 hash (64 hex characters)',
			},
		},
		favoriteTempos: {
			type: [Number],
			default: [80],
			validate: {
				validator: (arr: number[]) => arr.every((tempo) => tempo >= 40 && tempo <= 200),
				message: 'Tempos must be between 40 and 200 BPM',
			},
		},
		preferredInstruments: {
			type: [String],
			default: ['sine', 'sawtooth'],
			validate: {
				validator: (arr: string[]) =>
					arr.every((inst) => ['sine', 'square', 'sawtooth', 'triangle'].includes(inst)),
				message: 'Instruments must be valid waveform types',
			},
		},
		volumeLevel: {
			type: Number,
			required: true,
			default: 0.5,
			min: 0,
			max: 1,
		},
		enableVisualizations: {
			type: Boolean,
			required: true,
			default: true,
		},
	},
	{
		timestamps: true,
		collection: 'user_preferences',
	}
);

// TTL index: Remove preferences after 180 days of inactivity
userPreferencesSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 15552000 }); // 180 days

// Ensure JSON output excludes internal fields
userPreferencesSchema.set('toJSON', {
	transform: (_doc, ret: unknown) => {
		const result = ret as Record<string, unknown>;
		delete result._id;
		delete result.__v;
		return result;
	},
});

export const UserPreferencesModel = mongoose.model<UserPreferencesDocument>(
	'UserPreferences',
	userPreferencesSchema
);
