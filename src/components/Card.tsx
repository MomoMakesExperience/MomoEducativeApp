import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow } from '@/theme/tokens';

export function Card({
  children,
  style,
  color,
  withShadow = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
  withShadow?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: color ?? theme.card,
          borderRadius: radius.md,
          padding: 16,
        },
        withShadow && !theme.dark ? shadow.card : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
