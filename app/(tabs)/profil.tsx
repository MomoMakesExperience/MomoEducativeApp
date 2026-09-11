import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Moon, Palette, Crown, HelpCircle, LogOut, ChevronRight, Flame, Award } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';
import { computeBulletin } from '@/features/bulletin/calc';
import { haptics } from '@/lib/haptics';

function SettingsRow({
  icon,
  label,
  right,
  onPress,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const theme = useTheme();
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      {icon}
      <Text style={{ flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: 14, color: theme.textPrimary }}>
        {label}
      </Text>
      {right ?? <ChevronRight size={16} color={theme.textTertiary} />}
    </View>
  );
  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default function Profil() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const examens = useAppStore((s) => s.examens);
  const matieres = useAppStore((s) => s.matieres);
  const ues = useAppStore((s) => s.ues);
  const streakDays = useAppStore((s) => s.streakDays);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);

  const bulletin = useMemo(() => computeBulletin(ues, matieres, examens), [ues, matieres, examens]);
  const examensCount = examens.filter((e) => e.statut === 'done').length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120, paddingHorizontal: 18, gap: 16 }}
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        {profile?.avatarUri ? (
          <Image source={{ uri: profile.avatarUri }} style={{ width: 72, height: 72, borderRadius: 999 }} />
        ) : (
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 26, color: '#fff' }}>
              {(profile?.prenom || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 18, color: theme.textPrimary }}>
          {profile?.prenom || 'Étudiant'}
        </Text>
        <Text style={{ fontFamily: fontFamily.body, fontSize: 13, color: theme.textSecondary }}>
          {profile?.niveau} {profile?.universite ? `· ${profile.universite}` : ''}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { label: 'Moyenne', value: bulletin.moyenneGenerale !== null ? bulletin.moyenneGenerale.toFixed(2) : '—', icon: Award },
          { label: 'Jours focus', value: String(streakDays), icon: Flame },
          { label: 'Examens', value: String(examensCount), icon: Award },
        ].map((s, i) => (
          <View
            key={i}
            style={{ flex: 1, backgroundColor: theme.card, borderRadius: radius.md, padding: 14, alignItems: 'center', gap: 4 }}
          >
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 18, color: theme.textPrimary }}>{s.value}</Text>
            <Text style={{ fontFamily: fontFamily.body, fontSize: 10, color: theme.textSecondary }}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: theme.card, borderRadius: radius.lg, overflow: 'hidden' }}>
        <SettingsRow
          icon={<Bell size={18} color={theme.textPrimary} strokeWidth={1.8} />}
          label="Notifications"
          right={
            <Switch
              value={profile?.notificationsEnabled ?? true}
              onValueChange={(v) => {
                haptics.selection();
                setNotificationsEnabled(v);
              }}
            />
          }
        />
        <SettingsRow
          icon={<Moon size={18} color={theme.textPrimary} strokeWidth={1.8} />}
          label="Thème sombre"
          right={
            <Switch
              value={theme.dark}
              onValueChange={(v) => {
                haptics.selection();
                setThemeMode(v ? 'dark' : 'light');
              }}
            />
          }
        />
        <SettingsRow
          icon={<Palette size={18} color={theme.textPrimary} strokeWidth={1.8} />}
          label="Personnalisation"
          onPress={() => router.push('/personnalisation')}
        />
        <SettingsRow
          icon={<Crown size={18} color={theme.textPrimary} strokeWidth={1.8} />}
          label="Premium"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<HelpCircle size={18} color={theme.textPrimary} strokeWidth={1.8} />}
          label="Aide"
          onPress={() => {}}
          last
        />
      </View>

      <Pressable onPress={() => router.push('/bulletin')}>
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: radius.lg,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Award size={18} color={theme.accent} strokeWidth={1.8} />
          <Text style={{ flex: 1, fontFamily: fontFamily.bodyMedium, fontSize: 14, color: theme.textPrimary }}>
            Voir mon bulletin complet
          </Text>
          <ChevronRight size={16} color={theme.textTertiary} />
        </View>
      </Pressable>

      <Pressable
        onPress={() => haptics.medium()}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 }}
      >
        <LogOut size={16} color={theme.danger} strokeWidth={1.8} />
        <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 13, color: theme.danger }}>Déconnexion</Text>
      </Pressable>
    </ScrollView>
  );
}
