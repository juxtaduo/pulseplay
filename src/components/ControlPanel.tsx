import { Play, Pause, Volume2, Piano, Music2, Mic2, Radio } from 'lucide-react';
import type { Mood } from '../types';
import type { InstrumentType } from '../lib/instruments';

/**
 * Control panel for ambient music player
 * Provides mood selection, play/pause, volume control, and instrument selection
 * @module components/ControlPanel
 */

interface ControlPanelProps {
	isPlaying: boolean;
	currentMood: Mood | null;
	volume: number; // 0-1 range
	selectedInstruments?: InstrumentType[]; // Phase 6: Multi-instrument support
	onStart: (mood: Mood) => void;
	onStop: () => void;
	onVolumeChange: (volume: number) => void;
	onInstrumentToggle?: (instrument: InstrumentType) => void; // Phase 6
	error: string | null;
}

const MOOD_OPTIONS: { value: Mood; label: string; description: string }[] = [
	{ value: 'thousand-years', label: 'A Thousand Years', description: 'Christina Perri romantic ballad, 75 BPM' },
	{ value: 'kiss-the-rain', label: 'Kiss The Rain', description: 'Yiruma emotional piano, 58 BPM' },
	{ value: 'river-flows', label: 'River Flows In You', description: 'Yiruma classic piano, 65 BPM' },
	{ value: 'gurenge', label: 'Gurenge', description: 'Demon Slayer opening, 135 BPM' },
];

// Phase 6: Instrument options with Lucide icons
const INSTRUMENT_OPTIONS: {
	value: InstrumentType;
	label: string;
	icon: typeof Piano;
	description: string;
}[] = [
	{ value: 'grand-piano', label: 'Electric Piano', icon: Piano, description: 'Rhodes/Wurlitzer EP' },
	{ value: 'flute', label: 'Flute', icon: Music2, description: 'Soft, airy woodwind' },
	{ value: 'electric-piano', label: 'Xylophone', icon: Mic2, description: 'Bright, percussive mallet' },
	{ value: 'bass', label: 'Kalimba', icon: Radio, description: 'African thumb piano' },
];

export const ControlPanel = ({
	isPlaying,
	currentMood,
	volume,
	selectedInstruments = [],
	onStart,
	onStop,
	onVolumeChange,
	onInstrumentToggle,
	error,
}: ControlPanelProps) => {
	const handleMoodSelect = (mood: Mood) => {
		if (isPlaying && currentMood === mood) {
			// Already playing this mood, do nothing
			return;
		}
		if (isPlaying) {
			// Stop current mood and start new one
			onStop();
			setTimeout(() => onStart(mood), 100); // Small delay for fadeout
		} else {
			onStart(mood);
		}
	};

	const handlePlayPause = () => {
		if (isPlaying) {
			onStop();
		} else if (currentMood) {
			onStart(currentMood);
		}
		// If not playing and no mood selected, do nothing (user must select mood first)
	};

	// Convert 0-1 range to 0-100 for display
	const displayVolume = Math.round(volume * 100);

	return (
		<div className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-6 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-slate-900 dark:text-white">Music Selection</h2>
				<button
					onClick={handlePlayPause}
					disabled={!currentMood && !isPlaying}
					className={`p-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
						isPlaying
							? 'bg-red-500 hover:bg-red-600'
							: 'bg-green-500 hover:bg-green-600'
					} text-white`}
					aria-label={isPlaying ? 'Pause music' : 'Play music'}
				>
					{isPlaying ? <Pause size={24} /> : <Play size={24} />}
				</button>
			</div>

			{error && (
				<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
					<p className="text-sm text-red-400 dark:text-red-400">{error}</p>
				</div>
			)}

			<div>
				<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
					Select Song {!currentMood && !isPlaying && (
						<span className="text-xs text-blue-500 dark:text-blue-400 font-normal">(click to start music)</span>
					)}
				</label>
				<div className="grid grid-cols-2 gap-2">
					{MOOD_OPTIONS.map((moodOption) => (
						<button
							key={moodOption.value}
							onClick={() => handleMoodSelect(moodOption.value)}
							className={`py-3 px-4 rounded-lg font-medium transition-all text-left ${
								currentMood === moodOption.value
									? 'bg-blue-500 text-white ring-2 ring-blue-400'
									: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
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
					<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
						Instruments{' '}
					</label>
					<div className="grid grid-cols-2 gap-2">
						{INSTRUMENT_OPTIONS.map((instrument) => {
							const Icon = instrument.icon;
							const isSelected = selectedInstruments.includes(instrument.value);
							return (
								<button
									key={instrument.value}
									onClick={() => onInstrumentToggle(instrument.value)}
									className={`py-3 px-3 rounded-lg font-medium transition-all text-left flex items-start gap-2 ${
										isSelected
											? 'bg-purple-500 text-white ring-2 ring-purple-400'
											: 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
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
						<p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
							⚠ 3+ instruments may blend harmonics during fast typing
						</p>
					)}
				</div>
			)}

			<div>
				<label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
					<span>Volume</span>
					<span className="text-slate-600 dark:text-slate-400">{displayVolume}%</span>
				</label>
				<div className="flex items-center gap-3">
					<Volume2 size={20} className="text-slate-600 dark:text-slate-400" />
					<input
						type="range"
						min="0"
						max="100"
						value={displayVolume}
						onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
						className="flex-1 h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
						aria-label="Volume slider"
					/>
				</div>
			</div>
		</div>
  );
};
