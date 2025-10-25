/**
 * Browser compatibility detection utilities
 * Checks for Web Audio API support and other required features
 * @module utils/browserCheck
 */

export interface BrowserCapabilities {
	webAudioSupported: boolean;
	canvasSupported: boolean;
	localStorageSupported: boolean;
	es6Supported: boolean;
	browserName: string;
	browserVersion: string;
	isSupported: boolean;
}

/**
 * Detect Web Audio API support
 * @returns true if Web Audio API is available
 */
export function isWebAudioSupported(): boolean {
	return !!(
		window.AudioContext ||
		(window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
		(window as Window & { mozAudioContext?: typeof AudioContext }).mozAudioContext
	);
}

/**
 * Detect Canvas API support
 * @returns true if Canvas is available
 */
export function isCanvasSupported(): boolean {
	const canvas = document.createElement('canvas');
	return !!canvas.getContext?.('2d');
}

/**
 * Detect localStorage support
 * @returns true if localStorage is available
 */
export function isLocalStorageSupported(): boolean {
	try {
		const testKey = '__pulseplay_test__';
		localStorage.setItem(testKey, 'test');
		localStorage.removeItem(testKey);
		return true;
	} catch (_e) {
		return false;
	}
}

/**
 * Detect ES6 support (basic features)
 * @returns true if ES6 features are available
 */
export function isES6Supported(): boolean {
	try {
		// Test arrow functions, const/let, template literals
		new Function('const x = () => `test`; return x();')();
		return true;
	} catch (_e) {
		return false;
	}
}

/**
 * Get browser name and version
 * @returns Object with browserName and browserVersion
 */
export function getBrowserInfo(): { name: string; version: string } {
	const ua = navigator.userAgent;
	let browserName = 'Unknown';
	let browserVersion = 'Unknown';

	// Chrome
	if (ua.includes('Chrome') && !ua.includes('Edg')) {
		browserName = 'Chrome';
		const match = ua.match(/Chrome\/(\d+)/);
		if (match) browserVersion = match[1];
	}
	// Edge
	else if (ua.includes('Edg')) {
		browserName = 'Edge';
		const match = ua.match(/Edg\/(\d+)/);
		if (match) browserVersion = match[1];
	}
	// Firefox
	else if (ua.includes('Firefox')) {
		browserName = 'Firefox';
		const match = ua.match(/Firefox\/(\d+)/);
		if (match) browserVersion = match[1];
	}
	// Safari
	else if (ua.includes('Safari') && !ua.includes('Chrome')) {
		browserName = 'Safari';
		const match = ua.match(/Version\/(\d+)/);
		if (match) browserVersion = match[1];
	}
	// Opera
	else if (ua.includes('OPR') || ua.includes('Opera')) {
		browserName = 'Opera';
		const match = ua.match(/(?:OPR|Opera)\/(\d+)/);
		if (match) browserVersion = match[1];
	}

	return { name: browserName, version: browserVersion };
}

/**
 * Check all browser capabilities
 * @returns Object with detailed capability information
 */
export function checkBrowserCapabilities(): BrowserCapabilities {
	const browserInfo = getBrowserInfo();
	const webAudioSupported = isWebAudioSupported();
	const canvasSupported = isCanvasSupported();
	const localStorageSupported = isLocalStorageSupported();
	const es6Supported = isES6Supported();

	// Minimum browser versions
	const minVersions: Record<string, number> = {
		Chrome: 90,
		Firefox: 88,
		Safari: 14,
		Edge: 90,
		Opera: 76,
	};

	let versionSupported = true;
	if (minVersions[browserInfo.name]) {
		const currentVersion = parseInt(browserInfo.version, 10);
		versionSupported = currentVersion >= minVersions[browserInfo.name];
	}

	// Overall support check
	const isSupported =
		webAudioSupported &&
		canvasSupported &&
		localStorageSupported &&
		es6Supported &&
		versionSupported;

	return {
		webAudioSupported,
		canvasSupported,
		localStorageSupported,
		es6Supported,
		browserName: browserInfo.name,
		browserVersion: browserInfo.version,
		isSupported,
	};
}

/**
 * Get user-friendly error messages for unsupported features
 * @param capabilities - Browser capabilities object
 * @returns Array of error messages
 */
export function getUnsupportedFeatureMessages(capabilities: BrowserCapabilities): string[] {
	const messages: string[] = [];

	if (!capabilities.webAudioSupported) {
		messages.push(
			'Web Audio API is not supported. PulsePlay requires a modern browser with Web Audio API support.'
		);
	}

	if (!capabilities.canvasSupported) {
		messages.push(
			'Canvas API is not supported. The waveform visualizer will not work without Canvas support.'
		);
	}

	if (!capabilities.localStorageSupported) {
		messages.push('localStorage is not available. Your preferences cannot be saved locally.');
	}

	if (!capabilities.es6Supported) {
		messages.push(
			'Your browser does not support modern JavaScript (ES6). Please update your browser.'
		);
	}

	const minVersions: Record<string, number> = {
		Chrome: 90,
		Firefox: 88,
		Safari: 14,
		Edge: 90,
		Opera: 76,
	};

	if (minVersions[capabilities.browserName]) {
		const currentVersion = parseInt(capabilities.browserVersion, 10);
		const minVersion = minVersions[capabilities.browserName];
		if (currentVersion < minVersion) {
			messages.push(
				`Your browser version (${capabilities.browserName} ${capabilities.browserVersion}) is outdated. Please update to ${capabilities.browserName} ${minVersion} or later.`
			);
		}
	}

	return messages;
}

/**
 * Log browser capabilities to console for debugging
 * @param capabilities - Browser capabilities object
 */
export function logBrowserCapabilities(capabilities: BrowserCapabilities): void {
	console.group('🌐 Browser Capabilities');
	console.log('Browser:', `${capabilities.browserName} ${capabilities.browserVersion}`);
	console.log('Web Audio API:', capabilities.webAudioSupported ? '✅' : '❌');
	console.log('Canvas API:', capabilities.canvasSupported ? '✅' : '❌');
	console.log('localStorage:', capabilities.localStorageSupported ? '✅' : '❌');
	console.log('ES6 Support:', capabilities.es6Supported ? '✅' : '❌');
	console.log('Overall Support:', capabilities.isSupported ? '✅ Supported' : '❌ Not Supported');
	console.groupEnd();

	if (!capabilities.isSupported) {
		console.warn('⚠️ Browser is not fully supported. Some features may not work correctly.');
		const messages = getUnsupportedFeatureMessages(capabilities);
		messages.forEach((msg) => {
			console.warn(`  - ${msg}`);
		});
	}
}
