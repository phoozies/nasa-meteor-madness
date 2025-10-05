'use client';


import { useState } from 'react';
import {
  Box,
  Container,
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

export default function MitigationPage() {
  const theme = useTheme();
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyKey>('kinetic');
  const [scenario, setScenario] = useState({
    asteroidSize: 200,
    timeToImpact: 365, // days
  });

  const strategies = {
    kinetic: {
      name: 'Kinetic Impactor',
      description: 'High-speed spacecraft collision to alter asteroid trajectory',
      pros: ['Proven technology', 'Relatively simple', 'Cost-effective'],
      cons: ['May fragment asteroid', 'Requires precise targeting', 'Limited effectiveness for large objects'],
      successRate: 75,
      icon: <Science sx={{ fontSize: 40 }} />,
      color: 'primary'
    },
    gravity: {
      name: 'Gravity Tractor',
      description: 'Spacecraft uses gravitational pull to slowly deflect asteroid',
      pros: ['Gentle deflection', 'No fragmentation risk', 'Highly controllable'],
      cons: ['Very slow process', 'Requires long lead time', 'High fuel requirements'],
      successRate: 90,
      icon: <RadioButtonUnchecked sx={{ fontSize: 40 }} />,
      color: 'success'
    },
    laser: {
      name: 'Laser Ablation',
      description: 'Focused laser beam vaporizes surface material for propulsion',
      pros: ['Precise control', 'No spacecraft contact', 'Scalable power'],
      cons: ['Technology in development', 'Power requirements', 'Atmospheric interference'],
      successRate: 60,
      icon: <FlashOn sx={{ fontSize: 40 }} />,
      color: 'warning'
    },
    nuclear: {
      name: 'Nuclear Deflection',
      description: 'Nuclear device detonated near asteroid to alter trajectory',
      pros: ['Extremely powerful', 'Effective for large objects', 'Rapid deflection'],
      cons: ['Fragmentation risk', 'Political challenges', 'Fallout concerns'],
      successRate: 85,
      icon: <RadioButtonUnchecked sx={{ fontSize: 40 }} />,
      color: 'error'
    }
  } as const;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
        Asteroid Deflection Strategies
      </Typography>
      
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
                      label={`${strategy.successRate}% Success Rate`}
                      color={strategy.successRate > 80 ? 'success' : strategy.successRate > 60 ? 'warning' : 'error'}
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
        {/* Mission Parameters */}
        <Grid size={{ xs: 12, xl: 4 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                Mission Parameters
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <ParameterSlider
                  label="Asteroid Size"
                  value={scenario.asteroidSize}
                  min={50}
                  max={1000}
                  step={10}
                  unit=" m"
                  onChange={(value) => setScenario({...scenario, asteroidSize: value})}
                  description="Diameter of the asteroid in meters"
                />
                
                <ParameterSlider
                  label="Time to Impact"
                  value={scenario.timeToImpact}
                  min={30}
                  max={3650}
                  step={1}
                  unit=" days"
                  onChange={(value) => setScenario({...scenario, timeToImpact: value})}
                  description="Time remaining before potential impact"
                />
              </Box>
              
              <Paper sx={{ p: 3, mt: 3, backgroundColor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Mission Feasibility
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Success Rate:</Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {strategies[selectedStrategy].successRate}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Est. Cost:</Typography>
                    <Typography variant="body2" color="info.main" sx={{ fontWeight: 'bold' }}>
                      $2.5B
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Mission Duration:</Typography>
                    <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      18 months
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
              
              <Button
                fullWidth
                variant="contained"
                color="success"
                size="large"
                startIcon={<Launch />}
                sx={{ mt: 3, py: 1.5 }}
              >
                Launch Mission Simulation
              </Button>
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
            
            {/* Mission Timeline */}
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Mission Timeline
                </Typography>
                <Box
                  sx={{
                    height: 250,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography color="text.secondary">
                    Mission timeline visualization will be rendered here
                  </Typography>
                </Box>
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
                        {strategies[selectedStrategy].successRate}%
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
                        {Math.round((100 - strategies[selectedStrategy].successRate) * 0.7)}%
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
                        {Math.round((100 - strategies[selectedStrategy].successRate) * 0.3)}%
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
    </Container>
  );
}