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
			addLog('🔊 Starting direct audio test...');
			
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

			// Create oscillator and gain
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			addLog('Created oscillator and gain nodes');

			// Connect audio graph
			osc.connect(gain);
			gain.connect(ctx.destination);
			addLog('Connected: Oscillator → Gain → Destination');

			// Set parameters
			osc.type = 'sine';
			osc.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
			gain.gain.setValueAtTime(0.5, ctx.currentTime); // 50% volume
			addLog('Set frequency: 440Hz (A4), volume: 50%');

			// Start oscillator
			osc.start();
			setIsPlaying(true);
			addLog('✅ Oscillator started! You should hear a tone.');
			addLog('🎵 Playing 440Hz sine wave for 3 seconds...');

			// Stop after 3 seconds
			setTimeout(() => {
				osc.stop();
				setIsPlaying(false);
				addLog('⏹️ Stopped. Test complete!');
				
				if (ctx.state === 'running') {
					addLog('✅ SUCCESS: AudioContext is running!');
					addLog('If you heard the tone, Web Audio API works.');
					addLog('If not, check system audio settings.');
				} else {
					addLog('❌ WARNING: AudioContext state is: ' + ctx.state);
				}
			}, 3000);

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
						Can't hear PulsePlay audio? Test your browser's Web Audio API directly.
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
					{isPlaying ? 'Playing 440Hz Test Tone...' : 'Play Test Tone (3 sec)'}
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
					<strong className="text-white">If you hear the 440Hz tone:</strong> Web Audio API works!
					The issue is in PulsePlay's code.
				</p>
				<p className="mt-1">
					<strong className="text-white">If you don't hear the tone:</strong> Browser or system audio
					issue. Check:
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
