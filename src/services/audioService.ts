/**
 * Audio synthesis service for generating ambient Lofi music
 * Uses Web Audio API OscillatorNode for real-time sound generation
 * Supports both continuous ambient soundscapes and per-keystroke instrumental notes
 * @module services/audioService
 */

import { getAudioContext } from '../lib/audioContext';
import type { Mood } from '../../backend/src/types';
import type { InstrumentConfig } from '../lib/instruments';

export interface AudioConfig {
	baseFrequency: number;
	tempo: number; // BPM
	volume: number; // 0-1
	waveform: OscillatorType;
}

/**
 * Mood to audio configuration mapping
 * Based on research.md specifications
 */
const MOOD_CONFIGS: Record<Mood, AudioConfig> = {
	'deep-focus': {
		baseFrequency: 160, // Hz - low, grounding
		tempo: 60, // BPM - slow, steady
		volume: 0.3,
		waveform: 'sine',
	},
	'creative-flow': {
		baseFrequency: 200, // Hz - mid-range, inspiring
		tempo: 80, // BPM - moderate, flowing
		volume: 0.4,
		waveform: 'triangle',
	},
	'calm-reading': {
		baseFrequency: 150, // Hz - very low, calming
		tempo: 50, // BPM - very slow
		volume: 0.25,
		waveform: 'sine',
	},
	'energized-coding': {
		baseFrequency: 220, // Hz - higher, energizing
		tempo: 100, // BPM - faster, driving
		volume: 0.45,
		waveform: 'sawtooth',
	},
};

export class AudioEngine {
	private ctx: AudioContext;
	private masterGain: GainNode;
	private oscillators: OscillatorNode[] = [];
	private filters: BiquadFilterNode[] = [];
	private isPlaying = false;
	private currentMood: Mood | null = null;

	constructor() {
		this.ctx = getAudioContext();
		this.masterGain = this.ctx.createGain();
		this.masterGain.connect(this.ctx.destination);
		this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
	}

	/**
	 * Start playing ambient music for the selected mood
	 */
	async start(mood: Mood): Promise<void> {
		if (this.isPlaying) {
			this.stop();
		}

		// Resume AudioContext if suspended (browser autoplay policy)
		if (this.ctx.state === 'suspended') {
			await this.ctx.resume();
		}

		const config = MOOD_CONFIGS[mood];
		this.currentMood = mood;
		this.isPlaying = true;

		// Create base ambient oscillator (root note)
		const baseOsc = this.createOscillator(config.baseFrequency, config.waveform, 0.3);

		// Create harmony oscillator (perfect fifth above)
		const harmonyOsc = this.createOscillator(config.baseFrequency * 1.5, config.waveform, 0.2);

		// Create sub-bass oscillator (octave below)
		const bassOsc = this.createOscillator(config.baseFrequency / 2, 'sine', 0.15);

		// Apply low-pass filter for Lofi warmth
		const filter = this.ctx.createBiquadFilter();
		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(800, this.ctx.currentTime); // Cut high frequencies
		filter.Q.setValueAtTime(1, this.ctx.currentTime);

		// Connect oscillators through filter to master gain
		[baseOsc, harmonyOsc, bassOsc].forEach((osc) => {
			osc.connect(filter);
		});
		filter.connect(this.masterGain);
		this.filters.push(filter);

		// Fade in master gain
		this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
		this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
		this.masterGain.gain.linearRampToValueAtTime(
			config.volume,
			this.ctx.currentTime + 1, // 1 second fade-in
		);

		// Start all oscillators
		const now = this.ctx.currentTime;
		[baseOsc, harmonyOsc, bassOsc].forEach((osc) => {
			osc.start(now);
		});

		console.log(`[AudioEngine] Started ambient music for mood: ${mood}`);
	}

	/**
	 * Stop all audio with fadeout
	 */
	stop(): void {
		if (!this.isPlaying) return;

		const now = this.ctx.currentTime;
		const fadeOutDuration = 2; // 2 seconds

		// Fade out master gain
		this.masterGain.gain.cancelScheduledValues(now);
		this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
		this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + fadeOutDuration);

		// Stop and disconnect all oscillators after fadeout
		setTimeout(() => {
			this.oscillators.forEach((osc) => {
				try {
					osc.stop();
					osc.disconnect();
				} catch (e) {
					// Oscillator may have already stopped
				}
			});
			this.filters.forEach((filter) => filter.disconnect());
			this.oscillators = [];
			this.filters = [];
			this.isPlaying = false;

			console.log('[AudioEngine] Stopped ambient music');
		}, fadeOutDuration * 1000);
	}

	/**
	 * Set volume (0-1 range)
	 */
	setVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
		this.masterGain.gain.setValueAtTime(
			this.masterGain.gain.value,
			this.ctx.currentTime,
		);
		this.masterGain.gain.linearRampToValueAtTime(
			clampedVolume,
			this.ctx.currentTime + 0.1, // Smooth transition
		);
		console.log(`[AudioEngine] Volume set to ${(clampedVolume * 100).toFixed(0)}%`);
	}

	/**
	 * Get current playback state
	 */
	getState(): { isPlaying: boolean; mood: Mood | null; volume: number } {
		return {
			isPlaying: this.isPlaying,
			mood: this.currentMood,
			volume: this.masterGain.gain.value,
		};
	}

	/**
	 * Create an oscillator node with specified parameters
	 * @private
	 */
	private createOscillator(
		frequency: number,
		type: OscillatorType,
		gainValue: number,
	): OscillatorNode {
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
		gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);

		osc.connect(gain);
		// Note: gain will be connected to filter in start() method

		this.oscillators.push(osc);
		return osc;
	}

	/**
	 * Play an instrumental note with ADSR envelope
	 * @param instrument - Instrument configuration
	 * @param frequency - Note frequency in Hz
	 * @param velocity - Note velocity (0-1)
	 * @param duration - Note duration in seconds (default 1.1)
	 */
	playInstrumentNote(
		instrument: InstrumentConfig,
		frequency: number,
		velocity: number,
		duration: number = 1.1,
	): void {
		const now = this.ctx.currentTime;
		const { envelope, waveform, harmonics = [] } = instrument;

		// Create main oscillator
		const osc = this.ctx.createOscillator();
		osc.type = waveform;
		osc.frequency.setValueAtTime(frequency, now);

		// Create gain node for ADSR envelope
		const gain = this.ctx.createGain();

		// ADSR envelope (per research.md)
		gain.gain.setValueAtTime(0, now);
		gain.gain.linearRampToValueAtTime(
			velocity * instrument.baseVolume,
			now + envelope.attack,
		); // Attack
		gain.gain.exponentialRampToValueAtTime(
			velocity * instrument.baseVolume * envelope.sustain,
			now + envelope.attack + envelope.decay,
		); // Decay
		gain.gain.setValueAtTime(
			velocity * instrument.baseVolume * envelope.sustain,
			now + envelope.attack + envelope.decay + duration - envelope.release,
		); // Sustain
		gain.gain.exponentialRampToValueAtTime(
			0.001,
			now + envelope.attack + envelope.decay + duration,
		); // Release

		// Connect oscillator through gain to master
		osc.connect(gain);
		gain.connect(this.masterGain);

		// Add harmonic oscillators for richer timbre
		const harmonicOscs: OscillatorNode[] = [];
		harmonics.forEach((harmonic, index) => {
			const harmOsc = this.ctx.createOscillator();
			harmOsc.type = waveform;
			harmOsc.frequency.setValueAtTime(frequency * harmonic, now);

			const harmGain = this.ctx.createGain();
			// Harmonics are quieter than fundamental
			const harmonicVolume = velocity * instrument.baseVolume * 0.3 * (1 / (index + 2));
			harmGain.gain.setValueAtTime(0, now);
			harmGain.gain.linearRampToValueAtTime(harmonicVolume, now + envelope.attack);
			harmGain.gain.exponentialRampToValueAtTime(
				harmonicVolume * envelope.sustain,
				now + envelope.attack + envelope.decay,
			);
			harmGain.gain.setValueAtTime(
				harmonicVolume * envelope.sustain,
				now + envelope.attack + envelope.decay + duration - envelope.release,
			);
			harmGain.gain.exponentialRampToValueAtTime(
				0.001,
				now + envelope.attack + envelope.decay + duration,
			);

			harmOsc.connect(harmGain);
			harmGain.connect(this.masterGain);

			harmonicOscs.push(harmOsc);
		});

		// Start and schedule stop
		const totalDuration = envelope.attack + envelope.decay + duration;
		osc.start(now);
		osc.stop(now + totalDuration);
		harmonicOscs.forEach((harmOsc) => {
			harmOsc.start(now);
			harmOsc.stop(now + totalDuration);
		});
	}

	/**
	 * Cleanup resources
	 */
	dispose(): void {
		this.stop();
		this.masterGain.disconnect();
	}
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null;

/**
 * Get or create AudioEngine singleton
 */
export function getAudioEngine(): AudioEngine {
	if (!audioEngineInstance) {
		audioEngineInstance = new AudioEngine();
	}
	return audioEngineInstance;
}
