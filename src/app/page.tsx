'use client';

import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { Rocket, Analytics } from '@mui/icons-material';
import '@fontsource/orbitron/700.css';

export default function Home() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        color: '#fff',
        background: '#000',
        px: 4,

        // Core star animation layers
        '&::before, &::after, & .star-layer': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
          opacity: 0.9,
        },

        // Base starfield (many small bright points)
        '&::before': {
          backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, #ffffff 80%, transparent),
            radial-gradient(1.5px 1.5px at 30% 40%, #a6e3ff 90%, transparent),
            radial-gradient(1px 1px at 50% 60%, #ffffff 80%, transparent),
            radial-gradient(2px 2px at 70% 80%, #d0f0ff 90%, transparent),
            radial-gradient(1px 1px at 90% 50%, #b0dfff 80%, transparent),
            radial-gradient(1px 1px at 20% 70%, #ffffff 80%, transparent),
            radial-gradient(1px 1px at 80% 25%, #ffffff 80%, transparent),
            radial-gradient(2px 2px at 40% 90%, #b0eaff 90%, transparent)
          `,
          animation: 'starTwinkle 4s ease-in-out infinite alternate',
          opacity: 0.8,
        },

        // Mid layer (slightly blurred, slower drift)
        '&::after': {
          backgroundImage: `
            radial-gradient(2px 2px at 15% 30%, #ffffff 70%, transparent),
            radial-gradient(2px 2px at 45% 55%, #a6e3ff 80%, transparent),
            radial-gradient(2px 2px at 65% 75%, #b0eaff 90%, transparent),
            radial-gradient(3px 3px at 85% 35%, #d0f0ff 100%, transparent)
          `,
          filter: 'blur(1px)',
          opacity: 0.6,
          animation: 'starDrift 60s linear infinite',
        },

        // Third layer (added via inner Box for parallax depth)
        '@keyframes starTwinkle': {
          '0%': { opacity: 0.4 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.4 },
        },
        '@keyframes starDrift': {
          '0%': { transform: 'translateY(0px) translateX(0px)' },
          '100%': { transform: 'translateY(-300px) translateX(400px)' },
        },
      }}
    >
      {/* Third layer: faint large stars drifting slower */}
      <Box
        className="star-layer"
        sx={{
          backgroundImage: `
            radial-gradient(3px 3px at 10% 60%, #d0f0ff 90%, transparent),
            radial-gradient(4px 4px at 40% 20%, #a6e3ff 80%, transparent),
            radial-gradient(3px 3px at 75% 50%, #ffffff 90%, transparent),
            radial-gradient(5px 5px at 90% 80%, #c8f7ff 100%, transparent)
          `,
          filter: 'blur(2px)',
          opacity: 0.3,
          animation: 'starDrift 90s linear infinite',
          zIndex: 0,
        }}
      />

      {/* Soft center glow */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.06), transparent 70%)',
          zIndex: 1,
        }}
      />

      {/* Text & buttons */}
      <Box sx={{ width: '100%', textAlign: 'center', zIndex: 2 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            fontWeight: 800,
            color: theme.palette.primary.light,
            mb: 2,
            textShadow: '0 0 20px rgba(0, 200, 255, 0.8)',
            fontFamily: '"Orbitron", sans-serif',
          }}
        >
          Meteor Madness
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '1.2rem', md: '1.6rem' },
            fontWeight: 300,
            color: 'rgba(255,255,255,0.9)',
            mb: 4,
            maxWidth: '70ch',
            mx: 'auto',
            lineHeight: 1.7,
          }}
        >
          Defending Earth through science and simulation. Explore asteroid threats,
          model impact scenarios, and discover mitigation strategies using real NASA
          and USGS data.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
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
              background: 'linear-gradient(45deg, #00bcd4, #3f51b5)',
              boxShadow: '0 0 25px rgba(0, 200, 255, 0.6)',
              '&:hover': {
                boxShadow: '0 0 30px rgba(0, 200, 255, 0.9)',
                background: 'linear-gradient(45deg, #03a9f4, #5c6bc0)',
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
              py: 1.5,
              px: 3,
              fontSize: '1rem',
              borderColor: 'rgba(255,255,255,0.6)',
              color: '#fff',
              '&:hover': {
                background: 'rgba(255,255,255,0.15)',
                borderColor: '#fff',
              },
            }}
          >
            Explore Data
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
