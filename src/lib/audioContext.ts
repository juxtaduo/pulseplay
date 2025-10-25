/**
 * Web Audio API context management
 * @module lib/audioContext
 */

/**
 * Web Audio API context management
 * @module lib/audioContext
 */

/**
 * Singleton Web Audio API context
 * Ensures only one AudioContext exists across the application
 */

let instance: AudioContext | null = null;
let visibilityHandler: (() => void) | null = null;

/**
 * Get or create the AudioContext
 * @returns AudioContext instance
 */
export function getContext(): AudioContext {
	if (!instance) {
		instance = new (window.AudioContext || (window as any).webkitAudioContext)();
		console.log('[AudioContext] Created new AudioContext');

		// Prevent audio from stopping when tab becomes hidden
		setupVisibilityHandler();
	}
	return instance;
}

/**
 * Setup handler to keep audio running when tab is hidden
 * @private
 */
function setupVisibilityHandler(): void {
	if (visibilityHandler) return; // Already set up

	visibilityHandler = async () => {
		if (document.hidden) {
			console.log('[AudioContext] Tab hidden - keeping audio context running');
			// Do NOT suspend - keep audio running in background
		} else {
			console.log('[AudioContext] Tab visible - ensuring audio context is running');
			// Resume if somehow suspended
			const ctx = getContext();
			if (ctx.state === 'suspended') {
				await ctx.resume();
				console.log('[AudioContext] Resumed audio context');
			}
		}
	};

	document.addEventListener('visibilitychange', visibilityHandler);
	console.log('[AudioContext] Visibility handler set up - audio will continue in background');
}

/**
 * Resume AudioContext if suspended (browser autoplay policy)
 * Must be called from user interaction (click, touch, etc.)
 */
export async function resume(): Promise<void> {
	const ctx = getContext();
	if (ctx.state === 'suspended') {
		await ctx.resume();
		console.log('[AudioContext] Resumed from suspended state');
	}
}

/**
 * Suspend AudioContext to save resources
 */
export async function suspend(): Promise<void> {
	const ctx = getContext();
	if (ctx.state === 'running') {
		await ctx.suspend();
		console.log('[AudioContext] Suspended');
	}
}

/**
 * Close AudioContext (cannot be reopened)
 * Only use when completely done with audio
 */
export async function close(): Promise<void> {
	if (instance) {
		await instance.close();
		instance = null;
		console.log('[AudioContext] Closed');
	}

	// Remove visibility handler
	if (visibilityHandler) {
		document.removeEventListener('visibilitychange', visibilityHandler);
		visibilityHandler = null;
		console.log('[AudioContext] Visibility handler removed');
	}
}

/**
 * Get current AudioContext state
 */
export function getState(): AudioContextState | null {
	return instance?.state || null;
}

/**
 * Get current sample rate
 */
export function getSampleRate(): number | null {
	return instance?.sampleRate || null;
}

/**
 * Get current time
 */
export function getCurrentTime(): number | null {
	return instance?.currentTime || null;
} /**
 * Hook-friendly function to get AudioContext
 * Safe to call multiple times
 */
export function getAudioContext(): AudioContext {
	return getContext();
}

/**
 * Resume audio context from user interaction
 */
export async function resumeAudioContext(): Promise<void> {
	return resume();
}

/**
 * Suspend audio context to save resources
 */
export async function suspendAudioContext(): Promise<void> {
	return suspend();
}

/**
 * Close audio context (cannot be reopened)
 */
export async function closeAudioContext(): Promise<void> {
	return close();
}

/**
 * Get audio context state
 */
export function getAudioContextState(): AudioContextState | null {
	return getState();
}
