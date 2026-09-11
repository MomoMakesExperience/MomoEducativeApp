import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Grid3x3, Plus } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { BottomSheet } from '@/components/BottomSheet';
import { haptics } from '@/lib/haptics';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const HEURES = Array.from({ length: 11 }, (_, i) => 8 + i); // 8h -> 18h

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

export default function EDT() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cours = useAppStore((s) => s.cours);
  const matieres = useAppStore((s) => s.matieres);
  const addCours = useAppStore((s) => s.addCours);

  const [day, setDay] = useState('Lun');
  const [overview, setOverview] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [matiereId, setMatiereId] = useState<string | null>(null);
  const [titre, setTitre] = useState('');
  const [salle, setSalle] = useState('');
  const [heureDebut, setHeureDebut] = useState('08:00');
  const [duree, setDuree] = useState('60');
  const [couleur, setCouleur] = useState('#1E90FF');

  const pickMatiere = (id: string | null) => {
    haptics.selection();
    setMatiereId(id);
    if (id) {
      const m = matieres.find((mm) => mm.id === id);
      if (m) {
        setTitre(m.nom);
        setCouleur(m.couleur);
      }
    }
  };

  const coursDuJour = useMemo(
    () => cours.filter((c) => c.jour === day).sort((a, b) => a.heureDebut.localeCompare(b.heureDebut)),
    [cours, day]
  );

  const submit = async () => {
    if (!titre.trim()) return;
    await addCours({
      jour: day,
      heureDebut,
      dureeMinutes: parseInt(duree, 10) || 60,
      titre: titre.trim(),
      salle: salle.trim(),
      couleur,
      matiereId,
    });
    haptics.success();
    setTitre('');
    setSalle('');
    setMatiereId(null);
    setCouleur('#1E90FF');
    setShowAdd(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 18, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 22, color: theme.textPrimary }}>
            Emploi du temps
          </Text>
          <Pressable
            onPress={() => {
              haptics.selection();
              setShowAdd(true);
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Plus size={18} color="#fff" strokeWidth={2.2} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {JOURS.map((j) => {
            const active = j === day && !overview;
            return (
              <Pressable
                key={j}
                onPress={() => {
                  haptics.selection();
                  setDay(j);
                  setOverview(false);
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active ? theme.accent : theme.card,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.headingBold,
                    fontSize: 12,
                    color: active ? '#fff' : theme.textPrimary,
                  }}
                >
                  {j}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => {
              haptics.selection();
              setOverview((v) => !v);
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: overview ? theme.accent : theme.card,
            }}
          >
            <Grid3x3 size={18} color={overview ? '#fff' : theme.textPrimary} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      {overview ? (
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 130 }} horizontal>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 40 }} />
              {JOURS.map((j) => (
                <Text
                  key={j}
                  style={{
                    width: 88,
                    textAlign: 'center',
                    fontFamily: fontFamily.headingBold,
                    fontSize: 11,
                    color: theme.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  {j}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 40 }}>
                {HEURES.map((h) => (
                  <Text
                    key={h}
                    style={{ height: 48, fontFamily: fontFamily.body, fontSize: 10, color: theme.textTertiary }}
                  >
                    {h}h
                  </Text>
                ))}
              </View>
              {JOURS.map((j) => (
                <View key={j} style={{ width: 88, height: HEURES.length * 48, position: 'relative' }}>
                  {HEURES.map((h, i) => (
                    <View
                      key={h}
                      style={{
                        position: 'absolute',
                        top: i * 48,
                        left: 0,
                        right: 2,
                        height: 48,
                        borderTopWidth: 1,
                        borderTopColor: theme.border,
                      }}
                    />
                  ))}
                  {cours
                    .filter((c) => c.jour === j)
                    .map((c) => {
                      const start = toMinutes(c.heureDebut);
                      const top = ((start - 8 * 60) / 60) * 48;
                      const height = (c.dureeMinutes / 60) * 48;
                      return (
                        <View
                          key={c.id}
                          style={{
                            position: 'absolute',
                            top,
                            left: 0,
                            right: 2,
                            height: Math.max(height, 20),
                            backgroundColor: c.couleur,
                            borderRadius: 8,
                            padding: 4,
                          }}
                        >
                          <Text numberOfLines={2} style={{ fontFamily: fontFamily.bodySemibold, fontSize: 9, color: '#fff' }}>
                            {c.titre}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 130, gap: 10 }}>
          {coursDuJour.length === 0 ? (
            <Card>
              <EmptyState title="Aucun cours ce jour" subtitle="Ajoute un cours avec le bouton +." />
            </Card>
          ) : (
            coursDuJour.map((c) => (
              <View key={c.id} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 52, alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 13, color: theme.textSecondary }}>
                    {c.heureDebut}
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: c.couleur, borderRadius: 16, padding: 14 }}>
                  <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: '#fff' }}>{c.titre}</Text>
                  <Text style={{ fontFamily: fontFamily.body, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                    {c.dureeMinutes} min{c.salle ? ` · ${c.salle}` : ''}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary, textAlign: 'center' }}>
          Ajouter un cours ({day})
        </Text>

        {matieres.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>
              Matière
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Pressable
                onPress={() => pickMatiere(null)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: radius.pill,
                  backgroundColor: matiereId === null ? theme.textPrimary : theme.card,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.headingBold,
                    fontSize: 12,
                    color: matiereId === null ? theme.bg : theme.textPrimary,
                  }}
                >
                  Cours libre
                </Text>
              </Pressable>
              {matieres.map((m) => {
                const active = matiereId === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => pickMatiere(m.id)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: radius.pill,
                      backgroundColor: active ? m.couleur : theme.card,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fontFamily.headingBold,
                        fontSize: 12,
                        color: active ? '#fff' : theme.textPrimary,
                      }}
                    >
                      {m.nom}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ backgroundColor: theme.card, borderRadius: 18, padding: 14, gap: 4 }}>
          <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>Titre</Text>
          <TextInput
            value={titre}
            onChangeText={setTitre}
            placeholder="Ex. Algorithmique III"
            placeholderTextColor={theme.textTertiary}
            style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: theme.textPrimary }}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 18, padding: 14 }}>
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>
              Heure début
            </Text>
            <TextInput
              value={heureDebut}
              onChangeText={setHeureDebut}
              placeholder="08:00"
              style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary, marginTop: 4 }}
            />
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 18, padding: 14 }}>
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>
              Durée (min)
            </Text>
            <TextInput
              value={duree}
              onChangeText={setDuree}
              keyboardType="numeric"
              style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary, marginTop: 4 }}
            />
          </View>
        </View>
        <View style={{ backgroundColor: theme.card, borderRadius: 18, padding: 14, gap: 4 }}>
          <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>Salle</Text>
          <TextInput
            value={salle}
            onChangeText={setSalle}
            placeholder="Amphi B"
            placeholderTextColor={theme.textTertiary}
            style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary }}
          />
        </View>
        <Pressable
          onPress={submit}
          disabled={!titre.trim()}
          style={{
            backgroundColor: titre.trim() ? theme.accent : theme.cardAlt,
            paddingVertical: 15,
            borderRadius: radius.pill,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: titre.trim() ? '#fff' : theme.textTertiary }}>
            Ajouter
          </Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}
