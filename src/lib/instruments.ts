/**
 * Instrument Sound Library
 * Defines frequency mappings and ADSR envelope parameters for various instruments
 * @module lib/instruments
 */

export type InstrumentType = 'grand-piano' | 'flute' | 'electric-piano' | 'bass';

/**
 * ADSR (Attack, Decay, Sustain, Release) envelope parameters
 */
export interface ADSREnvelope {
	attack: number; // Time to reach peak amplitude (seconds)
	decay: number; // Time to decay to sustain level (seconds)
	sustain: number; // Sustain amplitude level (0-1)
	release: number; // Time to fade to zero after note off (seconds)
}

/**
 * Instrument configuration
 */
export interface InstrumentConfig {
	name: string;
	waveform: OscillatorType;
	envelope: ADSREnvelope;
	baseFrequency: number; // Hz
	frequencyRange: [number, number]; // Min/max Hz for tempo adaptation
	baseVolume: number; // 0-1
	harmonics?: number[]; // Multipliers for additional oscillators (e.g., [2, 3] for octave + fifth)
}

/**
 * Instrument configurations library
 * Based on research.md specifications and music theory
 */
export const INSTRUMENTS: Record<InstrumentType, InstrumentConfig> = {
	'grand-piano': {
		name: 'Electric Piano',
		waveform: 'sine', // Sine wave for electric piano's pure, bell-like tone
		envelope: {
			attack: 0.01, // Fast attack for immediate electric piano response (10ms)
			decay: 0.3, // Medium decay for characteristic EP fade
			sustain: 0.6, // Higher sustain - EPs hold notes well
			release: 0.4, // Medium release for smooth fade
		},
		baseFrequency: 440, // A4
		frequencyRange: [261.63, 880], // C4 to A5
		baseVolume: 0.3, // Balanced volume for electric piano
		harmonics: [2, 3, 4], // Limited harmonics for cleaner EP sound
	},

	flute: {
		name: 'Flute',
		waveform: 'sine', // Pure, soft tone for flute
		envelope: {
			attack: 0.08, // Gentle breath attack
			decay: 0.15, // Soft decay
			sustain: 0.75, // Sustained breath
			release: 0.3, // Gentle release for airy fade
		},
		baseFrequency: 523.25, // C5 (middle range for flute)
		frequencyRange: [261.63, 1046.5], // C4 to C6 (flute's comfortable range)
		baseVolume: 0.5, // Softer than violin
		harmonics: [2], // Single octave harmonic for subtle richness
	},

	'electric-piano': {
		name: 'Xylophone',
		waveform: 'triangle', // Bright, percussive tone
		envelope: {
			attack: 0.01, // Very fast attack for percussive hit
			decay: 0.15, // Quick decay
			sustain: 0.2, // Very low sustain for wooden mallet sound
			release: 0.2, // Short release for staccato effect
		},
		baseFrequency: 784, // G5 (higher range for xylophone brightness)
		frequencyRange: [523.25, 1568], // C5 to G6 (xylophone's typical range)
		baseVolume: 0.6,
		harmonics: [2, 3, 4], // Multiple harmonics for metallic/wooden timbre
	},

	bass: {
		name: 'Kalimba',
		waveform: 'sine', // Pure, resonant tone
		envelope: {
			attack: 0.02, // Quick pluck attack
			decay: 0.4, // Medium decay for resonance
			sustain: 0.3, // Low sustain (notes fade naturally)
			release: 0.6, // Long release for bell-like ring
		},
		baseFrequency: 523.25, // C5 (higher range for kalimba)
		frequencyRange: [261.63, 1046.5], // C4 to C6 (kalimba's sweet range)
		baseVolume: 0.7, // Moderate volume for gentle presence
		harmonics: [2, 3, 4], // Multiple harmonics for metallic, bell-like timbre
	},
};

/**
 * Calculate note frequency based on typing tempo
 * @param instrument - Instrument configuration
 * @param keysPerMinute - Current typing speed
 * @returns Frequency in Hz
 */
export function getFrequencyForTempo(
	instrument: InstrumentConfig,
	keysPerMinute: number
): number {
	const [minFreq, maxFreq] = instrument.frequencyRange;

	// Map tempo ranges to frequency ranges per research.md:
	// 40-80 keys/min → lower pitch
	// 80-120 keys/min → higher pitch
	// 120+ keys/min → highest pitch

	let normalizedTempo: number;

	if (keysPerMinute < 40) {
		// Very slow: minimum frequency
		normalizedTempo = 0;
	} else if (keysPerMinute < 80) {
		// Slow: 0-0.33 range
		normalizedTempo = (keysPerMinute - 40) / 40 / 3;
	} else if (keysPerMinute < 120) {
		// Medium: 0.33-0.66 range
		normalizedTempo = 0.33 + ((keysPerMinute - 80) / 40 / 3);
	} else {
		// Fast: 0.66-1.0 range
		normalizedTempo = 0.66 + Math.min((keysPerMinute - 120) / 80 / 3, 0.34);
	}

	// Logarithmic interpolation for musical pitch scaling
	const logMin = Math.log2(minFreq);
	const logMax = Math.log2(maxFreq);
	const frequency = 2 ** (logMin + normalizedTempo * (logMax - logMin));

	return frequency;
}

/**
 * Calculate velocity (volume) based on rhythm intensity
 * @param rhythmScore - Current rhythm score (0-100)
 * @returns Velocity value (0-1)
 */
export function getVelocityForRhythm(rhythmScore: number): number {
	// Map rhythm score to velocity with some dynamic range
	const normalized = Math.max(0, Math.min(100, rhythmScore)) / 100;
	// Apply curve for more musical dynamics (softer overall for gentle experience)
	return 0.2 + normalized * 0.4; // Range: 0.2-0.6 (reduced from 0.3-1.0)
}

/**
 * Apply accessibility mode frequency limits (200-800 Hz per research.md FR-015)
 * @param frequency - Original frequency in Hz
 * @returns Clamped frequency for accessibility
 */
export function applyAccessibilityFrequency(frequency: number): number {
	return Math.max(200, Math.min(800, frequency));
}
