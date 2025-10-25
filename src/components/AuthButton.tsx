import { useAuth0 } from '@auth0/auth0-react';
import { LogIn, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Authentication button component using Auth0
 * Displays login button when unauthenticated, user info and logout when authenticated
 * Shows development mode when Auth0 is not configured
 * @module components/AuthButton
 */

export const AuthButton = () => {
	const [auth0Available, setAuth0Available] = useState(false);

	useEffect(() => {
		const domain = import.meta.env.VITE_AUTH0_DOMAIN;
		const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
		const isSecure =
			window.location.protocol === 'https:' || window.location.hostname === 'localhost';

		const hasValidConfig =
			domain && clientId && domain !== 'dev-example.auth0.com' && clientId !== 'example_client_id';

		setAuth0Available(hasValidConfig && isSecure);
	}, []);

	// Use Auth0 hook at top level - always call it
	const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

	// If Auth0 is not available, show development mode
	if (!auth0Available) {
		return (
			<div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/50 dark:to-yellow-800/50 border border-yellow-200 dark:border-yellow-600/50 rounded-full px-4 py-2 shadow-sm">
				<User size={18} className="text-yellow-700 dark:text-yellow-400" />
				<span className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">Dev Mode</span>
			</div>
		);
	}

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
				<div className="flex items-center gap-2 bg-white/90 dark:bg-gradient-to-r dark:from-[rgb(48_53_91)] dark:to-[rgb(61_65_102)] rounded-full px-4 py-2 shadow-sm border border-slate-200/60 dark:border-slate-600/60">
					<User size={18} className="text-slate-600 dark:text-slate-400" />
					<span className="text-sm text-slate-700 dark:text-slate-300">
						{user.name || user.email?.split('@')[0] || 'User'}
					</span>
				</div>
				<button
					type="button"
					onClick={handleLogout}
					className="p-2 bg-white/90 dark:bg-gradient-to-r dark:from-[rgb(48_53_91)] dark:to-[rgb(61_65_102)] hover:bg-slate-100 dark:hover:from-[rgb(48_53_91)] dark:hover:to-[rgb(61_65_102)] rounded-full transition-all text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200/60 dark:border-slate-600/60"
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
			type="button"
			onClick={handleLogin}
			className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-4 py-2 rounded-full transition-all text-white font-medium shadow-sm"
			aria-label="Sign in with Auth0"
		>
			<LogIn size={18} />
			Sign In
		</button>
	);
};
