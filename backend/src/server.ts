import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { logger } from './config/logger.js';
import { connectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Main Express server entry point
 * @module server
 */

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(
	cors({
		origin: FRONTEND_URL,
		credentials: true,
	}),
);
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
	logger.info({ method: req.method, path: req.path }, 'incoming_request');
	next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
import sessionsRouter from './routes/sessions.js';
import aiRouter from './routes/ai.js';
app.use('/api/sessions', sessionsRouter);
app.use('/api/ai', aiRouter);

// TODO: Import and mount remaining API routes here
// app.use('/api/preferences', preferencesRouter);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
	try {
		// Connect to MongoDB (optional for testing - requires real MongoDB Atlas URI)
		const mongoUri = process.env.MONGODB_URI || '';
		const isRealMongoUri =
			mongoUri.includes('mongodb+srv://') || (mongoUri.includes('mongodb://') && !mongoUri.includes('localhost'));

		if (isRealMongoUri && !mongoUri.includes('your')) {
			await connectDatabase();
		} else {
			logger.warn(
				{ mongodb: 'skipped', reason: 'No production MongoDB URI configured' },
				'Skipping MongoDB connection. Using local/example URI or not configured.',
			);
		}
		
		// Start Express server
		const server = app.listen(PORT, () => {
			logger.info({ port: PORT, env: process.env.NODE_ENV }, 'server_started');
		});

		// Keep server reference for graceful shutdown
		return server;
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				env: process.env.NODE_ENV,
			},
			'server_startup_failed',
		);
		process.exit(1);
	}
}

// Graceful shutdown
process.on('SIGTERM', async () => {
	logger.info('sigterm_received');
	process.exit(0);
});

process.on('SIGINT', async () => {
	logger.info('sigint_received');
	process.exit(0);
});

// Start the server
startServer();

export default app;
