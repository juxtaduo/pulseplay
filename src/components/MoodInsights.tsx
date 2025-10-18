import { useState, useEffect } from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { RhythmData } from '../hooks/useRhythmDetection';
import { generateMood, MoodResponse } from '../services/moodService';

interface MoodInsightsProps {
  rhythmData: RhythmData;
  isPlaying: boolean;
}

export const MoodInsights = ({ rhythmData, isPlaying }: MoodInsightsProps) => {
  const [insights, setInsights] = useState<MoodResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPlaying || rhythmData.keystrokeCount < 10) {
      setInsights(null);
      return;
    }

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const moodData = await generateMood(rhythmData);
        setInsights(moodData);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchInsights, 5000);

    return () => clearTimeout(timeoutId);
  }, [rhythmData.keystrokeCount, isPlaying]);

  if (!isPlaying || rhythmData.keystrokeCount < 10) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={24} className="text-blue-400" />
        <h2 className="text-xl font-semibold text-white">AI Insights</h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing your rhythm...</span>
        </div>
      ) : insights ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-slate-900 rounded-lg">
            <Sparkles size={20} className="text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <div className="text-white font-semibold mb-1">{insights.mood}</div>
              <div className="text-slate-400 text-sm mb-2">{insights.description}</div>
              <div className="text-blue-400 text-sm italic">{insights.suggestion}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Recommended Tempo:</span>
            <span className="text-white font-medium">{insights.tempo}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
