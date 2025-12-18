import React, { InputHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: InputSize;
}

export const Input: React.FC<InputProps> = ({ size = 'md', style, ...props }) => {
  const theme = useTheme();
  
  const getSizeStyles = (size: InputSize) => {
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
  
  const inputStyles: React.CSSProperties = {
    ...getSizeStyles(size),
    backgroundColor: 'transparent',
    color: theme.colors.text,
    border: 'none',
    borderBottom: `2px solid ${theme.colors.primary}`,
    borderRadius: '0',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: theme.fonts.secondary,
    ...style,
  };
  
  return (
    <input
      style={inputStyles}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = theme.colors.success;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = theme.colors.primary;
      }}
      {...props}
    />
  );
};