import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '@/state/useAppStore';
import { darkPalette, lightPalette, type AccentColor } from './tokens';

export interface Theme {
  dark: boolean;
  accent: AccentColor | string;
  bg: string;
  card: string;
  cardAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  sheetBg: string;
  danger: string;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const profile = useAppStore((s) => s.profile);

  const mode = profile?.themeMode ?? 'system';
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const accent = profile?.accentColor ?? '#1E90FF';

  const theme = useMemo<Theme>(() => {
    const palette = isDark ? darkPalette : lightPalette;
    return { dark: isDark, accent, ...palette };
  }, [isDark, accent]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
