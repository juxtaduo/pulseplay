import crypto from 'node:crypto';

/**
 * Cryptographic utilities for data anonymization
 * @module utils/crypto
 */

/**
 * Hashes a string using SHA-256 algorithm
 * Used for anonymizing user IDs before storage in MongoDB
 * @param input - String to hash (e.g., Auth0 user ID)
 * @returns Hex-encoded SHA-256 hash
 * @example
 * const hashedUserId = hashSHA256('auth0|123456789');
 * // Returns: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
 */
export function hashSHA256(input: string): string {
	return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Verifies if a plain text matches a hashed value
 * @param plainText - Original string
 * @param hash - SHA-256 hash to compare against
 * @returns True if match, false otherwise
 */
export function verifySHA256(plainText: string, hash: string): boolean {
	const computedHash = hashSHA256(plainText);
	return computedHash === hash;
}
