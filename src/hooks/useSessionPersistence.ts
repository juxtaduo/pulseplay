import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Song } from '../types';
import type { RhythmData as FrontendRhythmData } from './useRhythmDetection';

/**
 * React hook for persisting focus sessions to backend API
 * Handles session creation, updates, and cleanup
 * Integrates with Auth0 for authenticated API calls
 * @module hooks/useSessionPersistence
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SessionState {
	sessionId: string | null;
	startTime: Date | null;
	error: string | null;
	accessToken: string | null;
}

export interface UseSessionPersistenceReturn {
	sessionId: string | null;
	startSession: (song: Song) => Promise<string | null>;
	stopSession: (
		finalRhythmData?: FrontendRhythmData,
		endTime?: Date,
		sessionDuration?: number
	) => Promise<void>;
	updateSessionRhythm: (rhythmData: FrontendRhythmData) => Promise<void>;
	updateSessionState: (
		newState: 'active' | 'paused' | 'completed',
		durationSeconds?: number
	) => Promise<void>;
	error: string | null;
}

export function useSessionPersistence(): UseSessionPersistenceReturn {
	const { getAccessTokenSilently, isAuthenticated } = useAuth0();
	const [state, setState] = useState<SessionState>({
		sessionId: null,
		startTime: null,
		error: null,
		accessToken: null,
	});
	const abortControllerRef = useRef<AbortController | null>(null);

	/**
	 * Start a new focus session
	 */
	const startSession = useCallback(
		async (song: Song): Promise<string | null> => {
			if (!isAuthenticated) {
				setState((prev) => ({ ...prev, error: 'Not authenticated' }));
				console.warn('[useSessionPersistence] Cannot start session: not authenticated');
				return null;
			}

			try {
				setState((prev) => ({ ...prev, error: null }));
				const token = await getAccessTokenSilently();

				abortControllerRef.current = new AbortController();

				const response = await fetch(`${API_BASE_URL}/api/sessions`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ song }),
					signal: abortControllerRef.current.signal,
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
					throw new Error(errorData.error || `HTTP ${response.status}`);
				}

				const data = await response.json();
				const sessionId = data.session.sessionId;
				setState({
					sessionId,
					startTime: new Date(data.session.startTime),
					error: null,
					accessToken: token,
				});
				console.log('[useSessionPersistence] Session started:', sessionId);
				return sessionId;
			} catch (err) {
				if (err instanceof Error && err.name === 'AbortError') {
					// Request was cancelled, ignore
					return null;
				}
				const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
				setState((prev) => ({ ...prev, error: errorMessage }));
				console.error('[useSessionPersistence] Start session error:', err);
				return null;
			}
		},
		[isAuthenticated, getAccessTokenSilently]
	);

	/**
	 * Update session with rhythm data
	 */
	const updateSessionRhythm = useCallback(
		async (frontendRhythmData: FrontendRhythmData) => {
			console.log('[useSessionPersistence] updateSessionRhythm called:', {
				hasSessionId: !!state.sessionId,
				sessionId: state.sessionId,
				isAuthenticated,
				frontendRhythmData,
			});

			if (!state.sessionId || !isAuthenticated) {
				console.warn(
					'[useSessionPersistence] Cannot update rhythm: no active session or not authenticated',
					{
						sessionId: state.sessionId,
						isAuthenticated,
					}
				);
				return;
			}

			try {
				console.log('[useSessionPersistence] Starting rhythm update request...');
				setState((prev) => ({ ...prev, error: null }));
				const token = await getAccessTokenSilently();

				// Transform frontend rhythm data to backend format
				const rhythmType =
					frontendRhythmData.intensity === 'high'
						? 'energetic'
						: frontendRhythmData.intensity === 'medium'
							? 'steady'
							: 'thoughtful';

				const backendRhythmData = {
					averageKeysPerMinute: frontendRhythmData.keysPerMinute,
					rhythmType,
					peakIntensity: frontendRhythmData.rhythmScore / 100, // Convert score to 0-1 range
					samples: [], // We'll keep this empty for now, could add historical data later
				};

				const requestBody = {
					rhythmData: backendRhythmData,
					keystrokeCount: frontendRhythmData.keystrokeCount,
					averageBpm: frontendRhythmData.averageBpm, // Include average BPM
				};

				console.log('[useSessionPersistence] Making PUT request:', {
					url: `${API_BASE_URL}/api/sessions/${state.sessionId}`,
					body: requestBody,
				});

				abortControllerRef.current = new AbortController();

				const response = await fetch(`${API_BASE_URL}/api/sessions/${state.sessionId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(requestBody),
					signal: abortControllerRef.current.signal,
				});

				console.log('[useSessionPersistence] PUT response received:', {
					status: response.status,
					ok: response.ok,
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
					throw new Error(errorData.error || `HTTP ${response.status}`);
				}

				console.log('[useSessionPersistence] Session rhythm updated successfully:', {
					keysPerMinute: frontendRhythmData.keysPerMinute,
					rhythmType,
					keystrokeCount: frontendRhythmData.keystrokeCount,
				});
			} catch (err) {
				if (err instanceof Error && err.name === 'AbortError') {
					// Request was cancelled, ignore
					return;
				}
				const errorMessage = err instanceof Error ? err.message : 'Failed to update rhythm';
				setState((prev) => ({ ...prev, error: errorMessage }));
				console.error('[useSessionPersistence] Update rhythm error:', err);
			}
		},
		[state.sessionId, isAuthenticated, getAccessTokenSilently]
	);

	/**
	 * Update session state (active, paused, completed)
	 */
	const updateSessionState = useCallback(
		async (newState: 'active' | 'paused' | 'completed', durationSeconds?: number) => {
			if (!state.sessionId || !isAuthenticated) {
				console.warn(
					'[useSessionPersistence] Cannot update session state: no active session or not authenticated',
					{
						sessionId: state.sessionId,
						isAuthenticated,
					}
				);
				return;
			}

			try {
				setState((prev) => ({ ...prev, error: null }));
				const token = await getAccessTokenSilently();

				abortControllerRef.current = new AbortController();

				const requestBody: {
					state: string;
					totalDurationSeconds?: number;
				} = {
					state: newState,
				};

				// Include duration if provided
				if (durationSeconds !== undefined) {
					requestBody.totalDurationSeconds = durationSeconds;
				}

				const response = await fetch(`${API_BASE_URL}/api/sessions/${state.sessionId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(requestBody),
					signal: abortControllerRef.current.signal,
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
					throw new Error(errorData.error || `HTTP ${response.status}`);
				}

				console.log('[useSessionPersistence] Session state updated:', {
					sessionId: state.sessionId,
					newState,
					durationSeconds,
				});
			} catch (err) {
				if (err instanceof Error && err.name === 'AbortError') {
					// Request was cancelled, ignore
					return;
				}
				const errorMessage = err instanceof Error ? err.message : 'Failed to update session state';
				setState((prev) => ({ ...prev, error: errorMessage }));
				console.error('[useSessionPersistence] Update session state error:', err);
			}
		},
		[state.sessionId, isAuthenticated, getAccessTokenSilently]
	);

	/**
	 * Stop the current focus session
	 */
	const stopSession = useCallback(
		async (finalRhythmData?: FrontendRhythmData, endTime?: Date, sessionDuration?: number) => {
			if (!state.sessionId || !isAuthenticated) {
				console.warn(
					'[useSessionPersistence] Cannot stop session: no active session or not authenticated'
				);
				return;
			}

			try {
				setState((prev) => ({ ...prev, error: null }));
				const token = await getAccessTokenSilently();

				abortControllerRef.current = new AbortController();

				const requestBody: {
					state: string;
					endTime?: string;
					totalDurationSeconds?: number;
					rhythmData?: {
						averageKeysPerMinute: number;
						rhythmType: string;
						peakIntensity: number;
						samples: unknown[];
					};
					keystrokeCount?: number;
					averageBpm?: number;
				} = {
					state: 'completed',
					// endTime can be provided by frontend for accuracy, otherwise set by backend
				};

				// Include endTime if provided
				if (endTime) {
					requestBody.endTime = endTime.toISOString();
				}

				// Include sessionDuration if provided (use frontend duration instead of calculating)
				if (sessionDuration !== undefined) {
					requestBody.totalDurationSeconds = sessionDuration;
				}

				// Include final rhythm data if provided (for average BPM)
				if (finalRhythmData) {
					const rhythmType =
						finalRhythmData.intensity === 'high'
							? 'energetic'
							: finalRhythmData.intensity === 'medium'
								? 'steady'
								: 'thoughtful';

					requestBody.rhythmData = {
						averageKeysPerMinute: finalRhythmData.keysPerMinute,
						rhythmType,
						peakIntensity: finalRhythmData.rhythmScore / 100, // Convert score to 0-1 range
						samples: [], // We'll keep this empty for now, could add historical data later
					};
					requestBody.keystrokeCount = finalRhythmData.keystrokeCount;
					requestBody.averageBpm = finalRhythmData.averageBpm; // Include average BPM
				}

				const response = await fetch(`${API_BASE_URL}/api/sessions/${state.sessionId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(requestBody),
					signal: abortControllerRef.current.signal,
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
					throw new Error(errorData.error || `HTTP ${response.status}`);
				}

				const data = await response.json();
				console.log('[useSessionPersistence] Session stopped:', data.session._id);

				setState({
					sessionId: null,
					startTime: null,
					error: null,
					accessToken: null,
				});
			} catch (err) {
				if (err instanceof Error && err.name === 'AbortError') {
					// Request was cancelled, ignore
					return;
				}
				const errorMessage = err instanceof Error ? err.message : 'Failed to stop session';
				setState((prev) => ({ ...prev, error: errorMessage }));
				console.error('[useSessionPersistence] Stop session error:', err);
			}
		},
		[state.sessionId, isAuthenticated, getAccessTokenSilently]
	);

	// Cleanup: Stop session on unmount
	useEffect(() => {
		let cleanupController: AbortController | null = null;

		const performCleanup = async () => {
			if (state.sessionId && isAuthenticated && state.accessToken) {
				console.log(
					'[useSessionPersistence] Performing session cleanup for active session:',
					state.sessionId
				);

				try {
					// Use fetch with keepalive for reliable delivery during page unload
					const response = await fetch(`${API_BASE_URL}/api/sessions/${state.sessionId}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${state.accessToken}`,
						},
						body: JSON.stringify({ state: 'completed' }),
						keepalive: true, // This ensures the request completes even if page unloads
					});

					if (response.ok) {
						console.log('[useSessionPersistence] Session cleanup succeeded');
					} else {
						console.warn('[useSessionPersistence] Session cleanup failed:', response.status);
					}
				} catch (error) {
					console.error('[useSessionPersistence] Session cleanup error:', error);
				}
			}
		};

		const handleBeforeUnload = () => {
			// Cancel any ongoing cleanup
			if (cleanupController) {
				cleanupController.abort();
			}

			// Start cleanup process
			cleanupController = new AbortController();
			performCleanup().catch((error) => {
				console.error('[useSessionPersistence] Cleanup failed in beforeunload:', error);
			});

			// Note: We don't prevent the unload, we just ensure cleanup happens
		};

		// Listen for page unload events
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			// Cleanup event listeners
			window.removeEventListener('beforeunload', handleBeforeUnload);

			// Cancel any ongoing cleanup
			if (cleanupController) {
				cleanupController.abort();
			}

			// Also try the async cleanup as backup (for non-page-unload scenarios)
			if (state.sessionId && isAuthenticated) {
				console.log(
					'[useSessionPersistence] Component unmounting with active session, marking as completed:',
					state.sessionId
				);
				updateSessionState('completed').catch((error) => {
					console.warn('[useSessionPersistence] Failed to complete session on unmount:', error);
				});
			}
		};
	}, [state.sessionId, isAuthenticated, state.accessToken, updateSessionState]);

	// Periodic duration sync: Update session duration every 30 seconds during active sessions
	useEffect(() => {
		if (!state.sessionId || !isAuthenticated || !state.startTime) {
			return; // No active session to sync
		}

		const DURATION_SYNC_INTERVAL = 30000; // 30 seconds

		const syncDuration = () => {
			const now = new Date();
			const durationSeconds = Math.round((now.getTime() - (state.startTime?.getTime() || 0)) / 1000);

			console.log('[useSessionPersistence] Syncing session duration:', {
				sessionId: state.sessionId,
				durationSeconds,
				lastSync: new Date().toISOString(),
			});

			// Update duration in backend (state remains 'active')
			updateSessionState('active', durationSeconds).catch((error) => {
				console.warn('[useSessionPersistence] Failed to sync duration:', error);
				// Don't set error state for periodic sync failures to avoid UI disruption
			});
		};

		// Sync immediately, then set up interval
		syncDuration();
		const intervalId = setInterval(syncDuration, DURATION_SYNC_INTERVAL);

		return () => {
			clearInterval(intervalId);
		};
	}, [state.sessionId, isAuthenticated, state.startTime, updateSessionState]);

	return {
		sessionId: state.sessionId,
		startSession,
		stopSession,
		updateSessionRhythm,
		updateSessionState,
		error: state.error,
	};
}
