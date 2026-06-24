export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  cardBorder: string;
  cardT: string;
  cardTBorder: string;
  glassSurface: string;
  glassBorder: string;
  inputSurface: string;
  inputBorder: string;
  subtleSurface: string;
  subtleBorder: string;
  disabledSurface: string;
  onPrimary: string;
  successSurface: string;
  successBorder: string;
  modalBackdrop: string;
  divider: string;
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
  pulsePositiveSurface: string;
  pulsePositiveBorder: string;
  pulseNegativeSurface: string;
  pulseNegativeBorder: string;
  pulseNeutralSurface: string;
  pulseNeutralBorder: string;
  toastErrorSurface: string;
  toastWarningSurface: string;
  toastSuccessSurface: string;
  toastInfoSurface: string;
  toastMutedSurface: string;
  toastCloseSurface: string;
  feedInsightBorder?: string;
  feedInsightGlow?: string;
}

export const themes: Record<ThemeMode, ThemeColors> = {  
  dark: {
    background: '#0B0F14',
    surface: '#121821',
    card: '#151C26',
    cardBorder: '#273241',
    cardT: 'rgba(8,14,24,0.6)',
    cardTBorder: 'rgba(255,255,255,0.08)',    
    glassSurface: '#101923',
    glassBorder: '#223041',
    inputSurface: '#16202B',
    inputBorder: '#2A394D',
    subtleSurface: '#18212C',
    subtleBorder: '#29384A',
    disabledSurface: '#3E4A5E',
    onPrimary: '#F7FFF9',
    successSurface: '#173927',
    successBorder: '#2C6B45',
    modalBackdrop: 'rgba(13, 17, 23, 0.85)',
    divider: '#243044',
    text: '#E5E8EC',
    textDim: '#9AA2B3',
    primary: '#0B8F4D',
    primaryDim: '#143425',
    success: '#22C55E',
    warning: '#FBBF24',
    warningDim: '#423413',
    danger: '#EF4444',
    dangerDim: '#351A20',
    accent: '#38BDF8',
    accentDim: '#163448',
    overlay: '#111821',
    shadow: 'rgba(0, 0, 0, 0.32)',
    greenDim: '#143425',
    greenGlow: '#2B6B46',
    greenStartFillColor: 'rgba(11,143,77,0.4)',
    greenEndFillColor: 'rgba(11,143,77,0)',
    redStartFillColor: 'rgba(240,91,91,0.4)',
    redEndFillColor: 'rgba(240,91,91,0)',
    pulsePositiveSurface: 'rgba(11, 143, 77, 0.05)',
    pulsePositiveBorder: 'rgba(11, 143, 77, 0.3)',
    pulseNegativeSurface: 'rgba(235, 87, 87, 0.05)',
    pulseNegativeBorder: 'rgba(235, 87, 87, 0.3)',
    pulseNeutralSurface: '#342915',
    pulseNeutralBorder: '#8A6926',
    toastErrorSurface: '#3D1F24',
    toastWarningSurface: '#4A3516',
    toastSuccessSurface: '#173927',
    toastInfoSurface: '#143449',
    toastMutedSurface: '#1D2734',
    toastCloseSurface: '#273241',
    feedInsightBorder: 'rgba(11,143,77,0.30)',
    feedInsightGlow: 'rgba(11,143,77,0.22)',
  },
  light: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#D6DEE8',
    cardT: 'rgba(8,14,24,0.6)',
    cardTBorder: 'rgba(255,255,255,0.08)',    
    glassSurface: '#FAFCFE',
    glassBorder: '#D6DEE8',
    inputSurface: '#F5F7FB',
    inputBorder: '#D6DEE8',
    subtleSurface: '#EEF2F7',
    subtleBorder: '#D6DEE8',
    disabledSurface: '#B8C3D1',
    onPrimary: '#F7FFF9',
    successSurface: '#E7F7EC',
    successBorder: '#A9D9B7',
    modalBackdrop: '#DDE4EC',
    divider: '#D7DFE9',
    text: '#111827',
    textDim: '#6B7280',
    primary: '#0B8F4D',
    primaryDim: '#E4F3EA',
    success: '#16A34A',
    warning: '#D97706',
    warningDim: '#FCEECC',
    danger: '#B91C1C',
    dangerDim: '#F8E5E7',
    accent: '#0EA5E9',
    accentDim: '#E3F2FA',
    overlay: '#EFF4F9',
    shadow: 'rgba(15, 23, 42, 0.08)',
    greenDim: '#E4F3EA',
    greenGlow: '#9ED4B6',
    greenStartFillColor: 'rgba(11,143,77,0.4)',
    greenEndFillColor: 'rgba(11,143,77,0)',
    redStartFillColor: 'rgba(240,91,91,0.4)',
    redEndFillColor: 'rgba(240,91,91,0)',
    pulsePositiveSurface: '#E8F4EC',
    pulsePositiveBorder: '#98C8AA',
    pulseNegativeSurface: '#F9E8EA',
    pulseNegativeBorder: '#D7A2A9',
    pulseNeutralSurface: '#FBF1DE',
    pulseNeutralBorder: '#D9BA76',
    toastErrorSurface: '#FCE8E8',
    toastWarningSurface: '#FEF3D5',
    toastSuccessSurface: '#E7F7EC',
    toastInfoSurface: '#E4F4FB',
    toastMutedSurface: '#EEF2F7',
    toastCloseSurface: '#E5EBF1',
    feedInsightBorder: 'rgba(11,143,77,0.26)',
    feedInsightGlow: 'rgba(11,143,77,0.18)',
  },
};

export const defaultTheme = themes.dark;