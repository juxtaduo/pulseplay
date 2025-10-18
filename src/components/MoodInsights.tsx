import { Sparkles, TrendingUp, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * MoodInsights component displays AI-generated mood recommendations after session completion
 * Only shown for sessions ≥10 minutes per FR-016 and T117
 * @module components/MoodInsights
 */

interface MoodInsightsProps {
	sessionId: string | null;
	sessionDuration: number; // seconds
	onClose?: () => void;
}

interface AIRecommendation {
	recommendationId: string;
	suggestedMood: string;
	rationale: string;
	confidence: number;
	generatedAt: string;
}

export const MoodInsights = ({ sessionId, sessionDuration, onClose }: MoodInsightsProps) => {
	const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Only fetch recommendation if session is ≥10 minutes (T117)
		if (sessionId && sessionDuration >= 600) {
			fetchRecommendation();
		}
	}, [sessionId, sessionDuration]);

	const fetchRecommendation = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch('http://localhost:3001/api/ai/mood-recommendation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ sessionId }),
			});

			if (response.status === 400) {
				const errorData = await response.json();
				setError(errorData.message || 'Session too short for AI insights');
				return;
			}

			if (!response.ok) {
				throw new Error('Failed to fetch AI recommendation');
			}

			const data: AIRecommendation = await response.json();
			setRecommendation(data);
		} catch (err) {
			console.error('[MoodInsights] Failed to fetch recommendation:', err);
			setError('AI insights temporarily unavailable. Try again later.');
		} finally {
			setLoading(false);
		}
	};

	// Don't render if session is too short (T117)
	if (sessionDuration < 600) {
		return null;
	}

	// Don't render if no sessionId
	if (!sessionId) {
		return null;
	}

	return (
		<div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="p-2 bg-purple-500/20 rounded-lg">
						<Sparkles size={20} className="text-purple-400" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-white">AI Mood Insights</h3>
						<p className="text-xs text-slate-400">Powered by Gemini</p>
					</div>
				</div>
				{onClose && (
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-white transition-colors"
						aria-label="Close insights"
					>
						×
					</button>
				)}
			</div>

			{loading && (
				<div className="flex items-center gap-3 text-slate-300">
					<div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
					<span className="text-sm">Analyzing your session rhythm...</span>
				</div>
			)}

			{error && (
				<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
					<p className="text-sm text-yellow-400">{error}</p>
				</div>
			)}

			{recommendation && !loading && !error && (
				<div className="space-y-4">
					{/* Suggested Mood */}
					<div className="flex items-center gap-3">
						<TrendingUp size={18} className="text-purple-400 flex-shrink-0" />
						<div>
							<div className="text-xs text-slate-400 mb-1">Suggested for next session:</div>
							<div className="text-lg font-semibold text-white capitalize">
								{recommendation.suggestedMood.replace(/-/g, ' ')}
							</div>
						</div>
					</div>

					{/* AI Rationale */}
					<div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
						<p className="text-sm text-slate-300 leading-relaxed">{recommendation.rationale}</p>
					</div>

					{/* Confidence Score */}
					<div className="flex items-center justify-between text-xs text-slate-400">
						<div className="flex items-center gap-2">
							<Clock size={14} />
							<span>Generated just now</span>
						</div>
						<div>
							Confidence: {Math.round(recommendation.confidence * 100)}%
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
