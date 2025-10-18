import { useState, useEffect, useCallback, useRef } from 'react';
import { getAudioEngine } from '../services/audioService';
import {
	INSTRUMENTS,
	getVelocityForRhythm,
	type InstrumentType,
} from '../lib/instruments';

export interface RhythmData {
	rhythmScore: number;
	bpm: number;
	intensity: 'low' | 'medium' | 'high';
	keystrokeCount: number;
	clickCount: number; // Mouse clicks count (added for T130)
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
		clickCount: 0,
		averageInterval: 0,
		keysPerMinute: 0,
	});

	const keystrokeTimestamps = useRef<number[]>([]);
	const clickTimestamps = useRef<number[]>([]); // Track mouse clicks (T130)
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

		// Adjust intensity based on keys per minute (50 keys/min = medium)
		let intensity: 'low' | 'medium' | 'high' = 'low';
		if (keysPerMinute >= 80) intensity = 'high';    // 80+ keys/min = high
		else if (keysPerMinute >= 50) intensity = 'medium'; // 50-79 keys/min = medium
		// else: <50 keys/min = low

		setRhythmData({
			rhythmScore: Math.round(rhythmScore),
			bpm: Math.min(bpm, 180),
			intensity,
			keystrokeCount: keystrokeTimestamps.current.length,
			clickCount: clickTimestamps.current.length,
			averageInterval: Math.round(averageInterval),
			keysPerMinute,
		});
	}, []);

	const handleKeyDown = useCallback(() => {
		if (!isActive) return;

		const now = Date.now();
		keystrokeTimestamps.current.push(now);
		console.log('[useRhythmDetection] Keystroke detected, total:', keystrokeTimestamps.current.length);

		if (keystrokeTimestamps.current.length > 50) {
			keystrokeTimestamps.current.shift();
		}

		// Trigger instrumental sound on keystroke (T072)
		if (enableInstrumentalSounds && selectedInstruments.length > 0) {
			console.log('[useRhythmDetection] Instrumental sounds enabled, instruments:', selectedInstruments);
			
			// Throttle rapid typing if enabled (T075)
			const timeSinceLastKeystroke = now - lastKeystrokeTime.current;
			const shouldPlaySound = !throttleRapidTyping || timeSinceLastKeystroke > 50; // Min 50ms between notes

			if (shouldPlaySound) {
				lastKeystrokeTime.current = now;

				// Round-robin through selected instruments (T092)
				const instrument =
					INSTRUMENTS[selectedInstruments[instrumentIndexRef.current % selectedInstruments.length]];
				instrumentIndexRef.current++;

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

			// Play the instrumental note (frequency now from pentatonic scale)
			console.log(`[useRhythmDetection] Playing instrument: ${selectedInstruments[instrumentIndexRef.current % selectedInstruments.length]}, vel=${velocity}`);
			audioEngineRef.current.playInstrumentNote(instrument, velocity);
			} else {
				console.log('[useRhythmDetection] Skipped note (throttled)');
			}
		} else {
			if (!enableInstrumentalSounds) {
				console.log('[useRhythmDetection] Instrumental sounds DISABLED');
			}
			if (selectedInstruments.length === 0) {
				console.log('[useRhythmDetection] No instruments selected');
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
		if (!isActive) return;

		// Track click timestamp (T130 - session stats)
		const now = Date.now();
		clickTimestamps.current.push(now);

		// Play bass-range sound for mouse clicks (T074) if enabled
		if (enableInstrumentalSounds && selectedInstruments.length > 0) {
			const bassInstrument = INSTRUMENTS['bass'];
			// Lower volume for mouse clicks (subtle)
			const velocity = 0.4;

			audioEngineRef.current.playInstrumentNote(bassInstrument, velocity, 0.8);
		}
	}, [isActive, enableInstrumentalSounds, selectedInstruments, accessibilityMode]);

	useEffect(() => {
		if (!isActive) {
			keystrokeTimestamps.current = [];
			clickTimestamps.current = [];
			mouseMovements.current = [];
			lastKeystrokeTime.current = 0;
			instrumentIndexRef.current = 0;
			setRhythmData({
				rhythmScore: 0,
				bpm: 0,
				intensity: 'low',
				keystrokeCount: 0,
				clickCount: 0,
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
		clickTimestamps.current = [];
		mouseMovements.current = [];
		lastKeystrokeTime.current = 0;
		instrumentIndexRef.current = 0;
		setRhythmData({
			rhythmScore: 0,
			bpm: 0,
			intensity: 'low',
			keystrokeCount: 0,
			clickCount: 0,
			averageInterval: 0,
			keysPerMinute: 0,
		});
	}, []);

	return { rhythmData, resetRhythm };
};
