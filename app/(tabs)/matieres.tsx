import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { BottomSheet } from '@/components/BottomSheet';
import { ColorIconPicker } from '@/components/ColorIconPicker';
import { IconGlyph } from '@/components/IconGlyph';
import type { IconName } from '@/db/types';
import { haptics } from '@/lib/haptics';

export default function Matieres() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const matieres = useAppStore((s) => s.matieres);
  const addMatiere = useAppStore((s) => s.addMatiere);

  const [showAdd, setShowAdd] = useState(false);
  const [nom, setNom] = useState('');
  const [codeUe, setCodeUe] = useState('');
  const [coefficient, setCoefficient] = useState('1');
  const [credits, setCredits] = useState('0');
  const [heures, setHeures] = useState('20');
  const [couleur, setCouleur] = useState('#1E90FF');
  const [icone, setIcone] = useState<IconName>('book');

  const reset = () => {
    setNom('');
    setCodeUe('');
    setCoefficient('1');
    setCredits('0');
    setHeures('20');
    setCouleur('#1E90FF');
    setIcone('book');
  };

  const submit = async () => {
    if (!nom.trim()) return;
    await addMatiere({
      nom: nom.trim(),
      codeUe: codeUe.trim(),
      coefficient: parseFloat(coefficient.replace(',', '.')) || 1,
      credits: parseInt(credits, 10) || 0,
      couleur,
      icone,
      heuresTotales: parseFloat(heures.replace(',', '.')) || 0,
    });
    haptics.success();
    reset();
    setShowAdd(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140, paddingHorizontal: 18, gap: 12 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 22, color: theme.textPrimary }}>
            Matières
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

        {matieres.length === 0 ? (
          <Card>
            <EmptyState title="Aucune matière" subtitle="Ajoute tes UE et matières pour suivre tes moyennes et ton temps de cours." />
          </Card>
        ) : (
          matieres.map((m) => (
            <Card key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: m.couleur,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconGlyph name={m.icone} size={22} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: theme.textPrimary }}>
                  {m.nom}
                </Text>
                <Text style={{ fontFamily: fontFamily.body, fontSize: 12, color: theme.textSecondary }}>
                  {m.codeUe ? `UE ${m.codeUe} · ` : ''}coeff {m.coefficient}
                </Text>
                <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 12, color: m.couleur, marginTop: 2 }}>
                  {m.heuresRestantes.toFixed(1)}h restantes
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary }}>
            Ajouter une matière
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderRadius: 18, padding: 14 }}>
          <View
            style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: couleur, alignItems: 'center', justifyContent: 'center' }}
          >
            <IconGlyph name={icone} size={22} />
          </View>
          <TextInput
            value={nom}
            onChangeText={setNom}
            placeholder="Nom de la matière"
            placeholderTextColor={theme.textTertiary}
            style={{ flex: 1, fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary }}
          />
        </View>

        <ColorIconPicker color={couleur} icon={icone} onColorChange={setCouleur} onIconChange={setIcone} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 18, padding: 14 }}>
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>
              Code UE
            </Text>
            <TextInput
              value={codeUe}
              onChangeText={setCodeUe}
              placeholder="Info 301"
              placeholderTextColor={theme.textTertiary}
              style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary, marginTop: 4 }}
            />
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 18, padding: 14 }}>
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>
              Coefficient
            </Text>
            <TextInput
              value={coefficient}
              onChangeText={setCoefficient}
              keyboardType="numeric"
              style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary, marginTop: 4 }}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 18, padding: 14 }}>
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>
              Crédits
            </Text>
            <TextInput
              value={credits}
              onChangeText={setCredits}
              keyboardType="numeric"
              style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary, marginTop: 4 }}
            />
          </View>
          <View style={{ flex: 1, backgroundColor: theme.card, borderRadius: 18, padding: 14 }}>
            <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>
              Heures de cours
            </Text>
            <TextInput
              value={heures}
              onChangeText={setHeures}
              keyboardType="numeric"
              style={{ fontFamily: fontFamily.bodySemibold, fontSize: 14, color: theme.textPrimary, marginTop: 4 }}
            />
          </View>
        </View>

        <Pressable
          onPress={submit}
          disabled={!nom.trim()}
          style={{
            backgroundColor: nom.trim() ? theme.accent : theme.cardAlt,
            paddingVertical: 15,
            borderRadius: radius.pill,
            alignItems: 'center',
          }}
        >
          <Text
            style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: nom.trim() ? '#fff' : theme.textTertiary }}
          >
            Ajouter
          </Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}
