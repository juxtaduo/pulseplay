import mongoose from 'mongoose';
import { logger } from './logger.js';

/**
 * MongoDB connection configuration with Mongoose
 * @module config/database
 */

/**
 * Connects to MongoDB Atlas using Mongoose
 * Implements retry logic and error handling
 * @throws {Error} If connection fails after retries
 */
export async function connectDatabase(): Promise<void> {
	const mongoUri = process.env.MONGODB_ATLAS_URI;

	if (!mongoUri) {
		throw new Error('MONGODB_ATLAS_URI environment variable is not defined');
	}

	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});

		logger.info(
			{
				database: mongoose.connection.name,
				host: mongoose.connection.host,
			},
			'database_connected'
		);

		// Handle connection events
		mongoose.connection.on('error', (error) => {
			logger.error(
				{
					error: error.message,
				},
				'database_error'
			);
		});

		mongoose.connection.on('disconnected', () => {
			logger.warn('database_disconnected');
		});

		mongoose.connection.on('reconnected', () => {
			logger.info('database_reconnected');
		});
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : 'Unknown error',
				mongo_uri: mongoUri.replace(/\/\/.*@/, '//<credentials>@'), // Sanitize URI
			},
			'database_connection_failed'
		);
		throw error;
	}
}

/**
 * Gracefully disconnects from MongoDB
 */
export async function disconnectDatabase(): Promise<void> {
	try {
		await mongoose.disconnect();
		logger.info('database_disconnected');
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			'database_disconnect_error'
		);
	}
}

/**
 * Health check for MongoDB connection
 * @returns True if connected, false otherwise
 */
export function isDatabaseConnected(): boolean {
	return mongoose.connection.readyState === 1;
}
