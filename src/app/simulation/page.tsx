'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { MapViewProps } from '@/components/MapViewLeaflet';
import {
  Box,
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
  useTheme,
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
  const theme = useTheme();
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

  // Detailed statistics from API
  const [detailedStats, setDetailedStats] = useState<{
    crater: string[];
    shockwave: string[];
    windBlast: string[];
    seismic: string[];
  } | null>(null);

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

      const density = material === 'iron' ? 7800 : material === 'cometary' ? 600 : 2600;

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
        
        // Store detailed statistics
        if (data.detailed_stats) {
          setDetailedStats(data.detailed_stats);
        }
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
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', px: 4, py: 4 }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom sx={{ mb: 4 }}>
        Asteroid Impact Simulation
      </Typography>
        
      <Grid container spacing={3}>
        {/* Parameters Panel - Left Column */}
        <Grid size={{ xs: 12, xl: 3 }}>
          <Card sx={{ height: { xs: 'auto', xl: 700 } }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                }}
              >
                Impact Parameters
              </Typography>
                
                <Box sx={{ 
                  mt: 3, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  overflow: 'auto',
                  pr: 0.5,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '3px',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                    },
                  },
                  scrollbarWidth: 'thin',
                  scrollbarColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2) transparent' : 'rgba(0, 0, 0, 0.2) transparent',
                }}>
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
                sx={{ py: 1.5, mt: 'auto' }}
                disabled={loading}
                suppressHydrationWarning
              >
                {loading ? 'Simulating…' : 'Run Simulation'}
              </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Visualization Panel - Center Column (Largest) */}
        <Grid size={{ xs: 12, xl: 6 }}>
          <Card sx={{ height: { xs: 500, xl: 700 } }}>
            <CardContent sx={{ p: 3, height: '100%', overflow: 'hidden' }}>
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
        
        {/* Results Panel - Right Column */}
        <Grid size={{ xs: 12, xl: 3 }}>
          <Card sx={{ height: { xs: 'auto', xl: 700 }, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Impact Results
              </Typography>
              
              {/* Quick Results Cards */}
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                pr: 0.5,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '3px',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                  },
                },
                scrollbarWidth: 'thin',
                scrollbarColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2) transparent' : 'rgba(0, 0, 0, 0.2) transparent',
              }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={12}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Impact Energy
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        {results.energy} MT TNT
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={12}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Crater Diameter
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                        {results.craterDiameter} km
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={12}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Affected Area
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                        {results.affectedArea} km²
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Detailed Impact Statistics from API */}
              {detailedStats && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  {/* Crater Statistics */}
                  {detailedStats.crater && detailedStats.crater.length > 0 && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#1e3a8a' }}>
                        💥 Crater
                      </Typography>
                      {detailedStats.crater.map((stat, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5, ml: 1 }}>
                          • {stat}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  
                  {/* Shockwave Statistics */}
                  {detailedStats.shockwave && detailedStats.shockwave.length > 0 && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#dc2626' }}>
                        💨 Shock Wave
                      </Typography>
                      {detailedStats.shockwave.map((stat, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5, ml: 1 }}>
                          • {stat}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  
                  {/* Wind Blast Statistics */}
                  {detailedStats.windBlast && detailedStats.windBlast.length > 0 && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#f97316' }}>
                        🌪️ Wind Blast
                      </Typography>
                      {detailedStats.windBlast.map((stat, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5, ml: 1 }}>
                          • {stat}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  
                  {/* Seismic Statistics */}
                  {detailedStats.seismic && detailedStats.seismic.length > 0 && (
                    <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#8b5cf6' }}>
                        🌍 Seismic Effects
                      </Typography>
                      {detailedStats.seismic.map((stat, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.5, ml: 1 }}>
                          • {stat}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Generic Impact Information (shown when no detailed stats) */}
              {!detailedStats && (
                <Box sx={{ mt: 'auto', p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Impact Assessment:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    • Atmospheric heating and fires{'\n'}
                    • Debris ejection and fallout{'\n'}
                    • Seismic activity potential{'\n'}
                    • Infrastructure damage zones
                  </Typography>
                </Box>
              )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}