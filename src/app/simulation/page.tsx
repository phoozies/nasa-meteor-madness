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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import { PlayArrow, Science } from '@mui/icons-material';
import ParameterSlider from '@/components/ui/ParameterSlider';
import Globe from '../../components/simulation/globe';

export default function SimulationPage() {
  const theme = useTheme();
  const [asteroidData, setAsteroidData] = useState({
    size: 100, // meters
    velocity: 20, // km/s
    angle: 45, // degrees
    composition: 'rocky'
  });

  const [results, setResults] = useState({
    energy: '---',
    craterDiameter: '---',
    affectedArea: '---'
  });

  const runSimulation = () => {
    // Placeholder for simulation logic
    const energy = (asteroidData.size * asteroidData.velocity * asteroidData.velocity / 1000).toFixed(1);
    const crater = (asteroidData.size * 0.1).toFixed(1);
    const area = (Math.PI * Math.pow(asteroidData.size * 0.5, 2) / 1000000).toFixed(1);
    
    setResults({
      energy: energy,
      craterDiameter: crater,
      affectedArea: area
    });
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Page Header */}
      <Box sx={{ backgroundColor: theme.palette.background.paper, py: 4, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Science sx={{ fontSize: 32, color: theme.palette.primary.main, mr: 2 }} />
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: '2.5rem',
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              Asteroid Impact Simulation
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: '66ch',
            }}
          >
            Model asteroid impacts with scientific accuracy using validated physics models
            and real-world parameters to assess potential threats and damage patterns.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Controls Panel */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    mb: 3,
                    color: '#212529',
                  }}
                >
                  Impact Parameters
                </Typography>
                
                <Box sx={{ mt: 3 }}>
                  <ParameterSlider
                    label="Asteroid Size"
                    value={asteroidData.size}
                    min={10}
                    max={1000}
                    step={10}
                    unit=" m"
                    onChange={(value) => setAsteroidData({...asteroidData, size: value})}
                    description="Diameter of the asteroid in meters"
                  />
                  
                  <ParameterSlider
                    label="Impact Velocity"
                    value={asteroidData.velocity}
                    min={5}
                    max={50}
                    step={1}
                    unit=" km/s"
                    onChange={(value) => setAsteroidData({...asteroidData, velocity: value})}
                    description="Speed at which the asteroid impacts Earth"
                  />
                  
                  <ParameterSlider
                    label="Impact Angle"
                    value={asteroidData.angle}
                    min={0}
                    max={90}
                    step={1}
                    unit="°"
                    onChange={(value) => setAsteroidData({...asteroidData, angle: value})}
                    description="Angle of impact relative to Earth's surface"
                  />

                  <FormControl fullWidth sx={{ mt: 3, mb: 4 }}>
                    <InputLabel>Asteroid Composition</InputLabel>
                    <Select
                      value={asteroidData.composition}
                      label="Asteroid Composition"
                      onChange={(e) => setAsteroidData({...asteroidData, composition: e.target.value})}
                    >
                      <MenuItem value="rocky">Rocky (Silicate)</MenuItem>
                      <MenuItem value="metallic">Metallic (Iron-Nickel)</MenuItem>
                      <MenuItem value="icy">Icy (Water & Volatiles)</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrow />}
                    onClick={runSimulation}
                    sx={{ py: 1.5 }}
                  >
                    Run Simulation
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Visualization Panel */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: { xs: 400, lg: 600 } }}>
              <CardContent sx={{ p: 4, height: '100%' }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 600, 
                    mb: 3,
                    color: theme.palette.text.primary,
                  }}
                >
                  Impact Visualization
                </Typography>
                <Box
                  sx={{
                    height: 'calc(100% - 60px)',
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    border: `2px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Globe />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Results Panel */}
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid size={{ xs: 12 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: '2rem', 
                fontWeight: 600, 
                mb: 3,
                color: '#0B3D91',
                textAlign: 'center',
              }}
            >
              Simulation Results
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h4" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, color: '#212529' }}>
                  Impact Energy
                </Typography>
                <Typography variant="h2" sx={{ color: '#FC3D21', fontWeight: 700, fontSize: '2.5rem' }}>
                  {results.energy}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                  Megatons TNT Equivalent
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h4" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, color: '#212529' }}>
                  Crater Diameter
                </Typography>
                <Typography variant="h2" sx={{ color: '#0B3D91', fontWeight: 700, fontSize: '2.5rem' }}>
                  {results.craterDiameter}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                  Kilometers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h4" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, color: '#212529' }}>
                  Affected Area
                </Typography>
                <Typography variant="h2" sx={{ color: '#6c757d', fontWeight: 700, fontSize: '2.5rem' }}>
                  {results.affectedArea}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                  Square Kilometers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}