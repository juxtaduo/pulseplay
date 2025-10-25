import { Mic2, Music2, Pause, Piano, Play, Radio, RotateCcw, Square, Volume2 } from 'lucide-react';
import type { InstrumentType } from '../lib/instruments';
import type { Mood } from '../types';

/**
 * Control panel for ambient music player
 * Provides mood selection, play/pause/reset, volume control, and instrument selection
 * @module components/ControlPanel
 */

interface ControlPanelProps {
	isPlaying: boolean;
	isPaused: boolean;
	currentMood: Mood | null;
	volume: number; // 0-1 range
	selectedInstruments?: InstrumentType[]; // Phase 6: Multi-instrument support
	onStart: (mood: Mood) => void;
	onPauseResume: () => void;
	onReset: () => void;
	onStop?: () => void; // Stop and complete session
	onVolumeChange: (volume: number) => void;
	onInstrumentToggle?: (instrument: InstrumentType) => void; // Phase 6
	error: string | null;
	isCompleted?: boolean; // Whether session is completed/stopped
}

const MOOD_OPTIONS: { value: Mood; label: string; description: string }[] = [
	{
		value: 'thousand-years',
		label: 'A Thousand Years',
		description: 'Christina Perri romantic ballad, 75 BPM',
	},
	{ value: 'kiss-the-rain', label: 'Kiss The Rain', description: 'Yiruma emotional piano, 58 BPM' },
	{
		value: 'river-flows',
		label: 'River Flows In You',
		description: 'Yiruma classic piano, 65 BPM',
	},
	{ value: 'gurenge', label: 'Gurenge', description: 'Demon Slayer opening, 135 BPM' },
];

// Phase 6: Instrument options with Lucide icons
const INSTRUMENT_OPTIONS: {
	value: InstrumentType;
	label: string;
	icon: typeof Piano;
	description: string;
}[] = [
	{
		value: 'grand-piano',
		label: 'Electric Piano',
		icon: Piano,
		description: 'Rhodes/Wurlitzer EP',
	},
	{ value: 'flute', label: 'Flute', icon: Music2, description: 'Soft, airy woodwind' },
	{
		value: 'electric-piano',
		label: 'Xylophone',
		icon: Mic2,
		description: 'Bright, percussive mallet',
	},
	{ value: 'bass', label: 'Kalimba', icon: Radio, description: 'African thumb piano' },
];

export const ControlPanel = ({
	isPlaying,
	isPaused,
	currentMood,
	volume,
	selectedInstruments = [],
	onStart,
	onPauseResume,
	onReset,
	onStop,
	onVolumeChange,
	onInstrumentToggle,
	error,
	isCompleted = false,
}: ControlPanelProps) => {
	const handleMoodSelect = (mood: Mood) => {
		if (isPlaying && currentMood === mood) {
			// Already playing this mood, do nothing
			return;
		}
		if (isPlaying) {
			// Stop current mood and start new one
			onPauseResume(); // Pause first
			setTimeout(() => onStart(mood), 100); // Small delay for fadeout
		} else {
			onStart(mood);
		}
	};

	const handlePlayPause = () => {
		if (isPlaying) {
			// Currently playing, so pause
			onPauseResume();
		} else {
			// Currently paused or not started, so play/resume
			if (currentMood) {
				if (isPaused) {
					// Resume paused session
					onPauseResume();
				} else {
					// Start new session
					onStart(currentMood);
				}
			}
			// If no mood selected, do nothing (user must select mood first)
		}
	};

	const handleReset = () => {
		onReset();
	};

	// Convert 0-1 range to 0-100 for display
	const displayVolume = Math.round(volume * 100);

	return (
		<div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 space-y-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg backdrop-blur-sm transition-colors duration-200 relative z-20">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-slate-800 dark:text-white">Music Selection</h2>
				<div className="flex items-center gap-3">
					{/* Play/Pause button */}
					<button
						type="button"
						onClick={handlePlayPause}
						disabled={(!currentMood && !isPlaying && !isPaused) || isCompleted}
						className={`p-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md ${
							isPlaying
								? 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-700 dark:hover:to-orange-800'
								: isPaused
									? 'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 dark:hover:from-emerald-700 dark:hover:to-emerald-800'
									: 'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 dark:hover:from-emerald-700 dark:hover:to-emerald-800'
						} text-white`}
						aria-label={isPlaying ? 'Pause music' : isPaused ? 'Resume music' : 'Play music'}
						title={isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
					>
						{isPlaying ? <Pause size={24} /> : <Play size={24} />}
					</button>
					{/* Stop button */}
					{onStop && (isPlaying || isPaused || isCompleted) && (
						<button
							type="button"
							onClick={onStop}
							disabled={isCompleted}
							className="p-4 rounded-full bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 dark:from-red-500 dark:to-red-600 dark:hover:from-red-700 dark:hover:to-red-800 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
							aria-label="Stop and complete session"
							title={isCompleted ? 'Session completed' : 'Stop session and get AI insights'}
						>
							<Square size={20} />
						</button>
					)}
					{/* Reset button - rightmost */}
					{(isPlaying || isPaused || isCompleted) && (
						<button
							type="button"
							onClick={handleReset}
							disabled={!isPlaying && !isPaused && !currentMood && !isCompleted}
							className="p-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-700 dark:hover:to-amber-800 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
							aria-label="Reset session"
							title={isCompleted ? 'Reset to start new session' : 'Reset'}
						>
							<RotateCcw size={24} />
						</button>
					)}
				</div>
			</div>{' '}
			{error && (
				<div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3">
					<p className="text-sm text-red-800 dark:text-red-400">{error}</p>
				</div>
			)}
			<div>
				<div className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
					Select Song{' '}
					{!currentMood && !isPlaying && (
						<span className="text-xs text-blue-600 dark:text-blue-400 font-normal">
							(click to start music)
						</span>
					)}
				</div>
				<div className="grid grid-cols-2 gap-2">
					{MOOD_OPTIONS.map((moodOption) => (
						<button
							type="button"
							key={moodOption.value}
							onClick={() => handleMoodSelect(moodOption.value)}
							disabled={isPaused || isCompleted || (isPlaying && currentMood !== moodOption.value)}
							className={`py-3 px-4 rounded-lg font-medium transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
								currentMood === moodOption.value
									? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-md dark:bg-blue-600 dark:text-white dark:ring-blue-400'
									: 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900 dark:border-blue-700'
							}`}
							aria-pressed={currentMood === moodOption.value}
						>
							<div className="font-semibold">{moodOption.label}</div>
							<div className="text-xs opacity-75 mt-1">{moodOption.description}</div>
						</button>
					))}
				</div>
			</div>
			{/* Phase 6: Instrument Selection (T090-T091) */}
			{onInstrumentToggle && (
				<div>
					<div className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
						Instruments{' '}
					</div>
					<div className="grid grid-cols-2 gap-2">
						{INSTRUMENT_OPTIONS.map((instrument) => {
							const Icon = instrument.icon;
							const isSelected = selectedInstruments.includes(instrument.value);
							return (
								<button
									type="button"
									key={instrument.value}
									onClick={() => onInstrumentToggle(instrument.value)}
									disabled={isPaused || isCompleted}
									className={`py-3 px-3 rounded-lg font-medium transition-all text-left flex items-start gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
										isSelected
											? 'bg-purple-500 text-white ring-2 ring-purple-300 shadow-md dark:bg-purple-600 dark:text-white dark:ring-purple-400'
											: 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:hover:bg-purple-900 dark:border-purple-700'
									}`}
									aria-pressed={isSelected}
									aria-label={`${isSelected ? 'Deselect' : 'Select'} ${instrument.label}`}
								>
									<Icon size={20} className="flex-shrink-0 mt-0.5" />
									<div className="flex-1 min-w-0">
										<div className="font-semibold truncate">{instrument.label}</div>
										<div className="text-xs opacity-75 truncate">{instrument.description}</div>
									</div>
								</button>
							);
						})}
					</div>
					{selectedInstruments.length >= 3 && (
						<p className="text-xs text-amber-700 dark:text-yellow-400 mt-2">
							⚠ 3+ instruments may blend harmonics during fast typing
						</p>
					)}
				</div>
			)}
			<div>
				<div className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
					<span>Volume</span>
					<span className="text-slate-600 dark:text-slate-400">{displayVolume}%</span>
				</div>
				<div className="flex items-center gap-3">
					<Volume2 size={20} className="text-slate-500 dark:text-slate-400" />
					<input
						type="range"
						min="0"
						max="100"
						value={displayVolume}
						onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
						disabled={isCompleted}
						className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						aria-label="Volume slider"
					/>
				</div>
			</div>
		</div>
	);
};
