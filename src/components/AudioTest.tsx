import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Emergency Audio Test Component
 * Directly tests Web Audio API with a simple 440Hz tone
 * Use this to diagnose if the issue is with the browser or the app
 */
export function AudioTest() {
	const [isPlaying, setIsPlaying] = useState(false);

	const testDirectAudio = async () => {
		try {
			console.log('🔊 Starting audio test with ascending triad...');
			
			// Create AudioContext
			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			const ctx = new AudioContextClass();
			console.log(`AudioContext created, state: ${ctx.state}`);

			// Resume if suspended
			if (ctx.state === 'suspended') {
				console.log('AudioContext is suspended, resuming...');
				await ctx.resume();
				console.log(`Resumed! New state: ${ctx.state}`);
			}

			// Create three ascending tones: C-E-G (C major triad)
			const notes = [
				{ name: 'C5', freq: 523 },  // Do
				{ name: 'E5', freq: 659 },  // Mi
				{ name: 'G5', freq: 784 },  // Sol
			];
			
			console.log('🎵 Playing C Major Triad (Do-Mi-Sol)...');
			
			// Play each note in sequence
			notes.forEach((note, index) => {
				const startTime = ctx.currentTime + (index * 0.5); // 0.5s apart
				
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				
				// Connect audio graph
				osc.connect(gain);
				gain.connect(ctx.destination);
				
				// Set parameters
				osc.type = 'sine';
				osc.frequency.setValueAtTime(note.freq, startTime);
				
				// Envelope: fade in and out
				gain.gain.setValueAtTime(0, startTime);
				gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Quick attack
				gain.gain.setValueAtTime(0.3, startTime + 0.4); // Sustain
				gain.gain.linearRampToValueAtTime(0, startTime + 0.5); // Fade out
				
				// Start and stop
				osc.start(startTime);
				osc.stop(startTime + 0.5);
				
				console.log(`  ${index + 1}. ${note.name} (${note.freq}Hz)`);
			});

			setIsPlaying(true);
			console.log('✅ Started! Listen for three ascending tones...');

			// Complete after 2 seconds (all notes finished)
			setTimeout(() => {
				setIsPlaying(false);
				console.log('⏹️ Test complete!');
				
				if (ctx.state === 'running') {
					console.log('✅ SUCCESS: AudioContext is running!');
					console.log('If you heard the three tones, Web Audio API works.');
					console.log('If not, check system audio settings.');
				} else {
					console.log('❌ WARNING: AudioContext state is: ' + ctx.state);
				}
			}, 2000);

		} catch (error) {
			console.log('❌ ERROR: ' + (error as Error).message);
			setIsPlaying(false);
		}
	};

	return (
		<button
			onClick={testDirectAudio}
			disabled={isPlaying}
			className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
				isPlaying
					? 'bg-gray-600 cursor-not-allowed'
					: 'bg-yellow-500 hover:bg-yellow-400 text-black'
			}`}
		>
			<Play size={20} />
			{isPlaying ? 'Playing...' : 'Play Test Tones'}
		</button>
	);
}
