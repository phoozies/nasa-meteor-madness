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
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home,
  Science,
  Analytics,
  Shield,
  Info,
  Menu as MenuIcon,
} from '@mui/icons-material';

export default function Navigation() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { href: '/', label: 'Home', icon: <Home /> },
    { href: '/simulation', label: 'Simulation', icon: <Science /> },
    { href: '/visualization', label: 'Data Viz', icon: <Analytics /> },
    { href: '/mitigation', label: 'Mitigation', icon: <Shield /> },
    { href: '/about', label: 'About', icon: <Info /> }
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
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          width: 250,
        },
      }}
    >
      <List>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              sx={{
                backgroundColor: pathname === item.href ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: pathname === item.href ? 'primary.dark' : 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: isMobile ? 1 : 0 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" sx={{ mr: 1 }}>
                ☄️
              </Typography>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Meteor Madness
              </Typography>
            </Link>
          </Box>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', ml: 4, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  variant={pathname === item.href ? 'contained' : 'text'}
                  sx={{
                    color: pathname === item.href ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: pathname === item.href ? 'primary.dark' : 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleMobileMenuToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      {mobileMenu}
    </>
  );
}