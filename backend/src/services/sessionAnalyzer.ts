/**
 * Session pattern analyzer for mood recommendations
 * Classifies session rhythm patterns as steady/erratic and tempo as slow/medium/fast
 * @module services/sessionAnalyzer
 */

import { logger } from '../config/logger.js';

/**
 * Session data for analysis
 */
export interface SessionAnalysisInput {
	duration: number; // seconds
	totalKeystrokes: number;
	averageTempo: number; // keys/min
	keystrokeTimestamps?: number[]; // Optional: for rhythm variance analysis
}

/**
 * Analysis result with pattern classification
 */
export interface SessionAnalysisResult {
	duration: number; // minutes (converted)
	avgTempo: number; // keys/min
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
	const durationMinutes = Math.floor(sessionData.duration / 60);
	const avgTempo = sessionData.averageTempo;

	// Classify tempo category
	let tempoCategory: 'slow' | 'medium' | 'fast';
	if (avgTempo < 40) {
		tempoCategory = 'slow';
	} else if (avgTempo < 80) {
		tempoCategory = 'medium';
	} else {
		tempoCategory = 'fast';
	}

	// Classify activity level (used for mood suggestions)
	let activityLevel: 'low' | 'medium' | 'high';
	if (avgTempo < 40) {
		activityLevel = 'low';
	} else if (avgTempo < 80) {
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
		// Fallback: Use average tempo consistency
		// If totalKeystrokes is very low relative to duration, assume erratic
		const expectedKeystrokes = (avgTempo * durationMinutes);
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
		duration: durationMinutes,
		avgTempo,
		rhythmPattern,
		tempoCategory,
		activityLevel,
	};
}

/**
 * Generates mood suggestion based on session pattern (rule-based fallback)
 * @param analysis - Session analysis result
 * @returns Suggested mood
 */
export function suggestMoodFromPattern(
	analysis: SessionAnalysisResult
): 'deep-focus' | 'creative-flow' | 'calm-reading' | 'energized-coding' {
	const { rhythmPattern, tempoCategory, activityLevel } = analysis;

	// Rule-based mood mapping
	if (activityLevel === 'high' && rhythmPattern === 'steady') {
		return 'energized-coding'; // Fast, steady = high productivity flow
	}

	if (activityLevel === 'low' && rhythmPattern === 'steady') {
		return 'calm-reading'; // Slow, steady = deep contemplation
	}

	if (activityLevel === 'medium' && rhythmPattern === 'steady') {
		return 'creative-flow'; // Moderate, steady = balanced creativity
	}

	if (rhythmPattern === 'erratic' && tempoCategory === 'slow') {
		return 'calm-reading'; // Erratic slow = need calmness
	}

	if (rhythmPattern === 'erratic' && tempoCategory === 'fast') {
		return 'deep-focus'; // Erratic fast = need grounding
	}

	// Default: deep focus (most balanced option)
	return 'deep-focus';
}
