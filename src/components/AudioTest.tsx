import { useState } from 'react';
import { Volume2, Play } from 'lucide-react';

/**
 * Emergency Audio Test Component
 * Directly tests Web Audio API with a simple 440Hz tone
 * Use this to diagnose if the issue is with the browser or the app
 */
export function AudioTest() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [logs, setLogs] = useState<string[]>([]);

	const addLog = (message: string) => {
		setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
		console.log(message);
	};

	const testDirectAudio = async () => {
		try {
			addLog('🔊 Starting audio test with ascending triad...');
			
			// Create AudioContext
			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			const ctx = new AudioContextClass();
			addLog(`AudioContext created, state: ${ctx.state}`);

			// Resume if suspended
			if (ctx.state === 'suspended') {
				addLog('AudioContext is suspended, resuming...');
				await ctx.resume();
				addLog(`Resumed! New state: ${ctx.state}`);
			}

			// Create three ascending tones: C-E-G (C major triad)
			const notes = [
				{ name: 'C5', freq: 523 },  // Do
				{ name: 'E5', freq: 659 },  // Mi
				{ name: 'G5', freq: 784 },  // Sol
			];
			
			addLog('🎵 Playing C Major Triad (Do-Mi-Sol)...');
			
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
				
				addLog(`  ${index + 1}. ${note.name} (${note.freq}Hz)`);
			});

			setIsPlaying(true);
			addLog('✅ Started! Listen for three ascending tones...');

			// Complete after 2 seconds (all notes finished)
			setTimeout(() => {
				setIsPlaying(false);
				addLog('⏹️ Test complete!');
				
				if (ctx.state === 'running') {
					addLog('✅ SUCCESS: AudioContext is running!');
					addLog('If you heard the three tones, Web Audio API works.');
					addLog('If not, check system audio settings.');
				} else {
					addLog('❌ WARNING: AudioContext state is: ' + ctx.state);
				}
			}, 2000);

		} catch (error) {
			addLog('❌ ERROR: ' + (error as Error).message);
			setIsPlaying(false);
		}
	};

	const clearLogs = () => {
		setLogs([]);
	};

	return (
		<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
			<div className="flex items-center gap-3 mb-4">
				<Volume2 className="text-yellow-400" size={24} />
				<div>
				<h3 className="text-lg font-semibold text-white">🔧 Audio Diagnostic Test</h3>
				<p className="text-sm text-yellow-300">
					Test your browser's Web Audio API with three ascending tones (Do-Mi-Sol).
				</p>
				</div>
			</div>

			<div className="flex gap-3 mb-4">
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
					{isPlaying ? 'Playing C Major Triad...' : 'Play Test Tones (Do-Mi-Sol)'}
				</button>

				{logs.length > 0 && (
					<button
						onClick={clearLogs}
						className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm"
					>
						Clear Logs
					</button>
				)}
			</div>

			{logs.length > 0 && (
				<div className="bg-slate-900/50 rounded-lg p-4 max-h-64 overflow-y-auto">
					<div className="text-xs font-mono space-y-1">
						{logs.map((log, i) => (
							<div
								key={i}
								className={`${
									log.includes('✅') || log.includes('SUCCESS')
										? 'text-green-400'
										: log.includes('❌') || log.includes('ERROR')
										? 'text-red-400'
										: log.includes('⚠️') || log.includes('WARNING')
										? 'text-yellow-400'
										: log.includes('🔊') || log.includes('🎵')
										? 'text-blue-400'
										: 'text-slate-300'
								}`}
							>
								{log}
							</div>
						))}
					</div>
				</div>
			)}

			<div className="mt-4 text-xs text-slate-400">
				<p className="mb-2">
					<strong className="text-white">What this tests:</strong>
				</p>
				<ul className="list-disc list-inside space-y-1">
					<li>Web Audio API availability</li>
					<li>AudioContext creation and state</li>
					<li>Audio graph connections (Oscillator → Gain → Speakers)</li>
					<li>Browser autoplay policy handling</li>
				</ul>
				<p className="mt-3">
					<strong className="text-white">If you hear three ascending tones (Do-Mi-Sol):</strong>{' '}
					Web Audio API works! PulsePlay audio should also work.
				</p>
				<p className="mt-1">
					<strong className="text-white">If you don't hear the tones:</strong> Browser or system
					audio issue. Check:
				</p>
				<ul className="list-disc list-inside space-y-1 ml-4">
					<li>System volume not muted</li>
					<li>Correct audio output device selected</li>
					<li>Browser tab not muted (check tab icon)</li>
					<li>Browser audio permissions granted</li>
				</ul>
			</div>
		</div>
	);
}
