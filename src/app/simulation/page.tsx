'use client';

import { useState, useEffect, useRef } from 'react';
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
import MeteorSimulation from '@/components/simulation/MeteorSimulation';
import { ImpactPhysics } from '@/lib/calculations/impactPhysics';
import type { Viewer, Entity } from 'cesium';

// Client-only components with proper typing
const MapView = dynamic<MapViewProps>(
  () => import('@/components/MapViewLeaflet').then((mod) => mod.default),
  { ssr: false }
);

const DynamicGlobe = dynamic(
  () => import('../../components/simulation/globe'),
  { 
    ssr: false,
    loading: () => <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Typography>Loading Globe...</Typography></Box>
  }
);

const DynamicNeoSelector = dynamic(
  () => import('@/components/simulation/NeoSelector'),
  { 
    ssr: false,
    loading: () => <Box sx={{ height: 60, display: 'flex', alignItems: 'center' }}><Typography variant="body2">Loading NEO data...</Typography></Box>
  }
);

export default function SimulationPage() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [asteroidData, setAsteroidData] = useState<{ size: number; velocity: number; angle: number; composition: 'rocky' | 'metallic' | 'icy' }>({
    size: 100,
    velocity: 20,
    angle: 45,
    composition: 'rocky',
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

  // 3D Globe state
  const [viewerRef, setViewerRef] = useState<Viewer | null>(null);
  const [clickTarget, setClickTarget] = useState<{ lon: number; lat: number; height: number } | null>(null);
  const markerRef = useRef<Entity | null>(null);
  const [runSim, setRunSim] = useState(false);

  // 2D Map state
  const [impactPoint, setImpactPoint] = useState<{ lon: number; lat: number } | null>(null);
  const [geojsonRings, setGeojsonRings] = useState<
    { id: string; color?: string; opacity?: number; label?: string; description?: string; geojson: GeoJSON.GeoJSON }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // NEO Selector state
  const [selectedAsteroid, setSelectedAsteroid] = useState<{
    id: string;
    name: string;
    date: string;
    size: number;
    velocity: number;
    isPotentiallyHazardous: boolean;
    absoluteMagnitude: number;
    missDistance: {
      kilometers: number;
      lunar: number;
    };
    closeApproachDate: string;
    orbitingBody: string;
  } | null>(null);

  // Add marker when clickTarget changes
  useEffect(() => {
    if (!viewerRef) return;

    // capture viewerRef to avoid it becoming undefined during async operations
    const v = viewerRef;

    // Remove previous marker
    if (markerRef.current) {
      try { v.entities.remove(markerRef.current); } catch { /* ignore */ }
      markerRef.current = null;
    }

    if (!clickTarget) return;

    const addMarker = async () => {
      const Cesium = await import('cesium');
      if (!v) return;
      const entity = v.entities.add({
        name: 'Target Marker',
        position: Cesium.Cartesian3.fromDegrees(clickTarget.lon, clickTarget.lat, clickTarget.height),
        point: { pixelSize: 10, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
      });
      markerRef.current = entity;
    };

    addMarker();
  }, [clickTarget, viewerRef]);

  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset states when switching view modes
  useEffect(() => {
    setClickTarget(null);
    setImpactPoint(null);
    setRunSim(false);
    setGeojsonRings([]);
    setDetailedStats(null);
    if (markerRef.current && viewerRef) {
      try { viewerRef.entities.remove(markerRef.current); } catch { /* ignore */ }
      markerRef.current = null;
    }
  }, [viewMode, viewerRef]);

  const runSimulation = async () => {
    // Check for target based on view mode
    if (viewMode === '3d' && !clickTarget) {
      alert('Select a target on the globe first!');
      return;
    }
    
    if (viewMode === '2d' && !impactPoint) {
      alert('Click the map to set the impact point first.');
      return;
    }

    // Remove marker after launching for 3D mode
    if (viewMode === '3d' && markerRef.current && viewerRef) {
      try { viewerRef.entities.remove(markerRef.current); } catch { /* ignore */ }
      markerRef.current = null;
    }

    // Calculate impact using proper physics for both modes
    const impactResults = ImpactPhysics.calculateImpact({
      diameter: asteroidData.size,
      velocity: asteroidData.velocity,
      density: asteroidData.composition === 'metallic' ? 7800 : 
               asteroidData.composition === 'icy' ? 600 : 2600,
      angle: asteroidData.angle,
      composition: asteroidData.composition,
      targetDensity: 2500 // Default to land impact for 3D mode
    });

    // For 2D mode, run detailed simulation with API
    if (viewMode === '2d' && impactPoint) {
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
    } else if (viewMode === '3d') {
      // For 3D mode, use proper physics calculations
      const affectedAreaKm2 = Math.PI * Math.pow(impactResults.craterDiameter / 2, 2);
      
      setResults({
        energy: impactResults.energyMegatonsTNT.toFixed(1),
        craterDiameter: impactResults.craterDiameter.toFixed(2),
        craterDepth: impactResults.craterDepth.toFixed(2),
        affectedArea: affectedAreaKm2.toFixed(1),
        seismicMagnitude: impactResults.seismicMagnitude.toFixed(1),
        windSpeed: '---', // Only available in detailed 2D simulation
      });

      // Launch meteor simulation
      setRunSim(false);
      setTimeout(() => setRunSim(true), 50);
    }
  };

  if (!mounted) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', px: 4, py: 4 }}>        
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
                  {viewMode === '2d' && mounted && (
                    <DynamicNeoSelector
                      selectedAsteroid={selectedAsteroid}
                      onAsteroidSelect={(asteroid) => {
                        setSelectedAsteroid(asteroid);
                        if (asteroid) {
                          setAsteroidData({
                            size: asteroid.size,
                            velocity: asteroid.velocity,
                            angle: asteroidData.angle, // Keep user-controlled angle
                            composition: asteroidData.composition, // Keep user-controlled composition
                          });
                        }
                      }}
                    />
                  )}
                  
                  <ParameterSlider
                    label="Asteroid Size"
                    value={asteroidData.size}
                    min={10}
                    max={1000}
                    step={10}
                    unit=" m"
                    onChange={(value) => setAsteroidData({...asteroidData, size: value})}
                    description="Diameter of the asteroid in meters"
                    disabled={selectedAsteroid !== null}
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
                    disabled={selectedAsteroid !== null}
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
                  Asteroid Impact Visualization
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
{mounted && (
                  <>
                    {viewMode === '3d' ? (
                      <>
                        <DynamicGlobe
                          onViewerReady={(v) => setViewerRef(v)}
                          onClick={(pos) => setClickTarget(pos)}
                        />
                        {runSim && viewerRef && clickTarget && (
                          <MeteorSimulation
                            viewer={viewerRef}
                            params={asteroidData}
                            target={clickTarget}
                            start={runSim}
                          />
                        )}
                      </>
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
