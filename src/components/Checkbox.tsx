import React, { InputHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, style, ...props }) => {
  const theme = useTheme();
  
  const checkboxStyles: React.CSSProperties = {
    width: '20px',
    height: '20px',
    accentColor: theme.colors.primary,
    cursor: 'pointer',
    ...style,
  };
  
  if (label) {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, cursor: 'pointer', color: theme.colors.text }}>
        <input
          type="checkbox"
          style={checkboxStyles}
          {...props}
        />
        <span>{label}</span>
      </label>
    );
  }
  
  return (
    <input
      type="checkbox"
      style={checkboxStyles}
      {...props}
    />
  );
};