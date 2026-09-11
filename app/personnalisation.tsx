import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Flame } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { accentPalette, fontFamily, radius, shadow } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';
import { haptics } from '@/lib/haptics';

export default function Personnalisation() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const setAccentColor = useAppStore((s) => s.setAccentColor);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const [accent, setAccent] = useState(profile?.accentColor ?? '#1E90FF');
  const [mode, setMode] = useState<'light' | 'dark'>(profile?.themeMode === 'dark' ? 'dark' : 'light');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await setAccentColor(accent);
    await setThemeMode(mode);
    haptics.success();
    setSaved(true);
    setTimeout(() => router.back(), 400);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40, paddingHorizontal: 18, gap: 20 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={18} color={theme.textPrimary} />
        </Pressable>
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 20, color: theme.textPrimary }}>
          Personnalisation
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 13, color: theme.textSecondary }}>
          Couleur d'accent
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {accentPalette.map((c) => {
            const selected = c === accent;
            return (
              <Pressable
                key={c}
                onPress={() => {
                  haptics.selection();
                  setAccent(c);
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  backgroundColor: c,
                  borderWidth: selected ? 3 : 0,
                  borderColor: theme.textPrimary,
                }}
              />
            );
          })}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 13, color: theme.textSecondary }}>Mode</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(['light', 'dark'] as const).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => {
                  haptics.selection();
                  setMode(m);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  backgroundColor: active ? accent : theme.card,
                }}
              >
                <Text
                  style={{ fontFamily: fontFamily.headingBold, fontSize: 13, color: active ? '#fff' : theme.textPrimary }}
                >
                  {m === 'light' ? 'Clair' : 'Sombre'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 13, color: theme.textSecondary }}>Aperçu</Text>
        <View
          style={[
            {
              backgroundColor: mode === 'dark' ? '#0B0B0C' : '#F5F7FA',
              borderRadius: radius.lg,
              padding: 16,
            },
          ]}
        >
          <View
            style={[
              { backgroundColor: accent, borderRadius: radius.md, padding: 16, gap: 6 },
              shadow.accent(accent),
            ]}
          >
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
              Prochain examen
            </Text>
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 28, color: '#fff' }}>12j</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Flame size={12} color="#fff" />
              <Text style={{ fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                Aperçu en direct
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        onPress={save}
        style={{ backgroundColor: accent, paddingVertical: 15, borderRadius: radius.pill, alignItems: 'center' }}
      >
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: '#fff' }}>
          {saved ? 'Enregistré ✓' : 'Enregistrer'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
