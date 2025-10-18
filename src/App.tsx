import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Music, History, AlertTriangle } from 'lucide-react';
import { AuthButton } from './components/AuthButton';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { SessionHistory } from './pages/SessionHistory';
import {
	checkBrowserCapabilities,
	getUnsupportedFeatureMessages,
	logBrowserCapabilities,
	type BrowserCapabilities,
} from './utils/browserCheck';

function App() {
	const [browserCheck, setBrowserCheck] = useState<BrowserCapabilities | null>(null);
	const [showCompatWarning, setShowCompatWarning] = useState(false);

	useEffect(() => {
		// Check browser capabilities on mount
		const capabilities = checkBrowserCapabilities();
		setBrowserCheck(capabilities);
		logBrowserCapabilities(capabilities);

		// Show warning if browser is not fully supported
		if (!capabilities.isSupported) {
			setShowCompatWarning(true);
		}
	}, []);

	return (
		<ErrorBoundary>
		<Router>
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
				<header className="bg-slate-800 bg-opacity-50 backdrop-blur-sm border-b border-slate-700">
					<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
						<div className="flex items-center gap-6">
							<Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
								<div className="p-2 bg-blue-500 rounded-lg">
									<Music size={24} className="text-white" />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-white">PulsePlay</h1>
									<p className="text-sm text-slate-400">AI Focus Music Generator</p>
								</div>
							</Link>
							
							<nav className="flex gap-4">
								<Link
									to="/"
									className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-white text-sm font-medium"
								>
									<Music size={16} />
									<span>Focus Session</span>
								</Link>
								<Link
									to="/history"
									className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-white text-sm font-medium"
								>
									<History size={16} />
									<span>Session History</span>
								</Link>
							</nav>
						</div>
						<AuthButton />
					</div>
				</header>

				{/* Browser Compatibility Warning */}
				{showCompatWarning && browserCheck && !browserCheck.isSupported && (
					<div className="max-w-7xl mx-auto px-4 py-4">
						<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<AlertTriangle size={24} className="text-yellow-400" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-yellow-400 mb-2">
										Browser Compatibility Warning
									</h3>
									<p className="text-slate-300 text-sm mb-3">
										Your browser ({browserCheck.browserName} {browserCheck.browserVersion}) may not support all features of PulsePlay AI.
									</p>
									<ul className="list-disc list-inside space-y-1 text-sm text-slate-400 mb-4">
										{getUnsupportedFeatureMessages(browserCheck).map((msg, i) => (
											<li key={i}>{msg}</li>
										))}
									</ul>
									<div className="flex gap-3">
										<button
											onClick={() => setShowCompatWarning(false)}
											className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
										>
											Dismiss
										</button>
										<a
											href="https://browsehappy.com/"
											target="_blank"
											rel="noopener noreferrer"
											className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
										>
											Update Browser
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/history" element={<SessionHistory />} />
				</Routes>

				<footer className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
					Built for open-source hackathon • Adaptive focus music powered by your rhythm
				</footer>
			</div>
		</Router>
		</ErrorBoundary>
	);
}

export default App;
