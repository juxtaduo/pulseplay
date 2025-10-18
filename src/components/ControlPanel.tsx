import { Play, Pause, Volume2 } from 'lucide-react';
import { MoodType } from '../hooks/useAudioEngine';

interface ControlPanelProps {
  isPlaying: boolean;
  mood: MoodType;
  volume: number;
  accessibilityMode: boolean;
  onPlayPause: () => void;
  onMoodChange: (mood: MoodType) => void;
  onVolumeChange: (volume: number) => void;
  onAccessibilityToggle: () => void;
}

export const ControlPanel = ({
  isPlaying,
  mood,
  volume,
  accessibilityMode,
  onPlayPause,
  onMoodChange,
  onVolumeChange,
  onAccessibilityToggle,
}: ControlPanelProps) => {
  const moods: MoodType[] = ['Calm', 'Focus', 'Energy'];

  return (
    <div className="bg-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Controls</h2>
        <button
          onClick={onPlayPause}
          className={`p-4 rounded-full transition-all ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Mood
        </label>
        <div className="grid grid-cols-3 gap-2">
          {moods.map((m) => (
            <button
              key={m}
              onClick={() => onMoodChange(m)}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                mood === m
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-sm font-medium text-slate-300 mb-3">
          <span>Volume</span>
          <span className="text-slate-400">{volume}%</span>
        </label>
        <div className="flex items-center gap-3">
          <Volume2 size={20} className="text-slate-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accessibilityMode}
            onChange={(e) => onAccessibilityToggle()}
            className="w-5 h-5 rounded accent-blue-500 cursor-pointer"
          />
          <div>
            <span className="text-sm font-medium text-slate-300 block">
              Accessibility Mode
            </span>
            <span className="text-xs text-slate-400">
              Lower frequencies for sensory comfort
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};
