import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Music, History, AlertTriangle } from 'lucide-react';
import { AuthButton } from './components/AuthButton';
import { ThemeToggle } from './components/ThemeToggle';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';
import { Home } from './pages/Home';
import { SessionHistory } from './pages/SessionHistory';
import {
	checkBrowserCapabilities,
	getUnsupportedFeatureMessages,
	logBrowserCapabilities,
	type BrowserCapabilities,
} from './utils/browserCheck';
import gramophoneIcon from './icon/gramophone.png';

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
		<ThemeProvider>
		<ErrorBoundary>
		<Router>
			<div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 transition-colors duration-200">
				<header className="bg-white/90 dark:bg-gradient-to-r dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-600/60 shadow-sm transition-colors duration-200">
					<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
						<div className="flex items-center gap-6">
							<Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
								<div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md">
									<img src={gramophoneIcon} alt="PulsePlay" className="w-6 h-6" />
								</div>
								<div>
									<h1 className="text-2xl font-bold text-slate-800 dark:text-white">PulsePlay</h1>
									<p className="text-sm text-slate-600 dark:text-slate-400">Moves with rhythm</p>
								</div>
							</Link>
							
							<nav className="flex gap-4">
								<Link
									to="/"
									className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/60 dark:to-slate-600/60 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all text-slate-800 dark:text-white text-sm font-medium shadow-sm border border-slate-200/60 dark:border-slate-500/60"
								>
									<Music size={16} />
									<span>Session</span>
								</Link>
								<Link
									to="/history"
									className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/60 dark:to-slate-600/60 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all text-slate-800 dark:text-white text-sm font-medium shadow-sm border border-slate-200/60 dark:border-slate-500/60"
								>
									<History size={16} />
									<span>Session History</span>
								</Link>
							</nav>
						</div>
						<div className="flex items-center gap-3">
							<ThemeToggle />
							<AuthButton />
						</div>
					</div>
				</header>

				{/* Browser Compatibility Warning */}
				{showCompatWarning && browserCheck && !browserCheck.isSupported && (
					<div className="max-w-7xl mx-auto px-4 py-4">
						<div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl p-6 shadow-sm">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<AlertTriangle size={24} className="text-yellow-600 dark:text-yellow-400" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
										Browser Compatibility Warning
									</h3>
									<p className="text-slate-700 dark:text-slate-300 text-sm mb-3">
										Your browser ({browserCheck.browserName} {browserCheck.browserVersion}) may not support all features of PulsePlay.
									</p>
									<ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-4">
										{getUnsupportedFeatureMessages(browserCheck).map((msg, i) => (
											<li key={i}>{msg}</li>
										))}
									</ul>
									<div className="flex gap-3">
										<button
											onClick={() => setShowCompatWarning(false)}
											className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
										>
											Dismiss
										</button>
										<a
											href="https://browsehappy.com/"
											target="_blank"
											rel="noopener noreferrer"
											className="px-4 py-2 bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 dark:from-slate-700 dark:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-500 text-slate-800 dark:text-white rounded-lg text-sm font-medium transition-all shadow-sm"
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

				<footer className="max-w-7xl mx-auto px-4 py-8 mt-12">
					<div className="text-center">
						<div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-700/60 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-600/60">
							<div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
							<span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Rhythm that follows you</span>
							<div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-pulse"></div>
						</div>
					</div>
				</footer>
			</div>
		</Router>
		</ErrorBoundary>
		</ThemeProvider>
	);
}

export default App;
