'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Launch,
} from '@mui/icons-material';
import '@fontsource/orbitron/700.css';

export default function AboutPage() {
  const theme = useTheme();

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
          About Meteor Madness
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
          Empowering planetary defense through interactive science and education
        </Typography>
      
      {/* Project Overview */}
      <Card sx={{ mb: 6, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)' }}>
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              mb: 4,
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, #a6e3ff 50%, #d0f0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Defending Earth Through Science and Simulation
          </Typography>
          
          <Typography variant="h6" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4 }}>
            Meteor Madness is an interactive educational platform developed for the 2025 NASA Space Apps Challenge. 
            Our mission is to transform complex astronomical data into accessible, engaging tools that help scientists, 
            policymakers, educators, and the public understand asteroid impact risks and mitigation strategies.
          </Typography>
          
          <Typography variant="h6" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            By integrating real data from NASA&apos;s Near-Earth Object program and USGS environmental datasets, 
            we create powerful visualizations and simulations that bridge the gap between cutting-edge science 
            and public understanding.
          </Typography>
        </CardContent>
      </Card>
      
      {/* NASA Space Apps Challenge */}
      <Card sx={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)' }}>
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#a6e3ff' }}>
              <Launch sx={{ fontSize: 40, color: '#0B3D91' }} />
            </Avatar>
          </Stack>
          
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, #a6e3ff 50%, #d0f0ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            2025 NASA Space Apps Challenge
          </Typography>
          
          <Typography variant="h6" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4, maxWidth: 600, mx: 'auto' }}>
            This project was developed as part of the 2025 NASA Space Apps Challenge, 
            a global hackathon that brings together scientists, engineers, and innovators 
            to solve challenges related to space exploration and Earth science.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            href="https://www.spaceappschallenge.org"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ px: 4, py: 2 }}
          >
            Visit Space Apps Challenge
          </Button>
        </CardContent>
      </Card>
      </Container>
    </Box>
  );
}