/**
 * AIMoodRecommendation Mongoose Model
 * AI-generated mood suggestions from Gemini API based on session rhythm patterns
 * @module models/AIMoodRecommendation
 */

import { Schema, model, Document } from 'mongoose';
import crypto from 'crypto';

/**
 * AIMoodRecommendation document interface
 */
export interface IAIMoodRecommendation extends Document {
	recommendationId: string;
	sessionId: string;
	suggestedMood: 'deep-focus' | 'creative-flow' | 'calm-reading' | 'energized-coding';
	rationale: string;
	confidence: number;
	generatedAt: Date;
	geminiModel: string;
}

/**
 * AIMoodRecommendation schema
 * TTL index inherits from associated FocusSession (90 days)
 */
const aiMoodRecommendationSchema = new Schema<IAIMoodRecommendation>({
	recommendationId: {
		type: String,
		required: true,
		unique: true,
		default: () => crypto.randomUUID(),
	},
	sessionId: {
		type: String,
		required: true,
		ref: 'FocusSession', // Foreign key reference
	},
	suggestedMood: {
		type: String,
		enum: ['deep-focus', 'creative-flow', 'calm-reading', 'energized-coding'],
		required: true,
	},
	rationale: {
		type: String,
		required: true,
		maxlength: 500, // Limit AI-generated text length
	},
	confidence: {
		type: Number,
		min: 0,
		max: 1,
		required: true,
	},
	generatedAt: { type: Date, default: Date.now },
	geminiModel: {
		type: String,
		required: true,
		match: /^gemini-1\.5-(flash|pro)$/, // Validate model name format
	},
});

// Indexes
aiMoodRecommendationSchema.index({ recommendationId: 1 }, { unique: true });
aiMoodRecommendationSchema.index({ sessionId: 1 }); // Foreign key lookup

export const AIMoodRecommendation = model<IAIMoodRecommendation>(
	'AIMoodRecommendation',
	aiMoodRecommendationSchema,
);
