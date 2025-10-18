import { useState, useEffect, useCallback, useRef } from 'react';

export interface RhythmData {
  rhythmScore: number;
  bpm: number;
  intensity: 'low' | 'medium' | 'high';
  keystrokeCount: number;
  averageInterval: number;
}

export const useRhythmDetection = (isActive: boolean) => {
  const [rhythmData, setRhythmData] = useState<RhythmData>({
    rhythmScore: 0,
    bpm: 0,
    intensity: 'low',
    keystrokeCount: 0,
    averageInterval: 0,
  });

  const keystrokeTimestamps = useRef<number[]>([]);
  const mouseMovements = useRef<number[]>([]);
  const lastUpdateTime = useRef<number>(Date.now());

  const calculateRhythm = useCallback(() => {
    const now = Date.now();
    const recentKeystrokes = keystrokeTimestamps.current.filter(
      (ts) => now - ts < 5000
    );

    if (recentKeystrokes.length < 2) {
      setRhythmData((prev) => ({
        ...prev,
        rhythmScore: 0,
        bpm: 0,
        intensity: 'low',
      }));
      return;
    }

    const intervals: number[] = [];
    for (let i = 1; i < recentKeystrokes.length; i++) {
      intervals.push(recentKeystrokes[i] - recentKeystrokes[i - 1]);
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const rhythmScore = Math.min(100, 1000 / Math.max(averageInterval, 50));
    const bpm = Math.round((60000 / Math.max(averageInterval, 50)) * 0.25);

    let intensity: 'low' | 'medium' | 'high' = 'low';
    if (rhythmScore > 70) intensity = 'high';
    else if (rhythmScore > 40) intensity = 'medium';

    setRhythmData({
      rhythmScore: Math.round(rhythmScore),
      bpm: Math.min(bpm, 180),
      intensity,
      keystrokeCount: keystrokeTimestamps.current.length,
      averageInterval: Math.round(averageInterval),
    });
  }, []);

  const handleKeyDown = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    keystrokeTimestamps.current.push(now);

    if (keystrokeTimestamps.current.length > 50) {
      keystrokeTimestamps.current.shift();
    }

    if (now - lastUpdateTime.current > 500) {
      calculateRhythm();
      lastUpdateTime.current = now;
    }
  }, [isActive, calculateRhythm]);

  const handleMouseMove = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    mouseMovements.current.push(now);

    if (mouseMovements.current.length > 30) {
      mouseMovements.current.shift();
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) {
      keystrokeTimestamps.current = [];
      mouseMovements.current = [];
      setRhythmData({
        rhythmScore: 0,
        bpm: 0,
        intensity: 'low',
        keystrokeCount: 0,
        averageInterval: 0,
      });
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleMouseMove);

    const intervalId = setInterval(calculateRhythm, 1000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(intervalId);
    };
  }, [isActive, handleKeyDown, handleMouseMove, calculateRhythm]);

  const resetRhythm = useCallback(() => {
    keystrokeTimestamps.current = [];
    mouseMovements.current = [];
    setRhythmData({
      rhythmScore: 0,
      bpm: 0,
      intensity: 'low',
      keystrokeCount: 0,
      averageInterval: 0,
    });
  }, []);

  return { rhythmData, resetRhythm };
};
