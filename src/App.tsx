import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Music, History } from 'lucide-react';
import { AuthButton } from './components/AuthButton';
import { Home } from './pages/Home';
import { SessionHistory } from './pages/SessionHistory';

function App() {
	return (
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

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/history" element={<SessionHistory />} />
				</Routes>

				<footer className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
					Built for open-source hackathon • Adaptive focus music powered by your rhythm
				</footer>
			</div>
		</Router>
	);
}

export default App;
