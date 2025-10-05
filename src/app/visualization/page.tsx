'use client';

import { Box, Container, Typography } from '@mui/material';
import SizeVisualizer from '@/components/SizeVisualizer';
import '@fontsource/orbitron/700.css';

export default function VisualizationPage() {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
        
        // Animated starfield layers
        '&::before, &::after, & .star-layer': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
        },

        // Base starfield (small bright stars)
        '&::before': {
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 10% 20%, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 30% 40%, #a6e3ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 50% 60%, #ffffff 100%, transparent),
            radial-gradient(2.5px 2.5px at 70% 80%, #d0f0ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 90% 50%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 20% 70%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 80% 25%, #ffffff 100%, transparent),
            radial-gradient(2.5px 2.5px at 40% 90%, #b0eaff 100%, transparent),
            radial-gradient(1.5px 1.5px at 60% 15%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 25% 85%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 15% 45%, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 35% 25%, #a6e3ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 55% 75%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 75% 35%, #d0f0ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 95% 65%, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 5% 55%, #b0eaff 100%, transparent),
            radial-gradient(1.5px 1.5px at 45% 5%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 65% 95%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 85% 45%, #a6e3ff 100%, transparent),
            radial-gradient(2px 2px at 12% 88%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 32% 68%, #d0f0ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 52% 32%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 72% 12%, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 92% 92%, #b0eaff 100%, transparent),
            radial-gradient(1.5px 1.5px at 8% 72%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 28% 52%, #a6e3ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 48% 28%, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 68% 8%, #d0f0ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 88% 68%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 18% 38%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 38% 58%, #b0eaff 100%, transparent),
            radial-gradient(2px 2px at 58% 78%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 78% 18%, #a6e3ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 98% 38%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 3% 63%, #d0f0ff 100%, transparent),
            radial-gradient(1.5px 1.5px at 23% 83%, #ffffff 100%, transparent),
            radial-gradient(2px 2px at 43% 43%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 63% 23%, #b0eaff 100%, transparent),
            radial-gradient(1.5px 1.5px at 83% 83%, #ffffff 100%, transparent),
            radial-gradient(1.5px 1.5px at 13% 13%, #a6e3ff 100%, transparent)
          `,
          animation: 'starTwinkle 4s ease-in-out infinite alternate',
          opacity: 1.0,
        },

        // Mid layer (blurred, slower drift)
        '&::after': {
          backgroundImage: `
            radial-gradient(2.5px 2.5px at 15% 30%, #ffffff 100%, transparent),
            radial-gradient(2.5px 2.5px at 45% 55%, #a6e3ff 100%, transparent),
            radial-gradient(2.5px 2.5px at 65% 75%, #b0eaff 100%, transparent),
            radial-gradient(3px 3px at 85% 35%, #d0f0ff 100%, transparent),
            radial-gradient(2.5px 2.5px at 35% 65%, #ffffff 100%, transparent),
            radial-gradient(2.5px 2.5px at 55% 25%, #a6e3ff 100%, transparent),
            radial-gradient(2.5px 2.5px at 25% 85%, #ffffff 100%, transparent),
            radial-gradient(3px 3px at 75% 45%, #b0eaff 100%, transparent),
            radial-gradient(2.5px 2.5px at 95% 15%, #d0f0ff 100%, transparent),
            radial-gradient(2.5px 2.5px at 5% 95%, #a6e3ff 100%, transparent),
            radial-gradient(2.5px 2.5px at 50% 10%, #ffffff 100%, transparent),
            radial-gradient(3px 3px at 20% 50%, #b0eaff 100%, transparent),
            radial-gradient(2.5px 2.5px at 70% 90%, #ffffff 100%, transparent),
            radial-gradient(2.5px 2.5px at 40% 70%, #a6e3ff 100%, transparent),
            radial-gradient(2.5px 2.5px at 60% 40%, #d0f0ff 100%, transparent),
            radial-gradient(3px 3px at 80% 60%, #ffffff 100%, transparent),
            radial-gradient(2.5px 2.5px at 10% 80%, #b0eaff 100%, transparent),
            radial-gradient(2.5px 2.5px at 90% 20%, #a6e3ff 100%, transparent),
            radial-gradient(2.5px 2.5px at 30% 10%, #ffffff 100%, transparent),
            radial-gradient(3px 3px at 50% 50%, #d0f0ff 100%, transparent)
          `,
          filter: 'blur(1px)',
          opacity: 0.8,
          animation: 'starDrift 60s linear infinite',
        },

        '@keyframes starTwinkle': {
          '0%': { opacity: 0.7 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.7 },
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
            radial-gradient(3.5px 3.5px at 10% 60%, #d0f0ff 100%, transparent),
            radial-gradient(4px 4px at 40% 20%, #a6e3ff 100%, transparent),
            radial-gradient(3.5px 3.5px at 75% 50%, #ffffff 100%, transparent),
            radial-gradient(5px 5px at 90% 80%, #c8f7ff 100%, transparent),
            radial-gradient(3.5px 3.5px at 20% 30%, #b0eaff 100%, transparent),
            radial-gradient(4px 4px at 60% 70%, #d0f0ff 100%, transparent),
            radial-gradient(3.5px 3.5px at 85% 10%, #ffffff 100%, transparent),
            radial-gradient(4.5px 4.5px at 30% 90%, #a6e3ff 100%, transparent),
            radial-gradient(3.5px 3.5px at 50% 40%, #c8f7ff 100%, transparent),
            radial-gradient(5px 5px at 70% 15%, #d0f0ff 100%, transparent),
            radial-gradient(3.5px 3.5px at 15% 85%, #ffffff 100%, transparent),
            radial-gradient(4px 4px at 95% 45%, #b0eaff 100%, transparent),
            radial-gradient(3.5px 3.5px at 5% 25%, #a6e3ff 100%, transparent),
            radial-gradient(4.5px 4.5px at 45% 65%, #c8f7ff 100%, transparent),
            radial-gradient(3.5px 3.5px at 65% 95%, #d0f0ff 100%, transparent),
            radial-gradient(5px 5px at 80% 35%, #ffffff 100%, transparent)
          `,
          filter: 'blur(2px)',
          opacity: 0.5,
          animation: 'starDrift 90s linear infinite',
          zIndex: 0,
        }}
      />

      {/* Content */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          textAlign="center" 
          gutterBottom 
          sx={{ 
            mb: 2,
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffffff 0%, #a6e3ff 50%, #d0f0ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(166, 227, 255, 0.3)',
          }}
        >
          Asteroid Size Visualizer
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4,
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            maxWidth: '70ch',
            mx: 'auto',
            lineHeight: 1.7,
          }}
        >
          Compare asteroid sizes with everyday objects and explore real Near-Earth Objects from NASA
        </Typography>
        <Box sx={{ height: 'calc(100vh - 240px)', minHeight: 600 }}>
          <SizeVisualizer />
        </Box>
      </Container>
    </Box>
  );
}
