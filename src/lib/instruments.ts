/**
 * Instrument Sound Library
 * Defines frequency mappings and ADSR envelope parameters for various instruments
 * @module lib/instruments
 */

export type InstrumentType = 'grand-piano' | 'violin' | 'electric-piano' | 'bass';

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
		name: 'Grand Piano',
		waveform: 'triangle', // Piano-like timbre per research.md
		envelope: {
			attack: 0.1, // Fast attack for percussive feel
			decay: 0.2, // Quick decay
			sustain: 0.7, // Moderate sustain
			release: 0.3, // Short release
		},
		baseFrequency: 440, // A4
		frequencyRange: [261.63, 880], // C4 to A5
		baseVolume: 0.8,
		harmonics: [2], // Octave harmonic for richness
	},

	violin: {
		name: 'Violin',
		waveform: 'sawtooth', // Rich harmonics for string timbre
		envelope: {
			attack: 0.15, // Slower attack for bow feel
			decay: 0.1, // Quick decay
			sustain: 0.8, // Long sustain (bowed strings)
			release: 0.4, // Longer release for natural fade
		},
		baseFrequency: 659.25, // E5 (violin's G string open)
		frequencyRange: [329.63, 1318.51], // E4 to E6
		baseVolume: 0.6,
		harmonics: [1.5, 2], // Fifth and octave for string character
	},

	'electric-piano': {
		name: 'Electric Piano',
		waveform: 'sine', // Clean electric tone
		envelope: {
			attack: 0.05, // Very fast attack
			decay: 0.3, // Medium decay
			sustain: 0.5, // Lower sustain
			release: 0.5, // Medium release
		},
		baseFrequency: 523.25, // C5
		frequencyRange: [261.63, 1046.5], // C4 to C6
		baseVolume: 0.7,
		harmonics: [2, 3], // Octave and twelfth for bell-like quality
	},

	bass: {
		name: 'Bass',
		waveform: 'sine', // Deep, fundamental tone
		envelope: {
			attack: 0.08, // Quick attack
			decay: 0.2, // Quick decay
			sustain: 0.6, // Moderate sustain
			release: 0.25, // Short release
		},
		baseFrequency: 110, // A2 (bass range)
		frequencyRange: [82.41, 220], // E2 to A3
		baseVolume: 0.9,
		harmonics: [0.5], // Sub-octave for deep bass
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
	// Apply curve for more musical dynamics (softer at low scores)
	return 0.3 + normalized * 0.7; // Range: 0.3-1.0
}

/**
 * Apply accessibility mode frequency limits (200-800 Hz per research.md FR-015)
 * @param frequency - Original frequency in Hz
 * @returns Clamped frequency for accessibility
 */
export function applyAccessibilityFrequency(frequency: number): number {
	return Math.max(200, Math.min(800, frequency));
}
