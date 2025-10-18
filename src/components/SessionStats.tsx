import { Activity, Clock, TrendingUp } from 'lucide-react';
import { RhythmData } from '../hooks/useRhythmDetection';

interface SessionStatsProps {
  rhythmData: RhythmData;
  sessionDuration: number;
  isActive: boolean;
}

export const SessionStats = ({ rhythmData, sessionDuration, isActive }: SessionStatsProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
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

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Session Stats</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-slate-400" />
            <span className="text-sm text-slate-400">Duration</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatDuration(sessionDuration)}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={20} className="text-slate-400" />
            <span className="text-sm text-slate-400">Keystrokes</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {rhythmData.keystrokeCount}
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-slate-400" />
            <span className="text-sm text-slate-400">Intensity</span>
          </div>
          <div className={`text-2xl font-bold capitalize ${getIntensityColor(rhythmData.intensity)}`}>
            {rhythmData.intensity}
          </div>
        </div>
      </div>

      {isActive && rhythmData.rhythmScore > 0 && (
        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
          <div className="text-sm text-slate-400 mb-2">Rhythm Score</div>
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
