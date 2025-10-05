'use client';

import { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import ParameterSlider from '@/components/ui/ParameterSlider';
import Globe from '../../components/simulation/globe';
import MeteorSimulation from '@/components/simulation/MeteorSimulation';
import type { Viewer, Entity } from 'cesium';

export default function SimulationPage() {
  const [asteroidData, setAsteroidData] = useState<{ size: number; velocity: number; angle: number; composition: 'rocky' | 'metallic' | 'icy' }>({
    size: 100,
    velocity: 20,
    angle: 45,
    composition: 'rocky',
  });

  const [results, setResults] = useState({
    energy: '---',
    craterDiameter: '---',
    affectedArea: '---',
  });

  const [viewerRef, setViewerRef] = useState<Viewer | null>(null);
  const [clickTarget, setClickTarget] = useState<{ lon: number; lat: number; height: number } | null>(null);
  const markerRef = useRef<Entity | null>(null);
  const [runSim, setRunSim] = useState(false);
  const [approachDir, setApproachDir] = useState<'north'|'east'|'south'|'west'>('north');

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
      affectedArea: area,
    });

    // Launch meteor simulation
    setRunSim(false);
    setTimeout(() => setRunSim(true), 50);
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

                <FormControl fullWidth sx={{ mt: 1, mb: 3 }}>
                  <InputLabel>Approach</InputLabel>
                  <Select
                    value={approachDir}
                    label="Approach"
                    onChange={(e) => setApproachDir(e.target.value as 'north'|'east'|'south'|'west')}
                  >
                    <MenuItem value="north">From North</MenuItem>
                    <MenuItem value="east">From Right (East)</MenuItem>
                    <MenuItem value="south">From South</MenuItem>
                    <MenuItem value="west">From Left (West)</MenuItem>
                  </Select>
                </FormControl>

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
                    bearingDeg={approachDir === 'north' ? 0 : approachDir === 'east' ? 90 : approachDir === 'south' ? 180 : 270}
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
    </Container>
  );
}
