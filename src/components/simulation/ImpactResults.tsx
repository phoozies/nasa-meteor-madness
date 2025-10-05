'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack
} from '@mui/material';

interface ImpactData {
  energy: number; // Megatons TNT
  craterDiameter: number; // kilometers
  affectedArea: number; // square kilometers
  seismicMagnitude: number;
  tsunamiRisk: 'Low' | 'Medium' | 'High' | 'Extreme';
  casualties?: number;
}

interface ImpactResultsProps {
  impactData: ImpactData | null;
  isLoading?: boolean;
}

export default function ImpactResults({ impactData, isLoading = false }: ImpactResultsProps) {
  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[...Array(6)].map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="80%" height={32} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!impactData) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          Run a simulation to see impact results
        </Typography>
      </Box>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(1);
  };

  const getTsunamiColor = (risk: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (risk) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'warning';
      case 'Extreme': return 'error';
      default: return 'default';
    }
  };

  const results = [
    {
      title: 'Impact Energy',
      value: `${formatNumber(impactData.energy)} MT`,
      subtitle: 'TNT Equivalent',
      color: 'error.main' as const,
      icon: '💥'
    },
    {
      title: 'Crater Diameter',
      value: `${impactData.craterDiameter.toFixed(1)} km`,
      subtitle: 'Impact Crater',
      color: 'warning.main' as const,
      icon: '🕳️'
    },
    {
      title: 'Affected Area',
      value: `${formatNumber(impactData.affectedArea)} km²`,
      subtitle: 'Damage Zone',
      color: 'info.main' as const,
      icon: '📍'
    },
    {
      title: 'Seismic Magnitude',
      value: impactData.seismicMagnitude.toFixed(1),
      subtitle: 'Richter Scale',
      color: 'secondary.main' as const,
      icon: '🌍'
    },
    {
      title: 'Tsunami Risk',
      value: impactData.tsunamiRisk,
      subtitle: 'Coastal Threat',
      color: 'primary.main' as const,
      icon: '🌊'
    },
    {
      title: 'Est. Casualties',
      value: impactData.casualties ? formatNumber(impactData.casualties) : 'N/A',
      subtitle: 'Population Impact',
      color: 'error.main' as const,
      icon: '👥'
    }
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {results.map((result, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h3">
                    {result.title}
                  </Typography>
                  <Typography variant="h4">
                    {result.icon}
                  </Typography>
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: result.color, 
                    fontWeight: 'bold', 
                    mb: 1 
                  }}
                >
                  {result.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Tsunami Risk Chip */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Chip
          label={`Tsunami Risk: ${impactData.tsunamiRisk}`}
          color={getTsunamiColor(impactData.tsunamiRisk)}
          variant="outlined"
          size="medium"
        />
      </Box>
      
      {/* Additional Assessment Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Impact Assessment
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                Environmental Effects:
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText primary="• Atmospheric heating and fires" />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText primary="• Debris ejection and fallout" />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText primary="• Potential climate disruption" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                Secondary Hazards:
              </Typography>
              <List dense>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText primary="• Seismic activity and landslides" />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText primary="• Tsunami generation (if oceanic)" />
                </ListItem>
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText primary="• Infrastructure damage" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}