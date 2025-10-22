import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to safely get the system theme
const getSystemTheme = (): Theme => {
  // Check if we are in a browser environment
  if (typeof globalThis.matchMedia === 'function') {
    if (globalThis.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light'; // Default to light
};

// Helper to safely get the stored theme from localStorage
const getStoredTheme = (): Theme | null => {
  if (typeof globalThis.localStorage !== 'undefined') {
    return localStorage.getItem('theme') as Theme | null;
  }
  return null;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    return getStoredTheme() || getSystemTheme();
  });

  // This function is called when the user *manually* clicks the toggle
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Safely set localStorage
      if (typeof globalThis.localStorage !== 'undefined') {
        localStorage.setItem('theme', newTheme);
      }
      return newTheme;
    });
  };

  // This effect applies the theme to the <html> tag
  useEffect(() => {
    // Safely access document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // This effect listens for real-time changes in the OS theme
  useEffect(() => {
    // Only run this in a browser
    if (typeof globalThis.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const userHasSetTheme = !!getStoredTheme();

      // If they have NOT set a theme, update the app to match their OS
      if (!userHasSetTheme) {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        setTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []); // Runs once

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within an AuthProvider');
  }
  return context;
};