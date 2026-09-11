import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily } from '@/theme/tokens';

export function EmptyState({ icon, title, subtitle }: { icon?: React.ReactNode; title: string; subtitle?: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 10 }}>
      {icon}
      <Text
        style={{
          fontFamily: fontFamily.headingBold,
          fontSize: 15,
          color: theme.textPrimary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: fontFamily.body,
            fontSize: 13,
            color: theme.textSecondary,
            textAlign: 'center',
            maxWidth: 240,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
