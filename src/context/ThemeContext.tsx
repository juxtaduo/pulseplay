import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
	theme: Theme;
	toggleTheme: () => void;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		// Check localStorage first
		const stored = localStorage.getItem('pulseplay-theme') as Theme | null;
		if (stored === 'light' || stored === 'dark') {
			return stored;
		}

		// Check system preference
		if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
			return 'light';
		}

		// Default to dark
		return 'dark';
	});

	useEffect(() => {
		// Apply theme to document root
		const root = document.documentElement;
		if (theme === 'light') {
			root.classList.remove('dark');
			root.classList.add('light');
		} else {
			root.classList.remove('light');
			root.classList.add('dark');
		}

		// Persist to localStorage
		localStorage.setItem('pulseplay-theme', theme);
	}, [theme]);

	const toggleTheme = () => {
		setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}
