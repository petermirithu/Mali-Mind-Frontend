export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  text: string;
  textDim: string;
  primary: string;
  primaryDim: string;
  success: string;
  warning: string;
  danger: string;
  dangerDim: string;
  accent: string;
  overlay: string;
  shadow: string;
  greenDim: string;
  greenGlow: string;
}

export const themes: Record<ThemeMode, ThemeColors> = {
  dark: {
    background: '#0B0F14',
    surface: '#121821',
    card: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.12)',
    text: '#E5E8EC',
    textDim: '#9AA2B3',
    primary: '#0B8F4D',
    primaryDim: 'rgba(11,143,77,0.15)',
    success: '#22C55E',
    warning: '#FBBF24',
    danger: '#EF4444',
    dangerDim: 'rgba(239,68,68,0.15)',
    accent: '#38BDF8',
    overlay: 'rgba(11,15,20,0.72)',
    shadow: 'rgba(0, 0, 0, 0.32)',
    greenDim: 'rgba(11,143,77,0.15)',
    greenGlow: 'rgba(11,143,77,0.35)'
  },
  light: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    card: 'rgba(255,255,255,0.92)',
    cardBorder: 'rgba(15,23,42,0.08)',
    text: '#111827',
    textDim: '#6B7280',
    primary: '#0B8F4D',
    primaryDim: 'rgba(11,143,77,0.15)',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#B91C1C',
    dangerDim: 'rgba(185,28,28,0.15)',
    accent: '#0EA5E9',
    overlay: 'rgba(255,255,255,0.72)',
    shadow: 'rgba(15, 23, 42, 0.08)',
    greenDim: 'rgba(11,143,77,0.15)',
    greenGlow: 'rgba(11,143,77,0.35)'
  },
};

export const defaultTheme = themes.dark;
