import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';
import { EmptyState } from '@/components/EmptyState';
import { computeBulletin } from '@/features/bulletin/calc';

export default function Bulletin() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const matieres = useAppStore((s) => s.matieres);
  const examens = useAppStore((s) => s.examens);
  const ues = useAppStore((s) => s.ues);

  const bulletin = useMemo(() => computeBulletin(ues, matieres, examens), [ues, matieres, examens]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 60, paddingHorizontal: 18, gap: 16 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={18} color={theme.textPrimary} />
        </Pressable>
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 20, color: theme.textPrimary }}>Bulletin</Text>
      </View>

      <View style={{ backgroundColor: '#14161A', borderRadius: radius.lg, padding: 20, gap: 4 }}>
        <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
          Moyenne générale
        </Text>
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 44, color: '#fff' }}>
          {bulletin.moyenneGenerale !== null ? `${bulletin.moyenneGenerale.toFixed(2)}/20` : '—'}
        </Text>
        <Text style={{ fontFamily: fontFamily.body, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          sur {bulletin.ueCount} UE · {bulletin.totalCredits} crédits
        </Text>
      </View>

      {bulletin.ues.length === 0 && bulletin.matieresSansUe.length === 0 ? (
        <EmptyState title="Aucune note saisie" subtitle="Ajoute des examens notés pour voir ton bulletin se construire." />
      ) : (
        bulletin.ues.map((ueBreak) => (
          <View key={ueBreak.ue.id} style={{ backgroundColor: theme.card, borderRadius: radius.lg, padding: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ flex: 1, fontFamily: fontFamily.headingBold, fontSize: 14, color: theme.textPrimary }}>
                {ueBreak.ue.nom}
              </Text>
              <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: ueBreak.ue.couleur }}>
                {ueBreak.moyenne !== null ? ueBreak.moyenne.toFixed(1) : '—'}
              </Text>
            </View>
            <Text style={{ fontFamily: fontFamily.body, fontSize: 12, color: theme.textSecondary }}>
              {ueBreak.ue.credits} crédits
            </Text>
            {ueBreak.matieres.map((m) => (
              <View
                key={m.matiere.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                }}
              >
                <Text style={{ fontFamily: fontFamily.body, fontSize: 13, color: theme.textSecondary }}>
                  {m.matiere.nom} <Text style={{ color: theme.textTertiary }}>· coeff {m.matiere.coefficient}</Text>
                </Text>
                <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary }}>
                  {m.note !== null ? m.note.toFixed(1) : '—'}
                </Text>
              </View>
            ))}
          </View>
        ))
      )}

      {bulletin.moyenneGenerale !== null && (
        <View
          style={{
            backgroundColor: theme.dark ? '#1A2A3D' : '#EAF3FF',
            borderRadius: radius.lg,
            padding: 16,
            flexDirection: 'row',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              backgroundColor: '#1E90FF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} color="#fff" strokeWidth={2} />
          </View>
          <Text style={{ flex: 1, fontFamily: fontFamily.body, fontSize: 13, color: theme.dark ? '#BFDBFE' : '#1E3A5F', lineHeight: 19 }}>
            Continue à ajouter tes notes pour affiner ta moyenne générale en temps réel.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
