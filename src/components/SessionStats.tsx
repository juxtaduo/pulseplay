import { Activity, Clock, TrendingUp, Mouse } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RhythmData } from '../hooks/useRhythmDetection';

/**
 * SessionStats component displays real-time session metrics (T130, T131)
 * Updates every 5 seconds during active session
 * @module components/SessionStats
 */

interface SessionStatsProps {
	rhythmData: RhythmData;
	sessionDuration: number;
	isActive: boolean;
	isPaused: boolean;
	isCompleted?: boolean;
}

export const SessionStats = ({ rhythmData, sessionDuration, isActive, isPaused, isCompleted = false }: SessionStatsProps) => {
	const [frozenRhythmData, setFrozenRhythmData] = useState(rhythmData);
	const [frozenSessionDuration, setFrozenSessionDuration] = useState(sessionDuration);

	// Update frozen values when not paused and not completed, freeze when paused or completed
	useEffect(() => {
		if (!isPaused && !isCompleted) {
			setFrozenRhythmData(rhythmData);
			setFrozenSessionDuration(sessionDuration);
		}
	}, [rhythmData, sessionDuration, isPaused, isCompleted]);

	// Use frozen values when paused or completed, live values when active
	const displayRhythmData = (isPaused || isCompleted) ? frozenRhythmData : rhythmData;
	const displaySessionDuration = (isPaused || isCompleted) ? frozenSessionDuration : sessionDuration;
	const formatDuration = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const getIntensityColor = (intensity: string) => {
		switch (intensity) {
			case 'high':
				return 'text-red-400';
			case 'medium':
				return 'text-blue-400';
			default:
				return 'text-green-400';
		}
	};

	// Calculate keys per minute (T138 - rolling average tempo)
	const keysPerMinute = displaySessionDuration > 0 ? Math.round((displayRhythmData.keystrokeCount / displaySessionDuration) * 60) : 0;

	return (
		<div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold text-slate-900 dark:text-slate-900 dark:text-white">Session Stats</h2>
				{isActive && (
					<div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-600 dark:text-slate-400">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						<span>Live</span>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{/* Row 1: Keyboard & General Stats */}
				
				{/* Duration */}
				<div className="bg-slate-100 dark:bg-slate-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 transition-colors duration-200">
					<div className="flex items-center gap-2 mb-2">
						<Clock size={18} className="text-slate-600 dark:text-slate-600 dark:text-slate-400" />
						<span className="text-xs text-slate-600 dark:text-slate-400">Duration</span>
					</div>
					<div className="text-2xl font-bold text-slate-900 dark:text-white">{formatDuration(displaySessionDuration)}</div>
				</div>

				{/* Keystrokes */}
				<div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<Activity size={18} className="text-slate-600 dark:text-slate-400" />
						<span className="text-xs text-slate-600 dark:text-slate-400">Keystrokes</span>
					</div>
					<div className="text-2xl font-bold text-slate-900 dark:text-white">{displayRhythmData.keystrokeCount}</div>
				</div>

				{/* Keys Per Minute (T138) */}
				<div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<TrendingUp size={18} className="text-slate-600 dark:text-slate-400" />
						<span className="text-xs text-slate-600 dark:text-slate-400">Keys/Min</span>
					</div>
					<div className="text-2xl font-bold text-slate-900 dark:text-white">{keysPerMinute}</div>
				</div>

				{/* Row 2: Mouse Stats */}

				{/* Mouse Clicks */}
				<div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<Mouse size={18} className="text-slate-600 dark:text-slate-400" />
						<span className="text-xs text-slate-600 dark:text-slate-400">Clicks</span>
					</div>
					<div className="text-2xl font-bold text-slate-900 dark:text-white">{displayRhythmData.clickCount}</div>
				</div>

				{/* Mouse Moves */}
				<div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<Mouse size={18} className="text-slate-600 dark:text-slate-400" />
						<span className="text-xs text-slate-600 dark:text-slate-400">Mouse Moves</span>
					</div>
					<div className="text-2xl font-bold text-slate-900 dark:text-white">{displayRhythmData.mouseMoveCount}</div>
				</div>

				{/* Scrolls */}
				<div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<Mouse size={18} className="text-slate-600 dark:text-slate-400" />
						<span className="text-xs text-slate-600 dark:text-slate-400">Scrolls</span>
					</div>
					<div className="text-2xl font-bold text-slate-900 dark:text-white">{displayRhythmData.scrollCount}</div>
				</div>
			</div>

			{/* Rhythm Score */}
			{isActive && displayRhythmData.rhythmScore > 0 && (
				<div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-slate-600 dark:text-slate-400">Rhythm Score</span>
						<span className={`text-sm font-semibold capitalize ${getIntensityColor(displayRhythmData.intensity)}`}>
							{displayRhythmData.intensity}
						</span>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex-1 h-3 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
							<div
								className={`h-full transition-all duration-500 ${
									displayRhythmData.intensity === 'high'
										? 'bg-red-500'
										: displayRhythmData.intensity === 'medium'
											? 'bg-blue-500'
											: 'bg-green-500'
								}`}
								style={{ width: `${displayRhythmData.rhythmScore}%` }}
							/>
						</div>
						<span className="text-lg font-bold text-slate-900 dark:text-white min-w-[3rem] text-right">
              {displayRhythmData.rhythmScore}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
