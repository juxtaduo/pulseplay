import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Authentication button component using Auth0
 * Displays login button when unauthenticated, user info and logout when authenticated
 * @module components/AuthButton
 */

export const AuthButton = () => {
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
		return <div className="w-10 h-10 bg-slate-700 rounded-full animate-pulse" />;
	}

	if (isAuthenticated && user) {
		return (
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
					<User size={18} className="text-slate-400" />
					<span className="text-sm text-slate-300">
						{user.name || user.email?.split('@')[0] || 'User'}
					</span>
				</div>
				<button
					onClick={handleLogout}
					className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-300"
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
			className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full transition-colors text-white font-medium"
			aria-label="Sign in with Auth0"
		>
			<LogIn size={18} />
			Sign In
		</button>
	);
};
