import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, swatchPalette } from '@/theme/tokens';
import { ICON_NAMES, IconGlyph } from './IconGlyph';
import type { IconName } from '@/db/types';
import { haptics } from '@/lib/haptics';

export function ColorIconPicker({
  color,
  icon,
  onColorChange,
  onIconChange,
}: {
  color: string;
  icon: IconName;
  onColorChange: (c: string) => void;
  onIconChange: (i: IconName) => void;
}) {
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.card, borderRadius: 18, padding: 14, gap: 12 }}>
      <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 12, color: theme.textSecondary }}>
        Icône &amp; couleur
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {swatchPalette.map((hex) => {
          const selected = hex === color;
          return (
            <Pressable
              key={hex}
              onPress={() => {
                haptics.selection();
                onColorChange(hex);
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                backgroundColor: hex,
                borderWidth: hex === '#FFFFFF' ? 1 : selected ? 2 : 0,
                borderColor: hex === '#FFFFFF' ? '#E5E7EB' : '#fff',
                shadowColor: hex,
                shadowOpacity: selected ? 0.5 : 0,
                shadowRadius: selected ? 4 : 0,
                shadowOffset: { width: 0, height: 0 },
              }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ICON_NAMES.map((name) => {
          const selected = name === icon;
          return (
            <Pressable
              key={name}
              onPress={() => {
                haptics.selection();
                onIconChange(name);
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? theme.textPrimary : theme.cardAlt,
              }}
            >
              <IconGlyph name={name} size={18} color={selected ? '#fff' : theme.textPrimary} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
