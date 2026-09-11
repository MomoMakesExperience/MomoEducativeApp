export const accentPalette = [
  '#1E90FF',
  '#0E9B7A',
  '#22C55E',
  '#FACC15',
  '#9CA3AF',
  '#111111',
  '#EC4899',
  '#8B5CF6',
] as const;

export type AccentColor = (typeof accentPalette)[number];

export const swatchPalette = [
  '#22C55E',
  '#1E90FF',
  '#FACC15',
  '#9CA3AF',
  '#111111',
  '#FFFFFF',
  '#EC4899',
  '#8B5CF6',
] as const;

export const typeColors = {
  exam: '#1E90FF',
  devoir: '#0E9B7A',
  projet: '#14161A',
} as const;

export const lightPalette = {
  bg: '#F5F7FA',
  card: '#FFFFFF',
  cardAlt: '#F1F5F9',
  border: '#EEF1F4',
  textPrimary: '#0B0B0C',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  sheetBg: '#F5F7FA',
  danger: '#EF4444',
};

export const darkPalette = {
  bg: '#0B0B0C',
  card: '#1A1B1E',
  cardAlt: '#26272B',
  border: '#26272B',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  sheetBg: '#0B0B0C',
  danger: '#F87171',
};

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#0B0B0C',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  accent: (color: string) => ({
    shadowColor: color,
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  }),
};

export const fontFamily = {
  headingRegular: 'Quicksand_600SemiBold',
  headingBold: 'Quicksand_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const fontSize = {
  bigNumber: 48,
  screenTitle: 22,
  cardTitle: 16,
  body: 14,
  small: 12,
  label: 10,
};
