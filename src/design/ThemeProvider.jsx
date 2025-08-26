import React, { useEffect, useState, useCallback } from 'react';
import tokens, { darkMode } from './tokens';
import '../styles/base.css';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('ltwy-theme') : null;
    return stored || (systemPrefersDark ? 'dark' : 'light');
  });

  const applyTheme = useCallback((mode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, []);

  useEffect(() => { applyTheme(theme); }, [theme, applyTheme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => {
      const autoMode = localStorage.getItem('ltwy-theme-auto');
      if (autoMode === 'true') setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const toggleTheme = () => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('ltwy-theme', next);
      return next;
    });
  };

  const value = { tokens, darkTokens: darkMode, theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
