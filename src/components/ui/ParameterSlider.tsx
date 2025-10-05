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
  disabled?: boolean;
}

export default function ParameterSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description,
  disabled = false
}: ParameterSliderProps) {
  const handleChange = (_: Event, newValue: number | number[]) => {
    onChange(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 600, 
            color: '#212529',
            fontFamily: '"Source Sans Pro", sans-serif',
          }}
        >
          {label}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 700,
            color: '#0B3D91',
            backgroundColor: '#f8f9fa',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            border: '1px solid #dee2e6',
          }}
        >
          {value}{unit}
        </Typography>
      </Box>
      
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        disabled={disabled}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => `${val}${unit}`}
        sx={{ 
          mb: 2,
          opacity: disabled ? 0.5 : 1,
          '& .MuiSlider-valueLabel': {
            backgroundColor: '#0B3D91',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600,
          },
        }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: description ? 2 : 0 }}>
        <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.75rem' }}>
          Min: {min}{unit}
        </Typography>
        <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '0.75rem' }}>
          Max: {max}{unit}
        </Typography>
      </Box>
      
      {description && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6c757d',
            fontSize: '0.875rem',
            lineHeight: 1.4,
            fontStyle: 'italic',
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}