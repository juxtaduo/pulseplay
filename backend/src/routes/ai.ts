/**
 * AI routes for mood recommendations via Gemini API
 * @module routes/ai
 */

import { Router, type Request, type Response } from 'express';
import { logger } from '../config/logger.js';
import { FocusSessionModel } from '../models/FocusSession.js';
import { AIMoodRecommendation } from '../models/AIMoodRecommendation.js';
import { generateMoodRecommendation, generateWeeklySummary } from '../services/geminiService.js';
import { analyzeSessionPattern } from '../services/sessionAnalyzer.js';

const router = Router();

/**
 * POST /api/ai/mood-recommendation
 * Generate AI-driven mood recommendation based on completed session
 * 
 * @route POST /api/ai/mood-recommendation
 * @body {sessionId: string} - ID of completed session
 * @returns {AIMoodRecommendation} - AI-generated mood recommendation
 * @access Requires Auth0 authentication
 */
router.post('/mood-recommendation', async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.body;

		if (!sessionId) {
			return res.status(400).json({ error: 'Session ID is required' });
		}

		// Retrieve session from database
		const session = await FocusSessionModel.findOne({ _id: sessionId }).exec();

		if (!session) {
			return res.status(404).json({ error: 'Session not found' });
		}

		// Check if session is at least 1 minute (T117 - reduced threshold)
		const sessionDuration = session.totalDurationMinutes || 0;
		if (sessionDuration < 1) {
			return res.status(400).json({
				error: 'Session too short for AI insights',
				message: 'AI recommendations require sessions of at least 1 minute',
			});
		}

		// Check if recommendation already exists for this session
		const existingRecommendation = await AIMoodRecommendation.findOne({ sessionId });

		if (existingRecommendation) {
			logger.info({ session_id: sessionId }, 'returning_existing_recommendation');
			return res.status(200).json(existingRecommendation);
		}

		// Analyze session pattern (T113)
		const sessionDurationSeconds = sessionDuration * 60; // Convert to seconds
		const averageTempo = session.rhythmData.averageKeysPerMinute || 0;
		const totalKeystrokes = Math.round((averageTempo * sessionDuration)); // Estimate from average tempo
		
		const analysis = analyzeSessionPattern({
			duration: sessionDurationSeconds,
			totalKeystrokes,
			averageTempo,
		});

		// Generate Gemini AI recommendation (T111)
		const recommendation = await generateMoodRecommendation({
			duration: analysis.duration,
			avgTempo: analysis.avgTempo,
			rhythmPattern: analysis.rhythmPattern,
		});

		// Save recommendation to database
		const aiRecommendation = new AIMoodRecommendation({
			sessionId,
			suggestedMood: recommendation.mood,
			rationale: recommendation.rationale,
			confidence: recommendation.confidence,
			geminiModel: 'gemini-2.5-flash',
		});

		await aiRecommendation.save();

		logger.info({
			session_id: sessionId,
			suggested_mood: recommendation.mood,
			confidence: recommendation.confidence,
		}, 'ai_mood_recommendation_created');

		return res.status(201).json(aiRecommendation);
	} catch (error) {
		logger.error({
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		}, 'ai_mood_recommendation_error');

		return res.status(500).json({
			error: 'Failed to generate mood recommendation',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
});

/**
 * GET /api/ai/weekly-summary
 * Generate weekly focus pattern summary from recent sessions
 * 
 * @route GET /api/ai/weekly-summary
 * @query {userId?: string} - User ID (optional, defaults to authenticated user)
 * @returns {summary: string} - AI-generated weekly summary
 * @access Requires Auth0 authentication
 */
router.get('/weekly-summary', async (_req: Request, res: Response) => {
	try {
		// Get sessions from last 7 days
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		// Note: In production, filter by authenticated userId from req.user
		const sessions = await FocusSessionModel.find({
			createdAt: { $gte: sevenDaysAgo },
			endTime: { $ne: null }, // Only completed sessions
		})
			.sort({ createdAt: -1 })
			.limit(20); // Limit to 20 most recent sessions

		if (sessions.length < 5) {
			return res.status(400).json({
				error: 'Insufficient data',
				message: 'Weekly summary requires at least 5 completed sessions',
			});
		}

		// Map sessions to metrics format expected by Gemini
		const sessionData = sessions.map((s) => {
			return {
				duration: (s.totalDurationMinutes || 0) * 60,
				totalKeystrokes: s.keystrokeCount || 0,
				averageTempo: s.averageTempo || 0,
				selectedMood: s.mood || 'thousand-years',
			};
		});

		// Generate weekly summary via Gemini
		const summary = await generateWeeklySummary(sessionData);

		logger.info({
			sessions_analyzed: sessions.length,
		}, 'weekly_summary_generated');

		return res.status(200).json({
			summary,
			sessionsAnalyzed: sessions.length,
			periodStart: sevenDaysAgo.toISOString(),
			periodEnd: new Date().toISOString(),
		});
	} catch (error) {
		logger.error({
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		}, 'weekly_summary_error');

		return res.status(500).json({
			error: 'Failed to generate weekly summary',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
});

export default router;
