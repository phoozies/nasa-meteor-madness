'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#8b5cf6', // Purple
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#0f172a', // Dark space background
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
    info: {
      main: '#06b6d4',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.75rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '3rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1f2937, #374151)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          textTransform: 'none',
          fontWeight: 600,
          padding: '0.75rem 1.5rem',
        },
        contained: {
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          '&:hover': {
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#3b82f6',
          '& .MuiSlider-thumb': {
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            border: '2px solid #1e40af',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            },
          },
          '& .MuiSlider-track': {
            background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
          },
        },
      },
    },
  },
});