import { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioEngine } from '../services/audioService';
import {
	INSTRUMENTS,
	getFrequencyForTempo,
	getVelocityForRhythm,
	applyAccessibilityFrequency,
	type InstrumentType,
} from '../lib/instruments';

export interface RhythmData {
	rhythmScore: number;
	bpm: number;
	intensity: 'low' | 'medium' | 'high';
	keystrokeCount: number;
	averageInterval: number;
	keysPerMinute: number; // Added for tempo calculation
}

export interface UseRhythmDetectionOptions {
	selectedInstruments?: InstrumentType[]; // Instruments to play on keystroke
	enableInstrumentalSounds?: boolean; // Enable per-keystroke sounds
	accessibilityMode?: boolean; // Lower frequency range (200-800 Hz)
	throttleRapidTyping?: boolean; // Smooth blending for >200 keys/min
}

export const useRhythmDetection = (
	isActive: boolean,
	options: UseRhythmDetectionOptions = {}
) => {
	const {
		selectedInstruments = [],
		enableInstrumentalSounds = false,
		accessibilityMode = false,
		throttleRapidTyping = true,
	} = options;
	const [rhythmData, setRhythmData] = useState<RhythmData>({
		rhythmScore: 0,
		bpm: 0,
		intensity: 'low',
		keystrokeCount: 0,
		averageInterval: 0,
		keysPerMinute: 0,
	});

	const keystrokeTimestamps = useRef<number[]>([]);
	const mouseMovements = useRef<number[]>([]);
	const lastUpdateTime = useRef<number>(Date.now());
	const audioEngineRef = useRef(getAudioEngine());
	const instrumentIndexRef = useRef(0); // Round-robin index for multiple instruments
	const lastKeystrokeTime = useRef<number>(0);

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
				keysPerMinute: 0,
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

		// Calculate keys per minute
		const timeWindowMs = 60000; // 1 minute
		const recentMinuteKeystrokes = keystrokeTimestamps.current.filter(
			(ts) => now - ts < timeWindowMs
		);
		const keysPerMinute = recentMinuteKeystrokes.length;

		let intensity: 'low' | 'medium' | 'high' = 'low';
		if (rhythmScore > 70) intensity = 'high';
		else if (rhythmScore > 40) intensity = 'medium';

		setRhythmData({
			rhythmScore: Math.round(rhythmScore),
			bpm: Math.min(bpm, 180),
			intensity,
			keystrokeCount: keystrokeTimestamps.current.length,
			averageInterval: Math.round(averageInterval),
			keysPerMinute,
		});
	}, []);

	const handleKeyDown = useCallback(() => {
		if (!isActive) return;

		const now = Date.now();
		keystrokeTimestamps.current.push(now);

		if (keystrokeTimestamps.current.length > 50) {
			keystrokeTimestamps.current.shift();
		}

		// Trigger instrumental sound on keystroke (T072)
		if (enableInstrumentalSounds && selectedInstruments.length > 0) {
			// Throttle rapid typing if enabled (T075)
			const timeSinceLastKeystroke = now - lastKeystrokeTime.current;
			const shouldPlaySound = !throttleRapidTyping || timeSinceLastKeystroke > 50; // Min 50ms between notes

			if (shouldPlaySound) {
				lastKeystrokeTime.current = now;

				// Round-robin through selected instruments (T092)
				const instrument =
					INSTRUMENTS[selectedInstruments[instrumentIndexRef.current % selectedInstruments.length]];
				instrumentIndexRef.current++;

				// Calculate frequency based on tempo (T073)
				const keysPerMinute = Math.round(
					keystrokeTimestamps.current.filter((ts) => now - ts < 60000).length
				);
				let frequency = getFrequencyForTempo(instrument, keysPerMinute);

				// Apply accessibility mode frequency limits (T077)
				if (accessibilityMode) {
					frequency = applyAccessibilityFrequency(frequency);
				}

				// Calculate velocity based on rhythm intensity
				const recentKeystrokes = keystrokeTimestamps.current.filter((ts) => now - ts < 5000);
				let rhythmScore = 50; // Default
				if (recentKeystrokes.length >= 2) {
					const intervals: number[] = [];
					for (let i = 1; i < recentKeystrokes.length; i++) {
						intervals.push(recentKeystrokes[i] - recentKeystrokes[i - 1]);
					}
					const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
					rhythmScore = Math.min(100, 1000 / Math.max(avgInterval, 50));
				}
				const velocity = getVelocityForRhythm(rhythmScore);

				// Play the instrumental note
				audioEngineRef.current.playInstrumentNote(instrument, frequency, velocity);
			}
		}

		if (now - lastUpdateTime.current > 500) {
			calculateRhythm();
			lastUpdateTime.current = now;
		}
	}, [
		isActive,
		calculateRhythm,
		enableInstrumentalSounds,
		selectedInstruments,
		accessibilityMode,
		throttleRapidTyping,
	]);

	const handleMouseMove = useCallback(() => {
		if (!isActive) return;

		const now = Date.now();
		mouseMovements.current.push(now);

		if (mouseMovements.current.length > 30) {
			mouseMovements.current.shift();
		}
	}, [isActive]);

	const handleMouseClick = useCallback(() => {
		if (!isActive || !enableInstrumentalSounds || selectedInstruments.length === 0) return;

		// Play bass-range sound for mouse clicks (T074)
		const bassInstrument = INSTRUMENTS['bass'];
		let frequency = 110; // A2 bass note

		// Apply accessibility mode if enabled
		if (accessibilityMode) {
			frequency = applyAccessibilityFrequency(frequency);
		}

		// Lower volume for mouse clicks (subtle)
		const velocity = 0.4;

		audioEngineRef.current.playInstrumentNote(bassInstrument, frequency, velocity, 0.8);
	}, [isActive, enableInstrumentalSounds, selectedInstruments, accessibilityMode]);

	useEffect(() => {
		if (!isActive) {
			keystrokeTimestamps.current = [];
			mouseMovements.current = [];
			lastKeystrokeTime.current = 0;
			instrumentIndexRef.current = 0;
			setRhythmData({
				rhythmScore: 0,
				bpm: 0,
				intensity: 'low',
				keystrokeCount: 0,
				averageInterval: 0,
				keysPerMinute: 0,
			});
			return;
		}

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('click', handleMouseClick);

		const intervalId = setInterval(calculateRhythm, 1000);

		// Inactivity detection: stop instrumental sounds after 5 seconds (T076)
		let inactivityTimer: NodeJS.Timeout;
		if (enableInstrumentalSounds) {
			inactivityTimer = setInterval(() => {
				const now = Date.now();
				const timeSinceLastKeystroke = now - lastKeystrokeTime.current;
				if (timeSinceLastKeystroke > 5000) {
					// More than 5 seconds inactive - instrumental sounds automatically stop
					// (ambient music continues, per FR-016)
					console.log('[useRhythmDetection] 5-second inactivity detected, instrumental sounds paused');
				}
			}, 1000);
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('click', handleMouseClick);
			clearInterval(intervalId);
			if (inactivityTimer) clearInterval(inactivityTimer);
		};
	}, [
		isActive,
		handleKeyDown,
		handleMouseMove,
		handleMouseClick,
		calculateRhythm,
		enableInstrumentalSounds,
	]);

	const resetRhythm = useCallback(() => {
		keystrokeTimestamps.current = [];
		mouseMovements.current = [];
		lastKeystrokeTime.current = 0;
		instrumentIndexRef.current = 0;
		setRhythmData({
			rhythmScore: 0,
			bpm: 0,
			intensity: 'low',
			keystrokeCount: 0,
			averageInterval: 0,
			keysPerMinute: 0,
		});
	}, []);

	return { rhythmData, resetRhythm };
};
