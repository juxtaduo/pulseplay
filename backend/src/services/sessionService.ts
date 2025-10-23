import { FocusSessionModel, type FocusSessionDocument } from '../models/FocusSession.js';
import { logger } from '../config/logger.js';
import type { Song, SessionState, RhythmData } from '../types/index.js';

/**
 * Session service for managing focus sessions
 * @module services/sessionService
 */

export interface CreateSessionInput {
	userIdHash: string;
	song: Song;
}

export interface UpdateSessionInput {
	state?: SessionState;
	endTime?: Date;
	rhythmData?: Partial<RhythmData>;
}

/**
 * Create a new focus session
 */
export async function createSession(input: CreateSessionInput): Promise<FocusSessionDocument> {
	try {
		const session = await FocusSessionModel.create({
			userIdHash: input.userIdHash,
			song: input.song,
			startTime: new Date(),
			state: 'active',
			rhythmData: {
				averageKeysPerMinute: 0,
				rhythmType: 'steady',
				peakIntensity: 0,
				samples: [],
			},
		});

		logger.info(
			{
				sessionId: session._id.toString(),
				song: input.song,
				userIdHash: input.userIdHash,
			},
			'session_created',
		);

		return session;
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				userIdHash: input.userIdHash,
			},
			'session_creation_failed',
		);
		throw error;
	}
}

/**
 * Get session by ID
 */
export async function getSessionById(sessionId: string): Promise<FocusSessionDocument | null> {
	try {
		const session = await FocusSessionModel.findById(sessionId);

		if (!session) {
			logger.warn({ sessionId }, 'session_not_found');
			return null;
		}

		return session;
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				sessionId,
			},
			'session_retrieval_failed',
		);
		throw error;
	}
}

/**
 * Get sessions by user ID hash
 */
export async function getSessionsByUser(
	userIdHash: string,
	limit = 10,
): Promise<FocusSessionDocument[]> {
	try {
		const sessions = await FocusSessionModel.find({ userIdHash })
			.sort({ createdAt: -1 })
			.limit(limit);

		logger.info(
			{ userIdHash, count: sessions.length },
			'sessions_retrieved_by_user',
		);

		return sessions;
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				userIdHash,
			},
			'sessions_retrieval_by_user_failed',
		);
		throw error;
	}
}

/**
 * Update session
 */
export async function updateSession(
	sessionId: string,
	updates: UpdateSessionInput,
): Promise<FocusSessionDocument | null> {
	try {
		const session = await FocusSessionModel.findById(sessionId);

		if (!session) {
			logger.warn({ sessionId }, 'session_not_found_for_update');
			return null;
		}

	// Update fields
	if (updates.state) {
		session.state = updates.state;
		
		// If session is being completed, set endTime to current server time
		// This ensures accurate duration calculation regardless of client-server latency
		if (updates.state === 'completed' && !session.endTime) {
			session.endTime = new Date();
		}
	}

	if (updates.endTime && updates.state !== 'completed') {
		// Only allow manual endTime setting if not completing the session
		// When completing, we use server time for accuracy
		session.endTime = updates.endTime;
	}		if (updates.rhythmData) {
			// Merge rhythm data
			if (updates.rhythmData.averageKeysPerMinute !== undefined) {
				session.rhythmData.averageKeysPerMinute = updates.rhythmData.averageKeysPerMinute;
			}
			if (updates.rhythmData.rhythmType) {
				session.rhythmData.rhythmType = updates.rhythmData.rhythmType;
			}
			if (updates.rhythmData.peakIntensity !== undefined) {
				session.rhythmData.peakIntensity = updates.rhythmData.peakIntensity;
			}
			if (updates.rhythmData.samples) {
				session.rhythmData.samples = updates.rhythmData.samples;
			}
		}

		await session.save();

		logger.info(
			{
				sessionId: session._id.toString(),
				updates: Object.keys(updates),
			},
			'session_updated',
		);

		return session;
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				sessionId,
			},
			'session_update_failed',
		);
		throw error;
	}
}

/**
 * Delete session (soft delete by setting state to completed)
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
	try {
		const result = await FocusSessionModel.findByIdAndDelete(sessionId);

		if (!result) {
			logger.warn({ sessionId }, 'session_not_found_for_deletion');
			return false;
		}

		logger.info({ sessionId }, 'session_deleted');
		return true;
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				sessionId,
			},
			'session_deletion_failed',
		);
		throw error;
	}
}
