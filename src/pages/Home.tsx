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
	const [selectedInstruments, setSelectedInstruments] = useState<InstrumentType[]>([]);
	const [enableInstrumentalSounds, setEnableInstrumentalSounds] = useState(false);

	// Audio engine hook (Web Audio API)
	const { isPlaying, currentMood, volume, startAudio, stopAudio, setVolume, error: audioError } =
		useAudioEngine();

	// Rhythm detection hook with instrument support (Phase 5 & 6)
	const { rhythmData, resetRhythm } = useRhythmDetection(isPlaying, {
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

		if (isPlaying) {
			intervalId = setInterval(() => {
				setSessionDuration((prev) => prev + 1);
			}, 1000);
		} else {
			setSessionDuration(0);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [isPlaying]);

	// Periodically update session with rhythm data (every 30 seconds during active session)
	useEffect(() => {
		console.log('[Home] Rhythm update effect triggered:', { isPlaying, sessionId, hasUpdateFn: !!updateSessionRhythm });
		
		let intervalId: NodeJS.Timeout;
		let initialTimer: NodeJS.Timeout;

		if (isPlaying && sessionId) {
			console.log('[Home] Setting up rhythm update timers for session:', sessionId);
			
			// Update immediately after 5 seconds to get some initial data (reduced for testing)
			initialTimer = setTimeout(() => {
				const currentRhythmData = rhythmDataRef.current;
				console.log('[Home] Sending initial rhythm update:', currentRhythmData);
				updateSessionRhythm(currentRhythmData);
			}, 5000); // Reduced to 5 seconds for faster testing

			// Regular updates every 15 seconds (reduced for testing)
			intervalId = setInterval(() => {
				const currentRhythmData = rhythmDataRef.current;
				console.log('[Home] Sending periodic rhythm update:', currentRhythmData);
				updateSessionRhythm(currentRhythmData);
			}, 15000); // Reduced to 15 seconds for faster testing

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
			// Start audio engine
			await startAudio(mood);
			// Start backend session
			await startSession(mood);
			
			// Immediate test update after session creation
			setTimeout(() => {
				if (sessionId) {
					console.log('[Home] Sending immediate test rhythm update after session creation');
					updateSessionRhythm(rhythmDataRef.current);
				}
			}, 2000); // 2 seconds after session creation
		} catch (err) {
			console.error('[App] Failed to start session:', err);
		}
	};

	// Handle stopping a session
	const handleStop = async () => {
		try {
			// Stop audio engine (with fadeout)
			stopAudio();
			// Stop backend session
			await stopSession();
			// Reset rhythm data
			resetRhythm();
		} catch (err) {
			console.error('[App] Failed to stop session:', err);
		}
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
						currentMood={currentMood}
						volume={volume}
						selectedInstruments={selectedInstruments}
						onStart={handleStart}
						onStop={handleStop}
						onVolumeChange={setVolume}
						onInstrumentToggle={handleInstrumentToggle}
						error={displayError}
					/>
				</div>

				<SessionStats rhythmData={rhythmData} sessionDuration={sessionDuration} isActive={isPlaying} />

				{/* AI Mood Insights (Phase 7: T116, T117) - Only shown for completed sessions ≥1 minute */}
				{!isPlaying && sessionId && sessionDuration >= 60 && (
					<div className="mt-8">
						<SongInsights sessionId={sessionId} sessionDuration={sessionDuration} />
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
