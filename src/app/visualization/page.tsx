'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Slider,
  Stack,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Download,
  Map as MapIcon,
  ThreeDRotation,
  BarChart,
} from '@mui/icons-material';

export default function VisualizationPage() {
  const theme = useTheme();
  const [selectedDataset, setSelectedDataset] = useState('neo');
  const [viewMode, setViewMode] = useState('map');
  const [magnitude, setMagnitude] = useState([0, 10]);
  const [region, setRegion] = useState('all');

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: string) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleMagnitudeChange = (event: Event, newValue: number | number[]) => {
    setMagnitude(newValue as number[]);
  };

  const datasetOptions = [
    { value: 'neo', label: 'Near-Earth Objects' },
    { value: 'tsunami', label: 'Tsunami Risk Zones' },
    { value: 'seismic', label: 'Seismic Activity' },
    { value: 'population', label: 'Population Density' },
    { value: 'elevation', label: 'Elevation Data' },
  ];

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'na', label: 'North America' },
    { value: 'eu', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'pacific', label: 'Pacific' },
  ];

  return (
    <Box sx={{ px: 4, py: 4, backgroundColor: theme.palette.background.default }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
        Data Visualization Dashboard
      </Typography>
      
      {/* Control Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flex: 1 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Dataset</InputLabel>
                <Select
                  value={selectedDataset}
                  label="Dataset"
                  onChange={(e) => setSelectedDataset(e.target.value)}
                >
                  {datasetOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value="map" aria-label="map view">
                  <MapIcon sx={{ mr: 1 }} />
                  Map
                </ToggleButton>
                <ToggleButton value="3d" aria-label="3d view">
                  <ThreeDRotation sx={{ mr: 1 }} />
                  3D
                </ToggleButton>
                <ToggleButton value="chart" aria-label="chart view">
                  <BarChart sx={{ mr: 1 }} />
                  Charts
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            
            <Button
              variant="contained"
              color="success"
              startIcon={<Download />}
              sx={{ minWidth: 'fit-content' }}
            >
              Export Data
            </Button>
          </Stack>
        </CardContent>
      </Card>
      
      <Grid container spacing={4}>
        {/* Visualization Panel */}
        <Grid size={{ xs: 12, xl: 9 }}>
          <Card sx={{ height: 600 }}>
            <CardContent sx={{ height: '100%' }}>
              <Box
                sx={{
                  height: 'calc(100% - 16px)',
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {viewMode === 'map' && 'Interactive Map will be rendered here'}
                  {viewMode === '3d' && '3D Earth Visualization will be rendered here'}
                  {viewMode === 'chart' && 'Data Charts will be rendered here'}
                </Typography>
                <Chip 
                  label={`Dataset: ${selectedDataset.toUpperCase()}`}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Info & Controls Panel */}
        <Grid size={{ xs: 12, xl: 3 }}>
          <Stack spacing={3}>
            {/* Dataset Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dataset Info
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Source:</Typography>
                    <Typography variant="body2">NASA/USGS</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
                    <Typography variant="body2">Real-time</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Records:</Typography>
                    <Typography variant="body2">25,000+</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Coverage:</Typography>
                    <Typography variant="body2">Global</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
            
            {/* Filters */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Filters
                </Typography>
                <Stack spacing={3}>
                  <TextField
                    label="Date Range"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Magnitude Range
                    </Typography>
                    <Slider
                      value={magnitude}
                      onChange={handleMagnitudeChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={10}
                      step={0.1}
                      marks
                    />
                  </Box>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>Region</InputLabel>
                    <Select
                      value={region}
                      label="Region"
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      {regionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>
            
            {/* Statistics */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Objects:</Typography>
                    <Typography variant="body2">25,347</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">High Risk:</Typography>
                    <Typography variant="body2" color="error.main">127</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Medium Risk:</Typography>
                    <Typography variant="body2" color="warning.main">1,834</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Low Risk:</Typography>
                    <Typography variant="body2" color="success.main">23,386</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}