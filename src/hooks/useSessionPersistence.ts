import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
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
}

export interface UseSessionPersistenceReturn {
	sessionId: string | null;
	startSession: (song: Song) => Promise<string | null>;
	stopSession: (finalRhythmData?: FrontendRhythmData) => Promise<void>;
	updateSessionRhythm: (rhythmData: FrontendRhythmData) => Promise<void>;
	error: string | null;
}

export function useSessionPersistence(): UseSessionPersistenceReturn {
	const { getAccessTokenSilently, isAuthenticated } = useAuth0();
	const [state, setState] = useState<SessionState>({
		sessionId: null,
		startTime: null,
		error: null,
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
				frontendRhythmData
			});

			if (!state.sessionId || !isAuthenticated) {
				console.warn('[useSessionPersistence] Cannot update rhythm: no active session or not authenticated', {
					sessionId: state.sessionId,
					isAuthenticated
				});
				return;
			}

			try {
				console.log('[useSessionPersistence] Starting rhythm update request...');
				setState((prev) => ({ ...prev, error: null }));
				const token = await getAccessTokenSilently();

				// Transform frontend rhythm data to backend format
				const rhythmType = frontendRhythmData.intensity === 'high' 
					? 'energetic' 
					: frontendRhythmData.intensity === 'medium' 
					? 'steady' 
					: 'thoughtful';

				const backendRhythmData = {
					averageKeysPerMinute: frontendRhythmData.keysPerMinute,
					rhythmType,
					peakIntensity: frontendRhythmData.rhythmScore / 100, // Convert score to 0-1 range
					samples: [] // We'll keep this empty for now, could add historical data later
				};

				const requestBody = {
					rhythmData: backendRhythmData,
					keystrokeCount: frontendRhythmData.keystrokeCount,
					averageBpm: frontendRhythmData.averageBpm, // Include average BPM
				};

				console.log('[useSessionPersistence] Making PUT request:', {
					url: `${API_BASE_URL}/api/sessions/${state.sessionId}`,
					body: requestBody
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
					ok: response.ok
				});

				if (!response.ok) {
					const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
					throw new Error(errorData.error || `HTTP ${response.status}`);
				}

				console.log('[useSessionPersistence] Session rhythm updated successfully:', {
					keysPerMinute: frontendRhythmData.keysPerMinute,
					rhythmType,
					keystrokeCount: frontendRhythmData.keystrokeCount
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
	 * Stop the current focus session
	 */
	const stopSession = useCallback(async (finalRhythmData?: FrontendRhythmData) => {
		if (!state.sessionId || !isAuthenticated) {
			console.warn('[useSessionPersistence] Cannot stop session: no active session or not authenticated');
			return;
		}

		try {
			setState((prev) => ({ ...prev, error: null }));
			const token = await getAccessTokenSilently();

			abortControllerRef.current = new AbortController();

			const requestBody: any = {
				state: 'completed',
				// endTime is now automatically set by the backend for accuracy
			};

			// Include final rhythm data if provided (for average BPM)
			if (finalRhythmData) {
				const rhythmType = finalRhythmData.intensity === 'high' 
					? 'energetic' 
					: finalRhythmData.intensity === 'medium' 
					? 'steady' 
					: 'thoughtful';

				requestBody.rhythmData = {
					averageKeysPerMinute: finalRhythmData.keysPerMinute,
					rhythmType,
					peakIntensity: finalRhythmData.rhythmScore / 100, // Convert score to 0-1 range
					samples: [] // We'll keep this empty for now, could add historical data later
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
	}, [state.sessionId, isAuthenticated, getAccessTokenSilently]);

	// Cleanup: Stop session on unmount
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	return {
		sessionId: state.sessionId,
		startSession,
		stopSession,
		updateSessionRhythm,
		error: state.error,
	};
}
