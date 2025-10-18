import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.tsx';
import './index.css';

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

if (!auth0Domain || !auth0ClientId) {
	console.error('Missing Auth0 configuration. Please set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in .env');
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Auth0Provider
			domain={auth0Domain || 'placeholder.auth0.com'}
			clientId={auth0ClientId || 'placeholder'}
			authorizationParams={{
				redirect_uri: window.location.origin,
				audience: auth0Audience,
			}}
			cacheLocation="localstorage"
		>
			<App />
		</Auth0Provider>
	</StrictMode>
);
