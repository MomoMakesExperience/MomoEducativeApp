import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.cardAlt,
        borderRadius: radius.pill,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => {
              haptics.selection();
              onChange(opt.key);
            }}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: radius.pill,
              alignItems: 'center',
              backgroundColor: active ? theme.card : 'transparent',
              shadowColor: '#0B0B0C',
              shadowOpacity: active && !theme.dark ? 0.1 : 0,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            <Text
              style={{
                fontFamily: fontFamily.headingBold,
                fontSize: 13,
                color: active ? theme.textPrimary : theme.textSecondary,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
