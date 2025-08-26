import React from 'react';
import tokens from './tokens';

export const ThemeContext = React.createContext({ tokens, theme:'light', toggleTheme: () => {} });
export default ThemeContext;
