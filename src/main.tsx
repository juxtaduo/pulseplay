import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
import './index.css';

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

// Check if we have proper Auth0 config and if we're on HTTPS (required by Auth0)
const hasAuth0Config = auth0Domain && auth0ClientId && 
	auth0Domain !== 'dev-example.auth0.com' && 
	auth0ClientId !== 'example_client_id';

const isSecureOrigin = window.location.protocol === 'https:' || 
	window.location.hostname === 'localhost' || 
	window.location.hostname === '127.0.0.1';

const shouldUseAuth0 = hasAuth0Config && isSecureOrigin;

if (!hasAuth0Config) {
	console.warn('Auth0 disabled: Missing or placeholder configuration. App will run without authentication.');
}

if (!isSecureOrigin && hasAuth0Config) {
	console.warn('Auth0 disabled: Requires HTTPS or localhost. App will run without authentication.');
}

const AppWithConditionalAuth = () => {
	if (shouldUseAuth0) {
		return (
			<Auth0Provider
				domain={auth0Domain}
				clientId={auth0ClientId}
				authorizationParams={{
					redirect_uri: window.location.origin,
					audience: auth0Audience,
				}}
				cacheLocation="localstorage"
			>
				<App />
			</Auth0Provider>
		);
	}
	
	// Run without Auth0 when config is missing or on insecure origin
	return <App />;
};

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<AppWithConditionalAuth />
	</StrictMode>
);
