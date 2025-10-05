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
} from '@mui/material';
import { PlayArrow, Public, Map } from '@mui/icons-material';
import ParameterSlider from '@/components/ui/ParameterSlider';
import MeteorSimulation from '@/components/simulation/MeteorSimulation';
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

  const handleRunSimulation = async () => {
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

    // Run impact calculations
    const energy = (asteroidData.size * asteroidData.velocity ** 2 / 1000).toFixed(1);
    const crater = (asteroidData.size * 0.1).toFixed(1);
    const area = (Math.PI * Math.pow(asteroidData.size * 0.5, 2) / 1000000).toFixed(1);
    
    // For 2D mode, run detailed simulation
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
      // For 3D mode, show basic calculations and run meteor simulation
      setResults({
        energy,
        craterDiameter: crater,
        craterDepth: (parseFloat(crater) * 0.15).toFixed(2),
        affectedArea: area,
        seismicMagnitude: '---',
        windSpeed: '---',
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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Three-column layout: Parameters | Visualization | Results */}
      <Grid container sx={{ flex: 1, height: '100%' }}>
        {/* Left Column: Parameters */}
        <Grid size={{ xs: 12, md: 2.5, lg: 2.5 }} sx={{ pr: 1 }}>
          <Card sx={{ height: '100vh', borderRadius: 0 }}>
            <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', mb: 1 }}>
                Parameters
              </Typography>

              <Box sx={{ mt: 2 }}>
                <ParameterSlider
                  label="Asteroid Size"
                  value={asteroidData.size}
                  min={10}
                  max={1000}
                  step={10}
                  unit=" m"
                  onChange={(value) => setAsteroidData({ ...asteroidData, size: value })}
                  description="Diameter of the asteroid in meters"
                />

                <ParameterSlider
                  label="Impact Velocity"
                  value={asteroidData.velocity}
                  min={5}
                  max={50}
                  step={1}
                  unit=" km/s"
                  onChange={(value) => setAsteroidData({ ...asteroidData, velocity: value })}
                  description="Speed at which the asteroid impacts Earth"
                />

                <ParameterSlider
                  label="Impact Angle"
                  value={asteroidData.angle}
                  min={0}
                  max={90}
                  step={1}
                  unit="°"
                  onChange={(value) => setAsteroidData({ ...asteroidData, angle: value })}
                  description="Angle of impact relative to Earth's surface"
                />

                <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                  <InputLabel>Composition</InputLabel>
                  <Select
                    value={asteroidData.composition}
                    label="Composition"
                    onChange={(e) => setAsteroidData({ ...asteroidData, composition: e.target.value as 'rocky' | 'metallic' | 'icy' })}
                  >
                    <MenuItem value="rocky">Rocky</MenuItem>
                    <MenuItem value="metallic">Metallic</MenuItem>
                    <MenuItem value="icy">Icy</MenuItem>
                  </Select>
                </FormControl>

                {/* NEO Selector */}
                {mounted && (
                  <Box sx={{ mb: 2 }}>
                    <DynamicNeoSelector
                      onAsteroidSelect={(neo: typeof selectedAsteroid) => {
                        setSelectedAsteroid(neo);
                        if (neo) {
                          setAsteroidData({
                            ...asteroidData,
                            size: neo.size,
                            velocity: neo.velocity,
                          });
                        }
                      }}
                      selectedAsteroid={selectedAsteroid}
                    />
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleRunSimulation}
                  sx={{ py: 1.5 }}
                  disabled={loading}
                >
                  {loading ? 'Running Simulation...' : 'Run Simulation'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Center Column: Visualization */}
        <Grid size={{ xs: 12, md: 7, lg: 7 }} sx={{ px: 0.5 }}>
          <Card sx={{ height: '100vh', borderRadius: 0 }}>
            <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 1, 
                px: 2, 
                py: 1,
                bgcolor: 'background.default',
                borderBottom: '1px solid #dee2e6'
              }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  Impact Visualization
                </Typography>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                  aria-label="view mode"
                >
                  <ToggleButton value="3d" aria-label="3d view">
                    <Public sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                    3D
                  </ToggleButton>
                  <ToggleButton value="2d" aria-label="2d view">
                    <Map sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                    2D
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 0,
                  overflow: 'hidden',
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
                          setImpactPoint={setImpactPoint}
                          rings={geojsonRings}
                          impactPoint={impactPoint}
                        />
                        {loading && (
                          <Typography color="text.secondary" sx={{ position: 'absolute', top: 16, left: 16 }}>
                            Simulating…
                          </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ position: 'absolute', bottom: 16, left: 16 }}>
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

        {/* Right Column: Results */}
        <Grid size={{ xs: 12, md: 2.5, lg: 2.5 }} sx={{ pl: 1 }}>
          <Card sx={{ height: '100vh', borderRadius: 0 }}>
            <CardContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', mb: 1 }}>
                Results
              </Typography>
              
              {/* Quick Stats */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 1, p: 1.5, bgcolor: 'error.main', color: 'white', borderRadius: 1 }}>
                  <Typography variant="caption">Impact Energy</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {results.energy} MT TNT
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', mb: 1, p: 1.5, bgcolor: 'warning.main', color: 'white', borderRadius: 1 }}>
                  <Typography variant="caption">Crater Diameter</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {results.craterDiameter} km
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 1, p: 1.5, bgcolor: 'secondary.main', color: 'white', borderRadius: 1 }}>
                  <Typography variant="caption">Crater Depth</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {results.craterDepth} km
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 1, p: 1.5, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
                  <Typography variant="caption">Affected Area</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {results.affectedArea} km²
                  </Typography>
                </Box>
              </Box>

              {/* Additional Effects */}
              {(results.seismicMagnitude !== '---' || results.windSpeed !== '---') && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Additional Effects
                  </Typography>
                  
                  {results.seismicMagnitude !== '---' && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Seismic:</strong> {results.seismicMagnitude} magnitude
                    </Typography>
                  )}
                  
                  {results.windSpeed !== '---' && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Wind Speed:</strong> {results.windSpeed} km/h
                    </Typography>
                  )}
                </Box>
              )}

              {/* Impact Zones Info */}
              {viewMode === '2d' && geojsonRings.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #dee2e6' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Impact Zones
                  </Typography>
                  <Typography variant="body2">
                    {geojsonRings.length} zones calculated showing blast effects
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Analysis Panel - Only show in 2D mode with detailed stats */}
      {viewMode === '2d' && detailedStats && (
        <Card sx={{ mt: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Impact Analysis
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'error.main' }}>
                  Seismic Effects
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Magnitude:</strong> {results.seismicMagnitude}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ground shaking felt across wide area
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'warning.main' }}>
                  Atmospheric Effects
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Blast Wind:</strong> {results.windSpeed} km/h
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Extreme winds cause structural damage
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'info.main' }}>
                  Thermal Radiation
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Duration:</strong> ~{Math.round(asteroidData.size / 50)} seconds
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Intense heat causes burns and fires
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

    </Box>
  );
}
