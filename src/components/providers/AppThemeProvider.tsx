'use client';

import { ThemeProvider } from '@mui/material/styles';
import { useThemeMode } from '@/contexts/ThemeContext';
import { createLightTheme, createDarkTheme } from '@/lib/theme';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const { darkMode } = useThemeMode();
  
  const theme = darkMode ? createDarkTheme() : createLightTheme();
  
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}