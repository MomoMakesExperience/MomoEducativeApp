import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily } from '@/theme/tokens';

export function SheetRowGroup({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.card, borderRadius: 18, overflow: 'hidden' }}>
      {children}
    </View>
  );
}

export function SheetRow({
  icon,
  label,
  value,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const theme = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {icon}
        <Text style={{ fontFamily: fontFamily.body, fontSize: 14, color: theme.textSecondary }}>
          {label}
        </Text>
      </View>
      <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary }}>
        {value}
      </Text>
    </View>
  );
  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export function SheetRowInput({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {icon}
        <Text style={{ fontFamily: fontFamily.body, fontSize: 14, color: theme.textSecondary }}>
          {label}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboardType}
        style={{
          fontFamily: fontFamily.bodySemibold,
          fontSize: 14,
          color: theme.textPrimary,
          textAlign: 'right',
          minWidth: 120,
        }}
      />
    </View>
  );
}
