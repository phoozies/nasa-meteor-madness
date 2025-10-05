'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Launch,
} from '@mui/icons-material';

export default function AboutPage() {
  const theme = useTheme();

  return (
    <Box sx={{ px: 4, py: 6, backgroundColor: theme.palette.background.default }}>
      <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
        About Meteor Madness
      </Typography>
      
      {/* Project Overview */}
      <Card sx={{ mb: 6 }}>
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Defending Earth Through Science and Simulation
          </Typography>
          
          <Typography variant="h6" paragraph sx={{ color: 'text.secondary', mb: 4 }}>
            Meteor Madness is an interactive educational platform developed for the 2025 NASA Space Apps Challenge. 
            Our mission is to transform complex astronomical data into accessible, engaging tools that help scientists, 
            policymakers, educators, and the public understand asteroid impact risks and mitigation strategies.
          </Typography>
          
          <Typography variant="h6" paragraph sx={{ color: 'text.secondary' }}>
            By integrating real data from NASA&apos;s Near-Earth Object program and USGS environmental datasets, 
            we create powerful visualizations and simulations that bridge the gap between cutting-edge science 
            and public understanding.
          </Typography>
        </CardContent>
      </Card>
      
      {/* NASA Space Apps Challenge */}
      <Card>
        <CardContent sx={{ p: 6, textAlign: 'center' }}>
          <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              <Launch sx={{ fontSize: 40 }} />
            </Avatar>
          </Stack>
          
          <Typography variant="h4" gutterBottom>
            2025 NASA Space Apps Challenge
          </Typography>
          
          <Typography variant="h6" paragraph sx={{ color: 'text.secondary', mb: 4, maxWidth: 600, mx: 'auto' }}>
            This project was developed as part of the 2025 NASA Space Apps Challenge, 
            a global hackathon that brings together scientists, engineers, and innovators 
            to solve challenges related to space exploration and Earth science.
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            href="https://www.spaceappschallenge.org"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ px: 4, py: 2 }}
          >
            Visit Space Apps Challenge
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}