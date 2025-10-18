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
	'melodic-flow': {
		baseFrequency: 262, // Hz - C4 (piano ballad key)
		tempo: 60, // BPM - slow, emotional
		volume: 0.5, // 50% volume
		waveform: 'sine',
	},
	'jazz-harmony': {
		baseFrequency: 220, // Hz - A3 (jazz key center)
		tempo: 90, // BPM - medium swing feel
		volume: 0.5, // 50% volume
		waveform: 'sine',
	},
	'rivers-flow': {
		baseFrequency: 440, // Hz - A4 (Yiruma key center)
		tempo: 65, // BPM - slow, emotional (from MIDI)
		volume: 0.45, // 45% volume - gentle piano
		waveform: 'sine',
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
	private melodyIndex = 0; // Track position in melody sequence
	private jazzChordIndex = 0; // Track current jazz chord in progression
	private jazzChordOscillators: OscillatorNode[] = []; // Active jazz chord oscillators
	private jazzProgressionInterval: NodeJS.Timeout | null = null; // Jazz chord change timer
	
	// Rivers Flow (Yiruma) - MIDI-based melody
	private riversFlowBassIndex = 0; // Track position in bass sequence
	private riversFlowMelodyIndex = 0; // Track position in treble melody
	private riversFlowBassInterval: NodeJS.Timeout | null = null; // Bass note timer

	// C Minor Pentatonic Scale - Extended across 2.5 octaves (15 notes)
	// Scale degrees: C, Eb, F, G, Bb (1, b3, 4, 5, b7)
	private readonly pentatonicScale = [
		131, // C3
		156, // Eb3
		175, // F3
		196, // G3
		233, // Bb3
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

	// Original melodic piano ballad (inspired by emotional piano pieces)
	// 32-note melody in C minor, slow and expressive
	private readonly melodySequence = [
		523, // C5
		622, // Eb5
		698, // F5
		784, // G5
		698, // F5
		622, // Eb5
		523, // C5
		466, // Bb4
		
		392, // G4
		466, // Bb4
		523, // C5
		622, // Eb5
		523, // C5
		466, // Bb4
		392, // G4
		349, // F4
		
		523, // C5
		622, // Eb5
		698, // F5
		784, // G5
		932, // Bb5
		784, // G5
		698, // F5
		622, // Eb5
		
		523, // C5
		466, // Bb4
		392, // G4
		349, // F4
		392, // G4
		466, // Bb4
		523, // C5
		523, // C5 (resolution)
	];

	// Jazz chord progression (ii-V-I in Bb major, classic jazz turnaround)
	// Each chord represented as [root, third, fifth, seventh]
	private readonly jazzChordProgression = [
		{ name: 'Cm7', notes: [262, 311, 392, 466] },      // Cm7 (ii)
		{ name: 'F7', notes: [175, 220, 262, 311] },       // F7 (V)
		{ name: 'BbMaj7', notes: [233, 294, 349, 440] },   // BbMaj7 (I)
		{ name: 'Gm7', notes: [196, 233, 294, 349] },      // Gm7 (vi) - adds movement
	];

	// Scale notes that fit each jazz chord (for keystroke harmonization)
	// Extended to 2 octaves for more variety
	private readonly jazzChordScales = {
		'Cm7': [131, 147, 156, 175, 196, 220, 233, 262, 294, 311, 349, 392, 440, 466, 523],     // C Dorian (2 octaves)
		'F7': [87, 98, 110, 123, 131, 147, 156, 175, 196, 220, 247, 262, 294, 311, 349],        // F Mixolydian (2 octaves)
		'BbMaj7': [117, 131, 147, 156, 175, 196, 220, 233, 262, 294, 311, 349, 392, 440, 466],  // Bb Major (2 octaves)
		'Gm7': [98, 110, 117, 131, 147, 165, 175, 196, 220, 233, 262, 294, 330, 349, 392],      // G Dorian (2 octaves)
	};

	// Rivers Flow (Yiruma) - MIDI-extracted notes
	// Bass notes (< C3 / 130.81Hz) - background layer, played continuously
	private readonly riversFlowBass = [110, 110, 110, 110, 110, 110, 110]; // All A2 pedal tones
	
	// Treble notes (>= C3 / 130.81Hz) - keystroke-triggered melody
	private readonly riversFlowMelody = [
		880, 185, 830.61, 277.18, 880, 369.99, 830.61, 880, 146.83, 659.26, 220, 880, 329.63, 587.33, 440,
		554.37, 880, 185, 830.61, 277.18, 880, 369.99, 830.61, 880, 146.83, 659.26, 220, 880, 329.63, 587.33, 
		440, 554.37, 880, 185, 830.61, 277.18, 880, 369.99, 440, 830.61, 880, 146.83, 440, 659.26, 220, 880, 
		329.63, 440, 587.33, 146.83, 440, 554.37, 587.33, 164.81, 440, 659.26, 277.18, 554.37, 415.3, 493.88, 
		207.65, 246.94, 329.63, 440, 415.3, 440, 185, 277.18, 369.99, 329.63, 440, 493.88, 554.37, 146.83, 220, 
		329.63, 554.37, 587.33, 659.26, 164.81, 277.18, 587.33, 554.37, 493.88, 164.81, 246.94, 415.3, 880, 185, 
		830.61, 277.18, 880, 369.99, 440, 830.61, 880, 146.83, 440, 659.26, 220
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

		// For melodic-flow mood, skip the lofi beat and vinyl noise
		// Only play melody notes triggered by keystrokes
		if (mood === 'melodic-flow') {
			console.log('[AudioEngine] Melodic-flow mode: No background beats, melody-only');
		} else if (mood === 'jazz-harmony') {
			// For jazz-harmony mood, play jazz chord progression (no drums)
			console.log('[AudioEngine] Jazz-harmony mode: Chord progression with harmonized keystrokes');
			this.startJazzProgression(config.tempo);
		} else if (mood === 'rivers-flow') {
			// For rivers-flow mood, play bass notes as background layer
			// Treble notes triggered by keystrokes
			console.log('[AudioEngine] Rivers Flow mode: MIDI bass background + keystroke melody');
			this.startRiversFlowBass(config.tempo);
		} else {
			// Create lofi hip-hop beat elements for other moods
			this.createLofiBeat(config);
			
			// Start vinyl crackle noise
			this.startVinylNoise();
		}

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
	 * Create lofi hip-hop beat with drums only (no continuous chords/bass)
	 * @private
	 */
	private createLofiBeat(config: AudioConfig): void {
		// Start the drum loop
		this.startDrumLoop(config.tempo);
		
		// NOTE: Removed continuous jazz chords and bass line per user request
		// Only keeping drums + vinyl crackle for clean lofi vibe
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

	// REMOVED: createJazzChords() - continuous chord progression removed per user request
	// REMOVED: createBassLine() - continuous bass line removed per user request
	// These created the constant drone sound that was distracting
	// Now only using drums + vinyl crackle for clean lofi vibe

	/**
	 * Start jazz chord progression with smooth voice leading
	 * Changes chords every 4 beats (measures)
	 * @private
	 */
	private startJazzProgression(tempo: number): void {
		const beatsPerMeasure = 4;
		const measureDuration = (60 / tempo) * beatsPerMeasure; // seconds per measure
		
		const playNextChord = () => {
			// Stop previous chord
			this.stopJazzChord();
			
			// Get current chord from progression
			const chord = this.jazzChordProgression[this.jazzChordIndex];
			console.log(`[AudioEngine] Jazz chord: ${chord.name}`);
			
			// Play the chord
			this.playJazzChord(chord.notes);
			
			// Advance to next chord
			this.jazzChordIndex = (this.jazzChordIndex + 1) % this.jazzChordProgression.length;
		};
		
		// Start immediately with first chord
		playNextChord();
		
		// Schedule chord changes
		this.jazzProgressionInterval = setInterval(playNextChord, measureDuration * 1000);
	}

	/**
	 * Play a jazz chord (4-note voicing)
	 * @private
	 */
	private playJazzChord(notes: number[]): void {
		const now = this.ctx.currentTime;
		
		// Create oscillator for each note in the chord
		for (const freq of notes) {
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			
			// Use sine wave for warm jazz tone
			osc.type = 'sine';
			osc.frequency.setValueAtTime(freq, now);
			
			// Soft volume per note, overall chord is balanced
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(0.08, now + 0.05); // Gentle attack
			
			osc.connect(gain);
			gain.connect(this.masterGain);
			
			osc.start(now);
			this.jazzChordOscillators.push(osc);
		}
	}

	/**
	 * Stop current jazz chord with fadeout
	 * @private
	 */
	private stopJazzChord(): void {
		const now = this.ctx.currentTime;
		const fadeOutDuration = 0.1; // Quick fade for chord changes
		
		for (const osc of this.jazzChordOscillators) {
			try {
				// Fade out
				const gainNode = osc.context.createGain();
				gainNode.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
				osc.stop(now + fadeOutDuration);
			} catch (e) {
				// Already stopped
			}
		}
		
		this.jazzChordOscillators = [];
	}

	/**
	 * Start Rivers Flow bass layer - plays bass notes (< C3) as continuous background
	 * @private
	 */
	private startRiversFlowBass(tempo: number): void {
		// Bass notes are A2 pedal tones that play throughout
		// They create a foundation for the treble melody
		const beatDuration = 60 / tempo; // seconds per beat
		const noteDuration = beatDuration * 8; // Each bass note lasts 8 beats (2 measures at 4/4)
		
		const playNextBassNote = () => {
			const freq = this.riversFlowBass[this.riversFlowBassIndex];
			const now = this.ctx.currentTime;
			
			// Create bass oscillator
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			
			// Warm bass tone using sine wave with sub-octave
			osc.type = 'sine';
			osc.frequency.setValueAtTime(freq, now);
			
			// ADSR envelope for bass
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(0.12, now + 0.1); // Gentle attack
			gain.gain.linearRampToValueAtTime(0.10, now + noteDuration - 0.2); // Sustain
			gain.gain.linearRampToValueAtTime(0, now + noteDuration); // Release
			
			osc.connect(gain);
			gain.connect(this.masterGain);
			
			osc.start(now);
			osc.stop(now + noteDuration);
			
			// Track oscillator for cleanup
			this.oscillators.push(osc);
			
			// Advance to next bass note
			this.riversFlowBassIndex = (this.riversFlowBassIndex + 1) % this.riversFlowBass.length;
		};
		
		// Start immediately with first bass note
		playNextBassNote();
		
		// Schedule bass note changes (every 8 beats)
		this.riversFlowBassInterval = setInterval(playNextBassNote, noteDuration * 1000);
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
		
		// Stop jazz progression
		if (this.jazzProgressionInterval) {
			clearInterval(this.jazzProgressionInterval);
			this.jazzProgressionInterval = null;
		}
		this.stopJazzChord();
		
		// Stop Rivers Flow bass
		if (this.riversFlowBassInterval) {
			clearInterval(this.riversFlowBassInterval);
			this.riversFlowBassInterval = null;
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
	 * Get next note from melody sequence (for melodic-flow mood)
	 * Loops back to start when reaching the end
	 * @private
	 */
	private getNextMelodyNote(): number {
		const note = this.melodySequence[this.melodyIndex];
		this.melodyIndex = (this.melodyIndex + 1) % this.melodySequence.length;
		console.log(`[AudioEngine] Melody note ${this.melodyIndex}/${this.melodySequence.length}: ${note}Hz`);
		return note;
	}

	/**
	 * Get next harmonized note for jazz-harmony mood
	 * Returns a note from the current chord's scale
	 * @private
	 */
	private getNextJazzNote(): number {
		const currentChord = this.jazzChordProgression[this.jazzChordIndex];
		const scale = this.jazzChordScales[currentChord.name as keyof typeof this.jazzChordScales];
		
		// Pick a note from the scale that harmonizes with current chord
		const note = scale[this.currentScaleIndex % scale.length];
		this.currentScaleIndex = (this.currentScaleIndex + 1) % scale.length;
		
		console.log(`[AudioEngine] Jazz note from ${currentChord.name}: ${note}Hz`);
		return note;
	}

	/**
	 * Get next note from Rivers Flow treble melody (for rivers-flow mood)
	 * Returns notes >= C3 from Yiruma's "Rivers Flow In You" MIDI
	 * @private
	 */
	private getNextRiversFlowNote(): number {
		const note = this.riversFlowMelody[this.riversFlowMelodyIndex];
		this.riversFlowMelodyIndex = (this.riversFlowMelodyIndex + 1) % this.riversFlowMelody.length;
		console.log(`[AudioEngine] Rivers Flow melody note ${this.riversFlowMelodyIndex}/${this.riversFlowMelody.length}: ${note}Hz`);
		return note;
	}

	/**
	 * Play an instrumental note with ADSR envelope
	 * Uses pentatonic scale for melodic progression instead of random frequencies
	 * @param instrument - Instrument configuration
	 * @param velocity - Note velocity (0-1)
	 * @param duration - Note duration in seconds (default 0.6 - shorter for snappier feel)
	 */
	playInstrumentNote(
		instrument: InstrumentConfig,
		velocity: number,
		duration: number = 0.6,
	): void {
		// Select note based on current mood
		let frequency: number;
		if (this.currentMood === 'melodic-flow') {
			frequency = this.getNextMelodyNote();
		} else if (this.currentMood === 'jazz-harmony') {
			frequency = this.getNextJazzNote();
		} else if (this.currentMood === 'rivers-flow') {
			frequency = this.getNextRiversFlowNote();
		} else {
			// Get next note from pentatonic scale for other moods
			frequency = this.getNextScaleNote();
		}
		
		console.log(`[AudioEngine] playInstrumentNote: ${instrument.name}, ${frequency}Hz, vel=${velocity}`);
		
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
