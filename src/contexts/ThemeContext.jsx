import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [storedTheme, setStoredTheme] = useLocalStorage('theme', 'light');
  const [theme, setTheme] = useState(storedTheme);

  useEffect(() => {
    setTheme(storedTheme); // Sync state with localStorage on initial load/change
  }, [storedTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const oldTheme = theme === 'dark' ? 'light' : 'dark';
    root.classList.remove(oldTheme);
    root.classList.add(theme);
    // Also update localStorage when theme state changes directly
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Use useMemo to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};