import React, { ReactNode, createContext, useContext } from 'react';
import { useTheme } from '../theme/ThemeProvider';

const ModalContext = createContext<{ onHide: () => void } | null>(null);

interface ModalProps {
  show: boolean;
  onHide: () => void;
  backdrop?: 'static' | boolean;
  keyboard?: boolean;
  children: ReactNode;
}

interface ModalHeaderProps {
  closeButton?: boolean;
  children: ReactNode;
}

interface ModalBodyProps {
  children: ReactNode;
}

interface ModalFooterProps {
  children: ReactNode;
}

interface ModalTitleProps {
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
  Title: React.FC<ModalTitleProps>;
} = ({ show, onHide, children }) => {
  const theme = useTheme();

  if (!show) return null;

  return (
    <ModalContext.Provider value={{ onHide }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={onHide}
      >
        <div
          style={{
            backgroundColor: theme.colors.dark,
            border: `3px solid ${theme.colors.primary}`,
            borderRadius: theme.borderRadius,
            minWidth: '400px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            boxShadow: `0 0 20px ${theme.colors.primary}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

Modal.Header = ({ closeButton, children }) => {
  const theme = useTheme();
  const modalContext = useContext(ModalContext);
  
  return (
    <div
      style={{
        padding: theme.spacing.md,
        borderBottom: `2px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.light,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>{children}</div>
      {closeButton && (
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: theme.colors.danger,
            fontWeight: 'bold',
          }}
          onClick={modalContext?.onHide}
        >
          ×
        </button>
      )}
    </div>
  );
};

Modal.Body = ({ children }) => {
  const theme = useTheme();
  
  return (
    <div
      style={{
        padding: theme.spacing.md,
        color: theme.colors.text,
      }}
    >
      {children}
    </div>
  );
};

Modal.Footer = ({ children }) => {
  const theme = useTheme();
  
  return (
    <div
      style={{
        padding: theme.spacing.md,
        borderTop: `2px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.light,
        display: 'flex',
        gap: theme.spacing.sm,
        justifyContent: 'flex-end',
      }}
    >
      {children}
    </div>
  );
};

Modal.Title = ({ children }) => {
  const theme = useTheme();
  
  return (
    <h4
      style={{
        margin: 0,
        color: theme.colors.text,
        fontSize: theme.fontSize.lg,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontFamily: theme.fonts.display,
      }}
    >
      {children}
    </h4>
  );
};