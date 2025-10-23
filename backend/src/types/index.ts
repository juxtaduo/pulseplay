/**
 * Shared type definitions for PulsePlay backend
 * @module types
 */

/**
 * Valid song types for focus sessions
 */
export type Song =
	| 'thousand-years'
	| 'kiss-the-rain'
	| 'river-flows'
	| 'gurenge';

/**
 * Rhythm types based on typing pattern analysis
 */
export type RhythmType = 'energetic' | 'steady' | 'thoughtful';

/**
 * Session state
 */
export type SessionState = 'active' | 'paused' | 'completed';

/**
 * Rhythm sample data point
 */
export interface RhythmSample {
	timestamp: Date;
	keysPerMinute: number;
	intensity: number;
}

/**
 * Aggregated rhythm data for a session
 */
export interface RhythmData {
	averageKeysPerMinute: number;
	rhythmType: RhythmType;
	peakIntensity: number;
	samples: RhythmSample[];
}

/**
 * Focus session data structure
 */
export interface FocusSession {
	sessionId: string;
	userIdHash: string;
	song: Song;
	startTime: Date;
	endTime: Date | null;
	totalDurationMinutes: number | null;
	keystrokeCount: number;
	averageTempo: number;
	averageBpm: number; // Average BPM for the entire session
	rhythmData: RhythmData;
	state: SessionState;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * AI song recommendation
 */
export interface AISongRecommendation {
	sessionId: string;
	suggestedSong: Song;
	rationale: string;
	confidence: number;
	createdAt: Date;
}

/**
 * Song insight data structure
 */
export interface SongInsight {
	sessionId: string;
	userIdHash: string;
	song: Song;
	insight: string;
	generatedAt: Date;
	promptHash: string;
	modelUsed: string;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * User preferences data structure
 */
export interface UserPreferences {
	userIdHash: string;
	preferredSongs: Song[];
	rhythmPreferences: RhythmType[];
	favoriteTempos: number[];
	preferredInstruments: string[];
	volumeLevel: number;
	enableVisualizations: boolean;
	sessionGoalMinutes: number;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * API Error structure
 */
export interface APIError {
	error: string;
	code?: string;
	message: string;
	details?: unknown;
	statusCode?: number;
}

/**
 * Weekly summary statistics
 */
export interface WeeklySummary {
	userIdHash: string;
	weekStart: Date;
	weekEnd: Date;
	totalSessions: number;
	totalMinutes: number;
	averageSessionMinutes: number;
	dominantSong: Song;
	songDistribution: Record<Song, number>;
	rhythmInsights: string;
	createdAt: Date;
}
