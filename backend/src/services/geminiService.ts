import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../config/logger.js';

/**
 * Gemini API service for generating AI-powered mood recommendations
 * @module services/geminiService
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generates AI-powered mood insight based on session metrics
 * @param sessionMetrics - Aggregated session data
 * @param sessionMetrics.duration - Session duration in seconds
 * @param sessionMetrics.totalKeystrokes - Total keystrokes during session
 * @param sessionMetrics.averageTempo - Average typing speed (keys/min)
 * @param sessionMetrics.selectedMood - User-selected mood (calm/focus/energy)
 * @param userContext - User's selected mood context
 * @returns Promise resolving to AI-generated insight text
 * @throws {GeminiAPIError} If API call fails after retries
 * @example
 * const insight = await generateMoodInsight({
 *   duration: 900,
 *   totalKeystrokes: 1500,
 *   averageTempo: 100,
 *   selectedMood: 'focus'
 * }, 'focus');
 * console.log(insight); // "Your steady rhythm suggests deep concentration..."
 */
export async function generateMoodInsight(
	sessionMetrics: {
		duration: number;
		totalKeystrokes: number;
		averageTempo: number;
		selectedMood: string;
	},
	_userContext: string // Prefix with underscore to indicate intentionally unused
): Promise<string> {
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

		// Calculate session characteristics
		const sessionMinutes = Math.floor(sessionMetrics.duration / 60);
		const rhythmType =
			sessionMetrics.averageTempo > 80 ? 'energetic' : sessionMetrics.averageTempo > 40 ? 'steady' : 'thoughtful';

		// Few-shot prompt with structured output
		const prompt = `You are an AI focus coach analyzing typing patterns to provide mood recommendations.

Examples:
- Session: 15 min, 1500 keystrokes, 100 keys/min, energetic rhythm → Recommendation: "Your consistent, energetic typing suggests you're in a productive flow state. Continue with the 'energy' mood to maintain this momentum."
- Session: 20 min, 600 keystrokes, 30 keys/min, thoughtful rhythm → Recommendation: "Your slower, deliberate pace indicates deep, thoughtful work. Try the 'calm' mood to support sustained concentration."

Now analyze this session:
- Duration: ${sessionMinutes} minutes
- Keystrokes: ${sessionMetrics.totalKeystrokes}
- Average tempo: ${sessionMetrics.averageTempo} keys/min
- Rhythm: ${rhythmType}
- Current mood: ${sessionMetrics.selectedMood}

Provide a 1-2 sentence mood recommendation for the next session. Be specific and encouraging.`;

		const startTime = Date.now();
		const result = await model.generateContent(prompt);
		const latency = Date.now() - startTime;

		const response = result.response.text();
		logger.info({ latency_ms: latency, response_length: response.length }, 'gemini_mood_recommendation_request');

		// Parse Gemini response
		const jsonMatch = response.match(/\{[\s\S]*"mood"[\s\S]*"rationale"[\s\S]*"confidence"[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('Invalid Gemini response format');
		}

		const parsed = JSON.parse(jsonMatch[0]);

		// Validate parsed response
		const validMoods = ['thousand-years', 'kiss-the-rain', 'river-flows', 'gurenge'];
		if (!validMoods.includes(parsed.mood)) {
			logger.warn({ suggested_mood: parsed.mood }, 'gemini_invalid_mood_suggestion');
			parsed.mood = 'thousand-years'; // Fallback
		}

		return parsed.rationale || parsed.insight || 'Continue with your current focus rhythm.';
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : 'Unknown error',
				session_metrics: sessionMetrics,
			},
			'gemini_api_error',
		);

		// Graceful fallback
		return getFallbackInsight(sessionMetrics.averageTempo);
	}
}

/**
 * Generates fallback insight when Gemini API is unavailable
 * @param averageTempo - Average typing speed
 * @returns Generic productivity tip based on tempo
 */
function getFallbackInsight(averageTempo: number): string {
	if (averageTempo > 80) {
		return 'Your productive energy is strong! Consider taking a short break to maintain this momentum.';
	}
	if (averageTempo > 40) {
		return 'You maintained a steady work rhythm. Consistent pacing helps sustain focus over longer sessions.';
	}
	return 'Thoughtful, deliberate work often produces the best results. Keep up the deep focus!';
}

/**
 * Simple hash function for logging (not cryptographic)
 * @param str - String to hash
 * @returns Hash string
 */
function hashString(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(16);
}

/**
 * Generates weekly focus pattern summary from multiple sessions
 * @param sessions - Array of session data
 * @returns Promise resolving to weekly summary text
 */
export async function generateWeeklySummary(
	sessions: Array<{
		duration: number;
		averageTempo: number;
		selectedMood: string;
	}>
): Promise<string> {
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

		const totalMinutes = sessions.reduce((sum, s) => sum + s.duration / 60, 0);
		const avgTempo = sessions.reduce((sum, s) => sum + s.averageTempo, 0) / sessions.length;
		const moodCounts = sessions.reduce(
			(acc, s) => {
				acc[s.selectedMood] = (acc[s.selectedMood] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);

		const prompt = `Analyze this week's focus sessions and provide a brief summary with actionable insights.

Sessions: ${sessions.length} total
Total time: ${Math.floor(totalMinutes)} minutes
Average tempo: ${Math.floor(avgTempo)} keys/min
Mood preferences: ${Object.entries(moodCounts)
			.map(([mood, count]) => `${mood}: ${count}`)
			.join(', ')}

Provide a 2-3 sentence summary highlighting patterns and suggesting improvements. Be specific and encouraging.`;

		const result = await model.generateContent(prompt);
		const summary = result.response.text();

		logger.info({
			sessions_analyzed: sessions.length,
			total_minutes: Math.floor(totalMinutes),
		}, 'gemini_weekly_summary');

		return summary.trim();
	} catch (error) {
		logger.error({
			error: error instanceof Error ? error.message : 'Unknown error',
		}, 'gemini_weekly_summary_error');

		return `You completed ${sessions.length} focus sessions this week, totaling ${Math.floor(
			sessions.reduce((sum, s) => sum + s.duration / 60, 0)
		)} minutes of focused work. Keep building this habit!`;
	}
}

/**
 * Generates structured mood recommendation with JSON output (T111)
 * @param sessionData - Session rhythm pattern data
 * @returns Promise resolving to mood recommendation with rationale and confidence
 */
export async function generateMoodRecommendation(sessionData: {
	duration: number;
	avgTempo: number;
	rhythmPattern: 'steady' | 'erratic';
}): Promise<{ mood: string; rationale: string; confidence: number }> {
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

		// Few-shot prompt with structured JSON output
		const prompt = `You are a focus productivity coach analyzing typing rhythm patterns. Based on the session data below, suggest a mood for the next focus session and explain why.

Mood options: deep-focus, creative-flow, calm-reading, energized-coding

Examples:
Input: 20 min, 100 keys/min, steady
Output: {"mood": "energized-coding", "rationale": "Your consistent high-speed rhythm indicates strong focus momentum. Energized coding mode will maintain this flow state.", "confidence": 0.85}

Input: 15 min, 40 keys/min, erratic
Output: {"mood": "calm-reading", "rationale": "Your slower, thoughtful rhythm suggests deep contemplation. Calm reading mode will support sustained concentration.", "confidence": 0.78}

Input: 12 min, 75 keys/min, steady
Output: {"mood": "creative-flow", "rationale": "Your moderate, steady rhythm suggests balanced productivity. Creative flow mode will nurture sustained inspiration.", "confidence": 0.82}

Now analyze this session:
- Duration: ${sessionData.duration} minutes
- Average Typing Speed: ${sessionData.avgTempo} keystrokes/min
- Rhythm Pattern: ${sessionData.rhythmPattern}

Respond ONLY with valid JSON: {"mood": "deep-focus|creative-flow|calm-reading|energized-coding", "rationale": "string", "confidence": 0.0-1.0}`;

		const startTime = Date.now();
		const result = await model.generateContent(prompt);
		const latency = Date.now() - startTime;

		const response = result.response.text();

		// Extract JSON from response (Gemini sometimes adds markdown formatting)
		const jsonMatch = response.match(/\{[^}]+\}/);
		if (!jsonMatch) {
			throw new Error('No JSON in Gemini response');
		}

		const insight = JSON.parse(jsonMatch[0]);

		// Validate response structure
		if (!insight.mood || !insight.rationale || typeof insight.confidence !== 'number') {
			throw new Error('Invalid Gemini response structure');
		}

		// Log prompt/response for transparency (Constitution principle II)
		logger.info({
			prompt_hash: hashString(prompt),
			suggested_mood: insight.mood,
			confidence: insight.confidence,
			latency_ms: latency,
			model: 'gemini-2.5-flash',
			session_duration_min: sessionData.duration,
			rhythm_pattern: sessionData.rhythmPattern,
		}, 'gemini_mood_recommendation');

		return insight;
	} catch (error) {
		logger.error({
			error: error instanceof Error ? error.message : 'Unknown error',
			session_data: sessionData,
		}, 'gemini_mood_recommendation_error');

		// Graceful fallback (Constitution principle II: fail-safe)
		return {
			mood: 'deep-focus',
			rationale: 'AI insights temporarily unavailable. Try deep focus mode for balanced concentration.',
			confidence: 0.5,
		};
	}
}
