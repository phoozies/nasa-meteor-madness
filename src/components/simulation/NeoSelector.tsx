import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import { Dangerous, Info } from '@mui/icons-material';

interface NeoAsteroid {
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
}

interface NeoSelectorProps {
  onAsteroidSelect: (asteroid: NeoAsteroid | null) => void;
  selectedAsteroid: NeoAsteroid | null;
}

export default function NeoSelector({ onAsteroidSelect, selectedAsteroid }: NeoSelectorProps) {
  const [asteroids, setAsteroids] = useState<NeoAsteroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNeoData();
  }, []);

  const fetchNeoData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/neo');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch NEO data');
      }
      
      setAsteroids(data.asteroids);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load asteroids');
      console.error('Error fetching NEO data:', err);
    } finally {
      setLoading(false);
    }
  };



  const formatSize = (size: number) => {
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)} km`;
    }
    return `${size} m`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading real asteroids...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel>Select from NEO Data</InputLabel>
        <Select
          value={selectedAsteroid?.id || ''}
          onChange={(e) => {
            const asteroid = asteroids.find(a => a.id === e.target.value);
            onAsteroidSelect(asteroid || null);
          }}
          label="Real NEO Asteroids (Last 3 Days)"
          renderValue={(selected) => {
            if (!selected) return '';
            const asteroid = asteroids.find(a => a.id === selected);
            return asteroid ? asteroid.name : '';
          }}
        >
          <MenuItem value="">
            <em>Custom Parameters</em>
          </MenuItem>
          {asteroids.map((asteroid) => (
            <MenuItem key={asteroid.id} value={asteroid.id}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                    {asteroid.name}
                  </Typography>
                  {asteroid.isPotentiallyHazardous && (
                    <Tooltip title="Potentially Hazardous Asteroid">
                      <Dangerous color="warning" fontSize="small" />
                    </Tooltip>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Size: ${formatSize(asteroid.size)}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`${asteroid.velocity} km/s`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Approach: {new Date(asteroid.closeApproachDate).toLocaleDateString()} • 
                  Miss: {(asteroid.missDistance.lunar).toFixed(2)} LD
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedAsteroid && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Info color="primary" fontSize="small" />
            <Typography variant="subtitle2">Selected Asteroid Details</Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Name:</strong> {selectedAsteroid.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Size:</strong> {formatSize(selectedAsteroid.size)} diameter
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Velocity:</strong> {selectedAsteroid.velocity} km/s relative to Earth
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            <strong>Close Approach:</strong> {new Date(selectedAsteroid.closeApproachDate).toLocaleDateString()} • 
            Miss Distance: {(selectedAsteroid.missDistance.lunar).toFixed(2)} lunar distances
          </Typography>
        </Box>
      )}
    </Box>
  );
}