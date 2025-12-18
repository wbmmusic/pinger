import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface NavbarProps {
  bg?: string;
  expand?: string;
  children: ReactNode;
}

interface NavProps {
  className?: string;
  children: ReactNode;
}

interface NavDropdownProps {
  title: string;
  id?: string;
  children: ReactNode;
}

interface NavDropdownItemProps {
  onClick?: () => void;
  children: ReactNode;
}

export const Navbar: React.FC<NavbarProps> & {
  Toggle: React.FC<{ 'aria-controls'?: string }>;
  Collapse: React.FC<{ id?: string; children: ReactNode }>;
} = ({ children }) => {
  const theme = useTheme();
  
  return (
    <nav
      style={{
        backgroundColor: theme.colors.dark,
        padding: theme.spacing.sm,
        borderBottom: `3px solid ${theme.colors.primary}`,
        boxShadow: `0 2px 10px ${theme.colors.primary}`,
      }}
    >
      {children}
    </nav>
  );
};

Navbar.Toggle = () => null; // Not needed for desktop app
Navbar.Collapse = ({ children }) => <div>{children}</div>;

export const Nav: React.FC<NavProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {children}
    </div>
  );
};

export const NavDropdown: React.FC<NavDropdownProps> & {
  Item: React.FC<NavDropdownItemProps>;
  Divider: React.FC;
} = ({ title, children }) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && e.target && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        style={{
          backgroundColor: 'transparent',
          color: theme.colors.text,
          border: `1px solid ${theme.colors.primary}`,
          borderRadius: theme.borderRadius,
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          cursor: 'pointer',
          fontSize: theme.fontSize.md,
          fontWeight: 400,
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          e.currentTarget.style.filter = 'brightness(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        {title}
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: theme.spacing.xs,
            backgroundColor: theme.colors.dark,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            minWidth: '150px',
            zIndex: 1000,
          }}
        >
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                ...child.props,
                onClick: () => {
                  if (child.props.onClick) child.props.onClick();
                  setIsOpen(false);
                }
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

NavDropdown.Item = ({ onClick, children }) => {
  const theme = useTheme();
  
  return (
    <div
      style={{
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        cursor: 'pointer',
        color: theme.colors.text,
        fontSize: theme.fontSize.sm,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
      onClick={onClick}
      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = theme.colors.secondary}
      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
    >
      {children}
    </div>
  );
};

NavDropdown.Divider = () => {
  const theme = useTheme();
  
  return (
    <div
      style={{
        height: '2px',
        backgroundColor: theme.colors.border,
        margin: `${theme.spacing.xs} 0`,
      }}
    />
  );
};