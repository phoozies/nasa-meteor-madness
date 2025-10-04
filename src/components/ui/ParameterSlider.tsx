import React from 'react';
import { Box, Typography, Slider } from '@mui/material';

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  description?: string;
}

export default function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description
}: ParameterSliderProps) {
  const handleChange = (_: Event, newValue: number | number[]) => {
    onChange(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value}{unit}
        </Typography>
      </Box>
      
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => `${val}${unit}`}
        sx={{ mb: 1 }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: description ? 1 : 0 }}>
        <Typography variant="caption" color="text.secondary">
          {min}{unit}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {max}{unit}
        </Typography>
      </Box>
      
      {description && (
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
}