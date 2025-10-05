'use client';


import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Launch,
  Science,
  FlashOn,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import ParameterSlider from '@/components/ui/ParameterSlider';

type StrategyKey = 'kinetic' | 'gravity' | 'laser' | 'nuclear';
type SizeKey = 'big' | 'small';


export default function MitigationPage() {
  const theme = useTheme();
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>('kinetic');
  const [selectedSize, setSelectedSize] = useState<SizeKey>('big');
  const [scenario, setScenario] = useState({
    asteroidSize: 200,
    timeToImpact: 365, // days
  });

  const size = {
    small: {
      name: 'Simple Asteroid',
      description: 'A small asteroid, it would do some damage it reaches us, but we have a number of stragies to counter this!',
      details: ['Diameter: 100 meters', 'Composition: Rocky','Warning time: 10 years (we got lucky)'],
    },
    big: {
      name: 'Complex Asteroid',
      description: 'A larger asteroid, this would cause significant damage if it were to reach us, must be prevented by any means.',
      details: ['Diameter: 2.5 kilometers', 'Composition: Metallic', 'Warning time: 25 years'],
    },
  }

  const strategies = {
    kinetic: {
      name: 'Kinetic Impactor',
      description: 'High-speed high-mass spacecraft collision to alter asteroid trajectory',
      pros: ['Proven technology', 'Relatively simple', 'Cost-effective'],
      cons: ['May fragment asteroid', 'Requires precise targeting', 'Limited effectiveness for large objects'],
      successRate: 40,
      successRate2: 75,
      icon: <Science sx={{ fontSize: 40 }} />,
      color: 'primary'
    },
    gravity: {
      name: 'Gravity Tractor',
      description: 'Spacecraft uses its own gravitational pull to slowly deflect asteroid',
      pros: ['Gentle deflection', 'No fragmentation risk', 'Highly controllable'],
      cons: ['Very slow process', 'Requires long lead time', 'Limited effectiveness for large objects'],
      successRate: 0,
      successRate2: 20,
      icon: <RadioButtonUnchecked sx={{ fontSize: 40 }} />,
      color: 'success'
    },
    laser: {
      name: 'Laser Ablation',
      description: 'Focused laser beam vaporizes surface material for propulsion',
      pros: ['Precise control', 'No spacecraft contact', 'Scalable power'],
      cons: ['Technology in development', 'Very high power requirements', 'Atmospheric interference'],
      successRate: 0,
      successRate2: 7.5,
      icon: <FlashOn sx={{ fontSize: 40 }} />,
      color: 'warning'
    },
    nuclear: {
      name: 'Nuclear Deflection',
      description: 'Nuclear device detonated near asteroid to alter trajectory',
      pros: ['Extremely powerful', 'Effective for large objects', 'Rapid deflection'],
      cons: ['Fragmentation risk', 'Political challenges', 'Fallout concerns'],
      successRate: 75,
      successRate2: 95,
      icon: <RadioButtonUnchecked sx={{ fontSize: 40 }} />,
      color: 'error'
    }
  } as const;

  return (
    <Box sx={{ px: 4, py: 4, backgroundColor: theme.palette.background.default }}>
            <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
        Asteroid Deflection Strategies
      </Typography>
      
    {/* Asteroid Size */}
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Choose Asteroid Size
      </Typography>

      <Grid
        container
        spacing={0} // removes all grid gaps
        justifyContent="center"
      >
        {Object.entries(size).map(([key, size]) => {
          const sizeKey = key as SizeKey;
          return (
            <Grid
              key={key}
              size={{ xs: 12, sm: 6, lg: 3 }}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                p: 0, // remove internal padding
              }}
            >
              <Card
                sx={{
                  width: 350,
                  cursor: 'pointer',
                  border: selectedSize === sizeKey ? '2px solid' : '1px solid',
                  borderColor:
                    selectedSize === sizeKey ? 'primary.main' : 'divider',
                  backgroundColor:
                    selectedSize === sizeKey
                      ? 'primary.dark' + '10'
                      : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => setSelectedSize(sizeKey)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {size.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {size.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>

      
      {/* Strategy Selection */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Choose Deflection Method
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(strategies).map(([key, strategy]) => {
            const strategyKey = key as StrategyKey;
            return (
              <Grid key={key} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedStrategy === strategyKey ? '2px solid' : '1px solid',
                    borderColor: selectedStrategy === strategyKey 
                      ? `${strategy.color}.main` 
                      : 'divider',
                    backgroundColor: selectedStrategy === strategyKey 
                      ? `${strategy.color}.dark` + '10' 
                      : 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => setSelectedStrategy(strategyKey)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ color: `${strategy.color}.main`, mb: 2 }}>
                      {strategy.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {strategy.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {strategy.description}
                    </Typography>
                    <Chip
                      label={`${
                        selectedSize === 'small' ? strategy.successRate2 : strategy.successRate
                      }% Success Rate`}
                      color={
                        (selectedSize === 'small' ? strategy.successRate2 : strategy.successRate) > 80
                          ? 'success'
                          : (selectedSize === 'small' ? strategy.successRate2 : strategy.successRate) > 60
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />

                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      
      <Grid container spacing={4}>
      {/* Asteroid Details */}
      <Grid size={{ xs: 12, xl: 4 }}>
        <Card>
          <CardContent sx={{ p: 4, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              {size[selectedSize].name}
            </Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <List dense sx={{ listStyleType: 'disc', pl: 2 }}>
                  {size[selectedSize].details.map((detail, index) => (
                    <ListItem key={index} sx={{ display: 'list-item', px: 0 }}>
                      <ListItemText primary={detail} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
        
        {/* Strategy Details */}
        <Grid size={{ xs: 12, xl: 8 }}>
          <Stack spacing={4}>
            {/* Strategy Info */}
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  {strategies[selectedStrategy].name}
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                  {strategies[selectedStrategy].description}
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Advantages
                    </Typography>
                    <List dense>
                      {strategies[selectedStrategy].pros.map((pro, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="success" />
                          </ListItemIcon>
                          <ListItemText primary={pro} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="h6" color="error.main" gutterBottom>
                      Challenges
                    </Typography>
                    <List dense>
                      {strategies[selectedStrategy].cons.map((con, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Warning color="error" />
                          </ListItemIcon>
                          <ListItemText primary={con} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* Success Probability */}
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Mission Outcome Prediction
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                        {selectedSize === 'small' 
                          ? strategies[selectedStrategy].successRate2 
                          : strategies[selectedStrategy].successRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Success
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      <Typography variant="h3" color="warning.main" sx={{ fontWeight: 'bold' }}>
                        {Math.round(
                          (100 - (selectedSize === 'small' 
                                    ? strategies[selectedStrategy].successRate2 
                                    : strategies[selectedStrategy].successRate)) * 0.7
                        )}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Partial Success
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                    >
                      <Typography variant="h3" color="error.main" sx={{ fontWeight: 'bold' }}>
                        {Math.round(
                          (100 - (selectedSize === 'small' 
                                    ? strategies[selectedStrategy].successRate2 
                                    : strategies[selectedStrategy].successRate)) * 0.3
                        )}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Failure
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}