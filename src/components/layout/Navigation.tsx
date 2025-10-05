'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useThemeMode } from '@/contexts/ThemeContext';

export default function Navigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useThemeMode();
  
  // Simplified navigation following NASA guidelines - focus on core functionality
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/simulation', label: 'Simulation' },
    { href: '/visualization', label: 'Visualization' },
    { href: '/mitigation', label: 'Mitigation' },
    { href: '/about', label: 'About' }
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          background: '#ffffff',
          width: 280,
          paddingTop: 2,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', fontWeight: 600, color: '#0B3D91' }}>
          Menu
        </Typography>
        <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#6c757d' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ pt: 0 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                py: 1.5,
                px: 3,
                backgroundColor: pathname === item.href ? 'rgba(11, 61, 145, 0.08)' : 'transparent',
                borderLeft: pathname === item.href ? '4px solid #0B3D91' : '4px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(11, 61, 145, 0.04)',
                },
              }}
            >
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontWeight: pathname === item.href ? 600 : 400,
                  color: pathname === item.href ? '#0B3D91' : '#212529',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Mobile Theme Toggle */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={toggleDarkMode}
            sx={{
              py: 1.5,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(11, 61, 145, 0.04)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {darkMode ? <LightModeIcon sx={{ mr: 2, color: '#0B3D91' }} /> : <DarkModeIcon sx={{ mr: 2, color: '#0B3D91' }} />}
              <ListItemText 
                primary={darkMode ? 'Light Mode' : 'Dark Mode'} 
                primaryTypographyProps={{
                  fontWeight: 400,
                  color: '#212529',
                }}
              />
            </Box>
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#0B3D91' }}>
        <Box sx={{ width: '100%' }}>
          <Toolbar sx={{ px: 2, minHeight: 64 }}>
            {/* NASA-style logo and title */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Link 
                href="/" 
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit', 
                  display: 'flex', 
                  alignItems: 'center' 
                }}
              >
                <Typography 
                  variant="h6" 
                  component="div" 
                  sx={{ 
                    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                    fontWeight: 700,
                    color: '#ffffff',
                    fontSize: '1.25rem',
                  }}
                >
                  Meteor Madness
                </Typography>
              </Link>
            </Box>
            
            {/* Desktop Navigation - Clean, minimal */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    component={Link}
                    href={item.href}
                    sx={{
                      color: '#ffffff',
                      fontWeight: pathname === item.href ? 600 : 400,
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      borderRadius: 0,
                      borderBottom: pathname === item.href ? '3px solid #FC3D21' : '3px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderBottom: '3px solid rgba(252, 61, 33, 0.5)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                
                {/* Theme Toggle Button */}
                <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                  <IconButton
                    onClick={toggleDarkMode}
                    sx={{
                      color: '#ffffff',
                      ml: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            
            {/* Mobile controls */}
            {isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Mobile Theme Toggle */}
                <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                  <IconButton
                    onClick={toggleDarkMode}
                    sx={{
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>
                
                {/* Mobile menu toggle */}
                <IconButton
                  color="inherit"
                  aria-label="open navigation menu"
                  edge="end"
                  onClick={handleMobileMenuToggle}
                  sx={{ color: '#ffffff' }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
          </Toolbar>
        </Box>
      </AppBar>
      {mobileMenu}
    </>
  );
}