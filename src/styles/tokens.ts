export const designTokens = {
  colors: {
    background: '#F4F7FB',
    elevated: '#ECF2FA',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F8FC',
    surfaceStrong: '#E9EFF7',
    border: '#D5DFEB',
    borderSoft: '#E7EDF5',
    textPrimary: '#121926',
    textSecondary: '#556074',
    textMuted: '#8692A7',
    primary: '#162B4D',
    primaryHover: '#1F3B69',
    primarySoft: '#E8EEF9',
    accentBlue: '#3A86FF',
    accentCoral: '#FF7A59',
    accentViolet: '#6C63FF',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
  },
  radius: {
    sm: '14px',
    md: '18px',
    lg: '28px',
    pill: '999px',
  },
  shadow: {
    card: '0 14px 34px rgba(16, 32, 57, 0.08)',
    cardHover: '0 18px 42px rgba(16, 32, 57, 0.14)',
    layered: '0 10px 24px rgba(16, 32, 57, 0.08), 0 24px 48px rgba(16, 32, 57, 0.12)',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    title: '700 clamp(1.3rem, 3vw, 1.9rem)/1.2 Inter, system-ui, sans-serif',
    subtitle: '500 1rem/1.45 Inter, system-ui, sans-serif',
    body: '400 0.95rem/1.55 Inter, system-ui, sans-serif',
    button: '700 0.92rem/1 Inter, system-ui, sans-serif',
  },
} as const

export type DesignTokens = typeof designTokens
