import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

/**
 * Authentication button component using Auth0
 * Displays login button when unauthenticated, user info and logout when authenticated
 * Shows development mode when Auth0 is not configured
 * @module components/AuthButton
 */

export const AuthButton = () => {
	const [auth0Available, setAuth0Available] = useState(true);

	// Check if Auth0 is properly configured by checking the domain
	useEffect(() => {
		const domain = import.meta.env.VITE_AUTH0_DOMAIN;
		const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
		const isSecure = window.location.protocol === 'https:' || 
			window.location.hostname === 'localhost' || 
			window.location.hostname === '127.0.0.1';

		const hasValidConfig = domain && clientId && 
			domain !== 'dev-example.auth0.com' && 
			clientId !== 'example_client_id';

		setAuth0Available(hasValidConfig && isSecure);
	}, []);

	// If Auth0 is not available, show development mode
	if (!auth0Available) {
		return (
			<div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-600 rounded-full px-4 py-2">
				<User size={18} className="text-yellow-600 dark:text-yellow-400" />
				<span className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
					Dev Mode
				</span>
			</div>
		);
	}

	// Use Auth0 normally when available
	const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

	const handleLogin = () => {
		loginWithRedirect({
			appState: {
				returnTo: window.location.pathname,
			},
		});
	};

	const handleLogout = () => {
		logout({
			logoutParams: {
				returnTo: window.location.origin,
			},
		});
	};

	if (isLoading) {
		return <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />;
	}

	if (isAuthenticated && user) {
		return (
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-full px-4 py-2">
					<User size={18} className="text-slate-600 dark:text-slate-400" />
					<span className="text-sm text-slate-700 dark:text-slate-300">
						{user.name || user.email?.split('@')[0] || 'User'}
					</span>
				</div>
				<button
					onClick={handleLogout}
					className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 rounded-full transition-colors text-slate-700 dark:text-slate-300"
					title="Sign Out"
					aria-label="Sign out"
				>
					<LogOut size={18} />
				</button>
			</div>
		);
	}

	return (
		<button
			onClick={handleLogin}
			className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full transition-colors text-slate-900 dark:text-white font-medium"
			aria-label="Sign in with Auth0"
		>
			<LogIn size={18} />
			Sign In
		</button>
	);
};
