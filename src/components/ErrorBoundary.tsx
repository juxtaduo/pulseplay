import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches React errors and provides graceful fallback UI
 * @module components/ErrorBoundary
 */

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<State> {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log error details for debugging
		console.error('[ErrorBoundary] Caught error:', error);
		console.error('[ErrorBoundary] Error info:', errorInfo);

		// Update state with error details
		this.setState({
			error,
			errorInfo,
		});

		// TODO: Send error to monitoring service (e.g., Sentry)
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			// Custom fallback UI if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default fallback UI
			return (
				<div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
					<div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl p-8 border border-red-500/30">
						{/* Error Icon */}
						<div className="flex justify-center mb-6">
							<div className="p-4 bg-red-500/20 rounded-full">
								<AlertTriangle size={48} className="text-red-400" />
							</div>
						</div>

						{/* Error Title */}
						<h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-4">
							Oops! Something went wrong
						</h2>

						{/* Error Message */}
						<p className="text-slate-700 dark:text-slate-300 text-center mb-6">
							We encountered an unexpected error. Don't worry—your session data is safe. You
							can refresh the page to try again.
						</p>

						{/* Error Details (Development Only) */}
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<div className="mb-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-700">
								<h3 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h3>
								<pre className="text-xs text-slate-600 dark:text-slate-400 overflow-auto max-h-40">
									{this.state.error.toString()}
									{this.state.errorInfo?.componentStack}
								</pre>
							</div>
						)}

						{/* Actions */}
						<div className="flex flex-col gap-3">
							<button
								onClick={this.handleReset}
								className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white px-6 py-3 rounded-lg transition-colors font-semibold"
							>
								<RefreshCw size={18} />
								<span>Refresh Page</span>
							</button>

							<a
								href="/"
								className="text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors text-sm"
							>
								Go back to home
							</a>
						</div>

						{/* Support Message */}
						<div className="mt-8 pt-6 border-t border-slate-700">
							<p className="text-xs text-slate-500 text-center">
								If this problem persists, please{' '}
								<a
									href="https://github.com/juxtaduo/pulseplay/issues"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-400 hover:text-blue-300 underline"
								>
									report an issue
								</a>{' '}
								on GitHub.
							</p>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

/**
 * Functional wrapper for ErrorBoundary with custom fallback
 * @param children - React children to wrap
 * @param fallback - Optional custom fallback UI
 */
export function withErrorBoundary(children: ReactNode, fallback?: ReactNode) {
	return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
