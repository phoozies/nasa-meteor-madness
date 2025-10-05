'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

// NASA color palette
const nasaColors = {
  primary: {
    main: '#0B3D91',
    light: '#1565C0',
    dark: '#061B40',
  },
  secondary: {
    main: '#FC3D21',
    light: '#FF6B4A',
    dark: '#D32F0E',
  },
};

// Common typography configuration following NASA guidelines
const typography = {
  fontFamily: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  h1: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    marginBottom: '60px',
  },
  h2: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 600,
    fontSize: '2rem',
    lineHeight: 1.3,
    marginBottom: '30px',
  },
  h3: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.4,
    marginBottom: '20px',
  },
  h4: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
    marginBottom: '15px',
  },
  h5: {
    fontFamily: '"Source Sans Pro", sans-serif',
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.5,
  },
  h6: {
    fontFamily: '"Source Sans Pro", sans-serif',
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body1: {
    fontFamily: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontFamily: '"Source Sans Pro", sans-serif',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
};

// Common component overrides
const getComponentOverrides = (mode: 'light' | 'dark') => ({
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        borderRadius: 4,
        fontWeight: 600,
        fontFamily: '"Source Sans Pro", sans-serif',
        padding: '12px 24px',
        fontSize: '0.875rem',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0 2px 4px rgba(11, 61, 145, 0.2)' 
            : '0 2px 4px rgba(11, 61, 145, 0.4)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(11, 61, 145, 0.3)' 
            : '0 2px 8px rgba(11, 61, 145, 0.5)',
        },
      },
      outlined: {
        borderColor: '#0B3D91',
        color: '#0B3D91',
        '&:hover': {
          backgroundColor: mode === 'light' 
            ? 'rgba(11, 61, 145, 0.04)' 
            : 'rgba(11, 61, 145, 0.12)',
          borderColor: '#061B40',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: mode === 'light' ? '#ffffff' : '#161b22',
        border: mode === 'light' ? '1px solid #dee2e6' : '1px solid #30363d',
        boxShadow: mode === 'light' 
          ? '0 1px 3px rgba(0,0,0,0.05)' 
          : '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
        '&:hover': {
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(0,0,0,0.1)' 
            : '0 2px 8px rgba(0,0,0,0.4)',
          borderColor: '#0B3D91',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: '#0B3D91',
        color: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: 'none',
      },
    },
  },
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: '24px',
        paddingRight: '24px',
        maxWidth: '1200px',
      },
    },
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        color: '#0B3D91',
        '& .MuiSlider-thumb': {
          backgroundColor: '#0B3D91',
          border: '2px solid #ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 0 0 8px rgba(11, 61, 145, 0.16)',
          },
        },
        '& .MuiSlider-track': {
          backgroundColor: '#0B3D91',
          border: 'none',
        },
        '& .MuiSlider-rail': {
          backgroundColor: mode === 'light' ? '#dee2e6' : '#30363d',
        },
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      body1: {
        maxWidth: '66ch',
      },
    },
  },
});

// Light theme configuration
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: nasaColors.primary,
    secondary: nasaColors.secondary,
    background: {
      default: '#ffffff',
      paper: '#f8f9fa',
    },
    text: {
      primary: '#212529',
      secondary: '#6c757d',
    },
    grey: {
      50: '#f8f9fa',
      100: '#e9ecef',
      200: '#dee2e6',
      300: '#ced4da',
      400: '#adb5bd',
      500: '#6c757d',
      600: '#495057',
      700: '#343a40',
      800: '#212529',
      900: '#0d1117',
    },
  },
  typography: {
    ...typography,
    h1: {
      ...typography.h1,
      color: '#0B3D91',
    },
    h2: {
      ...typography.h2,
      color: '#0B3D91',
    },
    h3: {
      ...typography.h3,
      color: '#212529',
    },
    h4: {
      ...typography.h4,
      color: '#212529',
    },
    body1: {
      ...typography.body1,
      color: '#212529',
    },
    body2: {
      ...typography.body2,
      color: '#6c757d',
    },
  },
  spacing: 8,
  components: getComponentOverrides('light'),
};

// Dark theme configuration
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2', // Lighter NASA blue for better contrast in dark mode
      light: '#42a5f5',
      dark: '#0B3D91',
    },
    secondary: nasaColors.secondary,
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    text: {
      primary: '#f0f6fc',
      secondary: '#8b949e',
    },
    grey: {
      50: '#0d1117',
      100: '#161b22',
      200: '#21262d',
      300: '#30363d',
      400: '#484f58',
      500: '#6e7681',
      600: '#8b949e',
      700: '#b1bac4',
      800: '#c9d1d9',
      900: '#f0f6fc',
    },
  },
  typography: {
    ...typography,
    h1: {
      ...typography.h1,
      color: '#1976d2',
    },
    h2: {
      ...typography.h2,
      color: '#1976d2',
    },
    h3: {
      ...typography.h3,
      color: '#f0f6fc',
    },
    h4: {
      ...typography.h4,
      color: '#f0f6fc',
    },
    body1: {
      ...typography.body1,
      color: '#f0f6fc',
    },
    body2: {
      ...typography.body2,
      color: '#8b949e',
    },
  },
  spacing: 8,
  components: getComponentOverrides('dark'),
};

// Create theme functions
export const createLightTheme = () => createTheme(lightThemeOptions);
export const createDarkTheme = () => createTheme(darkThemeOptions);

// Default export for backward compatibility
export const theme = createLightTheme();