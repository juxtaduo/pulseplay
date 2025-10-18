import pino from 'pino';

/**
 * Structured logging configuration using Pino
 * Logs are output in JSON format for observability
 * @module config/logger
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Pino logger instance with structured JSON logging
 * Log levels: DEBUG (development), INFO (production events), WARN (recoverable errors), ERROR (failures)
 */
export const logger = pino({
	level: isDevelopment ? 'debug' : 'info',
	transport: isDevelopment
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:standard',
					ignore: 'pid,hostname',
				},
			}
		: undefined,
	formatters: {
		level: (label) => {
			return { level: label };
		},
	},
	timestamp: pino.stdTimeFunctions.isoTime,
	base: {
		env: process.env.NODE_ENV || 'development',
	},
});

/**
 * Example usage:
 *
 * logger.info('rhythm_detected', {
 *   bpm: 120,
 *   intensity: 0.75,
 *   keystroke_count: 45,
 *   session_duration_ms: 180000
 * });
 *
 * logger.debug('audio_node_created', {
 *   type: 'OscillatorNode',
 *   frequency: 440,
 *   gain: 0.5,
 *   active_nodes_count: 12
 * });
 *
 * logger.error('database_connection_failed', {
 *   error: err.message,
 *   retry_attempt: 3
 * });
 */
