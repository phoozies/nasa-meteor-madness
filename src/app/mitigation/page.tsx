'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Launch,
  Science,
  FlashOn,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import ParameterSlider from '@/components/ui/ParameterSlider';
import '@fontsource/orbitron/700.css';

type StrategyKey = 'kinetic' | 'gravity' | 'laser' | 'nuclear';
type SizeKey = 'big' | 'small';


export default function MitigationPage() {
  const theme = useTheme();
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>('kinetic');
  const [selectedSize, setSelectedSize] = useState<SizeKey>('big');
  const [scenario, setScenario] = useState({
    asteroidSize: 200,
    timeToImpact: 365, // days
  });

  const size = {
    small: {
      name: 'Simple Asteroid',
      description: 'A small asteroid, it would do some damage it reaches us, but we have a number of stragies to counter this!',
      details: ['Diameter: 100 meters', 'Composition: Rocky','Warning time: 10 years (we got lucky)'],
    },
    big: {
      name: 'Complex Asteroid',
      description: 'A larger asteroid, this would cause significant damage if it were to reach us, must be prevented by any means.',
      details: ['Diameter: 2.5 kilometers', 'Composition: Metallic', 'Warning time: 25 years'],
    },
  }

  const strategies = {
    kinetic: {
      name: 'Kinetic Impactor',
      description: 'High-speed high-mass spacecraft collision to alter asteroid trajectory',
      pros: ['Proven technology', 'Relatively simple', 'Cost-effective'],
      cons: ['May fragment asteroid', 'Requires precise targeting', 'Limited effectiveness for large objects'],
      successRate: 40,
      successRate2: 75,
      icon: <Science sx={{ fontSize: 40 }} />,
      color: 'primary'
    },
    gravity: {
      name: 'Gravity Tractor',
      description: 'Spacecraft uses its own gravitational pull to slowly deflect asteroid',
      pros: ['Gentle deflection', 'No fragmentation risk', 'Highly controllable'],
      cons: ['Very slow process', 'Requires long lead time', 'Limited effectiveness for large objects'],
      successRate: 0,
      successRate2: 20,
      icon: <RadioButtonUnchecked sx={{ fontSize: 40 }} />,
      color: 'success'
    },
    laser: {
      name: 'Laser Ablation',
      description: 'Focused laser beam vaporizes surface material for propulsion',
      pros: ['Precise control', 'No spacecraft contact', 'Scalable power'],
      cons: ['Technology in development', 'Very high power requirements', 'Atmospheric interference'],
      successRate: 0,
      successRate2: 7.5,
      icon: <FlashOn sx={{ fontSize: 40 }} />,
      color: 'warning'
    },
    nuclear: {
      name: 'Nuclear Deflection',
      description: 'Nuclear device detonated near asteroid to alter trajectory',
      pros: ['Extremely powerful', 'Effective for large objects', 'Rapid deflection'],
      cons: ['Fragmentation risk', 'Political challenges', 'Fallout concerns'],
      successRate: 75,
      successRate2: 95,
      icon: <RadioButtonUnchecked sx={{ fontSize: 40 }} />,
      color: 'error'
    }
  } as const;

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
          Asteroid Deflection Strategies
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
          Explore cutting-edge methods to protect Earth from asteroid impacts
        </Typography>
      
    {/* Asteroid Size */}
    <Box sx={{ mb: 6 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 3, 
          textAlign: 'center',
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ffffff 0%, #a6e3ff 50%, #d0f0ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Choose Asteroid Size
      </Typography>

      <Grid
        container
        spacing={0} // removes all grid gaps
        justifyContent="center"
      >
        {Object.entries(size).map(([key, size]) => {
          const sizeKey = key as SizeKey;
          return (
            <Grid
              key={key}
              size={{ xs: 12, sm: 6, lg: 3 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                p: 0, // remove internal padding
              }}
            >
              <Card
                sx={{
                  width: 350,
                  cursor: 'pointer',
                  border: selectedSize === sizeKey ? '2px solid' : '1px solid',
                  borderColor:
                    selectedSize === sizeKey ? 'primary.main' : 'divider',
                  backgroundColor:
                    selectedSize === sizeKey
                      ? 'primary.dark' + '10'
                      : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => setSelectedSize(sizeKey)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {size.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {size.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>

      
      {/* Strategy Selection */}
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 3,
            textAlign: 'center',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffffff 0%, #a6e3ff 50%, #d0f0ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Choose Deflection Method
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(strategies).map(([key, strategy]) => {
            const strategyKey = key as StrategyKey;
            return (
              <Grid key={key} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedStrategy === strategyKey ? '2px solid' : '1px solid',
                    borderColor: selectedStrategy === strategyKey 
                      ? `${strategy.color}.main` 
                      : 'divider',
                    backgroundColor: selectedStrategy === strategyKey 
                      ? `${strategy.color}.dark` + '10' 
                      : 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => setSelectedStrategy(strategyKey)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ color: `${strategy.color}.main`, mb: 2 }}>
                      {strategy.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {strategy.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {strategy.description}
                    </Typography>
                    <Chip
                      label={`${
                        selectedSize === 'small' ? strategy.successRate2 : strategy.successRate
                      }% Success Rate`}
                      color={
                        (selectedSize === 'small' ? strategy.successRate2 : strategy.successRate) > 80
                          ? 'success'
                          : (selectedSize === 'small' ? strategy.successRate2 : strategy.successRate) > 60
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />

                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      
      <Grid container spacing={4}>
      {/* Asteroid Details */}
      <Grid size={{ xs: 12, xl: 4 }}>
        <Card>
          <CardContent sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              {size[selectedSize].name}
            </Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <List dense sx={{ listStyleType: 'disc', pl: 2 }}>
                  {size[selectedSize].details.map((detail, index) => (
                    <ListItem key={index} sx={{ display: 'list-item', px: 0 }}>
                      <ListItemText primary={detail} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
        
        {/* Strategy Details */}
        <Grid size={{ xs: 12, xl: 8 }}>
          <Stack spacing={4}>
            {/* Strategy Info */}
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  {strategies[selectedStrategy].name}
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                  {strategies[selectedStrategy].description}
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Advantages
                    </Typography>
                    <List dense>
                      {strategies[selectedStrategy].pros.map((pro, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary={pro} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" color="error.main" gutterBottom>
                      Challenges
                    </Typography>
                    <List dense>
                      {strategies[selectedStrategy].cons.map((con, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Warning color="error" />
                          </ListItemIcon>
                          <ListItemText primary={con} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Success Probability */}
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Mission Outcome Prediction
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {selectedSize === 'small' 
                          ? strategies[selectedStrategy].successRate2 
                          : strategies[selectedStrategy].successRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Success
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {Math.round(
                          (100 - (selectedSize === 'small' 
                                    ? strategies[selectedStrategy].successRate2 
                                    : strategies[selectedStrategy].successRate)) * 0.7
                        )}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Partial Success
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <Typography variant="h3" color="error.main" sx={{ fontWeight: 'bold' }}>
                        {Math.round(
                          (100 - (selectedSize === 'small' 
                                    ? strategies[selectedStrategy].successRate2 
                                    : strategies[selectedStrategy].successRate)) * 0.3
                        )}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Failure
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

          </Stack>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
}