import rateLimit from 'express-rate-limit';
import { logger } from '../config/logger.js';

/**
 * Rate limiting middleware for API endpoints
 * @module middleware/rateLimiter
 */

/**
 * General API rate limiter: 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: 'Too many requests from this IP, please try again after 15 minutes',
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		logger.warn({ ip: req.ip, path: req.path }, 'rate_limit_exceeded');
		res.status(429).json({
			error: 'Too Many Requests',
			message: 'Too many requests from this IP, please try again after 15 minutes',
		});
	},
});

/**
 * Strict rate limiter for AI endpoints: 10 requests per hour
 */
export const aiLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10,
	message: 'Too many AI requests from this IP, please try again after 1 hour',
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		logger.warn({ ip: req.ip, path: req.path }, 'ai_rate_limit_exceeded');
		res.status(429).json({
			error: 'Too Many Requests',
			message: 'Too many AI requests from this IP, please try again after 1 hour',
		});
	},
});
