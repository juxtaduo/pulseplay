import { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioEngine, type AudioEngine } from '../services/audioService';
import type { Mood } from '../../backend/src/types';

/**
 * React hook for managing Web Audio API audio engine
 * Provides controls for starting/stopping ambient music and adjusting volume
 * Integrates with audioService.ts singleton for consistent audio state
 * @module hooks/useAudioEngine
 */

export interface UseAudioEngineReturn {
	isPlaying: boolean;
	currentMood: Mood | null;
	volume: number;
	startAudio: (mood: Mood) => Promise<void>;
	stopAudio: () => void;
	setVolume: (volume: number) => void;
	error: string | null;
}

export function useAudioEngine(): UseAudioEngineReturn {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentMood, setCurrentMood] = useState<Mood | null>(null);
	const [volume, setVolumeState] = useState(0.5); // 50% default (0-1 range)
	const [error, setError] = useState<string | null>(null);
	const engineRef = useRef<AudioEngine | null>(null);

	// Initialize audio engine singleton on mount
	useEffect(() => {
		try {
			engineRef.current = getAudioEngine();
			console.log('[useAudioEngine] Audio engine initialized');
		} catch (err) {
			setError('Failed to initialize audio engine');
			console.error('[useAudioEngine] Initialization error:', err);
		}

		// Cleanup: Dispose engine on unmount
		return () => {
			if (engineRef.current) {
				try {
					engineRef.current.dispose();
					console.log('[useAudioEngine] Audio engine disposed');
				} catch (err) {
					console.error('[useAudioEngine] Disposal error:', err);
				}
			}
		};
	}, []);

	/**
	 * Start playing ambient music for selected mood
	 * Handles AudioContext resume for user gesture requirements
	 */
	const startAudio = useCallback(async (mood: Mood) => {
		if (!engineRef.current) {
			setError('Audio engine not initialized');
			console.error('[useAudioEngine] Engine not initialized');
			return;
		}

		try {
			setError(null);
			await engineRef.current.start(mood);
			setIsPlaying(true);
			setCurrentMood(mood);
			console.log('[useAudioEngine] Started audio for mood:', mood);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Failed to start audio';
			setError(errorMessage);
			console.error('[useAudioEngine] Start error:', err);
		}
	}, []);

	/**
	 * Stop audio playback with 2-second exponential fadeout
	 */
	const stopAudio = useCallback(() => {
		if (!engineRef.current) {
			console.warn('[useAudioEngine] Engine not available for stop');
			return;
		}

		try {
			engineRef.current.stop();
			setIsPlaying(false);
			setCurrentMood(null);
			console.log('[useAudioEngine] Stopped audio');
		} catch (err) {
			setError('Failed to stop audio');
			console.error('[useAudioEngine] Stop error:', err);
		}
	}, []);

	/**
	 * Set volume with smooth ramping (0-1 range)
	 */
	const setVolume = useCallback((newVolume: number) => {
		if (!engineRef.current) {
			console.warn('[useAudioEngine] Engine not available for volume change');
			return;
		}

		try {
			// Clamp volume to 0-1 range
			const clampedVolume = Math.max(0, Math.min(1, newVolume));
			engineRef.current.setVolume(clampedVolume);
			setVolumeState(clampedVolume);
		} catch (err) {
			setError('Failed to set volume');
			console.error('[useAudioEngine] Volume error:', err);
		}
	}, []);

	return {
		isPlaying,
		currentMood,
		volume,
		startAudio,
		stopAudio,
		setVolume,
		error,
	};
}
