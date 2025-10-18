/**
 * Web Audio API context management
 * @module lib/audioContext
 */

/**
 * Singleton Web Audio API context
 * Ensures only one AudioContext exists across the application
 */
class AudioContextManager {
	private static instance: AudioContext | null = null;
	private static visibilityHandler: (() => void) | null = null;

	/**
	 * Get or create the AudioContext
	 * @returns AudioContext instance
	 */
	static getContext(): AudioContext {
		if (!this.instance) {
			this.instance = new (window.AudioContext || (window as any).webkitAudioContext)();
			console.log('[AudioContext] Created new AudioContext');
			
			// Prevent audio from stopping when tab becomes hidden
			this.setupVisibilityHandler();
		}
		return this.instance;
	}

	/**
	 * Setup handler to keep audio running when tab is hidden
	 * @private
	 */
	private static setupVisibilityHandler(): void {
		if (this.visibilityHandler) return; // Already set up

		this.visibilityHandler = async () => {
			if (document.hidden) {
				console.log('[AudioContext] Tab hidden - keeping audio context running');
				// Do NOT suspend - keep audio running in background
			} else {
				console.log('[AudioContext] Tab visible - ensuring audio context is running');
				// Resume if somehow suspended
				const ctx = this.getContext();
				if (ctx.state === 'suspended') {
					await ctx.resume();
					console.log('[AudioContext] Resumed audio context');
				}
			}
		};

		document.addEventListener('visibilitychange', this.visibilityHandler);
		console.log('[AudioContext] Visibility handler set up - audio will continue in background');
	}

	/**
	 * Resume AudioContext if suspended (browser autoplay policy)
	 * Must be called from user interaction (click, touch, etc.)
	 */
	static async resume(): Promise<void> {
		const ctx = this.getContext();
		if (ctx.state === 'suspended') {
			await ctx.resume();
			console.log('[AudioContext] Resumed from suspended state');
		}
	}

	/**
	 * Suspend AudioContext to save resources
	 */
	static async suspend(): Promise<void> {
		const ctx = this.getContext();
		if (ctx.state === 'running') {
			await ctx.suspend();
			console.log('[AudioContext] Suspended');
		}
	}

	/**
	 * Close AudioContext (cannot be reopened)
	 * Only use when completely done with audio
	 */
	static async close(): Promise<void> {
		if (this.instance) {
			await this.instance.close();
			this.instance = null;
			console.log('[AudioContext] Closed');
		}
		
		// Remove visibility handler
		if (this.visibilityHandler) {
			document.removeEventListener('visibilitychange', this.visibilityHandler);
			this.visibilityHandler = null;
			console.log('[AudioContext] Visibility handler removed');
		}
	}

	/**
	 * Get current AudioContext state
	 */
	static getState(): AudioContextState | null {
		return this.instance?.state || null;
	}

	/**
	 * Get current sample rate
	 */
	static getSampleRate(): number | null {
		return this.instance?.sampleRate || null;
	}

	/**
	 * Get current time
	 */
	static getCurrentTime(): number | null {
		return this.instance?.currentTime || null;
	}
}

export default AudioContextManager;

/**
 * Hook-friendly function to get AudioContext
 * Safe to call multiple times
 */
export function getAudioContext(): AudioContext {
	return AudioContextManager.getContext();
}

/**
 * Resume audio context from user interaction
 */
export async function resumeAudioContext(): Promise<void> {
	return AudioContextManager.resume();
}

/**
 * Suspend audio context to save resources
 */
export async function suspendAudioContext(): Promise<void> {
	return AudioContextManager.suspend();
}

/**
 * Close audio context (cannot be reopened)
 */
export async function closeAudioContext(): Promise<void> {
	return AudioContextManager.close();
}

/**
 * Get audio context state
 */
export function getAudioContextState(): AudioContextState | null {
	return AudioContextManager.getState();
}
