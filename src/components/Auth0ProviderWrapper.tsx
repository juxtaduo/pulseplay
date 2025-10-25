import { Auth0Provider } from '@auth0/auth0-react';
import type { ReactNode } from 'react';

/**
 * Auth0 configuration wrapper for React app
 * @module components/Auth0ProviderWrapper
 */

interface Auth0ProviderWrapperProps {
	children: ReactNode;
}

/**
 * Wraps app with Auth0Provider for authentication
 * Requires environment variables:
 * - VITE_AUTH0_DOMAIN
 * - VITE_AUTH0_CLIENT_ID
 * - VITE_AUTH0_AUDIENCE
 */
export function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
	const domain = import.meta.env.VITE_AUTH0_DOMAIN;
	const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
	const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

	if (!domain || !clientId) {
		throw new Error(
			'Auth0 configuration missing: VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID required'
		);
	}

	return (
		<Auth0Provider
			domain={domain}
			clientId={clientId}
			authorizationParams={{
				redirect_uri: window.location.origin,
				audience: audience,
			}}
			cacheLocation="localstorage"
			useRefreshTokens={true}
		>
			{children}
		</Auth0Provider>
	);
}
