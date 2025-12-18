import React, { ButtonHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-info';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  style,
  ...props 
}) => {
  const theme = useTheme();
  
  const getVariantStyles = (variant: ButtonVariant) => {
    const isOutline = variant.startsWith('outline-');
    const colorKey = isOutline ? variant.replace('outline-', '') as keyof typeof theme.colors : variant as keyof typeof theme.colors;
    const color = theme.colors[colorKey] || theme.colors.primary;
    
    if (isOutline) {
      return {
        backgroundColor: 'transparent',
        color: color,
        border: `2px solid ${color}`,
      };
    }
    
    return {
      backgroundColor: color,
      color: variant === 'warning' || variant === 'light' ? theme.colors.dark : theme.colors.background,
      border: `2px solid ${color}`,
    };
  };
  
  const getSizeStyles = (size: ButtonSize) => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          fontSize: theme.fontSize.sm,
        };
      case 'lg':
        return {
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          fontSize: theme.fontSize.lg,
        };
      default:
        return {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: theme.fontSize.md,
        };
    }
  };
  
  const variantStyles = getVariantStyles(variant);
  const isOutline = variant.startsWith('outline-');
  const colorKey = isOutline ? variant.replace('outline-', '') as keyof typeof theme.colors : variant as keyof typeof theme.colors;
  const hoverColor = theme.colors[colorKey] || theme.colors.primary;
  
  const buttonStyles: React.CSSProperties = {
    ...variantStyles,
    ...getSizeStyles(size),
    borderRadius: theme.borderRadius,
    cursor: 'pointer',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    fontFamily: theme.fonts.display,
    ...style,
  };
  
  return (
    <button
      style={buttonStyles}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = `0 0 10px ${hoverColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {children}
    </button>
  );
};