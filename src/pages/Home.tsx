import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { RhythmVisualizer } from '../components/RhythmVisualizer';
import { ControlPanel } from '../components/ControlPanel';
import { SessionStats } from '../components/SessionStats';
import { SongInsights } from '../components/SongInsights';
import { AudioTest } from '../components/AudioTest';
import { useRhythmDetection } from '../hooks/useRhythmDetection';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useSessionPersistence } from '../hooks/useSessionPersistence';
import { useAuth0 } from '@auth0/auth0-react';
import type { Mood } from '../types';
import type { InstrumentType } from '../lib/instruments';
import type { RhythmData } from '../hooks/useRhythmDetection';

export function Home() {
	const [sessionDuration, setSessionDuration] = useState(0);
	const [completedSessionDuration, setCompletedSessionDuration] = useState<number | null>(null);
	const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
	const [completedRhythmData, setCompletedRhythmData] = useState<RhythmData | null>(null);
	const [selectedInstruments, setSelectedInstruments] = useState<InstrumentType[]>([]);
	const [enableInstrumentalSounds, setEnableInstrumentalSounds] = useState(false);
	const [isPaused, setIsPaused] = useState(false); // Track if session is paused
	const [isSessionStopped, setIsSessionStopped] = useState(false); // Track if session was stopped (for data preservation)

	const { isAuthenticated } = useAuth0();
	const { isPlaying, currentMood, volume, startAudio, stopAudio, pauseAudio, resumeAudio, setVolume, error: audioError } =
		useAudioEngine();

	// Rhythm detection hook with instrument support (Phase 5 & 6)
	const { rhythmData, resetRhythm } = useRhythmDetection(isPlaying && !isPaused, { // Only detect rhythm when playing and not paused
		selectedInstruments,
		enableInstrumentalSounds,
		accessibilityMode: false, // TODO: Add accessibility toggle in UI
		throttleRapidTyping: true,
		preserveData: isSessionStopped || isPaused, // Preserve data when session is stopped OR paused
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
			// Reset session stopped state
			setIsSessionStopped(false);
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
			// Capture the exact time when user clicks stop for accurate duration calculation
			const stopTime = new Date();
			
			// Save current session info before stopping
			const currentSessionId = sessionId;
			const currentSessionDuration = sessionDuration;
			const currentRhythmData = rhythmData;
			
			// Mark session as stopped for UI immediately
			setIsSessionStopped(true);
			
			// Stop audio engine (with fadeout) but keep mood for UI display
			stopAudio(false); // Don't clear mood when stopping
			
			// For authenticated users, try to stop backend session but don't fail UI if it fails
			if (isAuthenticated && currentSessionId) {
				try {
					await stopSession(rhythmData, stopTime, currentSessionDuration);
				} catch (stopError) {
					console.warn('[Home] Failed to stop backend session, but continuing with UI completion:', stopError);
				}
			}
			
			// Always set completed session data for UI consistency
			setCompletedSessionDuration(currentSessionDuration);
			setCompletedSessionId(currentSessionId);
			setCompletedRhythmData(currentRhythmData);
			
			// Reset paused state
			setIsPaused(false);
			// Note: Keep rhythm data, song selections, and instrument selections for display and AI insights
		} catch (err) {
			console.error('[App] Failed to stop session:', err);
			// If stopping fails completely, reset the stopped state and clear completed data
			setIsSessionStopped(false);
			setCompletedSessionDuration(null);
			setCompletedSessionId(null);
			setCompletedRhythmData(null);
		}
	};

	// Handle pausing/resuming a session
	const handlePauseResume = async () => {
		if (isPlaying) {
			// Pause the session - mute audio but keep oscillators/intervals running
			setIsPaused(true);
			pauseAudio();
		} else if (currentMood) {
			// Resume the session - unmute audio without restarting sequences
			setIsPaused(false);
			resumeAudio();
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
		
		// Clear completed session data to allow fresh start
		setCompletedSessionDuration(null);
		setCompletedSessionId(null);
		setCompletedRhythmData(null); // Clear completed rhythm data
		// Reset session stopped state
		setIsSessionStopped(false);
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
		<div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900">
			<main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
				{displayError && (
					<div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4">
						<p className="text-red-800 dark:text-red-400 text-sm">{displayError}</p>
					</div>
				)}

				{/* Audio Diagnostic Test - Shows if you can't hear sound */}
				{!isPlaying && (
					<div className="mb-8 flex items-center justify-between">
						<AudioTest />
						
						{/* Desktop navigation - only Session History */}
						<nav className="hidden md:flex gap-4">
							<Link
								to="/history"
								className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 hover:from-rose-200 hover:via-pink-200 hover:to-purple-200 dark:from-rose-900/30 dark:via-pink-900/30 dark:to-purple-900/30 dark:hover:from-rose-800/70 dark:hover:via-pink-800/70 dark:hover:to-purple-800/70 transition-all text-slate-800 dark:text-white text-sm font-medium shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 dark:shadow-lg dark:shadow-rose-900/40 dark:hover:shadow-xl dark:hover:shadow-rose-800/50 border border-rose-200/60 hover:border-rose-300/80 dark:border-rose-700/20 dark:hover:border-rose-600/80 dark:ring-2 dark:ring-rose-700/30 dark:hover:ring-rose-600/50"
							>
								<History size={16} />
								<span className="text-slate-800 dark:text-white">Session History</span>
							</Link>
						</nav>
						
						{/* Mobile navigation - only Session History */}
						<nav className="flex md:hidden gap-2">
							<Link
								to="/history"
								className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 hover:from-rose-200 hover:via-pink-200 hover:to-purple-200 dark:from-rose-900/30 dark:via-pink-900/30 dark:to-purple-900/30 dark:hover:from-rose-800/70 dark:hover:via-pink-800/70 dark:hover:to-purple-800/70 transition-all text-slate-800 dark:text-white shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 dark:shadow-lg dark:shadow-rose-900/40 dark:hover:shadow-xl dark:hover:shadow-rose-800/50 border border-rose-200/60 hover:border-rose-300/80 dark:border-rose-700/20 dark:hover:border-rose-600/80 dark:ring-2 dark:ring-rose-700/30 dark:hover:ring-rose-600/50"
								title="Session History"
								aria-label="Session History"
							>
								<History size={18} />
							</Link>
						</nav>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					<div className="flex flex-col items-center justify-center">
						<RhythmVisualizer rhythmData={rhythmData} isPlaying={isPlaying} />
						{currentMood && (
							<div className="mt-6 text-center">
								<div className="text-slate-500 dark:text-slate-400 text-sm mb-2">Current Song</div>
								<div className="text-slate-800 dark:text-white text-2xl font-semibold capitalize">
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
						isCompleted={isSessionStopped}
					/>
				</div>

				<SessionStats rhythmData={rhythmData} sessionDuration={sessionDuration} isActive={isPlaying} isPaused={isPaused} isCompleted={isSessionStopped} />

				{/* AI Song Insights (Phase 7: T116, T117) - Show warning for sessions <30 seconds, insights for ≥30 seconds */}
				{!isPlaying && (completedSessionDuration || 0) > 0 && ((isAuthenticated && completedSessionId) || (!isAuthenticated && completedRhythmData)) && (
					<div className="mt-8">
						<SongInsights 
							sessionId={completedSessionId} 
							sessionDuration={completedSessionDuration || 0}
							rhythmData={completedRhythmData || undefined}
						/>
					</div>
				)}

				{/* Session ID display removed for cleaner UI */}
			</main>
		</div>
	);
}
