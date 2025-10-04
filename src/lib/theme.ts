'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
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
    // NASA typography hierarchy
    fontFamily: '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      marginBottom: '60px',
      color: '#0B3D91',
    },
    h2: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      marginBottom: '30px',
      color: '#0B3D91',
    },
    h3: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      marginBottom: '20px',
      color: '#212529',
    },
    h4: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      marginBottom: '15px',
      color: '#212529',
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
      color: '#212529',
    },
    body2: {
      fontFamily: '"Source Sans Pro", sans-serif',
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6c757d',
    },
  },
  spacing: 8, // 8px base unit
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: 600,
          fontFamily: '"Source Sans Pro", sans-serif',
          padding: '12px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(11, 61, 145, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 2px 8px rgba(11, 61, 145, 0.3)',
          },
        },
        outlined: {
          borderColor: '#0B3D91',
          color: '#0B3D91',
          '&:hover': {
            backgroundColor: 'rgba(11, 61, 145, 0.04)',
            borderColor: '#061B40',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
            backgroundColor: '#dee2e6',
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
  },
});