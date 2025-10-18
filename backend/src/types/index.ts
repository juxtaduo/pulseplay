/**
 * Shared TypeScript types for PulsePlay AI
 * @module types
 */

/**
 * User mood categories
 */
export type Mood = 'deep-focus' | 'creative-flow' | 'calm-reading' | 'energized-coding';

/**
 * Typing rhythm classifications
 */
export type RhythmType = 'energetic' | 'steady' | 'thoughtful';

/**
 * Focus session state
 */
export type SessionState = 'active' | 'paused' | 'completed';

/**
 * Focus session data structure
 */
export interface FocusSession {
	sessionId: string;
	userIdHash: string; // SHA-256 hash of Auth0 user ID
	mood: Mood;
	startTime: Date;
	endTime?: Date;
	totalDurationMinutes?: number;
	rhythmData: RhythmData;
	state: SessionState;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Rhythm metrics captured during a session
 */
export interface RhythmData {
	averageKeysPerMinute: number;
	rhythmType: RhythmType;
	peakIntensity: number; // 0-1 scale
	samples: RhythmSample[];
}

/**
 * Individual rhythm measurement
 */
export interface RhythmSample {
	timestamp: Date;
	keysPerMinute: number;
	intensity: number; // 0-1 scale
}

/**
 * User preferences for music generation
 */
export interface UserPreferences {
	userIdHash: string;
	favoriteTempos: number[];
	preferredInstruments: string[];
	volumeLevel: number; // 0-1 scale
	enableVisualizations: boolean;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * AI-generated mood insight
 */
export interface MoodInsight {
	sessionId: string;
	insight: string;
	generatedAt: Date;
	promptHash: string;
	modelUsed: string;
}

/**
 * Weekly summary data
 */
export interface WeeklySummary {
	userIdHash: string;
	weekStartDate: Date;
	totalSessions: number;
	totalMinutes: number;
	dominantMood: Mood;
	averageKeysPerMinute: number;
	summary: string;
	generatedAt: Date;
}

/**
 * WebSocket message types
 */
export enum WSMessageType {
	RHYTHM_UPDATE = 'rhythm_update',
	SESSION_START = 'session_start',
	SESSION_PAUSE = 'session_pause',
	SESSION_RESUME = 'session_resume',
	SESSION_END = 'session_end',
	ERROR = 'error',
	PING = 'ping',
	PONG = 'pong',
}

/**
 * WebSocket message structure
 */
export interface WSMessage {
	type: WSMessageType;
	payload?: any;
	timestamp: Date;
}

/**
 * API error response
 */
export interface APIError {
	error: string;
	message: string;
	details?: any;
}

/**
 * Audio synthesis parameters
 */
export interface AudioParams {
	baseFrequency: number; // Hz
	tempo: number; // BPM
	volume: number; // 0-1
	waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

/**
 * Session creation request
 */
export interface CreateSessionRequest {
	mood: Mood;
}

/**
 * Session update request
 */
export interface UpdateSessionRequest {
	state?: SessionState;
	rhythmData?: Partial<RhythmData>;
}
