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
	suggestedMood: 'thousand-years' | 'kiss-the-rain' | 'river-flows' | 'gurenge';
	rationale: string;
	confidence: number; // 0.0 - 1.0
	generatedAt: Date;
}

/**
 * AIMoodRecommendation schema
 * Stores AI-generated mood recommendations for completed sessions
 */
const aiMoodRecommendationSchema = new Schema<IAIMoodRecommendation>({
	recommendationId: {
		type: String,
		required: true,
		unique: true,
		validate: {
			validator: (v: string) => /^[a-zA-Z0-9_-]{10,30}$/.test(v),
			message: 'recommendationId must be alphanumeric (10-30 chars)',
		},
	},
	sessionId: {
		type: String,
		required: true,
		index: true,
	},
	suggestedMood: {
		type: String,
		enum: ['thousand-years', 'kiss-the-rain', 'river-flows', 'gurenge'],
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
});

// Indexes
aiMoodRecommendationSchema.index({ recommendationId: 1 }, { unique: true });
aiMoodRecommendationSchema.index({ sessionId: 1 }); // Foreign key lookup

export const AIMoodRecommendation = model<IAIMoodRecommendation>(
	'AIMoodRecommendation',
	aiMoodRecommendationSchema,
);
