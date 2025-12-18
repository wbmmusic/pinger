import React, { TextareaHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea: React.FC<TextareaProps> = ({ style, ...props }) => {
  const theme = useTheme();
  
  const textareaStyles: React.CSSProperties = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    fontSize: theme.fontSize.sm,
    backgroundColor: theme.colors.dark,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius,
    outline: 'none',
    width: '100%',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: theme.fonts.mono,
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    ...style,
  };
  
  return (
    <textarea
      style={textareaStyles}
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