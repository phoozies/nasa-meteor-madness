import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  const getMuiVariant = () => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'outlined';
      default:
        return 'contained';
    }
  };

  const getMuiSize = () => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'md':
        return 'medium';
      case 'lg':
        return 'large';
      default:
        return 'medium';
    }
  };

  const getColor = () => {
    switch (variant) {
      case 'danger':
        return 'error';
      case 'success':
        return 'success';
      case 'secondary':
        return 'secondary';
      default:
        return 'primary';
    }
  };
  
  return (
    <MuiButton 
      variant={getMuiVariant()}
      size={getMuiSize()}
      color={getColor()}
      {...props}
    >
      {children}
    </MuiButton>
  );
}