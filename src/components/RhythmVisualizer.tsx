import { useEffect, useRef } from 'react';
import { RhythmData } from '../hooks/useRhythmDetection';

interface RhythmVisualizerProps {
  rhythmData: RhythmData;
  isPlaying: boolean;
}

export const RhythmVisualizer = ({ rhythmData, isPlaying }: RhythmVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (!isPlaying) {
        ctx.fillStyle = 'rgba(100, 100, 120, 0.1)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      const normalizedScore = rhythmData.rhythmScore / 100;
      const baseRadius = 60;
      const maxRadius = 120;
      const radius = baseRadius + (maxRadius - baseRadius) * normalizedScore;

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

      if (rhythmData.intensity === 'high') {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (rhythmData.intensity === 'medium') {
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
        gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.3)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 3; i++) {
        const waveRadius = radius + 20 + (i * 15);
        const opacity = 0.3 - (i * 0.1);
        ctx.strokeStyle = rhythmData.intensity === 'high'
          ? `rgba(239, 68, 68, ${opacity})`
          : rhythmData.intensity === 'medium'
          ? `rgba(59, 130, 246, ${opacity})`
          : `rgba(34, 197, 94, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius + Math.sin(phase + i) * 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      phase += 0.05 * (1 + normalizedScore);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rhythmData, isPlaying]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="rounded-lg"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-700 dark:text-white">
            {rhythmData.bpm}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-300 uppercase tracking-wider">
            BPM
          </div>
        </div>
      </div>
    </div>
  );
};
