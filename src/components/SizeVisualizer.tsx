'use client';

import { useState, useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import { format } from 'd3-format';
import useMeasure from 'react-use-measure';
import {
  Box,
  Card,
  CardContent,
  Slider,
  TextField,
  Button,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import { sizeReferences, categoryLabels, RefObject } from '@/data/sizeRefs';
import { Neo, fetchNeoFeed } from '@/lib/neo';

const formatNumber = format(',.1f');
const formatInteger = format(',');

type VisObject = {
  id: string;
  label: string;
  diameter_m: number;
  color: string;
  type: 'custom' | 'reference' | 'neo';
  emoji?: string;
  imageUrl?: string;
  path?: string; // SVG path data for silhouette
};

export default function SizeVisualizer() {
  // Canvas size
  const [canvasRef, { width, height }] = useMeasure();

  // Custom asteroid
  const [customDiameter, setCustomDiameter] = useState(100);

  // Zoom
  const [zoom, setZoom] = useState(1);

  // Reference objects
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(
    new Set(['human', 'car', 'house', 'statue-liberty'])
  );

  // NEOs
  const [neos, setNeos] = useState<Neo[]>([]);
  const [selectedNeos, setSelectedNeos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch NEOs (uses API default: last 3 days)
  const handleFetchNeos = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedNeos = await fetchNeoFeed();
      setNeos(fetchedNeos);
      // Auto-select first 3 NEOs
      if (fetchedNeos.length > 0) {
        setSelectedNeos(new Set(fetchedNeos.slice(0, 3).map((n) => n.id)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch NEO data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle reference
  const toggleRef = (id: string) => {
    setSelectedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handle NEO selection
  const handleNeoChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedNeos(new Set(typeof value === 'string' ? value.split(',') : value));
  };

  // Compute objects to render
  const objectsToRender = useMemo(() => {
    const objects: VisObject[] = [];

    // Custom asteroid
    if (customDiameter > 0) {
      objects.push({
        id: 'custom',
        label: 'Custom Asteroid',
        diameter_m: customDiameter,
        color: '#3b82f6',
        type: 'custom',
      });
    }

    // Selected references
    sizeReferences.forEach((ref) => {
      if (selectedRefs.has(ref.id)) {
        objects.push({
          id: ref.id,
          label: ref.label,
          diameter_m: ref.diameter_m,
          color: ref.color || '#64748b',
          type: 'reference',
          emoji: ref.emoji,
          imageUrl: ref.imageUrl,
          path: ref.path,
        });
      }
    });

    // Selected NEOs
    neos.forEach((neo) => {
      if (selectedNeos.has(neo.id)) {
        objects.push({
          id: neo.id,
          label: neo.name,
          diameter_m: neo.diameter_m,
          color: neo.is_hazardous ? '#dc2626' : '#f97316',
          type: 'neo',
        });
      }
    });

    // Sort by size (largest first) so small items render on top
    return objects.sort((a, b) => b.diameter_m - a.diameter_m);
  }, [customDiameter, selectedRefs, neos, selectedNeos]);

  // Compute scale
  const { maxMeters, rScale } = useMemo(() => {
    if (objectsToRender.length === 0) {
      return { maxMeters: 100, rScale: scaleLinear().domain([0, 50]).range([0, 100]) };
    }

    const max = Math.max(...objectsToRender.map((obj) => obj.diameter_m));
    const minDim = Math.min(width || 800, height || 600);
    const scale = scaleLinear()
      .domain([0, max / 2])
      .range([0, (0.45 * minDim) / zoom]);

    return { maxMeters: max, rScale: scale };
  }, [objectsToRender, width, height, zoom]);

  // Group references by category
  const refsByCategory = useMemo(() => {
    const grouped: Record<string, RefObject[]> = {};
    sizeReferences.forEach((ref) => {
      if (!grouped[ref.category]) {
        grouped[ref.category] = [];
      }
      grouped[ref.category].push(ref);
    });
    return grouped;
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, height: '100%' }}>
      {/* Left Controls */}
      <Box sx={{ width: { xs: '100%', md: 350 }, flexShrink: 0 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Controls
            </Typography>

            {/* Custom Asteroid Slider */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Custom Asteroid Diameter (m)
              </Typography>
              <Slider
                value={customDiameter}
                onChange={(_, val) => setCustomDiameter(val as number)}
                min={1}
                max={2000}
                step={1}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1, label: '1m' },
                  { value: 500, label: '500m' },
                  { value: 1000, label: '1km' },
                  { value: 2000, label: '2km' },
                ]}
              />
              <TextField
                type="number"
                value={customDiameter}
                onChange={(e) => setCustomDiameter(Math.max(1, parseInt(e.target.value) || 1))}
                size="small"
                fullWidth
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Zoom Slider */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Zoom: {zoom.toFixed(2)}×
              </Typography>
              <Slider
                value={zoom}
                onChange={(_, val) => setZoom(val as number)}
                min={0.25}
                max={5}
                step={0.25}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0.25, label: '0.25×' },
                  { value: 1, label: '1×' },
                  { value: 5, label: '5×' },
                ]}
              />
            </Box>

            {/* NEO Fetch */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Fetch Real NEOs from NASA (Last 3 Days)
              </Typography>
              <Button
                variant="contained"
                onClick={handleFetchNeos}
                disabled={loading}
                fullWidth
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Fetching...' : 'Fetch NEOs'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* NEO Selection */}
            {neos.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Select NEOs</InputLabel>
                <Select
                  multiple
                  value={Array.from(selectedNeos)}
                  onChange={handleNeoChange}
                  input={<OutlinedInput label="Select NEOs" />}
                  renderValue={(selected) => `${selected.length} NEO(s) selected`}
                >
                  {neos.map((neo) => (
                    <MenuItem key={neo.id} value={neo.id}>
                      <Checkbox checked={selectedNeos.has(neo.id)} />
                      {neo.name} ({formatNumber(neo.diameter_m)}m)
                      {neo.is_hazardous && ' ⚠️'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Reference Objects */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reference Objects
              </Typography>
              {Object.entries(refsByCategory).map(([category, refs]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {categoryLabels[category as RefObject['category']]}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {refs.map((ref) => (
                      <Chip
                        key={ref.id}
                        label={ref.label}
                        size="small"
                        onClick={() => toggleRef(ref.id)}
                        color={selectedRefs.has(ref.id) ? 'primary' : 'default'}
                        variant={selectedRefs.has(ref.id) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Legend */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Legend
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                  <Typography variant="caption">Custom Asteroid</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#64748b' }} />
                  <Typography variant="caption">Reference Objects</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#f97316' }} />
                  <Typography variant="caption">NEOs (Safe)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#dc2626' }} />
                  <Typography variant="caption">NEOs (Potentially Hazardous)</Typography>
                </Box>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      </Box>

      {/* Right Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card sx={{ flex: 1, minHeight: 500 }}>
          <CardContent ref={canvasRef} sx={{ height: '100%', p: 0 }}>
            {objectsToRender.length === 0 ? (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                }}
              >
                <Typography>
                  Select objects or fetch NEOs to visualize size comparisons
                </Typography>
              </Box>
            ) : (
              <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
                <g transform={`translate(${width / 2}, ${height / 2})`}>
                  {objectsToRender.map((obj) => {
                    const radius = rScale(obj.diameter_m / 2);
                    const isAsteroid = obj.type === 'custom' || obj.type === 'neo';
                    
                    return (
                      <g key={obj.id}>
                        {isAsteroid ? (
                          // Render asteroids as circles
                          <Tooltip title={`${obj.label}: ${formatNumber(obj.diameter_m)}m`}>
                            <g>
                              <circle
                                cx={0}
                                cy={0}
                                r={radius}
                                fill={obj.color}
                                fillOpacity={0.3}
                                stroke={obj.color}
                                strokeWidth={2}
                                style={{ cursor: 'pointer' }}
                              >
                                <title>{`${obj.label} • ${formatNumber(obj.diameter_m)}m`}</title>
                              </circle>
                            </g>
                          </Tooltip>
                        ) : (
                          // Render reference objects as images or emojis
                          <Tooltip title={`${obj.label}: ${formatNumber(obj.diameter_m)}m`}>
                            <g style={{ cursor: 'pointer' }}>
                              {/* Background circle for size reference */}
                              <circle
                                cx={0}
                                cy={0}
                                r={radius}
                                fill="none"
                                stroke={obj.color}
                                strokeWidth={1}
                                strokeDasharray="4,4"
                                opacity={0.3}
                              />
                              {/* Render actual image/SVG if available */}
                              {obj.imageUrl ? (
                                <image
                                  href={obj.imageUrl}
                                  x={-radius}
                                  y={-radius}
                                  width={radius * 2}
                                  height={radius * 2}
                                  preserveAspectRatio="xMidYMid meet"
                                  style={{
                                    filter: `drop-shadow(0 0 2px ${obj.color})`,
                                  }}
                                />
                              ) : obj.path ? (
                                // Fallback to inline SVG path
                                <g transform={`scale(${radius / 12})`}>
                                  <g transform="translate(-12, -12)">
                                    <path
                                      d={obj.path}
                                      fill={obj.color}
                                      fillOpacity={0.8}
                                      stroke={obj.color}
                                      strokeWidth={0.5}
                                    />
                                  </g>
                                </g>
                              ) : obj.emoji ? (
                                // Final fallback to emoji
                                <text
                                  x={0}
                                  y={0}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fontSize={Math.max(radius * 1.5, 20)}
                                  style={{ 
                                    userSelect: 'none',
                                    pointerEvents: 'none',
                                  }}
                                >
                                  {obj.emoji}
                                </text>
                              ) : null}
                              <title>{`${obj.label} • ${formatNumber(obj.diameter_m)}m`}</title>
                            </g>
                          </Tooltip>
                        )}
                        {/* Label for all objects */}
                        <text
                          y={-radius - 10}
                          textAnchor="middle"
                          fill="currentColor"
                          fontSize={12}
                          fontWeight={500}
                          style={{ pointerEvents: 'none' }}
                        >
                          {obj.label} • {formatNumber(obj.diameter_m)}m
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Scale bar */}
                <g transform={`translate(20, ${height - 40})`}>
                  <line x1={0} y1={0} x2={100} y2={0} stroke="currentColor" strokeWidth={2} />
                  <line x1={0} y1={-5} x2={0} y2={5} stroke="currentColor" strokeWidth={2} />
                  <line x1={100} y1={-5} x2={100} y2={5} stroke="currentColor" strokeWidth={2} />
                  <text x={50} y={20} textAnchor="middle" fill="currentColor" fontSize={12}>
                    {formatInteger(maxMeters / 10)} meters
                  </text>
                </g>
              </svg>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        {objectsToRender.length > 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Object</TableCell>
                  <TableCell align="right">Diameter (m)</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {objectsToRender.map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: obj.color }}
                        />
                        {obj.label}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatNumber(obj.diameter_m)}</TableCell>
                    <TableCell>{obj.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
