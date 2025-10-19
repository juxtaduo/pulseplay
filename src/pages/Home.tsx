import { useState, useEffect } from 'react';
import { RhythmVisualizer } from '../components/RhythmVisualizer';
import { ControlPanel } from '../components/ControlPanel';
import { SessionStats } from '../components/SessionStats';
import { MoodInsights } from '../components/MoodInsights';
import { AudioTest } from '../components/AudioTest';
import { useRhythmDetection } from '../hooks/useRhythmDetection';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { useSessionPersistence } from '../hooks/useSessionPersistence';
import type { Mood } from '../../backend/src/types';
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
	const { sessionId, startSession, stopSession } = useSessionPersistence();

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

	// Handle starting a session
	const handleStart = async (mood: Mood) => {
		try {
			// Start audio engine
			await startAudio(mood);
			// Start backend session
			await startSession(mood);
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

				{/* AI Mood Insights (Phase 7: T116, T117) - Only shown for completed sessions ≥10 minutes */}
				{!isPlaying && sessionId && sessionDuration >= 600 && (
					<div className="mt-8">
						<MoodInsights sessionId={sessionId} sessionDuration={sessionDuration} />
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
