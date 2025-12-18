export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    light: string;
    dark: string;
    background: string;
    text: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: string;
  fontSize: {
    sm: string;
    md: string;
    lg: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
    display: string;
  };
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#00FF41',
    secondary: '#4A90E2',
    success: '#00FF88',
    danger: '#FF4757',
    warning: '#FFA726',
    info: '#42A5F5',
    light: '#3C4043',
    dark: '#1E1E1E',
    background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 50%, #0F0F0F 100%)',
    text: '#E8EAED',
    border: '#2D3748',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: '4px',
  fontSize: {
    sm: '12px',
    md: '14px',
    lg: '16px',
  },
  fonts: {
    primary: '"Segoe UI", "Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    secondary: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
    mono: '"JetBrains Mono", "Source Code Pro", monospace',
    display: '"Orbitron", "Exo 2", "Rajdhani", sans-serif',
  },
};