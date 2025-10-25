import { auth } from 'express-oauth2-jwt-bearer';
import { logger } from './logger.js';

/**
 * Auth0 JWT validation middleware for Express
 * @module config/auth0
 */

/**
 * Validates Auth0 JWT tokens using express-oauth2-jwt-bearer
 * Requires AUTHORIZATION header with Bearer token
 */
export const checkJwt = auth({
	audience: process.env.AUTH0_AUDIENCE,
	issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
	tokenSigningAlg: 'RS256',
});

/**
 * Extracts user ID from Auth0 JWT token
 * @param req - Express request object
 * @returns Auth0 user ID (e.g., "auth0|123456")
 * @throws {Error} If token is invalid or missing
 */
export function getUserIdFromToken(req: any): string {
	if (!req.auth || !req.auth.payload || !req.auth.payload.sub) {
		logger.error('auth_token_missing_sub');
		throw new Error('Invalid authentication token: missing sub claim');
	}
	return req.auth.payload.sub;
}

/**
 * Optional middleware to check if user is authenticated
 * (does not throw error if not authenticated, just sets req.user)
 */
export const optionalAuth = auth({
	audience: process.env.AUTH0_AUDIENCE,
	issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
	tokenSigningAlg: 'RS256',
	// @ts-expect-error
	credentialsRequired: false,
});
