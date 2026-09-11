import React from 'react';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';

export function Pill({
  label,
  onPress,
  active,
  style,
}: {
  label: string;
  onPress?: () => void;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const content = (
    <View
      style={[
        {
          paddingVertical: 9,
          paddingHorizontal: 16,
          borderRadius: radius.pill,
          backgroundColor: active ? theme.accent : theme.card,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: fontFamily.headingBold,
          fontSize: 13,
          color: active ? '#fff' : theme.textPrimary,
        }}
      >
        {label}
      </Text>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
    >
      {content}
    </Pressable>
  );
}
