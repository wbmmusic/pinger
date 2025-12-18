import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface SelectProps {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, children, style }) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const options = React.Children.toArray(children).filter(
    (child): child is React.ReactElement => 
      React.isValidElement(child) && child.type === 'option'
  );
  
  const selectedOption = options.find(option => option.props.value === value);
  
  return (
    <div ref={selectRef} style={{ position: 'relative', ...style }}>
      <button
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: theme.fontSize.md,
          backgroundColor: theme.colors.dark,
          color: theme.colors.text,
          border: `2px solid ${theme.colors.primary}`,
          borderRadius: theme.borderRadius,
          outline: 'none',
          cursor: 'pointer',
          minWidth: '120px',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 0 10px ${theme.colors.primary}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span>{selectedOption?.props.children || 'Select...'}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: theme.borderRadius,
            zIndex: 1000,
            boxShadow: `0 0 20px ${theme.colors.primary}`,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {options.map((option, index) => (
            <div
              key={index}
              style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                cursor: 'pointer',
                color: theme.colors.text,
                fontSize: theme.fontSize.sm,
                borderBottom: index < options.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                backgroundColor: option.props.value === value ? theme.colors.primary : 'transparent',
              }}
              onClick={() => {
                onChange({ target: { value: option.props.value } });
                setIsOpen(false);
              }}
              onMouseEnter={(e) => {
                if (option.props.value !== value) {
                  e.currentTarget.style.backgroundColor = theme.colors.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (option.props.value !== value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {option.props.children}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};