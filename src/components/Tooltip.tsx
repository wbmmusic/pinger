import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface TooltipProps {
  text: string;
  children: ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const theme = useTheme();
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: true, left: '50%' });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Check if tooltip goes off right edge
      const tooltipLeft = containerRect.left + containerRect.width / 2 - tooltipRect.width / 2;
      const tooltipRight = tooltipLeft + tooltipRect.width;
      
      let newLeft = '50%';
      if (tooltipRight > windowWidth - 10) {
        newLeft = 'auto';
      } else if (tooltipLeft < 10) {
        newLeft = '0%';
      }

      // Check if tooltip goes off top edge
      const tooltipTop = containerRect.top - tooltipRect.height - 8;
      const showBelow = tooltipTop < 10;

      setPosition({ top: !showBelow, left: newLeft });
    }
  }, [show]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => {
        timeoutRef.current = setTimeout(() => setShow(true), 500);
      }}
      onMouseLeave={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setShow(false);
      }}
    >
      {children}
      {show && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            [position.top ? 'bottom' : 'top']: '100%',
            left: position.left,
            right: position.left === 'auto' ? '0' : 'auto',
            transform: position.left === '50%' ? 'translateX(-50%)' : 'none',
            [position.top ? 'marginBottom' : 'marginTop']: '8px',
            backgroundColor: theme.colors.dark,
            color: theme.colors.text,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            borderRadius: theme.borderRadius,
            fontSize: theme.fontSize.sm,
            whiteSpace: 'nowrap',
            border: `1px solid ${theme.colors.primary}`,
            boxShadow: `0 0 10px ${theme.colors.primary}`,
            zIndex: 1000,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};