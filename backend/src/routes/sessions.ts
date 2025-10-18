import express, { type Request, type Response } from 'express';
import { checkJwt, getUserIdFromToken } from '../config/auth0.js';
import {
	createSession,
	getSessionById,
	getSessionsByUser,
	updateSession,
	deleteSession,
} from '../services/sessionService.js';
import { hashSHA256 } from '../utils/crypto.js';
import { logger } from '../config/logger.js';
import type { Mood, SessionState } from '../types/index.js';

const router = express.Router();

/**
 * POST /api/sessions
 * Create a new focus session
 */
router.post('/', checkJwt, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);
		const { mood } = req.body as { mood: Mood };

		// Validate mood
		const validMoods: Mood[] = ['deep-focus', 'creative-flow', 'calm-reading', 'energized-coding'];
		if (!mood || !validMoods.includes(mood)) {
			return res.status(400).json({
				error: 'Invalid mood',
				message: 'Mood must be one of: deep-focus, creative-flow, calm-reading, energized-coding',
			});
		}

		const session = await createSession({ userIdHash, mood });

		logger.info(
			{ sessionId: session._id.toString(), mood },
			'session_created_via_api',
		);

		return res.status(201).json(session.toJSON());
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			'session_creation_api_error',
		);
		return res.status(500).json({
			error: 'Session creation failed',
			message: 'An error occurred while creating the session',
		});
	}
});

/**
 * GET /api/sessions/:id
 * Get a specific session by ID
 */
router.get('/:id', checkJwt, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);

		const session = await getSessionById(id);

		if (!session) {
			return res.status(404).json({
				error: 'Session not found',
				message: `Session with ID ${id} does not exist`,
			});
		}

		// Verify ownership
		if (session.userIdHash !== userIdHash) {
			logger.warn(
				{ sessionId: id, requestedBy: userIdHash },
				'unauthorized_session_access_attempt',
			);
			return res.status(403).json({
				error: 'Forbidden',
				message: 'You do not have permission to access this session',
			});
		}

		return res.json(session.toJSON());
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				sessionId: req.params.id,
			},
			'session_retrieval_api_error',
		);
		return res.status(500).json({
			error: 'Session retrieval failed',
			message: 'An error occurred while retrieving the session',
		});
	}
});

/**
 * GET /api/sessions
 * Get all sessions for the authenticated user
 */
router.get('/', checkJwt, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);
		const limit = Number.parseInt(req.query.limit as string, 10) || 10;

		const sessions = await getSessionsByUser(userIdHash, limit);

		return res.json({
			sessions: sessions.map((s) => s.toJSON()),
			count: sessions.length,
		});
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			'sessions_list_api_error',
		);
		return res.status(500).json({
			error: 'Sessions retrieval failed',
			message: 'An error occurred while retrieving sessions',
		});
	}
});

/**
 * PUT /api/sessions/:id
 * Update a session (state, endTime, rhythmData)
 */
router.put('/:id', checkJwt, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);

		// Verify ownership first
		const existingSession = await getSessionById(id);
		if (!existingSession) {
			return res.status(404).json({
				error: 'Session not found',
				message: `Session with ID ${id} does not exist`,
			});
		}

		if (existingSession.userIdHash !== userIdHash) {
			logger.warn(
				{ sessionId: id, requestedBy: userIdHash },
				'unauthorized_session_update_attempt',
			);
			return res.status(403).json({
				error: 'Forbidden',
				message: 'You do not have permission to update this session',
			});
		}

		// Extract update fields
		const { state, endTime, rhythmData } = req.body;

		// Validate state if provided
		if (state) {
			const validStates: SessionState[] = ['active', 'paused', 'completed'];
			if (!validStates.includes(state)) {
				return res.status(400).json({
					error: 'Invalid state',
					message: 'State must be one of: active, paused, completed',
				});
			}
		}

		const updatedSession = await updateSession(id, {
			state,
			endTime: endTime ? new Date(endTime) : undefined,
			rhythmData,
		});

		if (!updatedSession) {
			return res.status(404).json({
				error: 'Session not found',
				message: `Session with ID ${id} does not exist`,
			});
		}

		logger.info({ sessionId: id, updates: Object.keys(req.body) }, 'session_updated_via_api');

		return res.json(updatedSession.toJSON());
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				sessionId: req.params.id,
			},
			'session_update_api_error',
		);
		return res.status(500).json({
			error: 'Session update failed',
			message: 'An error occurred while updating the session',
		});
	}
});

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);

		// Verify ownership first
		const existingSession = await getSessionById(id);
		if (!existingSession) {
			return res.status(404).json({
				error: 'Session not found',
				message: `Session with ID ${id} does not exist`,
			});
		}

		if (existingSession.userIdHash !== userIdHash) {
			logger.warn(
				{ sessionId: id, requestedBy: userIdHash },
				'unauthorized_session_deletion_attempt',
			);
			return res.status(403).json({
				error: 'Forbidden',
				message: 'You do not have permission to delete this session',
			});
		}

		const deleted = await deleteSession(id);

		if (!deleted) {
			return res.status(404).json({
				error: 'Session not found',
				message: `Session with ID ${id} does not exist`,
			});
		}

		logger.info({ sessionId: id }, 'session_deleted_via_api');

		return res.status(204).send();
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				sessionId: req.params.id,
			},
			'session_deletion_api_error',
		);
		return res.status(500).json({
			error: 'Session deletion failed',
			message: 'An error occurred while deleting the session',
		});
	}
});

/**
 * GET /api/sessions/history
 * Get paginated session history for authenticated user (T132)
 * 
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20, max: 100)
 * @query {string} mood - Filter by mood (optional)
 * @query {string} sortBy - Sort field (default: createdAt)
 * @query {string} order - Sort order: asc/desc (default: desc)
 * @returns {sessions: Session[], total: number, page: number, totalPages: number}
 */
router.get('/history', checkJwt, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);

		// Parse query parameters
		const page = Math.max(1, parseInt(req.query.page as string) || 1);
		const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
		const mood = req.query.mood as Mood | undefined;
		const sortBy = (req.query.sortBy as string) || 'createdAt';
		const order = (req.query.order as string) === 'asc' ? 1 : -1;

		// Validate mood filter if provided
		const validMoods: Mood[] = ['deep-focus', 'creative-flow', 'calm-reading', 'energized-coding'];
		if (mood && !validMoods.includes(mood)) {
			return res.status(400).json({
				error: 'Invalid mood filter',
				message: `Mood must be one of: ${validMoods.join(', ')}`,
			});
		}

		// Build query filter
		const filter: Record<string, unknown> = { userIdHash };
		if (mood) {
			filter.mood = mood;
		}

		// Get sessions with pagination
		const sessions = await getSessionsByUser(userIdHash);
		
		// Filter by mood if specified
		const filteredSessions = mood 
			? sessions.filter(s => s.mood === mood)
			: sessions;

		// Sort sessions
		const sortedSessions = [...filteredSessions].sort((a, b) => {
			const aVal = (a as any)[sortBy];
			const bVal = (b as any)[sortBy];
			if (aVal < bVal) return -order;
			if (aVal > bVal) return order;
			return 0;
		});

		// Paginate
		const skip = (page - 1) * limit;
		const paginatedSessions = sortedSessions.slice(skip, skip + limit);
		const total = sortedSessions.length;
		const totalPages = Math.ceil(total / limit);

		logger.info({
			userIdHash,
			page,
			limit,
			mood: mood || 'all',
			total,
		}, 'session_history_retrieved');

		return res.status(200).json({
			sessions: paginatedSessions.map(s => s.toJSON()),
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		});
	} catch (error) {
		logger.error({
			error: error instanceof Error ? error.message : String(error),
		}, 'session_history_api_error');
		return res.status(500).json({
			error: 'Failed to retrieve session history',
			message: 'An error occurred while fetching your session history',
		});
	}
});

/**
 * GET /api/sessions/export
 * Export all user sessions as JSON (T133)
 * Returns all session data with no PII (userIdHash is SHA-256)
 * 
 * @returns {sessions: Session[], exportedAt: string, totalSessions: number}
 */
router.get('/export', checkJwt, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);

		// Get all sessions for user
		const sessions = await getSessionsByUser(userIdHash);

		// Export format with metadata
		const exportData = {
			exportedAt: new Date().toISOString(),
			totalSessions: sessions.length,
			sessions: sessions.map(s => s.toJSON()),
		};

		logger.info({
			userIdHash,
			totalSessions: sessions.length,
		}, 'session_data_exported');

		// Set headers for file download
		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Disposition', `attachment; filename="pulseplay-sessions-${Date.now()}.json"`);

		return res.status(200).json(exportData);
	} catch (error) {
		logger.error({
			error: error instanceof Error ? error.message : String(error),
		}, 'session_export_api_error');
		return res.status(500).json({
			error: 'Failed to export session data',
			message: 'An error occurred while exporting your sessions',
		});
	}
});

/**
 * DELETE /api/sessions/all
 * Delete all user sessions (right to be forgotten) (T134)
 * 
 * @returns {deletedCount: number, message: string}
 */
router.delete('/all', checkJwt, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);

		// Get all sessions to count before deletion
		const sessions = await getSessionsByUser(userIdHash);
		const sessionIds = sessions.map(s => s._id.toString());

		// Delete all sessions for this user
		let deletedCount = 0;
		for (const sessionId of sessionIds) {
			const deleted = await deleteSession(sessionId);
			if (deleted) deletedCount++;
		}

		logger.info({
			userIdHash,
			deletedCount,
		}, 'all_sessions_deleted');

		return res.status(200).json({
			deletedCount,
			message: `Successfully deleted ${deletedCount} session(s)`,
		});
	} catch (error) {
		logger.error({
			error: error instanceof Error ? error.message : String(error),
		}, 'delete_all_sessions_api_error');
		return res.status(500).json({
			error: 'Failed to delete sessions',
			message: 'An error occurred while deleting your sessions',
		});
	}
});

export default router;
