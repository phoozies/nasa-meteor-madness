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
import Globe from '../../components/simulation/globe';
import NeoSelector from '@/components/simulation/NeoSelector';
import MeteorSimulation from '@/components/simulation/MeteorSimulation';
import type { Viewer, Entity } from 'cesium';

// Client-only Leaflet map with proper typing
const MapView = dynamic<MapViewProps>(
  () => import('@/components/MapViewLeaflet').then((mod) => mod.default),
  { ssr: false }
);

export default function SimulationPage() {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const theme = useTheme();
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

  const handleRunSimulation = () => {
    if (!clickTarget) {
      alert('Select a target on the globe first!');
      return;
    }

    // Remove marker after launching
    if (markerRef.current && viewerRef) {
      try { viewerRef.entities.remove(markerRef.current); } catch { /* ignore */ }
      markerRef.current = null;
    }

    // Run impact calculations
    const energy = (asteroidData.size * asteroidData.velocity ** 2 / 1000).toFixed(1);
    const crater = (asteroidData.size * 0.1).toFixed(1);
    const area = (Math.PI * (asteroidData.size * 0.5) ** 2 / 1000000).toFixed(1);

    setResults({
      energy,
      craterDiameter: crater,
      craterDepth: '---',
      affectedArea: area,
      seismicMagnitude: '---',
      windSpeed: '---',
    });

    // Launch meteor simulation
    setRunSim(false);
    setTimeout(() => setRunSim(true), 50);
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', px: 4, py: 4 }}>
      <Grid container spacing={3}>
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

                <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
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

                {/* Approach selection removed: bearing will be randomized by the simulation for variety */}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleRunSimulation}
                  sx={{ py: 1.5 }}
                  suppressHydrationWarning
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
              <Typography variant="h5" gutterBottom>
                Impact Visualization
              </Typography>
              <Box
                sx={{
                  height: 'calc(100% - 40px)',
                  background: 'linear-gradient(135deg, #1f2937, #374151)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Globe
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
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Panel */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Impact Energy
              </Typography>
              <Typography variant="h3" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                {results.energy} MT TNT
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Crater Diameter
              </Typography>
              <Typography variant="h3" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                {results.craterDiameter} km
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Affected Area
              </Typography>
              <Typography variant="h3" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                {results.affectedArea} km²
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
