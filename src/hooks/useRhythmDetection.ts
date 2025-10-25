import { useCallback, useEffect, useRef, useState } from 'react';
import { getVelocityForRhythm, INSTRUMENTS, type InstrumentType } from '../lib/instruments';
import { getAudioEngine } from '../services/audioService';

export interface RhythmData {
	rhythmScore: number;
	bpm: number;
	averageBpm: number; // Average BPM for the entire session
	intensity: 'low' | 'medium' | 'high';
	keystrokeCount: number;
	clickCount: number; // Mouse clicks count (added for T130)
	mouseMoveCount: number; // Mouse movements count
	scrollCount: number; // Mouse scroll events count
	averageInterval: number;
	keysPerMinute: number; // Added for tempo calculation
}

export interface UseRhythmDetectionOptions {
	selectedInstruments?: InstrumentType[]; // Instruments to play on keystroke
	enableInstrumentalSounds?: boolean; // Enable per-keystroke sounds
	accessibilityMode?: boolean; // Lower frequency range (200-800 Hz)
	throttleRapidTyping?: boolean; // Smooth blending for >200 keys/min
	preserveData?: boolean; // Preserve rhythm data when session becomes inactive
}

export const useRhythmDetection = (isActive: boolean, options: UseRhythmDetectionOptions = {}) => {
	const {
		selectedInstruments = [],
		enableInstrumentalSounds = false,
		accessibilityMode: _accessibilityMode = false,
		throttleRapidTyping = true,
		preserveData = false,
	} = options;
	const [rhythmData, setRhythmData] = useState<RhythmData>({
		rhythmScore: 0,
		bpm: 0,
		averageBpm: 0,
		intensity: 'low',
		keystrokeCount: 0,
		clickCount: 0,
		mouseMoveCount: 0,
		scrollCount: 0,
		averageInterval: 0,
		keysPerMinute: 0,
	});

	const keystrokeTimestamps = useRef<number[]>([]);
	const clickTimestamps = useRef<number[]>([]); // Track mouse clicks (T130)
	const mouseMovements = useRef<number[]>([]);
	const scrollTimestamps = useRef<number[]>([]); // Track scroll events separately
	const lastUpdateTime = useRef<number>(Date.now());
	const audioEngineRef = useRef(getAudioEngine());
	const instrumentIndexRef = useRef(0); // Round-robin index for multiple instruments
	const lastKeystrokeTime = useRef<number>(0);
	const lastMouseMoveTime = useRef<number>(0); // Throttle mouse move events
	const lastScrollTime = useRef<number>(0); // Throttle scroll events
	const bpmHistory = useRef<number[]>([]); // Track BPM values over time for averaging

	// Cumulative counters for total session activity (not limited by array sizes)
	const totalKeystrokes = useRef<number>(0);
	const totalClicks = useRef<number>(0);
	const totalMouseMoves = useRef<number>(0);
	const totalScrolls = useRef<number>(0);

	const calculateRhythm = useCallback(() => {
		const now = Date.now();

		// Combine all interaction types for more comprehensive rhythm score
		const allInteractions = [
			...keystrokeTimestamps.current,
			...clickTimestamps.current,
			...mouseMovements.current,
		].sort((a, b) => a - b); // Sort chronologically

		const recentInteractions = allInteractions.filter(
			(ts) => now - ts < 5000 // Last 5 seconds
		);

		if (recentInteractions.length < 2) {
			// For minimal activity, still calculate a reasonable BPM if there are any interactions
			let estimatedBpm = 0;
			if (allInteractions.length >= 1) {
				// Estimate BPM based on total session activity
				// Typical typing: 40-60 WPM = 120-180 CPM = 2-3 CPS = 120-180 BPM
				// For minimal activity, use a conservative estimate
				const totalInteractions = allInteractions.length;
				const sessionDurationMinutes = (now - Math.min(...allInteractions)) / 60000;
				if (sessionDurationMinutes > 0) {
					const interactionsPerMinute = totalInteractions / sessionDurationMinutes;
					estimatedBpm = Math.min(180, Math.max(40, Math.round(interactionsPerMinute * 2))); // Rough estimate
				} else {
					// Very short session with activity, use default
					estimatedBpm = 60; // Reasonable default for minimal activity
				}

				// Add to BPM history for averaging
				bpmHistory.current.push(estimatedBpm);
				if (bpmHistory.current.length > 50) {
					bpmHistory.current.shift();
				}
			}

			// Calculate average from history
			const historicalAverageBpm =
				bpmHistory.current.length > 0
					? Math.round(bpmHistory.current.reduce((a, b) => a + b, 0) / bpmHistory.current.length)
					: estimatedBpm;

			setRhythmData((prev) => ({
				...prev,
				rhythmScore: 0,
				bpm: estimatedBpm,
				averageBpm: historicalAverageBpm || prev.averageBpm || estimatedBpm, // Ensure non-zero average
				intensity: 'low',
				keysPerMinute: 0,
			}));
			return;
		}

		const intervals: number[] = [];
		for (let i = 1; i < recentInteractions.length; i++) {
			intervals.push(recentInteractions[i] - recentInteractions[i - 1]);
		}

		const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

		// More achievable rhythm score for normal human typing/interaction
		// Reduced intervals by 50% to make scores more achievable
		// Average typing: 100-200ms intervals (5-10 actions/sec)
		// Formula adjusted: score 100 at 100ms interval (10 actions/sec)
		const rhythmScore = Math.min(100, 10000 / Math.max(averageInterval, 100));
		const bpm = Math.round((60000 / Math.max(averageInterval, 50)) * 0.25);

		// Track BPM values for averaging (keep last 50 values to avoid memory issues)
		bpmHistory.current.push(bpm);
		if (bpmHistory.current.length > 50) {
			bpmHistory.current.shift();
		}

		// Calculate average BPM from history
		const averageBpm =
			bpmHistory.current.length > 0
				? Math.round(bpmHistory.current.reduce((a, b) => a + b, 0) / bpmHistory.current.length)
				: bpm; // If no history, use current BPM as average

		// Ensure averageBpm is never 0 for sessions with activity
		const finalAverageBpm =
			averageBpm > 0 ? averageBpm : keystrokeTimestamps.current.length > 0 ? Math.max(bpm, 60) : 0;

		// Calculate keys per minute (keyboard only)
		const timeWindowMs = 60000; // 1 minute
		const recentMinuteKeystrokes = keystrokeTimestamps.current.filter(
			(ts) => now - ts < timeWindowMs
		);
		const keysPerMinute = recentMinuteKeystrokes.length;

		// Adjust intensity based on rhythm score (50% faster intervals)
		// Low: 0-40 (slow, thoughtful - 250ms+ intervals)
		// Medium: 40-70 (normal, steady - 150-250ms intervals)
		// High: 70+ (fast, energetic - 100-150ms intervals)
		let intensity: 'low' | 'medium' | 'high' = 'low';
		if (rhythmScore >= 70)
			intensity = 'high'; // Fast, energetic typing
		else if (rhythmScore >= 40) intensity = 'medium'; // Normal, steady pace
		// else: <40 = slow, thoughtful

		setRhythmData({
			rhythmScore: Math.round(rhythmScore),
			bpm: Math.min(bpm, 180),
			averageBpm: finalAverageBpm,
			intensity,
			keystrokeCount: totalKeystrokes.current,
			clickCount: totalClicks.current,
			mouseMoveCount: totalMouseMoves.current,
			scrollCount: totalScrolls.current,
			averageInterval: Math.round(averageInterval),
			keysPerMinute,
		});
	}, []);
	const handleKeyDown = useCallback(() => {
		if (!isActive) return;

		const now = Date.now();
		keystrokeTimestamps.current.push(now);
		totalKeystrokes.current++; // Increment cumulative counter
		console.log('[useRhythmDetection] Keystroke detected, total:', totalKeystrokes.current);

		if (keystrokeTimestamps.current.length > 50) {
			keystrokeTimestamps.current.shift();
		}

		// Trigger instrumental sound on keystroke (T072)
		if (enableInstrumentalSounds && selectedInstruments.length > 0) {
			console.log(
				'[useRhythmDetection] Instrumental sounds enabled, instruments:',
				selectedInstruments
			);

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
				console.log(
					`[useRhythmDetection] Playing instrument: ${selectedInstruments[instrumentIndexRef.current % selectedInstruments.length]}, vel=${velocity}`
				);
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
		throttleRapidTyping,
	]);

	const handleMouseMove = useCallback(() => {
		if (!isActive) return;

		const now = Date.now();

		// Throttle mouse move events to avoid excessive note playing (300ms minimum between moves)
		if (now - lastMouseMoveTime.current < 200) {
			return;
		}

		mouseMovements.current.push(now);
		totalMouseMoves.current++; // Increment cumulative counter

		if (mouseMovements.current.length > 30) {
			mouseMovements.current.shift();
		}

		lastMouseMoveTime.current = now;
		lastKeystrokeTime.current = now; // Update for inactivity detection

		// Play note on mouse move if instrumental sounds enabled
		if (enableInstrumentalSounds && selectedInstruments.length > 0) {
			// Use a lighter instrument or lower velocity for mouse moves
			const instrument =
				INSTRUMENTS[selectedInstruments[instrumentIndexRef.current % selectedInstruments.length]];
			const velocity = 0.3; // Subtle volume for mouse moves

			audioEngineRef.current.playInstrumentNote(instrument, velocity);

			// Advance to next instrument for round-robin
			instrumentIndexRef.current = (instrumentIndexRef.current + 1) % selectedInstruments.length;
		}
	}, [isActive, enableInstrumentalSounds, selectedInstruments]);

	const handleMouseScroll = useCallback(
		(event: WheelEvent) => {
			if (!isActive) return;

			const now = Date.now();

			// Throttle scroll events (200ms minimum between scrolls)
			if (now - lastScrollTime.current < 200) {
				return;
			}

			// Record scroll event timestamp
			scrollTimestamps.current.push(now);
			totalScrolls.current++; // Increment cumulative counter
			if (scrollTimestamps.current.length > 50) {
				scrollTimestamps.current.shift();
			}

			lastScrollTime.current = now;
			lastKeystrokeTime.current = now;

			// Play note on scroll if instrumental sounds enabled
			if (enableInstrumentalSounds && selectedInstruments.length > 0) {
				const instrument =
					INSTRUMENTS[selectedInstruments[instrumentIndexRef.current % selectedInstruments.length]];
				const velocity = Math.abs(event.deltaY) > 50 ? 0.5 : 0.35; // Louder for fast scrolls

				audioEngineRef.current.playInstrumentNote(instrument, velocity);

				instrumentIndexRef.current = (instrumentIndexRef.current + 1) % selectedInstruments.length;
			}
		},
		[isActive, enableInstrumentalSounds, selectedInstruments]
	);

	const handleMouseClick = useCallback(() => {
		if (!isActive) return;

		// Track click timestamp (T130 - session stats)
		const now = Date.now();
		clickTimestamps.current.push(now);
		totalClicks.current++; // Increment cumulative counter

		// Play bass-range sound for mouse clicks (T074) if enabled
		if (enableInstrumentalSounds && selectedInstruments.length > 0) {
			const bassInstrument = INSTRUMENTS.bass;
			// Lower volume for mouse clicks (subtle)
			const velocity = 0.4;

			audioEngineRef.current.playInstrumentNote(bassInstrument, velocity, 0.8);
		}
	}, [isActive, enableInstrumentalSounds, selectedInstruments]);

	useEffect(() => {
		if (!isActive) {
			// Only reset data if preserveData is false
			if (!preserveData) {
				keystrokeTimestamps.current = [];
				clickTimestamps.current = [];
				mouseMovements.current = [];
				scrollTimestamps.current = []; // Reset scroll timestamps
				totalKeystrokes.current = 0; // Reset cumulative counters
				totalClicks.current = 0;
				totalMouseMoves.current = 0;
				totalScrolls.current = 0;
				lastKeystrokeTime.current = 0;
				instrumentIndexRef.current = 0;
				setRhythmData({
					rhythmScore: 0,
					bpm: 0,
					averageBpm: 0,
					intensity: 'low',
					keystrokeCount: 0,
					clickCount: 0,
					mouseMoveCount: 0,
					scrollCount: 0,
					averageInterval: 0,
					keysPerMinute: 0,
				});
			}
			return;
		}

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('click', handleMouseClick);
		window.addEventListener('wheel', handleMouseScroll as any, { passive: true });

		const intervalId = setInterval(calculateRhythm, 1000);

		// Update rhythm data immediately when becoming active
		calculateRhythm();

		// Inactivity detection: stop instrumental sounds after 5 seconds (T076)
		let inactivityTimer: NodeJS.Timeout;
		if (enableInstrumentalSounds) {
			inactivityTimer = setInterval(() => {
				const now = Date.now();
				const timeSinceLastKeystroke = now - lastKeystrokeTime.current;
				if (timeSinceLastKeystroke > 5000) {
					// More than 5 seconds inactive - instrumental sounds automatically stop
					// (ambient music continues, per FR-016)
					console.log(
						'[useRhythmDetection] 5-second inactivity detected, instrumental sounds paused'
					);
				}
			}, 1000);
		}

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('click', handleMouseClick);
			window.removeEventListener('wheel', handleMouseScroll as any);
			clearInterval(intervalId);
			if (inactivityTimer) clearInterval(inactivityTimer);
		};
	}, [
		isActive,
		handleKeyDown,
		handleMouseMove,
		handleMouseClick,
		handleMouseScroll,
		calculateRhythm,
		enableInstrumentalSounds,
		preserveData,
	]);

	const resetRhythm = useCallback(() => {
		keystrokeTimestamps.current = [];
		clickTimestamps.current = [];
		mouseMovements.current = [];
		scrollTimestamps.current = []; // Reset scroll timestamps
		totalKeystrokes.current = 0; // Reset cumulative counters
		totalClicks.current = 0;
		totalMouseMoves.current = 0;
		totalScrolls.current = 0;
		bpmHistory.current = []; // Reset BPM history
		lastKeystrokeTime.current = 0;
		instrumentIndexRef.current = 0;
		setRhythmData({
			rhythmScore: 0,
			bpm: 0,
			averageBpm: 0,
			intensity: 'low',
			keystrokeCount: 0,
			clickCount: 0,
			mouseMoveCount: 0,
			scrollCount: 0,
			averageInterval: 0,
			keysPerMinute: 0,
		});
	}, []);

	return { rhythmData, resetRhythm };
};
