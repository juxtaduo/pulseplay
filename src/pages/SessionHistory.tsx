import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Download, Trash2, Filter, Clock, Activity, TrendingUp, Calendar, ChevronDown, Music } from 'lucide-react';
import { formatDuration, formatRelativeTime } from '../utils/timeFormatter';
import type { Mood } from '../types';

/**
 * SessionHistory page displays past focus sessions with filtering and export (T135, T136, T137)
 * @module pages/SessionHistory
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Session {
	sessionId: string;
	song: Mood; // Backend uses 'song' field, not 'mood'
	startTime: string;
	endTime?: string;
	totalDurationSeconds?: number;
	averageBpm?: number; // Average BPM for the session
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
	const { getAccessTokenSilently, isAuthenticated } = useAuth0();
	const [sessions, setSessions] = useState<Session[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedSong, setSelectedSong] = useState<Mood | 'all'>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalSessions, setTotalSessions] = useState(0);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
	const dropdownRef = useRef<HTMLDivElement>(null);

	const MOOD_OPTIONS: { value: Mood | 'all'; label: string }[] = [
		{ value: 'all', label: 'All Songs' },
		{ value: 'thousand-years', label: 'A Thousand Years' },
		{ value: 'kiss-the-rain', label: 'Kiss The Rain' },
		{ value: 'river-flows', label: 'River Flows In You' },
		{ value: 'gurenge', label: 'Gurenge' },
	];

	// Fetch session history (T135)
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDropdownOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Fetch sessions when component mounts or filters change
	useEffect(() => {
		fetchSessions();
	}, [selectedSong, currentPage, isAuthenticated]);

	const fetchSessions = async () => {
		setLoading(true);
		setError(null);

		if (!isAuthenticated) {
			setError('Please log in to save session history');
			setLoading(false);
			return;
		}

		try {
			const token = await getAccessTokenSilently();
			const songParam = selectedSong !== 'all' ? `&song=${selectedSong}` : '';
			const response = await fetch(
				`${API_BASE_URL}/api/sessions/history?page=${currentPage}&limit=20${songParam}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
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
		if (!isAuthenticated) {
			setError('Please log in to export data');
			return;
		}

		try {
			const token = await getAccessTokenSilently();
			const response = await fetch(`${API_BASE_URL}/api/sessions/export`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

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
		if (!isAuthenticated) {
			setError('Please log in to delete sessions');
			return;
		}

		if (!confirm('Are you sure you want to delete ALL sessions? This cannot be undone.')) {
			return;
		}

		try {
			const token = await getAccessTokenSilently();
			const response = await fetch(`${API_BASE_URL}/api/sessions/all`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
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

	const getSongColor = (song?: Mood) => {
		if (!song) return 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
		const colors: Record<Mood, string> = {
			'thousand-years': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
			'kiss-the-rain': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
			'river-flows': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
			'gurenge': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
		};
		return colors[song] || 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900">
			<main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Session History</h1>
					<p className="text-slate-600 dark:text-slate-400">
						View and manage your past focus sessions ({totalSessions} total)
					</p>
				</div>

				{/* Session Navigation - positioned to the right */}
				<div className="mb-6 flex justify-end">
					<Link
						to="/"
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 hover:from-rose-200 hover:via-pink-200 hover:to-purple-200 dark:from-rose-900/30 dark:via-pink-900/30 dark:to-purple-900/30 dark:hover:from-rose-800/70 dark:hover:via-pink-800/70 dark:hover:to-purple-800/70 transition-all text-slate-800 dark:text-white text-sm font-medium shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-300/60 dark:shadow-lg dark:shadow-rose-900/40 dark:hover:shadow-xl dark:hover:shadow-rose-800/50 border border-rose-200/60 hover:border-rose-300/80 dark:border-rose-700/20 dark:hover:border-rose-600/80 dark:ring-2 dark:ring-rose-700/30 dark:hover:ring-rose-600/50"
					>
						<Music size={16} />
						<span className="text-slate-800 dark:text-white">Session</span>
					</Link>
				</div>

				{/* Controls */}
				<div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 mb-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg backdrop-blur-sm">
					<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
						{/* Mood Filter (T136) */}
						<div className="flex items-center gap-3">
							<Filter size={20} className="text-slate-600 dark:text-slate-400" />
							<div className="relative z-[1001]" ref={dropdownRef}>
								<button
									onClick={() => {
										if (!isDropdownOpen && dropdownRef.current) {
											const rect = dropdownRef.current.getBoundingClientRect();
											setDropdownPosition({
												top: rect.bottom + window.scrollY,
												left: rect.left + window.scrollX,
												width: rect.width
											});
										}
										setIsDropdownOpen(!isDropdownOpen);
									}}
									className="bg-slate-100 dark:bg-[#485466] text-slate-800 dark:text-white rounded-lg px-4 py-2 border border-slate-200/60 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 shadow-sm flex items-center gap-2 min-w-[180px] justify-between"
								>
									<span>
										{MOOD_OPTIONS.find(option => option.value === selectedSong)?.label || 'All Songs'}
									</span>
									<ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
								</button>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-3">
							{/* Export Button (T137) */}
							<button
								onClick={handleExport}
								className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
							>
								<Download size={18} />
								<span>Export Data</span>
							</button>

							{/* Delete All Button */}
							<button
								onClick={handleDeleteAll}
								className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-sm"
							>
								<Trash2 size={18} />
								<span>Delete All</span>
							</button>
						</div>
					</div>
				</div>

				{/* Dropdown Portal */}
				{isDropdownOpen && createPortal(
					<div 
						className="fixed bg-white dark:bg-[#485466] border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-[9999] isolate"
						style={{
							top: dropdownPosition.top,
							left: dropdownPosition.left,
							width: dropdownPosition.width
						}}
					>
						{MOOD_OPTIONS.map((option) => (
							<button
								key={option.value}
								onClick={() => {
									setSelectedSong(option.value as Mood | 'all');
									setCurrentPage(1);
									setIsDropdownOpen(false);
								}}
								className={`w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
									selectedSong === option.value 
										? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
										: 'text-slate-800 dark:text-slate-200'
								}`}
							>
								{option.label}
							</button>
						))}
					</div>,
					document.body
				)}

				{/* Error Message */}
				{error && (
					<div className="bg-gradient-to-r from-red-100 via-rose-100 to-pink-100 dark:from-red-900/60 dark:via-rose-900/60 dark:to-pink-900/60 border-2 border-red-400 dark:border-red-500/80 rounded-xl p-6 mb-6 shadow-xl shadow-red-200/50 dark:shadow-red-500/40 dark:shadow-2xl dark:shadow-red-600/30 hover:shadow-2xl hover:shadow-red-300/60 dark:hover:shadow-red-500/60 transition-all duration-300 backdrop-blur-sm">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0">
								<div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg shadow-md">
									<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
								</div>
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Authentication Required</h3>
								<p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">{error}</p>
							</div>
						</div>
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
					<div className="bg-white/80 dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200/60 dark:border-slate-700 shadow-lg backdrop-blur-sm">
						<p className="text-slate-600 dark:text-slate-400 text-lg">No sessions found</p>
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
								className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 hover:bg-white/90 dark:hover:bg-slate-750 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-lg backdrop-blur-sm hover:shadow-xl"
							>
								<div className="flex flex-col md:flex-row gap-4 justify-between">
									{/* Session Info */}
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-3">
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getSongColor(
													session.song
												)}`}
											>
												{session.song?.replace(/-/g, ' ') || 'Unknown Song'}
											</span>
											<span className="text-xs text-slate-500">
												{formatRelativeTime(new Date(session.createdAt))}
											</span>
										</div>

										{/* Stats Grid */}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
											<div className="flex items-center gap-2">
												<Clock size={16} className="text-emerald-600 dark:text-emerald-400" />
												<div>
													<div className="text-xs text-slate-500">Duration</div>
													<div className="text-sm font-semibold text-slate-800 dark:text-white">
														{session.totalDurationSeconds
															? formatDuration(session.totalDurationSeconds)
															: 'N/A'}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<TrendingUp size={16} className="text-blue-600 dark:text-blue-400" />
												<div>
													<div className="text-xs text-slate-500">Avg BPM</div>
													<div className="text-sm font-semibold text-slate-800 dark:text-white">
														{Math.round(session.averageBpm || 0)}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<Activity size={16} className="text-purple-600 dark:text-purple-400" />
												<div>
													<div className="text-xs text-slate-500">Rhythm</div>
													<div className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
														{session.rhythmData.rhythmType || 'N/A'}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-2">
												<Calendar size={16} className="text-amber-600 dark:text-amber-400" />
												<div>
													<div className="text-xs text-slate-500">Status</div>
													<div className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
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
							className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/60 dark:to-slate-600/60 text-slate-800 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all shadow-sm disabled:shadow-none"
						>
							Previous
						</button>

						<span className="text-slate-600 dark:text-slate-400 font-medium">
							Page {currentPage} of {totalPages}
						</span>

						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700/60 dark:to-slate-600/60 text-slate-800 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all shadow-sm disabled:shadow-none"
						>
							Next
						</button>
					</div>
				)}
			</main>
		</div>
	);
};
