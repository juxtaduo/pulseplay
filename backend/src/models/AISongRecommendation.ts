/**
 * AISongRecommendation Mongoose Model
 * AI-generated song suggestions from Gemini API based on session rhythm patterns
 * @module models/AISongRecommendation
 */

import { Schema, model, Document } from 'mongoose';

/**
 * AISongRecommendation document interface
 */
export interface IAISongRecommendation extends Document {
	recommendationId: string;
	sessionId: string;
	suggestedSong: 'thousand-years' | 'kiss-the-rain' | 'river-flows' | 'gurenge';
	rationale: string;
	confidence: number; // 0.0 - 1.0
	generatedAt: Date;
}

/**
 * AISongRecommendation schema
 * Stores AI-generated song recommendations for completed sessions
 */
const aiSongRecommendationSchema = new Schema<IAISongRecommendation>({
	recommendationId: {
		type: String,
		required: true,
		validate: {
			validator: (v: string) => /^[a-zA-Z0-9_-]{10,30}$/.test(v),
			message: 'recommendationId must be alphanumeric (10-30 chars)',
		},
	},
	sessionId: {
		type: String,
		required: true,
	},
	suggestedSong: {
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
aiSongRecommendationSchema.index({ recommendationId: 1 }, { unique: true });
aiSongRecommendationSchema.index({ sessionId: 1 }); // Foreign key lookup

export const AISongRecommendation = model<IAISongRecommendation>(
	'AISongRecommendation',
	aiSongRecommendationSchema,
);
