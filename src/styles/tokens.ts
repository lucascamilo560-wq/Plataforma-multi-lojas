export const designTokens = {
  colors: {
    background: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF3F8',
    surfaceStrong: '#E6EDF5',
    border: '#D8E1EC',
    borderSoft: '#E8EEF5',
    textPrimary: '#0F172A',
    textSecondary: '#5B6472',
    textMuted: '#8A94A6',
    primary: '#14213D',
    primaryHover: '#1E2F55',
    primarySoft: '#E8EEF9',
    accentBlue: '#3A86FF',
    accentCoral: '#FF7A59',
    accentViolet: '#6C63FF',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
    info: '#0284C7',
  },
  radius: {
    sm: '12px',
    md: '16px',
    lg: '22px',
    pill: '999px',
  },
  shadow: {
    card: '0 10px 30px rgba(20, 33, 61, 0.08)',
    cardHover: '0 14px 36px rgba(20, 33, 61, 0.12)',
    layered: '0 8px 18px rgba(20, 33, 61, 0.06), 0 20px 40px rgba(20, 33, 61, 0.1)',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    title: '700 clamp(1.3rem, 3vw, 1.8rem)/1.2 Inter, system-ui, sans-serif',
    subtitle: '500 1rem/1.45 Inter, system-ui, sans-serif',
    body: '400 0.95rem/1.55 Inter, system-ui, sans-serif',
    button: '600 0.92rem/1 Inter, system-ui, sans-serif',
  },
} as const

export type DesignTokens = typeof designTokens
