import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sun, Moon, Check, Flame, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius, shadow } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { BottomSheet } from '@/components/BottomSheet';
import { daysLeft, countdownLabel, todayIso } from '@/lib/date';
import { computeBulletin } from '@/features/bulletin/calc';
import { haptics } from '@/lib/haptics';

export default function Accueil() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const examens = useAppStore((s) => s.examens);
  const matieres = useAppStore((s) => s.matieres);
  const ues = useAppStore((s) => s.ues);
  const sessionsToday = useAppStore((s) => s.sessionsToday);
  const streakDays = useAppStore((s) => s.streakDays);
  const taches = useAppStore((s) => s.taches);
  const toggleTache = useAppStore((s) => s.toggleTache);
  const addTache = useAppStore((s) => s.addTache);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const setAvatarUri = useAppStore((s) => s.setAvatarUri);

  const [showAddTache, setShowAddTache] = useState(false);
  const [nouvelleTache, setNouvelleTache] = useState('');

  const nextExamen = useMemo(
    () =>
      examens
        .filter((e) => e.statut === 'upcoming')
        .sort((a, b) => a.dateIso.localeCompare(b.dateIso))[0] ?? null,
    [examens]
  );

  const bulletin = useMemo(() => computeBulletin(ues, matieres, examens), [ues, matieres, examens]);

  const heureSalutation = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await setAvatarUri(result.assets[0].uri);
    }
  };

  return (
    <>
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 120, paddingHorizontal: 18, gap: 14 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: fontFamily.body, fontSize: 13, color: theme.textSecondary }}>
            {heureSalutation()}
          </Text>
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 22, color: theme.textPrimary }}>
            {profile?.prenom || 'Étudiant'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => {
              haptics.selection();
              setThemeMode(theme.dark ? 'light' : 'dark');
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              backgroundColor: theme.card,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {theme.dark ? (
              <Moon size={17} color={theme.textPrimary} strokeWidth={1.8} />
            ) : (
              <Sun size={17} color={theme.textPrimary} strokeWidth={1.8} />
            )}
          </Pressable>
          <Pressable onPress={pickAvatar}>
            {profile?.avatarUri ? (
              <Image source={{ uri: profile.avatarUri }} style={{ width: 44, height: 44, borderRadius: 999 }} />
            ) : (
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  backgroundColor: theme.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: '#fff' }}>
                  {(profile?.prenom || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {nextExamen ? (
        <Pressable onPress={() => router.push('/(tabs)/examens')}>
          <Card color={theme.accent} style={[shadow.accent(theme.accent), { gap: 10 }]}>
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
              Prochain examen
            </Text>
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 20, color: '#fff' }}>
              {nextExamen.titre}
            </Text>
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 48, color: '#fff' }}>
              {daysLeft(nextExamen.dateIso)}j
            </Text>
            <Text style={{ fontFamily: fontFamily.body, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
              {countdownLabel(nextExamen.dateIso)}
            </Text>
          </Card>
        </Pressable>
      ) : (
        <Card>
          <EmptyState title="Aucun examen à venir" subtitle="Ajoute ton premier examen depuis l'onglet Examens." />
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable style={{ flex: 1 }} onPress={() => router.push('/bulletin')}>
          <Card style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 20, color: theme.textPrimary }}>
              {bulletin.moyenneGenerale !== null ? bulletin.moyenneGenerale.toFixed(2) : '—'}
            </Text>
            <Text style={{ fontFamily: fontFamily.body, fontSize: 11, color: theme.textSecondary }}>Moyenne</Text>
          </Card>
        </Pressable>
        <Card style={{ flex: 1, alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 20, color: theme.textPrimary }}>
            {taches.filter((t) => !t.fait).length}
          </Text>
          <Text style={{ fontFamily: fontFamily.body, fontSize: 11, color: theme.textSecondary }}>
            Tâches du jour
          </Text>
        </Card>
        <Pressable style={{ flex: 1 }} onPress={() => router.push('/focus')}>
          <Card style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Flame size={16} color={theme.accent} />
              <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 20, color: theme.textPrimary }}>
                {streakDays}
              </Text>
            </View>
            <Text style={{ fontFamily: fontFamily.body, fontSize: 11, color: theme.textSecondary }}>
              Streak focus · {sessionsToday} auj.
            </Text>
          </Card>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary }}>
          Aujourd'hui
        </Text>
        <Pressable
          onPress={() => {
            haptics.selection();
            setShowAddTache(true);
          }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            backgroundColor: theme.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={15} color={theme.textPrimary} strokeWidth={2.2} />
        </Pressable>
      </View>

      {taches.length === 0 ? (
        <Card>
          <EmptyState title="Rien de prévu aujourd'hui" subtitle="Profites-en pour avancer sur tes révisions." />
        </Card>
      ) : (
        <View style={{ gap: 8 }}>
          {taches.map((t) => {
            const matiere = matieres.find((m) => m.id === t.matiereId);
            return (
              <Card key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    toggleTache(t.id, !t.fait);
                  }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 999,
                    borderWidth: 2,
                    borderColor: t.fait ? theme.accent : theme.cardAlt,
                    backgroundColor: t.fait ? theme.accent : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {t.fait && <Check size={14} color="#fff" strokeWidth={3} />}
                </Pressable>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: fontFamily.bodyMedium,
                    fontSize: 14,
                    color: t.fait ? theme.textTertiary : theme.textPrimary,
                    textDecorationLine: t.fait ? 'line-through' : 'none',
                  }}
                >
                  {t.titre}
                </Text>
                {matiere && (
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: radius.pill,
                      backgroundColor: matiere.couleur + '22',
                    }}
                  >
                    <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 10, color: matiere.couleur }}>
                      {matiere.nom}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>

    <BottomSheet visible={showAddTache} onClose={() => setShowAddTache(false)}>
      <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary, textAlign: 'center' }}>
        Nouvelle tâche
      </Text>
      <View style={{ backgroundColor: theme.card, borderRadius: radius.md, padding: 14 }}>
        <TextInput
          value={nouvelleTache}
          onChangeText={setNouvelleTache}
          placeholder="Ex. Réviser le chapitre 3"
          placeholderTextColor={theme.textTertiary}
          style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: theme.textPrimary }}
        />
      </View>
      <Pressable
        onPress={async () => {
          if (!nouvelleTache.trim()) return;
          await addTache(nouvelleTache.trim(), todayIso(), null);
          haptics.success();
          setNouvelleTache('');
          setShowAddTache(false);
        }}
        disabled={!nouvelleTache.trim()}
        style={{
          backgroundColor: nouvelleTache.trim() ? theme.accent : theme.cardAlt,
          paddingVertical: 15,
          borderRadius: radius.pill,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.headingBold,
            fontSize: 15,
            color: nouvelleTache.trim() ? '#fff' : theme.textTertiary,
          }}
        >
          Ajouter
        </Text>
      </Pressable>
    </BottomSheet>
    </>
  );
}
