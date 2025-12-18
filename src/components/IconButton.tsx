import React, { ButtonHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({ children, style, ...props }) => {
  const theme = useTheme();
  
  const buttonStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.sm,
    cursor: 'pointer',
    color: theme.colors.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    ...style,
  };
  
  return (
    <button
      style={buttonStyles}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.colors.primary;
        e.currentTarget.style.boxShadow = `0 0 10px ${theme.colors.primary}`;
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.color = 'black';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.color = theme.colors.text;
      }}
      {...props}
    >
      {children}
    </button>
  );
};