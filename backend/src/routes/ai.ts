/**
 * AI routes for song recommendations via Gemini API
 * @module routes/ai
 */

import { Router, type Request, type Response } from 'express';
import { logger } from '../config/logger.js';
import { checkJwt } from '../config/auth0.js';
import { FocusSessionModel } from '../models/FocusSession.js';
import { AISongRecommendation } from '../models/AISongRecommendation.js';
import { generateSongRecommendation, generateWeeklySummary } from '../services/geminiService.js';
import { analyzeSessionPattern } from '../services/sessionAnalyzer.js';

const router = Router();

/**
 * POST /api/ai/song-recommendation
 * Generate AI-driven song recommendation based on completed session
 * 
 * @route POST /api/ai/song-recommendation
 * @body {sessionId: string} - ID of completed session
 * @returns {AISongRecommendation} - AI-generated song recommendation
 * @access Requires Auth0 authentication
 */
router.post('/song-recommendation', checkJwt, async (req: Request, res: Response) => {
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

		// Check if session is at least 30 seconds (reduced threshold for better UX)
		const sessionDuration = session.totalDurationMinutes || 0;
		if (sessionDuration < 0.5) { // 0.5 minutes = 30 seconds
			return res.status(400).json({
				error: 'Session too short for AI insights',
				message: 'AI recommendations require sessions of at least 30 seconds',
			});
		}

		// Check if recommendation already exists for this session
		const existingRecommendation = await AISongRecommendation.findOne({ sessionId });

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
		const recommendation = await generateSongRecommendation({
			duration: analysis.duration,
			avgTempo: analysis.avgTempo,
			rhythmPattern: analysis.rhythmPattern,
		});

		// Map Gemini mood recommendations to actual song names
		const songMapping: Record<string, 'thousand-years' | 'kiss-the-rain' | 'river-flows' | 'gurenge'> = {
			'deep-focus': 'thousand-years',
			'creative-flow': 'river-flows',
			'calm-reading': 'kiss-the-rain',
			'energized-coding': 'gurenge',
		};

		const mappedSong = songMapping[recommendation.song] || 'thousand-years';

		// Generate unique recommendation ID
		const recommendationId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Save recommendation to database
		const aiRecommendation = new AISongRecommendation({
			recommendationId,
			sessionId,
			suggestedSong: mappedSong,
			rationale: recommendation.rationale,
			confidence: recommendation.confidence,
			geminiModel: 'gemini-2.5-flash',
		});

		await aiRecommendation.save();

		logger.info({
			session_id: sessionId,
			suggested_song: recommendation.song,
			confidence: recommendation.confidence,
		}, 'ai_song_recommendation_created');

		return res.status(201).json(aiRecommendation);
	} catch (error) {
		logger.error({
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		}, 'ai_song_recommendation_error');

		return res.status(500).json({
			error: 'Failed to generate song recommendation',
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
router.get('/weekly-summary', checkJwt, async (_req: Request, res: Response) => {
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
				selectedSong: s.song || 'thousand-years',
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
