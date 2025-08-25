import React from 'react';
import tokens from './tokens';
import '../styles/base.css';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={tokens}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
