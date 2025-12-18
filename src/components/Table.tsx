import React, { TableHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  borderless?: boolean;
  size?: 'sm' | 'md';
  hover?: boolean;
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ 
  borderless, 
  size = 'md', 
  hover, 
  style, 
  children, 
  ...props 
}) => {
  const theme = useTheme();
  
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    border: borderless ? 'none' : `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    ...style,
  };
  
  return (
    <div style={{ overflow: 'auto' }}>
      <table style={tableStyles} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              style: {
                ...child.props.style,
                ...(child.type === 'thead' && {
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.dark,
                }),
                ...(child.type === 'tbody' && hover && {
                  '& tr:hover': {
                    backgroundColor: theme.colors.light,
                  },
                }),
              },
            });
          }
          return child;
        })}
      </table>
    </div>
  );
};