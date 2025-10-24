import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Theme toggle button - switches between light and dark mode
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700/60 dark:to-slate-600/60 hover:from-slate-300 hover:to-slate-400 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all shadow-md dark:shadow-lg dark:shadow-slate-600/30 border border-slate-300/60 dark:border-slate-500/60 dark:ring-1 dark:ring-slate-400/20"
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
