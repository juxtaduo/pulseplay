import type { Request, Response, NextFunction } from 'express';
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
export function errorHandler(
	err: any,
	req: Request,
	res: Response,
	_next: NextFunction,
): void {
	// Log error with context
	logger.error(
		{
			err: {
				name: err.name,
				message: err.message,
				stack: err.stack,
			},
			path: req.path,
			method: req.method,
			ip: req.ip,
		},
		'request_error',
	);

	// Determine status code
	let statusCode = err.status || err.statusCode || 500;
	let errorMessage = err.message || 'An unexpected error occurred';
	let errorName = err.name || 'Internal Server Error';

	// Handle specific error types
	if (err.name === 'UnauthorizedError' || err.status === 401) {
		statusCode = 401;
		errorName = 'Unauthorized';
		errorMessage = 'Invalid or missing authentication token';
	} else if (err.name === 'ValidationError') {
		statusCode = 400;
		errorName = 'Validation Error';
		errorMessage = err.message;
	} else if (err.name === 'CastError') {
		statusCode = 400;
		errorName = 'Invalid ID';
		errorMessage = 'Invalid resource ID format';
	} else if (err.code === 11000) {
		// MongoDB duplicate key error
		statusCode = 409;
		errorName = 'Duplicate Resource';
		errorMessage = 'Resource already exists';
	} else if (err.name === 'MongoServerError') {
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
			stack: err.stack,
			originalError: err.name,
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
