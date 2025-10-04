'use client';

import Link from 'next/link';
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
} from '@mui/icons-material';

export default function Home() {
  
  return (
    <Box sx={{ backgroundColor: '#ffffff' }}>
      {/* Hero Section - Clean NASA style */}
      <Box sx={{ backgroundColor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                color: '#0B3D91',
                mb: 2,
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              Meteor Madness
            </Typography>
            
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 400,
                color: '#6c757d',
                mb: 4,
                maxWidth: '66ch',
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Defending Earth through science and simulation. 
              Explore asteroid threats, model impact scenarios, and discover 
              mitigation strategies using real NASA and USGS data.
            </Typography>
            
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Button
                component={Link}
                href="/simulation"
                variant="contained"
                size="large"
                startIcon={<Rocket />}
                sx={{
                  py: 1.5,
                  px: 3,
                  fontSize: '1rem',
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
                  py: 1.5,
                  px: 3,
                  fontSize: '1rem',
                }}
              >
                Explore Data
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
