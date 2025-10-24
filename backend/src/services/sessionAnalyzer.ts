/**
 * Session pattern analyzer for song recommendations
 * Classifies session rhythm patterns as steady/erratic and tempo as slow/medium/fast
 * @module services/sessionAnalyzer
 */

import { logger } from '../config/logger.js';

/**
 * Session Pattern Analyzer
 * Analyzes typing patterns and suggests optimal songs
 * @module services/sessionAnalyzer
 */

// Remove unused import

/**
 * Rhythm type based on typing pattern
 */
type RhythmType = 'steady' | 'burst' | 'pause-heavy';

/**
 * Session analysis result
 */
export interface SessionAnalysisInput {
	duration: number; // seconds
	totalKeystrokes: number;
	averageBpm: number; // Average BPM for the session
	keystrokeTimestamps?: number[]; // Optional: for rhythm variance analysis
}

/**
 * Analysis result with pattern classification
 */
export interface SessionAnalysisResult {
	duration: number; // seconds (converted)
	averageBpm: number; // Average BPM for the session
	rhythmPattern: 'steady' | 'erratic';
	tempoCategory: 'slow' | 'medium' | 'fast';
	activityLevel: 'low' | 'medium' | 'high';
}

/**
 * Analyzes session to classify rhythm patterns
 * @param sessionData - Raw session metrics
 * @returns Classification result
 */
export function analyzeSessionPattern(sessionData: SessionAnalysisInput): SessionAnalysisResult {
	const durationSeconds = sessionData.duration;
	const avgBpm = sessionData.averageBpm;

	// Classify tempo category based on BPM
	let tempoCategory: 'slow' | 'medium' | 'fast';
	if (avgBpm < 40) {
		tempoCategory = 'slow';
	} else if (avgBpm < 80) {
		tempoCategory = 'medium';
	} else {
		tempoCategory = 'fast';
	}

	// Classify activity level (used for song suggestions)
	let activityLevel: 'low' | 'medium' | 'high';
	if (avgBpm < 40) {
		activityLevel = 'low';
	} else if (avgBpm < 80) {
		activityLevel = 'medium';
	} else {
		activityLevel = 'high';
	}

	// Determine rhythm pattern (steady vs erratic)
	let rhythmPattern: 'steady' | 'erratic' = 'steady'; // Default to steady

	if (sessionData.keystrokeTimestamps && sessionData.keystrokeTimestamps.length > 5) {
		// Calculate coefficient of variation (CV) for rhythm steadiness
		// CV = standard deviation / mean
		// Lower CV = steadier rhythm, Higher CV = more erratic

		const timestamps = sessionData.keystrokeTimestamps;
		const intervals: number[] = [];

		for (let i = 1; i < timestamps.length; i++) {
			intervals.push(timestamps[i] - timestamps[i - 1]);
		}

		if (intervals.length > 0) {
			const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
			const variance =
				intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
			const stdDev = Math.sqrt(variance);
			const cv = mean > 0 ? stdDev / mean : 0;

			// Threshold: CV > 0.6 indicates erratic rhythm
			rhythmPattern = cv > 0.6 ? 'erratic' : 'steady';

			logger.debug({
				cv,
				rhythm_pattern: rhythmPattern,
				interval_count: intervals.length,
			}, 'rhythm_pattern_analysis');
		}
	} else {
		// Fallback: Use keystroke consistency
		// If totalKeystrokes is very low relative to duration, assume erratic
		const expectedKeystrokes = (avgBpm * durationSeconds) / 60; // Rough estimate
		const actualKeystrokes = sessionData.totalKeystrokes;
		const consistency = actualKeystrokes / expectedKeystrokes;

		// If actual keystrokes deviate significantly from expected, mark as erratic
		if (consistency < 0.7 || consistency > 1.3) {
			rhythmPattern = 'erratic';
		}

		logger.debug({
			consistency,
			rhythm_pattern: rhythmPattern,
			expected_keystrokes: expectedKeystrokes,
			actual_keystrokes: actualKeystrokes,
		}, 'rhythm_pattern_fallback');
	}

	return {
		duration: durationSeconds,
		averageBpm: avgBpm,
		rhythmPattern,
		tempoCategory,
		activityLevel,
	};
}

/**
 * Generates song suggestion based on session pattern (rule-based fallback)
 * @param analysis - Session analysis result
 * @returns Suggested song
 */
export /**
 * Maps rhythm patterns to suggested songs
 */
function mapRhythmToSong(
	rhythmType: RhythmType,
	variance: number,
): 'thousand-years' | 'kiss-the-rain' | 'river-flows' | 'gurenge' {
	// Map rhythm patterns to song suggestions
	if (rhythmType === 'steady' && variance < 0.2) {
		// Consistent, focused typing → thousand years (calm, focused)
		return 'thousand-years';
	}

	if (rhythmType === 'burst' && variance < 0.3) {
		// Intense bursts of activity → gurenge (energetic)
		return 'gurenge';
	}

	if (rhythmType === 'steady' && variance >= 0.2 && variance < 0.4) {
		// Moderate, steady work → river flows
		return 'river-flows';
	}

	if (rhythmType === 'burst' && variance >= 0.3) {
		// Varied, contemplative work → kiss the rain
		return 'kiss-the-rain';
	}

	if (rhythmType === 'pause-heavy') {
		return 'thousand-years'; // Thoughtful, grounding
	}

	// Default fallback
	return 'thousand-years';
}
