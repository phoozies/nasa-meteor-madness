'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import {
  Rocket,
  Analytics,
  Science,
  Shield,
  School,
  Satellite,
} from '@mui/icons-material';

export default function Home() {
  const [, setCurrentFeature] = useState(0);
  
  const features = [
    {
      title: 'Real-Time Asteroid Tracking',
      description: 'Monitor near-Earth objects using live NASA data',
      icon: <Satellite sx={{ fontSize: 48 }} />,
      link: '/visualization',
      color: 'primary.main'
    },
    {
      title: 'Impact Simulation',
      description: 'Model asteroid impacts with scientific accuracy',
      icon: <Science sx={{ fontSize: 48 }} />,
      link: '/simulation',
      color: 'error.main'
    },
    {
      title: 'Deflection Strategies',
      description: 'Explore methods to protect Earth from threats',
      icon: <Shield sx={{ fontSize: 48 }} />,
      link: '/mitigation',
      color: 'success.main'
    },
    {
      title: 'Educational Resources',
      description: 'Learn about planetary defense and space science',
      icon: <School sx={{ fontSize: 48 }} />,
      link: '/education',
      color: 'info.main'
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [features.length]);
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Star field background */}
      <Box className="star-field" sx={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 12 }}>
        <Box textAlign="center">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3.5rem', md: '8rem' },
              fontWeight: 'bold',
              mb: 3,
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
            }}
          >
            METEOR
          </Typography>
          
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3.5rem', md: '8rem' },
              fontWeight: 'bold',
              mb: 4,
              background: 'linear-gradient(45deg, #ef4444, #f97316)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
            }}
          >
            MADNESS
          </Typography>
          
          <Typography
            variant="h4"
            sx={{
              color: 'text.secondary',
              mb: 6,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: { xs: '1.25rem', md: '2rem' },
            }}
          >
            Defending Earth through science and simulation. Explore asteroid threats,
            model impact scenarios, and discover mitigation strategies using real NASA and USGS data.
          </Typography>
          
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            justifyContent="center"
            sx={{ mb: 8 }}
          >
            <Button
              component={Link}
              href="/simulation"
              variant="contained"
              size="large"
              startIcon={<Rocket />}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.125rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Start Simulation
            </Button>
            <Button
              component={Link}
              href="/visualization"
              variant="outlined"
              size="large"
              startIcon={<Analytics />}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.125rem',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Explore Data
            </Button>
          </Stack>
          
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              🏆 2025 NASA Space Apps Challenge
            </Typography>
            <Typography variant="caption" color="text.disabled">
              October 4-5, 2025 • Challenge: Meteor Madness
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
