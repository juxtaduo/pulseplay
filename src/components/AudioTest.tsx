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
			console.log('🔊 Starting audio test with Do-Re-Mi-Fa-Sol-La-Ti-Do scale...');
			
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

			// Do-Re-Mi-Fa-Sol-La-Ti-Do scale (C major scale)
			const notes = [
				{ name: 'C5 (Do)', freq: 523.25 },
				{ name: 'D5 (Re)', freq: 587.33 },
				{ name: 'E5 (Mi)', freq: 659.25 },
				{ name: 'F5 (Fa)', freq: 698.46 },
				{ name: 'G5 (Sol)', freq: 783.99 },
				{ name: 'A5 (La)', freq: 880.00 },
				{ name: 'B5 (Ti)', freq: 987.77 },
				{ name: 'C6 (Do)', freq: 1046.50 },
			];
			
			console.log('🎵 Playing Do-Re-Mi-Fa-Sol-La-Ti-Do scale (0.3s per note)...');
			
			// Play each note in sequence (0.3 seconds each, no overlap)
			notes.forEach((note, index) => {
				const startTime = ctx.currentTime + (index * 0.3); // 0.3 second apart (no gap, no overlap)
				
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				
				// Connect audio graph
				osc.connect(gain);
				gain.connect(ctx.destination);
				
				// Set parameters
				osc.type = 'sine';
				osc.frequency.setValueAtTime(note.freq, startTime);
				
				// Envelope: quick fade in and out for 0.3s duration
				gain.gain.setValueAtTime(0, startTime);
				gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02); // Quick attack
				gain.gain.setValueAtTime(0.3, startTime + 0.25); // Sustain
				gain.gain.linearRampToValueAtTime(0, startTime + 0.3); // Quick fade out
				
				// Start and stop (exactly 0.3 seconds)
				osc.start(startTime);
				osc.stop(startTime + 0.3);
				
				console.log(`  ${index + 1}. ${note.name} (${note.freq.toFixed(2)}Hz)`);
			});

			setIsPlaying(true);
			console.log('✅ Started! Listen for 8 notes (Do-Re-Mi-Fa-Sol-La-Ti-Do)...');

			// Complete after 2.4 seconds (8 notes × 0.3s each)
			setTimeout(() => {
				setIsPlaying(false);
				console.log('⏹️ Test complete!');
				
				if (ctx.state === 'running') {
					console.log('✅ SUCCESS: AudioContext is running!');
					console.log('If you heard the 8-note scale, Web Audio API works.');
					console.log('If not, check system audio settings.');
				} else {
					console.log('❌ WARNING: AudioContext state is: ' + ctx.state);
				}
			}, 2400);

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
