'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { MapViewProps } from '@/components/MapViewLeaflet';

// Client-only Leaflet map with proper typing
const MapView = dynamic<MapViewProps>(
  () => import('@/components/MapViewLeaflet').then((mod) => mod.default),
  { ssr: false }
);

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

export default function SimulationPage() {
  const [asteroidData, setAsteroidData] = useState({
    size: 100,       // meters
    velocity: 20,    // km/s
    angle: 45,       // degrees
    composition: 'rocky' as 'rocky' | 'metallic' | 'icy',
  });

  const [results, setResults] = useState({
    energy: '---',
    craterDiameter: '---',
    affectedArea: '---',
  });

  const [impactPoint, setImpactPoint] = useState<{ lon: number; lat: number } | null>(null);
  const [geojsonRings, setGeojsonRings] = useState<
    { id: string; color?: string; opacity?: number; geojson: GeoJSON.GeoJSON }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    // simple UI metrics (illustrative)
    const energy = (asteroidData.size * asteroidData.velocity * asteroidData.velocity / 1000).toFixed(1);
    const crater = (asteroidData.size * 0.1).toFixed(1);
    const area = (Math.PI * Math.pow(asteroidData.size * 0.5, 2) / 1_000_000).toFixed(1);
    setResults({ energy, craterDiameter: crater, affectedArea: area });

    if (!impactPoint) {
      alert('Click the map to set the impact point first.');
      return;
    }

    const material =
      asteroidData.composition === 'metallic' ? 'iron' :
      asteroidData.composition === 'icy'      ? 'cometary' : 'stony';

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
        Asteroid Impact Simulation
      </Typography>

      {/* Top: controls + map */}
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
                    onChange={(e) =>
                      setAsteroidData({
                        ...asteroidData,
                        composition: e.target.value as 'rocky' | 'metallic' | 'icy',
                      })
                    }
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
              <Typography variant="h5" gutterBottom>
                Impact Visualization
              </Typography>
              <Box
                sx={{
                  height: 'calc(100% - 60px)',
                  minHeight: { xs: '350px', lg: '550px' },
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid #dee2e6',
                  position: 'relative',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <MapView
                  impactPoint={impactPoint}
                  setImpactPoint={setImpactPoint}
                  rings={geojsonRings}
                />
                {loading && (
                  <Typography color="text.secondary" sx={{ position: 'absolute', top: 16, left: 16 }}>
                    Simulating…
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                  Tip: click the map to set the impact point.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom: KPI cards */}
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