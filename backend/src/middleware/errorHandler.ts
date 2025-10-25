import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.js';
import type { APIError } from '../types/index.js';

/**
 * Centralized error handling middleware
 * @module middleware/errorHandler
 */

/**
 * Global error handler for Express
 * Catches all errors and returns consistent error responses
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
	// Ensure err is an Error object
	const error = err instanceof Error ? err : new Error(String(err));

	// Log error with context
	logger.error(
		{
			err: {
				name: error.name,
				message: error.message,
				stack: error.stack,
			},
			path: req.path,
			method: req.method,
			ip: req.ip,
		},
		'request_error'
	);

	// Determine status code
	const errorWithProps = error as Error & { status?: number; statusCode?: number; code?: number };
	let statusCode = errorWithProps.status || errorWithProps.statusCode || 500;
	let errorMessage = error.message || 'An unexpected error occurred';
	let errorName = error.name || 'Internal Server Error';

	// Handle specific error types
	if (error.name === 'UnauthorizedError' || errorWithProps.status === 401) {
		statusCode = 401;
		errorName = 'Unauthorized';
		errorMessage = 'Invalid or missing authentication token';
	} else if (error.name === 'ValidationError') {
		statusCode = 400;
		errorName = 'Validation Error';
		errorMessage = error.message;
	} else if (error.name === 'CastError') {
		statusCode = 400;
		errorName = 'Invalid ID';
		errorMessage = 'Invalid resource ID format';
	} else if (errorWithProps.code === 11000) {
		// MongoDB duplicate key error
		statusCode = 409;
		errorName = 'Duplicate Resource';
		errorMessage = 'Resource already exists';
	} else if (error.name === 'MongoServerError') {
		statusCode = 503;
		errorName = 'Database Error';
		errorMessage = 'Database operation failed';
	}

	// Build error response
	const errorResponse: APIError = {
		error: errorName,
		message: errorMessage,
	};

	// Include details in development mode
	if (process.env.NODE_ENV === 'development') {
		errorResponse.details = {
			stack: error.stack,
			originalError: error.name,
		};
	}

	res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * Should be mounted after all routes
 */
export function notFoundHandler(req: Request, res: Response): void {
	logger.warn({ path: req.path, method: req.method }, 'route_not_found');

	res.status(404).json({
		error: 'Not Found',
		message: `Route ${req.method} ${req.path} not found`,
	});
}
