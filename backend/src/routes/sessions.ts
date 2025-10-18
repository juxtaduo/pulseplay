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

export default router;
