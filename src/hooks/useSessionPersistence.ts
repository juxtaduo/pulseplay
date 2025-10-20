import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { Song } from '../types';

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
	startSession: (song: Song) => Promise<void>;
	stopSession: () => Promise<void>;
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
		async (song: Song) => {
			if (!isAuthenticated) {
				setState((prev) => ({ ...prev, error: 'Not authenticated' }));
				console.warn('[useSessionPersistence] Cannot start session: not authenticated');
				return;
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
				setState({
					sessionId: data.session._id,
					startTime: new Date(data.session.startTime),
					error: null,
				});
				console.log('[useSessionPersistence] Session started:', data.session._id);
			} catch (err) {
				if (err instanceof Error && err.name === 'AbortError') {
					// Request was cancelled, ignore
					return;
				}
				const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
				setState((prev) => ({ ...prev, error: errorMessage }));
				console.error('[useSessionPersistence] Start session error:', err);
			}
		},
		[isAuthenticated, getAccessTokenSilently]
	);

	/**
	 * Stop the current focus session
	 */
	const stopSession = useCallback(async () => {
		if (!state.sessionId || !isAuthenticated) {
			console.warn('[useSessionPersistence] Cannot stop session: no active session or not authenticated');
			return;
		}

		try {
			setState((prev) => ({ ...prev, error: null }));
			const token = await getAccessTokenSilently();

			abortControllerRef.current = new AbortController();

			const response = await fetch(`${API_BASE_URL}/api/sessions/${state.sessionId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					state: 'completed',
					endTime: new Date().toISOString(),
				}),
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
		error: state.error,
	};
}
