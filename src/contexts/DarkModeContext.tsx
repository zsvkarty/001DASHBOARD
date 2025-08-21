import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface DarkModeContextType {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  toggleDarkMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

interface DarkModeProviderProps {
  children: React.ReactNode;
}

const getSystemPreference = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialThemeMode = (): ThemeMode => {
  const savedTheme = localStorage.getItem('themeMode');
  if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
    return savedTheme as ThemeMode;
  }
  
  // Migrate from old darkMode setting
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode !== null) {
    const isDark = JSON.parse(savedMode);
    localStorage.removeItem('darkMode'); // Clean up old setting
    return isDark ? 'dark' : 'light';
  }
  
  return 'system';
};

const calculateIsDarkMode = (themeMode: ThemeMode): boolean => {
  switch (themeMode) {
    case 'light':
      return false;
    case 'dark':
      return true;
    case 'system':
      return getSystemPreference();
    default:
      return false;
  }
};

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialThemeMode);
  const [isDarkMode, setIsDarkMode] = useState(() => calculateIsDarkMode(getInitialThemeMode()));

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // Update dark mode when theme mode changes
  useEffect(() => {
    const newIsDarkMode = calculateIsDarkMode(themeMode);
    setIsDarkMode(newIsDarkMode);
  }, [themeMode]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save theme mode to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleDarkMode = () => {
    // Toggle between light and dark, preserving system mode behavior
    if (themeMode === 'system') {
      setThemeMode(isDarkMode ? 'light' : 'dark');
    } else {
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, themeMode, toggleDarkMode, setThemeMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};