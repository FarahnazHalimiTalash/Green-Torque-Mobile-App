export const colors = {
  bg: '#F7FAF8',
  bgElevated: '#EEF5F0',
  bgSoft: '#E4F0E8',
  header: '#07140F',
  headerSoft: '#0F241A',
  card: '#FFFFFF',
  cardAlt: '#F4F9F6',
  border: '#D7E5DC',
  borderStrong: '#B7CFC0',
  primary: '#16A34A',
  primaryDark: '#0B1C14',
  primaryDeep: '#15803D',
  primaryMuted: 'rgba(22, 163, 74, 0.1)',
  primaryGlow: 'rgba(22, 163, 74, 0.18)',
  text: '#0C1F16',
  textMuted: '#4F6B5C',
  textDim: '#7F9A8B',
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
  lg: 22,
  xl: 28,
  xxl: 36,
};

export const radius = {
  sm: 14,
  md: 20,
  lg: 26,
  xl: 32,
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
  hero: 34,
  title: 28,
  subtitle: 18,
  body: 16,
  caption: 13,
  overline: 11,
};

export const shadow = {
  card: {
    shadowColor: '#07140F',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#07140F',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  float: {
    shadowColor: '#15803D',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};

export const gradients = {
  screen: ['#F7FAF8', '#EEF6F1', '#E7F2EB'] as const,
  hero: ['#07140F', '#0F241A', '#14532D'] as const,
  vehicle: ['#E8F5EE', '#F7FAF8'] as const,
  primaryButton: ['#22C55E', '#16A34A'] as const,
};
