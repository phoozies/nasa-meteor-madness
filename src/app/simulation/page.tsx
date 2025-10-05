'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { MapViewProps } from '@/components/MapViewLeaflet';
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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { PlayArrow, Public, Map } from '@mui/icons-material';
import ParameterSlider from '@/components/ui/ParameterSlider';
import Globe from '../../components/simulation/globe';

// Client-only Leaflet map with proper typing
const MapView = dynamic<MapViewProps>(
  () => import('@/components/MapViewLeaflet').then((mod) => mod.default),
  { ssr: false }
);

export default function SimulationPage() {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [asteroidData, setAsteroidData] = useState({
    size: 100, // meters
    velocity: 20, // km/s
    angle: 45, // degrees
    composition: 'rocky' as 'rocky' | 'metallic' | 'icy',
  });

  const [results, setResults] = useState({
    energy: '---',
    craterDiameter: '---',
    craterDepth: '---',
    affectedArea: '---',
    seismicMagnitude: '---',
    windSpeed: '---',
  });

  // State for 2D map mode
  const [impactPoint, setImpactPoint] = useState<{ lon: number; lat: number } | null>(null);
  const [geojsonRings, setGeojsonRings] = useState<
    { id: string; color?: string; opacity?: number; label?: string; description?: string; geojson: GeoJSON.GeoJSON }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    // Calculate basic metrics for quick display
    const energy = (asteroidData.size * asteroidData.velocity * asteroidData.velocity / 1000).toFixed(1);
    const crater = (asteroidData.size * 0.1).toFixed(1);
    const area = (Math.PI * Math.pow(asteroidData.size * 0.5, 2) / 1000000).toFixed(1);
    
    // For 2D mode, run detailed simulation
    if (viewMode === '2d') {
      if (!impactPoint) {
        alert('Click the map to set the impact point first.');
        return;
      }

      const material =
        asteroidData.composition === 'metallic' ? 'iron' :
        asteroidData.composition === 'icy' ? 'cometary' : 'stony';

      const density = material === 'iron' ? 7800 : material === 'cometary' ? 600 : 3000;

      const payload = {
        diameter_m: asteroidData.size,
        density,
        speed_ms: asteroidData.velocity * 1000, // km/s -> m/s
        angle_deg: asteroidData.angle,
        material,
        lon: impactPoint.lon,
        lat: impactPoint.lat,
        mitigation: { method: 'none' as const, dv_ms: 0, lead_time_days: 0 },
      };

      setLoading(true);
      try {
        const res = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.error('simulate failed', res.status, await res.text());
          return;
        }
        const data = await res.json();
        setGeojsonRings(data.rings || []);
        
        // Update results with detailed data from API
        setResults({
          energy: data.energy_MtTNT.toFixed(1),
          craterDiameter: (data.crater_diameter_m / 1000).toFixed(2),
          craterDepth: data.crater_depth_m ? (data.crater_depth_m / 1000).toFixed(2) : '---',
          affectedArea: (Math.PI * Math.pow(data.crater_diameter_m / 2000, 2)).toFixed(1),
          seismicMagnitude: data.seismic_magnitude ? data.seismic_magnitude.toFixed(1) : '---',
          windSpeed: '~470', // From extreme blast zone
        });
      } finally {
        setLoading(false);
      }
    } else {
      // For 3D mode, just show basic calculations
      setResults({
        energy: energy,
        craterDiameter: crater,
        craterDepth: (parseFloat(crater) * 0.15).toFixed(2),
        affectedArea: area,
        seismicMagnitude: '---',
        windSpeed: '---',
      });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
        Asteroid Impact Simulation
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Controls Panel */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
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

                <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
                  <InputLabel>Composition</InputLabel>
                  <Select
                    value={asteroidData.composition}
                    label="Composition"
                    onChange={(e) => setAsteroidData({
                      ...asteroidData, 
                      composition: e.target.value as 'rocky' | 'metallic' | 'icy'
                    })}
                  >
                    <MenuItem value="rocky">Rocky</MenuItem>
                    <MenuItem value="metallic">Metallic</MenuItem>
                    <MenuItem value="icy">Icy</MenuItem>
                  </Select>
                </FormControl>
                
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={runSimulation}
                  sx={{ py: 1.5 }}
                  disabled={loading}
                  suppressHydrationWarning
                >
                  {loading ? 'Simulating…' : 'Run Simulation'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Visualization Panel */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: { xs: 500, lg: 700 } }}>
            <CardContent sx={{ p: 4, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  Impact Visualization
                </Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => {
                    if (newMode !== null) {
                      setViewMode(newMode);
                    }
                  }}
                  size="small"
                  aria-label="view mode"
                >
                  <ToggleButton value="3d" aria-label="3D globe view">
                    <Public sx={{ mr: 1 }} fontSize="small" />
                    3D Globe
                  </ToggleButton>
                  <ToggleButton value="2d" aria-label="2D map view">
                    <Map sx={{ mr: 1 }} fontSize="small" />
                    2D Map
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box
                sx={{
                  height: 'calc(100% - 60px)',
                  minHeight: { xs: '350px', lg: '550px' },
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid #dee2e6',
                  position: 'relative',
                  backgroundColor: viewMode === '3d' ? 'transparent' : '#f8f9fa',
                  background: viewMode === '3d' ? 'linear-gradient(135deg, #1f2937, #374151)' : '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {viewMode === '3d' ? (
                  <Globe />
                ) : (
                  <>
                    <MapView
                      impactPoint={impactPoint}
                      setImpactPoint={setImpactPoint}
                      rings={geojsonRings}
                    />
                    {loading && (
                      <Typography 
                        color="text.secondary" 
                        sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}
                      >
                        Simulating…
                      </Typography>
                    )}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 1000 }}
                    >
                      Tip: click the map to set the impact point.
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Results Panel */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.95rem' }}>
                Impact Energy
              </Typography>
              <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                {results.energy}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MT TNT
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.95rem' }}>
                Crater Size
              </Typography>
              <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                {results.craterDiameter}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                km diameter
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {results.craterDepth} km deep
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.95rem' }}>
                Seismic Effects
              </Typography>
              <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                {results.seismicMagnitude}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Magnitude
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.95rem' }}>
                Peak Wind Speed
              </Typography>
              <Typography variant="h4" sx={{ color: 'error.dark', fontWeight: 'bold' }}>
                {results.windSpeed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                mph
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.95rem' }}>
                Affected Area
              </Typography>
              <Typography variant="h4" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                {results.affectedArea}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                km²
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}