import { useState, useEffect } from 'react';
import { Download, Trash2, Filter, Clock, Activity, TrendingUp, Calendar } from 'lucide-react';
import { formatDuration, formatRelativeTime } from '../utils/timeFormatter';
import type { Mood } from '../../backend/src/types';

/**
 * SessionHistory page displays past focus sessions with filtering and export (T135, T136, T137)
 * @module pages/SessionHistory
 */

interface Session {
	sessionId: string;
	mood: Mood;
	startTime: string;
	endTime?: string;
	totalDurationMinutes?: number;
	rhythmData: {
		averageKeysPerMinute: number;
		rhythmType: string;
	};
	state: string;
	createdAt: string;
}

interface SessionHistoryResponse {
	sessions: Session[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export const SessionHistory = () => {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedMood, setSelectedMood] = useState<Mood | 'all'>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalSessions, setTotalSessions] = useState(0);

	const MOOD_OPTIONS: { value: Mood | 'all'; label: string }[] = [
		{ value: 'all', label: 'All Moods' },
		{ value: 'deep-focus', label: 'Deep Flow' },
		{ value: 'melodic-flow', label: 'Melodic Flow' },
		{ value: 'jazz-harmony', label: 'Jazz Harmony' },
		{ value: 'rivers-flow', label: 'Rivers Flow' },
	];

	// Fetch session history (T135)
	useEffect(() => {
		fetchSessions();
	}, [selectedMood, currentPage]);

	const fetchSessions = async () => {
		setLoading(true);
		setError(null);

		try {
			const moodParam = selectedMood !== 'all' ? `&mood=${selectedMood}` : '';
			const response = await fetch(
				`http://localhost:3001/api/sessions/history?page=${currentPage}&limit=20${moodParam}`
			);

			if (!response.ok) {
				throw new Error('Failed to fetch session history');
			}

			const data: SessionHistoryResponse = await response.json();
			setSessions(data.sessions);
			setTotalPages(data.pagination.totalPages);
			setTotalSessions(data.pagination.total);
		} catch (err) {
			console.error('[SessionHistory] Fetch error:', err);
			setError('Failed to load session history. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Export session data (T137)
	const handleExport = async () => {
		try {
			const response = await fetch('http://localhost:3001/api/sessions/export');

			if (!response.ok) {
				throw new Error('Failed to export data');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `pulseplay-sessions-${Date.now()}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error('[SessionHistory] Export error:', err);
			setError('Failed to export data. Please try again.');
		}
	};

	// Delete all sessions
	const handleDeleteAll = async () => {
		if (!confirm('Are you sure you want to delete ALL sessions? This cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch('http://localhost:3001/api/sessions/all', {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error('Failed to delete sessions');
			}

			const result = await response.json();
			alert(`Successfully deleted ${result.deletedCount} session(s)`);
			
			// Refresh the list
			setCurrentPage(1);
			fetchSessions();
		} catch (err) {
			console.error('[SessionHistory] Delete error:', err);
			setError('Failed to delete sessions. Please try again.');
		}
	};

	const getMoodColor = (mood: Mood) => {
		const colors: Record<Mood, string> = {
			'deep-focus': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
			'melodic-flow': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
			'jazz-harmony': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
			'rivers-flow': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
		};
		return colors[mood] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-white mb-2">Session History</h1>
					<p className="text-slate-400">
						View and manage your past focus sessions ({totalSessions} total)
					</p>
				</div>

				{/* Controls */}
				<div className="bg-slate-800 rounded-xl p-6 mb-6">
					<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
						{/* Mood Filter (T136) */}
						<div className="flex items-center gap-3">
							<Filter size={20} className="text-slate-400" />
							<select
								value={selectedMood}
								onChange={(e) => {
									setSelectedMood(e.target.value as Mood | 'all');
									setCurrentPage(1);
								}}
								className="bg-slate-700 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								{MOOD_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						{/* Actions */}
						<div className="flex gap-3">
							{/* Export Button (T137) */}
							<button
								onClick={handleExport}
								className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
							>
								<Download size={18} />
								<span>Export Data</span>
							</button>

							{/* Delete All Button */}
							<button
								onClick={handleDeleteAll}
								className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
							>
								<Trash2 size={18} />
								<span>Delete All</span>
							</button>
						</div>
					</div>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
						<p className="text-red-400 text-sm">{error}</p>
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div className="flex items-center justify-center py-12">
						<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
					</div>
				)}

				{/* Sessions List */}
				{!loading && sessions.length === 0 && (
					<div className="bg-slate-800 rounded-xl p-12 text-center">
						<p className="text-slate-400 text-lg">No sessions found</p>
						<p className="text-slate-500 text-sm mt-2">
							Start a focus session to see your history here
						</p>
					</div>
				)}

				{!loading && sessions.length > 0 && (
					<div className="space-y-4">
						{sessions.map((session) => (
							<div
								key={session.sessionId}
								className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors"
							>
								<div className="flex flex-col md:flex-row gap-4 justify-between">
									{/* Session Info */}
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-3">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold border ${getMoodColor(
													session.mood
												)}`}
											>
												{session.mood.replace(/-/g, ' ')}
											</span>
											<span className="text-xs text-slate-500">
												{formatRelativeTime(new Date(session.createdAt))}
											</span>
										</div>

										{/* Stats Grid */}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
											<div className="flex items-center gap-2">
												<Clock size={16} className="text-slate-400" />
												<div>
													<div className="text-xs text-slate-500">Duration</div>
													<div className="text-sm font-semibold text-white">
														{session.totalDurationMinutes
															? formatDuration(session.totalDurationMinutes * 60)
															: 'N/A'}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<TrendingUp size={16} className="text-slate-400" />
												<div>
													<div className="text-xs text-slate-500">Avg Tempo</div>
													<div className="text-sm font-semibold text-white">
														{Math.round(session.rhythmData.averageKeysPerMinute || 0)} keys/min
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<Activity size={16} className="text-slate-400" />
												<div>
													<div className="text-xs text-slate-500">Rhythm</div>
													<div className="text-sm font-semibold text-white capitalize">
														{session.rhythmData.rhythmType || 'N/A'}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<Calendar size={16} className="text-slate-400" />
												<div>
													<div className="text-xs text-slate-500">Status</div>
													<div className="text-sm font-semibold text-white capitalize">
														{session.state}
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{!loading && totalPages > 1 && (
					<div className="mt-6 flex items-center justify-center gap-4">
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
						>
							Previous
						</button>

						<span className="text-slate-400">
							Page {currentPage} of {totalPages}
						</span>

						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
						>
							Next
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
