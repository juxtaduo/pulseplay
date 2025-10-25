import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Theme toggle button - switches between light and dark mode
 */
export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="p-2 rounded-lg bg-gradient-to-r from-indigo-100 via-blue-100 to-cyan-100 hover:from-indigo-200 hover:via-blue-200 hover:to-cyan-200 dark:from-indigo-900/60 dark:via-blue-900/60 dark:to-cyan-900/60 dark:hover:from-indigo-800/70 dark:hover:via-blue-800/70 dark:hover:to-cyan-800/70 transition-all shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/60 dark:shadow-lg dark:shadow-indigo-900/40 dark:hover:shadow-xl dark:hover:shadow-indigo-800/50 border border-indigo-200/60 hover:border-indigo-300/80 dark:border-indigo-700/60 dark:hover:border-indigo-600/80 dark:ring-2 dark:ring-indigo-700/30 dark:hover:ring-indigo-600/50"
			aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
			title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
		>
			{theme === 'light' ? (
				<Moon size={20} className="text-slate-700 dark:text-slate-300" />
			) : (
				<Sun size={20} className="text-yellow-400" />
			)}
		</button>
	);
}
