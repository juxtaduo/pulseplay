import { useState, useEffect, useRef, useCallback } from 'react';
import { RhythmData } from './useRhythmDetection';

export type MoodType = 'Calm' | 'Focus' | 'Energy';

export const useAudioEngine = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mood, setMood] = useState<MoodType>('Focus');
  const [volume, setVolume] = useState(70);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = volume / 100;
    masterGainRef.current = masterGain;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filterRef.current = filter;

    const reverb = ctx.createConvolver();
    const reverbLength = ctx.sampleRate * 2;
    const reverbBuffer = ctx.createBuffer(2, reverbLength, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const channelData = reverbBuffer.getChannelData(channel);
      for (let i = 0; i < reverbLength; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLength, 2);
      }
    }
    reverb.buffer = reverbBuffer;
    reverbRef.current = reverb;

    masterGain.connect(filter);
    filter.connect(reverb);
    reverb.connect(ctx.destination);
  }, [volume]);

  const getMoodFrequencies = useCallback((moodType: MoodType, accessMode: boolean) => {
    const baseSets = {
      Calm: accessMode ? [130, 165, 196] : [261.63, 329.63, 392.0],
      Focus: accessMode ? [145, 175, 220] : [293.66, 349.23, 440.0],
      Energy: accessMode ? [165, 196, 247] : [329.63, 392.0, 493.88],
    };
    return baseSets[moodType];
  }, []);

  const createOscillators = useCallback((frequencies: number[], ctx: AudioContext) => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // ignore
      }
    });
    gainNodesRef.current.forEach((gain) => gain.disconnect());

    oscillatorsRef.current = [];
    gainNodesRef.current = [];

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = index === 0 ? 'sine' : index === 1 ? 'triangle' : 'square';
      oscillator.frequency.value = freq;
      gainNode.gain.value = index === 0 ? 0.3 : index === 1 ? 0.2 : 0.15;

      oscillator.connect(gainNode);
      gainNode.connect(masterGainRef.current!);

      oscillator.start();

      oscillatorsRef.current.push(oscillator);
      gainNodesRef.current.push(gainNode);
    });
  }, []);

  const updateAudioParameters = useCallback((rhythmData: RhythmData) => {
    if (!isPlaying || !audioContextRef.current) return;

    const { rhythmScore, bpm } = rhythmData;
    const normalizedScore = Math.min(rhythmScore / 100, 1);

    oscillatorsRef.current.forEach((osc, index) => {
      const baseFreq = osc.frequency.value;
      const modulation = 1 + (normalizedScore * 0.3);
      const targetFreq = baseFreq * modulation;

      osc.frequency.linearRampToValueAtTime(
        targetFreq,
        audioContextRef.current!.currentTime + 0.5
      );
    });

    if (filterRef.current) {
      const filterFreq = accessibilityMode
        ? 1000 + (normalizedScore * 500)
        : 1500 + (normalizedScore * 1500);
      filterRef.current.frequency.linearRampToValueAtTime(
        filterFreq,
        audioContextRef.current.currentTime + 0.5
      );
    }

    gainNodesRef.current.forEach((gain, index) => {
      const baseGain = index === 0 ? 0.3 : index === 1 ? 0.2 : 0.15;
      const modulatedGain = baseGain * (0.7 + normalizedScore * 0.3);
      gain.gain.linearRampToValueAtTime(
        modulatedGain,
        audioContextRef.current!.currentTime + 0.5
      );
    });
  }, [isPlaying, accessibilityMode]);

  const startAudio = useCallback(() => {
    initAudioContext();
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const frequencies = getMoodFrequencies(mood, accessibilityMode);
    createOscillators(frequencies, audioContextRef.current);
    setIsPlaying(true);
  }, [mood, accessibilityMode, initAudioContext, getMoodFrequencies, createOscillators]);

  const stopAudio = useCallback(() => {
    oscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // ignore
      }
    });
    gainNodesRef.current.forEach((gain) => gain.disconnect());

    oscillatorsRef.current = [];
    gainNodesRef.current = [];
    setIsPlaying(false);
  }, []);

  const changeMood = useCallback((newMood: MoodType) => {
    setMood(newMood);
    if (isPlaying && audioContextRef.current) {
      const frequencies = getMoodFrequencies(newMood, accessibilityMode);
      createOscillators(frequencies, audioContextRef.current);
    }
  }, [isPlaying, accessibilityMode, getMoodFrequencies, createOscillators]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        volume / 100,
        audioContextRef.current?.currentTime ?? 0 + 0.1
      );
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return {
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
  };
};
