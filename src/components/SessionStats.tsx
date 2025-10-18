import { Activity, Clock, TrendingUp, Mouse } from 'lucide-react';
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
}

export const SessionStats = ({ rhythmData, sessionDuration, isActive }: SessionStatsProps) => {
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
	const keysPerMinute = sessionDuration > 0 ? Math.round((rhythmData.keystrokeCount / sessionDuration) * 60) : 0;

	return (
		<div className="bg-slate-800 rounded-xl p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold text-white">Session Stats</h2>
				{isActive && (
					<div className="flex items-center gap-2 text-xs text-slate-400">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
						<span>Live</span>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{/* Duration */}
				<div className="bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<Clock size={18} className="text-slate-400" />
						<span className="text-xs text-slate-400">Duration</span>
					</div>
					<div className="text-2xl font-bold text-white">{formatDuration(sessionDuration)}</div>
				</div>

				{/* Keystrokes */}
				<div className="bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<Activity size={18} className="text-slate-400" />
						<span className="text-xs text-slate-400">Keystrokes</span>
					</div>
					<div className="text-2xl font-bold text-white">{rhythmData.keystrokeCount}</div>
				</div>

				{/* Keys Per Minute (T138) */}
				<div className="bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<TrendingUp size={18} className="text-slate-400" />
						<span className="text-xs text-slate-400">Keys/Min</span>
					</div>
					<div className="text-2xl font-bold text-white">{keysPerMinute}</div>
				</div>

				{/* Mouse Clicks */}
				<div className="bg-slate-900 rounded-lg p-4">
					<div className="flex items-center gap-2 mb-2">
						<Mouse size={18} className="text-slate-400" />
						<span className="text-xs text-slate-400">Clicks</span>
					</div>
					<div className="text-2xl font-bold text-white">{rhythmData.clickCount}</div>
				</div>
			</div>

			{/* Rhythm Score */}
			{isActive && rhythmData.rhythmScore > 0 && (
				<div className="mt-4 p-4 bg-slate-900 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-slate-400">Rhythm Score</span>
						<span className={`text-sm font-semibold capitalize ${getIntensityColor(rhythmData.intensity)}`}>
							{rhythmData.intensity}
						</span>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
							<div
								className={`h-full transition-all duration-500 ${
									rhythmData.intensity === 'high'
										? 'bg-red-500'
										: rhythmData.intensity === 'medium'
											? 'bg-blue-500'
											: 'bg-green-500'
								}`}
								style={{ width: `${rhythmData.rhythmScore}%` }}
							/>
						</div>
						<span className="text-lg font-bold text-white min-w-[3rem] text-right">
              {rhythmData.rhythmScore}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
