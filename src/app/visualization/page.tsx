'use client';

import { Box, Container, Typography } from '@mui/material';
import SizeVisualizer from '@/components/SizeVisualizer';

export default function VisualizationPage() {
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h3" component="h1" textAlign="center" gutterBottom sx={{ mb: 4 }}>
          Asteroid Size Visualizer
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Compare asteroid sizes with everyday objects and explore real Near-Earth Objects from NASA
        </Typography>
        <Box sx={{ height: 'calc(100vh - 240px)', minHeight: 600 }}>
          <SizeVisualizer />
        </Box>
      </Container>
    </Box>
  );
}
