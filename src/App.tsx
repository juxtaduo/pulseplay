import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { AuthButton } from './components/AuthButton';
import { RhythmVisualizer } from './components/RhythmVisualizer';
import { ControlPanel } from './components/ControlPanel';
import { SessionStats } from './components/SessionStats';
import { MoodInsights } from './components/MoodInsights';
import { useRhythmDetection } from './hooks/useRhythmDetection';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useSessionPersistence } from './hooks/useSessionPersistence';
import type { Mood } from '../backend/src/types';
import type { InstrumentType } from './lib/instruments';

function App() {
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
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			<header className="bg-slate-800 bg-opacity-50 backdrop-blur-sm border-b border-slate-700">
				<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-500 rounded-lg">
							<Music size={24} className="text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-white">PulsePlay</h1>
							<p className="text-sm text-slate-400">AI Focus Music Generator</p>
						</div>
					</div>
					<AuthButton />
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 py-8">
				{displayError && (
					<div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
						<p className="text-red-400 text-sm">{displayError}</p>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					<div className="flex flex-col items-center justify-center">
						<RhythmVisualizer rhythmData={rhythmData} isPlaying={isPlaying} />
						{currentMood && (
							<div className="mt-6 text-center">
								<div className="text-slate-400 text-sm mb-2">Current Mood</div>
								<div className="text-white text-2xl font-semibold capitalize">
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

				<div className="mt-8">
					<MoodInsights rhythmData={rhythmData} isPlaying={isPlaying} />
				</div>

				{isPlaying && (
					<div className="mt-8 bg-slate-800 rounded-xl p-6">
						<h3 className="text-lg font-semibold text-white mb-2">How It Works</h3>
						<p className="text-slate-400 text-sm leading-relaxed">
							Select a mood that matches your workflow, then start your focus session. The ambient Lofi music will play continuously to help you concentrate. Adjust the volume to your preference, and when you're done, click stop for a graceful 2-second fadeout.
						</p>
					</div>
				)}

				{sessionId && (
					<div className="mt-6 text-center text-slate-500 text-sm">
						Session ID: {sessionId.slice(0, 8)}...
					</div>
				)}
			</main>

			<footer className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
				Built for open-source hackathon • Adaptive focus music powered by your rhythm
			</footer>
		</div>
	);
}

export default App;
