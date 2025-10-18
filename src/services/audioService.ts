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
 */
const MOOD_CONFIGS: Record<Mood, AudioConfig> = {
	'deep-focus': {
		baseFrequency: 160, // Hz - Low, calming frequency
		tempo: 60, // BPM - slow, steady
		volume: 0.5, // 50% volume
		waveform: 'sine',
	},
	'creative-flow': {
		baseFrequency: 200, // Hz - Slightly higher, more energetic
		tempo: 80, // BPM - moderate, flowing
		volume: 0.5, // 50% volume
		waveform: 'triangle',
	},
	'calm-reading': {
		baseFrequency: 150, // Hz - Very low, soothing
		tempo: 50, // BPM - very slow
		volume: 0.4, // 40% volume - quieter for reading
		waveform: 'sine',
	},
	'energized-coding': {
		baseFrequency: 220, // Hz - Higher, more alert
		tempo: 100, // BPM - faster, driving
		volume: 0.6, // 60% volume - more energetic
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
	private drumLoopInterval: NodeJS.Timeout | null = null;
	private vinylNoiseNode: AudioBufferSourceNode | null = null;
	private currentScaleIndex = 0; // Track position in scale for melodic progression

	// C Minor Pentatonic Scale (fits lofi jazz chords)
	// Scale degrees: C, Eb, F, G, Bb (1, b3, 4, 5, b7)
	private readonly pentatonicScale = [
		262, // C4
		311, // Eb4
		349, // F4
		392, // G4
		466, // Bb4
		523, // C5
		622, // Eb5
		698, // F5
		784, // G5
		932, // Bb5
	];

	constructor() {
		this.ctx = getAudioContext();
		this.masterGain = this.ctx.createGain();
		this.masterGain.connect(this.ctx.destination);
		this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
		console.log('[AudioEngine] Constructor - AudioContext state:', this.ctx.state);
		console.log('[AudioEngine] Constructor - Master gain connected to destination');
	}

	/**
	 * Start playing ambient music for the selected mood
	 */
	async start(mood: Mood): Promise<void> {
		if (this.isPlaying) {
			console.log('[AudioEngine] Already playing, stopping first');
			this.stop();
		}

		console.log('[AudioEngine] Start called - AudioContext state:', this.ctx.state);
		
		// Resume AudioContext if suspended (browser autoplay policy)
		if (this.ctx.state === 'suspended') {
			console.log('[AudioEngine] Resuming suspended AudioContext...');
			await this.ctx.resume();
			console.log('[AudioEngine] AudioContext resumed, state:', this.ctx.state);
		}
		
		// Ensure masterGain is connected to destination
		try {
			this.masterGain.disconnect();
		} catch (e) {
			// masterGain not connected yet (first run)
		}
		this.masterGain.connect(this.ctx.destination);

		const config = MOOD_CONFIGS[mood];
		this.currentMood = mood;
		this.isPlaying = true;
		
		console.log('[AudioEngine] Config for mood:', mood, config);

		// Create lofi hip-hop beat elements
		this.createLofiBeat(config);
		
		// Start vinyl crackle noise
		this.startVinylNoise();

		// Fade in master gain
		const now = this.ctx.currentTime;
		this.masterGain.gain.cancelScheduledValues(now);
		this.masterGain.gain.setValueAtTime(0, now);
		this.masterGain.gain.linearRampToValueAtTime(
			config.volume,
			now + 1, // 1 second fade-in
		);

		console.log(`[AudioEngine] ✅ Started lofi beat for mood: ${mood}`);
		console.log(`[AudioEngine] AudioContext state: ${this.ctx.state}`);
	}

	/**
	 * Create lofi hip-hop beat with drums, chords, and bass
	 * @private
	 */
	private createLofiBeat(config: AudioConfig): void {
		// Start the drum loop
		this.startDrumLoop(config.tempo);
		
		// Create jazz chord progression
		this.createJazzChords(config);
		
		// Create walking bass line
		this.createBassLine(config);
	}

	/**
	 * Start lofi drum loop (kick, snare, hi-hat)
	 * @private
	 */
	private startDrumLoop(tempo: number): void {
		const beatDuration = 60 / tempo; // seconds per beat
		let beatCount = 0;

		const playBeat = () => {
			const now = this.ctx.currentTime;
			
			// Kick drum on beats 1 and 3 (4/4 time)
			if (beatCount % 4 === 0 || beatCount % 4 === 2) {
				this.playKick(now);
			}
			
			// Snare on beats 2 and 4
			if (beatCount % 4 === 1 || beatCount % 4 === 3) {
				this.playSnare(now);
			}
			
			// Hi-hat on every beat
			this.playHiHat(now);
			
			beatCount++;
		};

		// Start immediately
		playBeat();
		
		// Schedule recurring beats
		this.drumLoopInterval = setInterval(playBeat, beatDuration * 1000);
	}

	/**
	 * Play kick drum sound
	 * @private
	 */
	private playKick(startTime: number): void {
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		
		// Kick = pitched down sine wave (60Hz -> 40Hz)
		osc.type = 'sine';
		osc.frequency.setValueAtTime(60, startTime);
		osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.05);
		
		// Punchy envelope
		gain.gain.setValueAtTime(0.8, startTime);
		gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
		
		osc.connect(gain);
		gain.connect(this.masterGain);
		
		osc.start(startTime);
		osc.stop(startTime + 0.3);
	}

	/**
	 * Play snare drum sound
	 * @private
	 */
	private playSnare(startTime: number): void {
		// Snare = white noise + tone
		const noise = this.ctx.createBufferSource();
		const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
		const data = noiseBuffer.getChannelData(0);
		
		// Generate white noise
		for (let i = 0; i < data.length; i++) {
			data[i] = Math.random() * 2 - 1;
		}
		noise.buffer = noiseBuffer;
		
		const noiseGain = this.ctx.createGain();
		const noiseFilter = this.ctx.createBiquadFilter();
		noiseFilter.type = 'highpass';
		noiseFilter.frequency.value = 1000;
		
		// Snappy envelope
		noiseGain.gain.setValueAtTime(0.3, startTime);
		noiseGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
		
		noise.connect(noiseFilter);
		noiseFilter.connect(noiseGain);
		noiseGain.connect(this.masterGain);
		
		noise.start(startTime);
		noise.stop(startTime + 0.15);
		
		// Add tonal component
		const osc = this.ctx.createOscillator();
		const oscGain = this.ctx.createGain();
		osc.type = 'triangle';
		osc.frequency.value = 200;
		
		oscGain.gain.setValueAtTime(0.1, startTime);
		oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
		
		osc.connect(oscGain);
		oscGain.connect(this.masterGain);
		
		osc.start(startTime);
		osc.stop(startTime + 0.1);
	}

	/**
	 * Play hi-hat sound
	 * @private
	 */
	private playHiHat(startTime: number): void {
		const noise = this.ctx.createBufferSource();
		const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
		const data = noiseBuffer.getChannelData(0);
		
		// Generate white noise
		for (let i = 0; i < data.length; i++) {
			data[i] = Math.random() * 2 - 1;
		}
		noise.buffer = noiseBuffer;
		
		const gain = this.ctx.createGain();
		const filter = this.ctx.createBiquadFilter();
		filter.type = 'highpass';
		filter.frequency.value = 7000; // High frequency for metallic sound
		
		// Quick, crisp envelope
		gain.gain.setValueAtTime(0.15, startTime);
		gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
		
		noise.connect(filter);
		filter.connect(gain);
		gain.connect(this.masterGain);
		
		noise.start(startTime);
		noise.stop(startTime + 0.05);
	}

	/**
	 * Create jazzy chord progression (continuous)
	 * @private
	 */
	private createJazzChords(config: AudioConfig): void {
		// Jazz chord progression in C minor (common lofi key)
		// Cm7 - Fm7 - Bbmaj7 - Ebmaj7
		const chordProgression = [
			[262, 311, 392, 466], // Cm7 (C, Eb, G, Bb)
			[349, 415, 523, 622], // Fm7 (F, Ab, C, Eb)
			[233, 294, 370, 440], // Bbmaj7 (Bb, D, F, A)
			[311, 392, 494, 587], // Ebmaj7 (Eb, G, Bb, D)
		];
		
		const chordDuration = (60 / config.tempo) * 4; // 4 beats per chord
		let chordIndex = 0;

		const playChord = () => {
			const chord = chordProgression[chordIndex];
			const now = this.ctx.currentTime;
			
			chord.forEach((frequency) => {
				const osc = this.ctx.createOscillator();
				const gain = this.ctx.createGain();
				const filter = this.ctx.createBiquadFilter();
				
				osc.type = 'triangle'; // Warm, mellow tone
				osc.frequency.value = frequency;
				
				filter.type = 'lowpass';
				filter.frequency.value = 800; // Lofi warmth
				filter.Q.value = 1;
				
				gain.gain.setValueAtTime(0, now);
				gain.gain.linearRampToValueAtTime(0.08, now + 0.1); // Soft attack
				gain.gain.setValueAtTime(0.08, now + chordDuration - 0.5);
				gain.gain.linearRampToValueAtTime(0, now + chordDuration); // Fade out
				
				osc.connect(filter);
				filter.connect(gain);
				gain.connect(this.masterGain);
				this.filters.push(filter);
				
				osc.start(now);
				osc.stop(now + chordDuration);
				this.oscillators.push(osc);
			});
			
			chordIndex = (chordIndex + 1) % chordProgression.length;
			
			// Schedule next chord
			if (this.isPlaying) {
				setTimeout(playChord, chordDuration * 1000);
			}
		};

		playChord();
	}

	/**
	 * Create walking bass line
	 * @private
	 */
	private createBassLine(config: AudioConfig): void {
		// Bass notes following the chord progression
		const bassNotes = [131, 175, 117, 156]; // C2, F2, Bb1, Eb2
		const noteDuration = (60 / config.tempo) * 2; // 2 beats per note
		let noteIndex = 0;

		const playBassNote = () => {
			const frequency = bassNotes[noteIndex];
			const now = this.ctx.currentTime;
			
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			
			osc.type = 'sine'; // Deep, round bass
			osc.frequency.value = frequency;
			
			// Plucky envelope
			gain.gain.setValueAtTime(0.15, now);
			gain.gain.exponentialRampToValueAtTime(0.05, now + noteDuration * 0.8);
			gain.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);
			
			osc.connect(gain);
			gain.connect(this.masterGain);
			
			osc.start(now);
			osc.stop(now + noteDuration);
			this.oscillators.push(osc);
			
			noteIndex = (noteIndex + 1) % bassNotes.length;
			
			// Schedule next note
			if (this.isPlaying) {
				setTimeout(playBassNote, noteDuration * 1000);
			}
		};

		playBassNote();
	}

	/**
	 * Start vinyl crackle/noise for lofi texture
	 * @private
	 */
	private startVinylNoise(): void {
		// Create pink noise buffer (softer than white noise)
		const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise, looped
		const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		
		// Generate pink noise (1/f noise)
		let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
		for (let i = 0; i < bufferSize; i++) {
			const white = Math.random() * 2 - 1;
			b0 = 0.99886 * b0 + white * 0.0555179;
			b1 = 0.99332 * b1 + white * 0.0750759;
			b2 = 0.96900 * b2 + white * 0.1538520;
			b3 = 0.86650 * b3 + white * 0.3104856;
			b4 = 0.55000 * b4 + white * 0.5329522;
			b5 = -0.7616 * b5 - white * 0.0168980;
			data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
			data[i] *= 0.11; // (roughly) compensate for gain
			b6 = white * 0.115926;
		}
		
		const noise = this.ctx.createBufferSource();
		noise.buffer = buffer;
		noise.loop = true;
		
		const noiseGain = this.ctx.createGain();
		noiseGain.gain.value = 0.02; // Very subtle
		
		const noiseFilter = this.ctx.createBiquadFilter();
		noiseFilter.type = 'lowpass';
		noiseFilter.frequency.value = 3000; // Remove harsh highs
		
		noise.connect(noiseFilter);
		noiseFilter.connect(noiseGain);
		noiseGain.connect(this.masterGain);
		
		noise.start();
		this.vinylNoiseNode = noise;
	}

	/**
	 * Stop all audio with fadeout
	 */
	stop(): void {
		if (!this.isPlaying) return;

		// Stop drum loop
		if (this.drumLoopInterval) {
			clearInterval(this.drumLoopInterval);
			this.drumLoopInterval = null;
		}
		
		// Stop vinyl noise
		if (this.vinylNoiseNode) {
			this.vinylNoiseNode.stop();
			this.vinylNoiseNode = null;
		}
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
	 * Get the next note from the pentatonic scale
	 * Advances through the scale melodically for musical keystroke sounds
	 * @private
	 */
	private getNextScaleNote(): number {
		const note = this.pentatonicScale[this.currentScaleIndex];
		this.currentScaleIndex = (this.currentScaleIndex + 1) % this.pentatonicScale.length;
		return note;
	}

	/**
	 * Play an instrumental note with ADSR envelope
	 * Uses pentatonic scale for melodic progression instead of random frequencies
	 * @param instrument - Instrument configuration
	 * @param velocity - Note velocity (0-1)
	 * @param duration - Note duration in seconds (default 1.1)
	 */
	playInstrumentNote(
		instrument: InstrumentConfig,
		velocity: number,
		duration: number = 1.1,
	): void {
		// Get next note from pentatonic scale
		const frequency = this.getNextScaleNote();
		
		console.log(`[AudioEngine] playInstrumentNote: ${instrument.name}, ${frequency}Hz (scale note), vel=${velocity}`);
		
		const now = this.ctx.currentTime;
		const { envelope, waveform, harmonics = [] } = instrument;

		// Create main oscillator
		const osc = this.ctx.createOscillator();
		osc.type = waveform;
		osc.frequency.setValueAtTime(frequency, now);
		console.log(`[AudioEngine] Created instrument oscillator: ${waveform} at ${frequency}Hz`);

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
		console.log('[AudioEngine] ✅ Connected instrument: oscillator → gain → masterGain');

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
		console.log(`[AudioEngine] ✅ Instrument note playing for ${totalDuration.toFixed(2)}s`);
		
		harmonicOscs.forEach((harmOsc) => {
			harmOsc.start(now);
			harmOsc.stop(now + totalDuration);
		});
		console.log(`[AudioEngine] Started ${harmonicOscs.length} harmonic oscillators`);
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
