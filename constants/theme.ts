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
  warningDim?: string;
  danger: string;
  dangerDim: string;
  accent: string;
  accentDim?: string;
  overlay: string;
  shadow: string;
  greenDim: string;
  greenGlow: string;
  greenStartFillColor: string;
  greenEndFillColor: string;
  redStartFillColor: string;
  redEndFillColor: string;
  feedInsightBorder?: string;
  feedInsightGlow?: string;
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
    warningDim: 'rgba(251,191,36,0.14)',
    danger: '#EF4444',
    dangerDim: 'rgba(239,68,68,0.15)',
    accent: '#38BDF8',
    accentDim: 'rgba(56,189,248,0.14)',
    overlay: 'rgba(11,15,20,0.72)',
    shadow: 'rgba(0, 0, 0, 0.32)',
    greenDim: 'rgba(11,143,77,0.15)',
    greenGlow: 'rgba(11,143,77,0.35)',
    greenStartFillColor: 'rgba(11,143,77,0.4)',
    greenEndFillColor: 'rgba(11,143,77,0)',
    redStartFillColor: 'rgba(240,91,91,0.4)',
    redEndFillColor: 'rgba(240,91,91,0)',
    feedInsightBorder: 'rgba(11,143,77,0.30)',
    feedInsightGlow: 'rgba(11,143,77,0.22)',
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
    warningDim: 'rgba(217,119,6,0.14)',
    danger: '#B91C1C',
    dangerDim: 'rgba(185,28,28,0.15)',
    accent: '#0EA5E9',
    accentDim: 'rgba(14,165,233,0.14)',
    overlay: 'rgba(255,255,255,0.72)',
    shadow: 'rgba(15, 23, 42, 0.08)',
    greenDim: 'rgba(11,143,77,0.15)',
    greenGlow: 'rgba(11,143,77,0.35)',
    greenStartFillColor: 'rgba(11,143,77,0.4)',
    greenEndFillColor: 'rgba(11,143,77,0)',
    redStartFillColor: 'rgba(240,91,91,0.4)',
    redEndFillColor: 'rgba(240,91,91,0)',
    feedInsightBorder: 'rgba(11,143,77,0.26)',
    feedInsightGlow: 'rgba(11,143,77,0.18)',
  },
};

export const defaultTheme = themes.dark;