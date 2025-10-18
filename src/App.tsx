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

function App() {
  const [sessionDuration, setSessionDuration] = useState(0);

  const {
    isPlaying,
    mood,
    volume,
    accessibilityMode,
    startAudio,
    stopAudio,
    changeMood,
    setVolume,
    setAccessibilityMode,
    updateAudioParameters,
  } = useAudioEngine();

  const { rhythmData, resetRhythm } = useRhythmDetection(isPlaying);

  useSessionPersistence(isPlaying, rhythmData, mood);

  useEffect(() => {
    if (isPlaying) {
      updateAudioParameters(rhythmData);
    }
  }, [rhythmData, isPlaying, updateAudioParameters]);

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

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAudio();
      resetRhythm();
    } else {
      startAudio();
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col items-center justify-center">
            <RhythmVisualizer rhythmData={rhythmData} isPlaying={isPlaying} />
            <div className="mt-6 text-center">
              <div className="text-slate-400 text-sm mb-2">Current Mood</div>
              <div className="text-white text-2xl font-semibold">{mood}</div>
            </div>
          </div>

          <ControlPanel
            isPlaying={isPlaying}
            mood={mood}
            volume={volume}
            accessibilityMode={accessibilityMode}
            onPlayPause={handlePlayPause}
            onMoodChange={changeMood}
            onVolumeChange={setVolume}
            onAccessibilityToggle={() => setAccessibilityMode(!accessibilityMode)}
          />
        </div>

        <SessionStats
          rhythmData={rhythmData}
          sessionDuration={sessionDuration}
          isActive={isPlaying}
        />

        <div className="mt-8">
          <MoodInsights rhythmData={rhythmData} isPlaying={isPlaying} />
        </div>

        {isPlaying && (
          <div className="mt-8 bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">How It Works</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Start typing or moving your mouse to generate adaptive focus music. The tempo and
              intensity automatically adjust based on your rhythm. Faster typing increases the BPM
              and energy, while slower, steady typing creates a calmer atmosphere.
            </p>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
        Built for open-source hackathon • Turn your typing rhythm into personalized focus music
      </footer>
    </div>
  );
}

export default App;
