/**
 * Time formatting utilities for session duration display (T139)
 * @module utils/timeFormatter
 */

/**
 * Converts seconds to HH:MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted time string (HH:MM:SS or MM:SS for durations < 1 hour)
 * @example
 * formatDuration(3665) // "1:01:05"
 * formatDuration(125) // "2:05"
 */
export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Converts seconds to human-readable format
 * @param seconds - Duration in seconds
 * @returns Human-readable string (e.g., "1 hour 5 minutes")
 * @example
 * formatDurationHuman(3665) // "1 hour 1 minute"
 * formatDurationHuman(125) // "2 minutes"
 */
export function formatDurationHuman(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	const parts: string[] = [];

	if (hours > 0) {
		parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
	}

	if (minutes > 0) {
		parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
	}

	if (parts.length === 0) {
		return `${seconds} second${seconds !== 1 ? 's' : ''}`;
	}

	return parts.join(' ');
}

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 * @example
 * formatRelativeTime(new Date(Date.now() - 7200000)) // "2 hours ago"
 */
export function formatRelativeTime(date: Date): string {
	const now = Date.now();
	const diffMs = now - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) {
		return 'just now';
	}

	if (diffMin < 60) {
		return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
	}

	if (diffHour < 24) {
		return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
	}

	if (diffDay < 7) {
		return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
	}

	// For older dates, return formatted date
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}
