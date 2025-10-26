import express, { type Request, type Response } from 'express';
import { checkJwt, getUserIdFromToken } from '../config/auth0.js';
import { logger } from '../config/logger.js';
import {
	createSession,
	deleteSession,
	getSessionById,
	getSessionsByUser,
	updateSession,
} from '../services/sessionService.js';
import type { SessionState, Song } from '../types/index.js';
import { hashSHA256 } from '../utils/crypto.js';

const router = express.Router();

/**
 * POST /api/sessions
 * Create a new focus session
 */
router.post('/', checkJwt, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);
		const { song } = req.body as { song: Song };

		// Validate song
		const validSongs: Song[] = ['thousand-years', 'kiss-the-rain', 'river-flows', 'gurenge'];
		if (!song || !validSongs.includes(song)) {
			return res.status(400).json({
				error: 'Invalid song',
				message: `Song must be one of: ${validSongs.join(', ')}`,
			});
		}

		const session = await createSession({ userIdHash, song });

		logger.info({ sessionId: session._id.toString(), song }, 'session_created_via_api');

		return res.status(201).json({ session: session.toJSON() });
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			'session_creation_api_error'
		);
		return res.status(500).json({
			error: 'Session creation failed',
			message: 'An error occurred while creating the session',
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
			'sessions_list_api_error'
		);
		return res.status(500).json({
			error: 'Sessions retrieval failed',
			message: 'An error occurred while retrieving sessions',
		});
	}
});

/**
 * GET /api/sessions/history
 * Get paginated session history for authenticated user (T132)
 *
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20, max: 100)
 * @query {string} song - Filter by song (optional)
 * @query {string} sortBy - Sort field (default: createdAt)
 * @query {string} order - Sort order: asc/desc (default: desc)
 * @returns {sessions: Session[], total: number, page: number, totalPages: number}
 */
router.get('/history', checkJwt, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);

		// Parse query parameters
		const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
		const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
		const song = req.query.song as Song | undefined;
		const sortBy = (req.query.sortBy as string) || 'createdAt';
		const order = (req.query.order as string) === 'asc' ? 1 : -1;

		// Validate song filter if provided
		const validSongs: Song[] = ['thousand-years', 'kiss-the-rain', 'river-flows', 'gurenge'];
		if (song && !validSongs.includes(song as Song)) {
			return res.status(400).json({
				error: 'Invalid song filter',
				message: `Song must be one of: ${validSongs.join(', ')}`,
			});
		}

		// Build query filter
		const filter: Record<string, unknown> = { userIdHash };
		if (song) {
			filter.song = song;
		}

		// Get sessions with pagination
		const allSessions = await getSessionsByUser(userIdHash);

		// Filter by song if specified
		const filteredSessions = song ? allSessions.filter((s) => s.song === song) : allSessions;

		// Sort sessions
		const sortedSessions = [...filteredSessions].sort((a, b) => {
			const aVal = (a as unknown as Record<string, unknown>)[sortBy];
			const bVal = (b as unknown as Record<string, unknown>)[sortBy];
			if (String(aVal) < String(bVal)) return -order;
			if (String(aVal) > String(bVal)) return order;
			return 0;
		});

		// Paginate
		const skip = (page - 1) * limit;
		const paginatedSessions = sortedSessions.slice(skip, skip + limit);
		const total = sortedSessions.length;
		const totalPages = Math.ceil(total / limit);

		// Calculate duration for sessions that don't have it stored
		const sessionsWithDuration = paginatedSessions.map((session) => {
			const sessionJson = session.toJSON();

			// If totalDurationSeconds is already set, use it (now comes from frontend for completed sessions)
			if (sessionJson.totalDurationSeconds) {
				return sessionJson;
			}

			// For active/paused sessions without stored duration, calculate from startTime to now
			const now = new Date();
			const durationMs = now.getTime() - session.startTime.getTime();
			sessionJson.totalDurationSeconds = Math.round(durationMs / 1000);

			return sessionJson;
		});

		logger.info(
			{
				userIdHash,
				page,
				limit,
				song: song || 'all',
				total,
			},
			'session_history_retrieved'
		);

		return res.status(200).json({
			sessions: sessionsWithDuration,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		});
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
			},
			'session_history_api_error'
		);
		return res.status(500).json({
			error: 'Failed to retrieve session history',
			message: 'An error occurred while fetching your session history',
		});
	}
});

/**
 * GET /api/sessions/export
 * Export user sessions as JSON (T133)
 * Returns session data with no PII (userIdHash is SHA-256)
 *
 * @query {string} sessionIds - Comma-separated list of session IDs to export (optional)
 * @returns {sessions: Session[], exportedAt: string, totalSessions: number}
 */
router.get('/export', checkJwt, async (req: Request, res: Response) => {
	try {
		const userId = getUserIdFromToken(req);
		const userIdHash = hashSHA256(userId);

		// Get all sessions for user
		const allSessions = await getSessionsByUser(userIdHash);

		// Clean up old active sessions (auto-complete sessions that have been active too long)
		const now = new Date();
		const SESSION_TIMEOUT_MINUTES = 30; // 30 minutes
		const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000;

		let cleanedUpCount = 0;
		for (const session of allSessions) {
			if (session.state === 'active') {
				const sessionAgeMs = now.getTime() - session.startTime.getTime();
				if (sessionAgeMs > timeoutMs) {
					// Session has been active too long, mark as completed
					try {
						const durationSeconds = Math.round(sessionAgeMs / 1000);
						await updateSession(session._id.toString(), {
							state: 'completed',
							totalDurationSeconds: durationSeconds,
							endTime: now,
						});
						session.state = 'completed';
						session.totalDurationSeconds = durationSeconds;
						session.endTime = now;
						cleanedUpCount++;
						logger.info(
							{
								sessionId: session._id.toString(),
								sessionAgeMinutes: Math.round(sessionAgeMs / (60 * 1000)),
								durationSeconds,
							},
							'auto_completed_abandoned_session'
						);
					} catch (cleanupError) {
						logger.error(
							{
								sessionId: session._id.toString(),
								error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
							},
							'failed_to_auto_complete_session'
						);
					}
				}
			}
		}

		if (cleanedUpCount > 0) {
			logger.info({ userIdHash, cleanedUpCount }, 'auto_completed_abandoned_sessions');
		}

		// Filter by sessionIds if provided
		let sessionsToExport = allSessions;
		const sessionIdsParam = req.query.sessionIds as string;
		if (sessionIdsParam) {
			const requestedIds = sessionIdsParam.split(',').map((id) => id.trim());
			sessionsToExport = allSessions.filter((session) =>
				requestedIds.includes(session._id.toString())
			);
		}

		// Export format with metadata
		const exportData = {
			exportedAt: new Date().toISOString(),
			totalSessions: sessionsToExport.length,
			sessions: sessionsToExport.map((s) => s.toJSON()),
		};

		logger.info(
			{
				userIdHash,
				totalSessions: sessionsToExport.length,
				filtered: !!sessionIdsParam,
			},
			'session_data_exported'
		);

		// Set headers for file download
		res.setHeader('Content-Type', 'application/json');
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="pulseplay-sessions-${Date.now()}.json"`
		);

		return res.status(200).json(exportData);
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
			},
			'session_export_api_error'
		);
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
		const sessionIds = sessions.map((s) => s._id.toString());

		// Delete all sessions for this user
		let deletedCount = 0;
		for (const sessionId of sessionIds) {
			const deleted = await deleteSession(sessionId);
			if (deleted) deletedCount++;
		}

		logger.info(
			{
				userIdHash,
				deletedCount,
			},
			'all_sessions_deleted'
		);

		return res.status(200).json({
			deletedCount,
			message: `Successfully deleted ${deletedCount} session(s)`,
		});
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
			},
			'delete_all_sessions_api_error'
		);
		return res.status(500).json({
			error: 'Failed to delete sessions',
			message: 'An error occurred while deleting your sessions',
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
				'unauthorized_session_access_attempt'
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
			'session_retrieval_api_error'
		);
		return res.status(500).json({
			error: 'Session retrieval failed',
			message: 'An error occurred while retrieving the session',
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
				'unauthorized_session_update_attempt'
			);
			return res.status(403).json({
				error: 'Forbidden',
				message: 'You do not have permission to update this session',
			});
		}

		// Extract update fields
		const { state, endTime, rhythmData, keystrokeCount, averageBpm, totalDurationSeconds } =
			req.body;

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
			keystrokeCount,
			averageBpm,
			totalDurationSeconds,
		});

		if (!updatedSession) {
			return res.status(404).json({
				error: 'Session not found',
				message: `Session with ID ${id} does not exist`,
			});
		}

		logger.info({ sessionId: id, updates: Object.keys(req.body) }, 'session_updated_via_api');

		return res.json({ session: updatedSession.toJSON() });
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				sessionId: req.params.id,
			},
			'session_update_api_error'
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
				'unauthorized_session_deletion_attempt'
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
			'session_deletion_api_error'
		);
		return res.status(500).json({
			error: 'Session deletion failed',
			message: 'An error occurred while deleting the session',
		});
	}
});

export default router;
