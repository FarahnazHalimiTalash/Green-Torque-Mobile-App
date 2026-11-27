/** Shared with shop admin/sub-admin (`shop/lib/theme.ts` + `shop/app/globals.css`). */
export const colors = {
  bg: '#F5F9F6',
  bgElevated: '#ECF4EF',
  bgSoft: '#E1EDE5',
  header: '#07140F',
  headerSoft: '#0F241A',
  card: '#FFFFFF',
  cardAlt: '#F3F8F5',
  border: '#D5E4DB',
  borderStrong: '#B4CDBF',
  primary: '#16A34A',
  primaryDark: '#0B1C14',
  primaryDeep: '#15803D',
  primaryMuted: 'rgba(22, 163, 74, 0.12)',
  primaryGlow: 'rgba(22, 163, 74, 0.2)',
  text: '#0A1A13',
  textMuted: '#4A6759',
  textDim: '#7A9587',
  textOnDark: '#F3FBF6',
  warning: '#C2410C',
  warningMuted: 'rgba(194, 65, 12, 0.1)',
  danger: '#DC2626',
  dangerMuted: 'rgba(220, 38, 38, 0.1)',
  info: '#0369A1',
  infoMuted: 'rgba(3, 105, 161, 0.1)',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(7, 20, 15, 0.45)',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const radius = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
};

export const fonts = {
  display: 'Outfit_700Bold',
  displayMedium: 'Outfit_600SemiBold',
  title: 'Outfit_700Bold',
  subtitle: 'Outfit_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  caption: 'DMSans_500Medium',
};

export const type = {
  hero: 36,
  title: 28,
  subtitle: 18,
  body: 16,
  caption: 13,
  overline: 11,
};

export const shadow = {
  card: {
    shadowColor: '#07140F',
    shadowOpacity: 0.07,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  soft: {
    shadowColor: '#07140F',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  float: {
    shadowColor: '#15803D',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
};

export const gradients = {
  screen: ['#F7FBF8', '#EEF6F1', '#E6F1EA'] as const,
  hero: ['#07140F', '#0F241A', '#14532D'] as const,
  vehicle: ['#E8F5EE', '#F7FAF8'] as const,
  primaryButton: ['#22C55E', '#16A34A'] as const,
  mediaFade: ['transparent', 'rgba(7,20,15,0.55)'] as const,
};
