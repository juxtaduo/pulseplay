import { useState, useEffect, useRef } from 'react';
import { RhythmVisualizer } from '../components/RhythmVisualizer';
import { ControlPanel } from '../components/ControlPanel';
import { SessionStats } from '../components/SessionStats';
import { SongInsights } from '../components/SongInsights';
import { AudioTest } from '../components/AudioTest';
import { useRhythmDetection } from '../hooks/useRhythmDetection';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useSessionPersistence } from '../hooks/useSessionPersistence';
import type { Mood } from '../types';
import type { InstrumentType } from '../lib/instruments';

export function Home() {
	const [sessionDuration, setSessionDuration] = useState(0);
	const [completedSessionDuration, setCompletedSessionDuration] = useState<number | null>(null);
	const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
	const [selectedInstruments, setSelectedInstruments] = useState<InstrumentType[]>([]);
	const [enableInstrumentalSounds, setEnableInstrumentalSounds] = useState(false);
	const [isPaused, setIsPaused] = useState(false); // Track if session is paused

	// Audio engine hook (Web Audio API)
	const { isPlaying, currentMood, volume, startAudio, stopAudio, setVolume, error: audioError } =
		useAudioEngine();

	// Rhythm detection hook with instrument support (Phase 5 & 6)
	const { rhythmData, resetRhythm } = useRhythmDetection(isPlaying && !isPaused, { // Only detect rhythm when playing and not paused
		selectedInstruments,
		enableInstrumentalSounds,
		accessibilityMode: false, // TODO: Add accessibility toggle in UI
		throttleRapidTyping: true,
	});

	// Session persistence hook (backend API integration)
	const { sessionId, startSession, stopSession, updateSessionRhythm } = useSessionPersistence();

	// Ref to access current rhythm data in interval callbacks
	const rhythmDataRef = useRef(rhythmData);

	// Update ref whenever rhythmData changes
	useEffect(() => {
		rhythmDataRef.current = rhythmData;
	}, [rhythmData]);

	// Track session duration
	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		if (isPlaying && !isPaused) {
			intervalId = setInterval(() => {
				setSessionDuration((prev) => prev + 1);
			}, 1000);
		}
		// Don't reset sessionDuration to 0 - preserve it for completed sessions

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [isPlaying, isPaused]);

	// Periodically update session with rhythm data (every 30 seconds during active session)
	useEffect(() => {
		console.log('[Home] Rhythm update effect triggered:', { isPlaying, sessionId, hasUpdateFn: !!updateSessionRhythm });

		let intervalId: NodeJS.Timeout;
		let initialTimer: NodeJS.Timeout;

		if (isPlaying && sessionId) {
			console.log('[Home] Setting up rhythm update timers for session:', sessionId);

			// Initial update after 30 seconds to get some data
			initialTimer = setTimeout(() => {
				const currentRhythmData = rhythmDataRef.current;
				console.log('[Home] Sending initial rhythm update:', currentRhythmData);
				updateSessionRhythm(currentRhythmData);
			}, 30000); // 30 seconds

			// Regular updates every 60 seconds
			intervalId = setInterval(() => {
				const currentRhythmData = rhythmDataRef.current;
				console.log('[Home] Sending periodic rhythm update:', currentRhythmData);
				updateSessionRhythm(currentRhythmData);
			}, 60000); // 60 seconds

			return () => {
				console.log('[Home] Cleaning up rhythm update timers');
				clearTimeout(initialTimer);
				clearInterval(intervalId);
			};
		} else {
			console.log('[Home] Not setting up rhythm updates:', { isPlaying, sessionId });
		}

		return () => {
			if (initialTimer) clearTimeout(initialTimer);
			if (intervalId) clearInterval(intervalId);
		};
	}, [isPlaying, sessionId, updateSessionRhythm]); // Removed rhythmData from deps to prevent constant re-running

	// Handle starting a session
	const handleStart = async (mood: Mood) => {
		try {
			console.log('[Home] handleStart called for mood:', mood);
			// Reset session duration for new session
			setSessionDuration(0);
			// Reset completed session duration and ID for new session
			setCompletedSessionDuration(null);
			setCompletedSessionId(null);
			// Start audio engine
			await startAudio(mood);
			// Start backend session
			const newSessionId = await startSession(mood);
			console.log('[Home] Session started, newSessionId:', newSessionId); 

			if (!newSessionId) {
				console.warn('[Home] No session ID returned from startSession');
			}
		} catch (err) {
			console.error('[App] Failed to start session:', err);
		}
	};

	// Handle stopping a session
	const handleStop = async () => {
		try {
			// Save current session info before stopping
			const currentSessionId = sessionId;
			const currentSessionDuration = sessionDuration;
			
			// Stop audio engine (with fadeout) but keep mood for UI display
			stopAudio(false); // Don't clear mood when stopping
			// Stop backend session with final rhythm data
			await stopSession(rhythmData);
			// Now that session is completed, save the duration and ID for AI insights
			setCompletedSessionDuration(currentSessionDuration);
			setCompletedSessionId(currentSessionId);
			// Reset paused state
			setIsPaused(false);
			// Note: Keep rhythm data, song selections, and instrument selections for display and AI insights
		} catch (err) {
			console.error('[App] Failed to stop session:', err);
		}
	};

	// Handle pausing/resuming a session
	const handlePauseResume = async () => {
		if (isPlaying) {
			// Pause the session - stop audio but keep currentMood for UI freezing
			setIsPaused(true);
			stopAudio(false); // Don't clear mood when pausing
		} else if (currentMood) {
			// Resume the session
			setIsPaused(false);
			await startAudio(currentMood);
		}
	};

	// Handle resetting the session
	const handleReset = () => {
		// Reset all session stats to 0
		setSessionDuration(0);
		resetRhythm();
		
		// Reset song and instrument selections
		setSelectedInstruments([]);
		setEnableInstrumentalSounds(false);
		
		// Clear current mood when resetting
		stopAudio(true); // This will clear the mood
		
		// Reset paused state
		setIsPaused(false);
		
		// Note: Keep completedSessionId and completedSessionDuration to preserve AI insights
	};

	// Handle instrument selection toggle (Phase 6: T091)
	const handleInstrumentToggle = (instrument: InstrumentType) => {
		setSelectedInstruments((prev) => {
			if (prev.includes(instrument)) {
				// Remove instrument
				return prev.filter((i) => i !== instrument);
			} else {
				// Add instrument
				return [...prev, instrument];
			}
		});

		// Enable instrumental sounds when at least one instrument is selected
		setEnableInstrumentalSounds(() => {
			const newInstruments = selectedInstruments.includes(instrument)
				? selectedInstruments.filter((i) => i !== instrument)
				: [...selectedInstruments, instrument];
			return newInstruments.length > 0;
		});
	};

	// Display errors if any (only show audio errors, auth errors are not critical)
	const displayError = audioError;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
			<main className="max-w-7xl mx-auto px-4 py-8">
				{displayError && (
					<div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
						<p className="text-red-400 text-sm">{displayError}</p>
					</div>
				)}

				{/* Audio Diagnostic Test - Shows if you can't hear sound */}
				{!isPlaying && (
					<div className="mb-8">
						<AudioTest />
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					<div className="flex flex-col items-center justify-center">
						<RhythmVisualizer rhythmData={rhythmData} isPlaying={isPlaying} />
						{currentMood && (
							<div className="mt-6 text-center">
								<div className="text-slate-600 dark:text-slate-400 text-sm mb-2">Current Mood</div>
								<div className="text-slate-900 dark:text-white text-2xl font-semibold capitalize">
									{currentMood.replace(/-/g, ' ')}
								</div>
							</div>
						)}
					</div>

					<ControlPanel
						isPlaying={isPlaying}
						isPaused={isPaused}
						currentMood={currentMood}
						volume={volume}
						selectedInstruments={selectedInstruments}
						onStart={handleStart}
						onPauseResume={handlePauseResume}
						onReset={handleReset}
						onStop={handleStop}
						onVolumeChange={setVolume}
						onInstrumentToggle={handleInstrumentToggle}
						error={displayError}
					/>
				</div>

				<SessionStats rhythmData={rhythmData} sessionDuration={sessionDuration} isActive={isPlaying} isPaused={isPaused} />

				{/* AI Song Insights (Phase 7: T116, T117) - Only shown for completed sessions ≥30 seconds */}
				{!isPlaying && completedSessionId && (completedSessionDuration || 0) >= 30 && (
					<div className="mt-8">
						<SongInsights sessionId={completedSessionId} sessionDuration={completedSessionDuration || 0} />
					</div>
				)}

				{sessionId && (
					<div className="mt-6 text-center text-slate-500 text-sm">
						Session ID: {sessionId.slice(0, 8)}...
					</div>
				)}
			</main>
		</div>
	);
}
