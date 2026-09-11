import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { Search, Plus, Award, BookOpen, CheckSquare, Check, Calendar, Clock, Bell, Trash2 } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius, typeColors } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';
import { SegmentedControl } from '@/components/SegmentedControl';
import { EmptyState } from '@/components/EmptyState';
import { BottomSheet } from '@/components/BottomSheet';
import { ColorIconPicker } from '@/components/ColorIconPicker';
import { IconGlyph } from '@/components/IconGlyph';
import { SheetRow, SheetRowGroup } from '@/components/SheetRow';
import type { AlerteOption, Examen, ExamenType, IconName } from '@/db/types';
import { countdownLabel, formatDateFull, formatDateShort, todayIso } from '@/lib/date';
import { haptics } from '@/lib/haptics';

const TYPE_ICON: Record<ExamenType, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  exam: Award,
  devoir: BookOpen,
  projet: CheckSquare,
};

const ALERTE_LABEL: Record<AlerteOption, string> = {
  aucune: 'Aucune',
  default: 'Par défaut',
  veille: 'La veille',
  jour_j: '1h avant',
};

function DeleteAction({ progress, onPress }: { progress: SharedValue<number>; onPress: () => void }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: Math.min(progress.value, 1) }],
  }));
  return (
    <Pressable onPress={onPress} style={{ justifyContent: 'center', paddingHorizontal: 6 }}>
      <Animated.View
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Trash2 size={20} color="#fff" strokeWidth={1.8} />
      </Animated.View>
    </Pressable>
  );
}

function DoneAction({ progress, onPress }: { progress: SharedValue<number>; onPress: () => void }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: Math.min(progress.value, 1) }],
  }));
  return (
    <Pressable onPress={onPress} style={{ justifyContent: 'center', paddingHorizontal: 6 }}>
      <Animated.View
        style={[
          {
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: '#0E9B7A',
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Check size={22} color="#fff" strokeWidth={2.4} />
      </Animated.View>
    </Pressable>
  );
}

function ExamenRow({
  examen,
  onDelete,
  onMarkDone,
}: {
  examen: Examen;
  onDelete: () => void;
  onMarkDone: () => void;
}) {
  const Icon = TYPE_ICON[examen.type];
  const bg = typeColors[examen.type];
  const row = (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 18,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={19} color="#fff" strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: '#fff' }}>
          {examen.titre}
        </Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: fontFamily.body }}>
          {examen.type === 'exam' ? 'Examen' : examen.type === 'devoir' ? 'Devoir' : 'Projet'} ·{' '}
          {formatDateShort(examen.dateIso)}
          {examen.heure ? ` · ${examen.heure}` : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {examen.statut === 'upcoming' ? (
          <Text
            style={{ fontFamily: fontFamily.headingBold, fontSize: 13, color: '#fff', maxWidth: 70, textAlign: 'right' }}
          >
            {countdownLabel(examen.dateIso)}
          </Text>
        ) : examen.note !== null ? (
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 20, color: '#fff' }}>{examen.note}</Text>
        ) : (
          <Check size={22} color="#fff" strokeWidth={2.5} />
        )}
      </View>
    </View>
  );

  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
      renderRightActions={(progress: SharedValue<number>) => <DeleteAction progress={progress} onPress={onDelete} />}
      renderLeftActions={
        examen.statut === 'upcoming'
          ? (progress: SharedValue<number>) => <DoneAction progress={progress} onPress={onMarkDone} />
          : undefined
      }
    >
      {row}
    </Swipeable>
  );
}

export default function Examens() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const examens = useAppStore((s) => s.examens);
  const addExamen = useAppStore((s) => s.addExamen);
  const removeExamen = useAppStore((s) => s.removeExamen);
  const markExamenDone = useAppStore((s) => s.markExamenDone);
  const setExamenNoteStore = useAppStore((s) => s.setExamenNote);

  const [tab, setTab] = useState<'passe' | 'futur'>('futur');
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [noteTarget, setNoteTarget] = useState<Examen | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const [titre, setTitre] = useState('');
  const [type, setType] = useState<ExamenType>('exam');
  const [dateIso, setDateIso] = useState(todayIso());
  const [heure, setHeure] = useState<string | null>(null);
  const [alerte, setAlerte] = useState<AlerteOption>('default');
  const [couleur, setCouleur] = useState('#1E90FF');
  const [icone, setIcone] = useState<IconName>('award');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const passeCount = examens.filter((e) => e.statut === 'done').length;
  const futurCount = examens.filter((e) => e.statut === 'upcoming').length;

  const filtered = useMemo(() => {
    return examens
      .filter((e) => (tab === 'passe' ? e.statut === 'done' : e.statut === 'upcoming'))
      .filter((e) => e.titre.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => (tab === 'futur' ? a.dateIso.localeCompare(b.dateIso) : b.dateIso.localeCompare(a.dateIso)));
  }, [examens, tab, query]);

  const reset = () => {
    setTitre('');
    setType('exam');
    setDateIso(todayIso());
    setHeure(null);
    setAlerte('default');
    setCouleur('#1E90FF');
    setIcone('award');
  };

  const submit = async () => {
    if (!titre.trim()) return;
    await addExamen({ titre: titre.trim(), type, dateIso, heure, couleur, icone, alerte });
    haptics.success();
    reset();
    setShowAdd(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 18,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.card,
            borderRadius: radius.pill,
            paddingVertical: 9,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: theme.textPrimary }}>
            Tous les examens
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 12, gap: 10 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title={tab === 'futur' ? 'Aucun examen à venir' : 'Aucun examen passé'}
            subtitle={
              tab === 'futur'
                ? 'Ajoute un examen, un devoir ou un projet avec le bouton +.'
                : 'Tes examens terminés apparaîtront ici.'
            }
          />
        ) : (
          filtered.map((e) => (
            <ExamenRow
              key={e.id}
              examen={e}
              onDelete={() => {
                haptics.medium();
                removeExamen(e.id);
              }}
              onMarkDone={() => {
                haptics.selection();
                setNoteInput('');
                setNoteTarget(e);
              }}
            />
          ))
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 18, paddingBottom: 8 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: theme.card,
            borderRadius: radius.pill,
            padding: 8,
            shadowColor: '#0B0B0C',
            shadowOpacity: theme.dark ? 0 : 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              backgroundColor: theme.cardAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={16} color={theme.textPrimary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <SegmentedControl
              value={tab}
              onChange={(k) => setTab(k as 'passe' | 'futur')}
              options={[
                { key: 'passe', label: `Passé ${passeCount}` },
                { key: 'futur', label: `Futur ${futurCount}` },
              ]}
            />
          </View>
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
      </View>

      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)}>
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary, textAlign: 'center' }}>
          Ajouter un examen
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.card, borderRadius: 18, padding: 14 }}>
          <View
            style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: couleur, alignItems: 'center', justifyContent: 'center' }}
          >
            <IconGlyph name={icone} size={22} />
          </View>
          <TextInput
            value={titre}
            onChangeText={setTitre}
            placeholder="Titre de l'examen"
            placeholderTextColor={theme.textTertiary}
            style={{ flex: 1, fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary }}
          />
        </View>

        <SegmentedControl
          value={type}
          onChange={(k) => setType(k as ExamenType)}
          options={[
            { key: 'exam', label: 'Examen' },
            { key: 'devoir', label: 'Devoir' },
            { key: 'projet', label: 'Projet' },
          ]}
        />

        <ColorIconPicker color={couleur} icon={icone} onColorChange={setCouleur} onIconChange={setIcone} />

        <SheetRowGroup>
          <SheetRow
            icon={<Calendar size={16} color={theme.textSecondary} strokeWidth={1.8} />}
            label="Date"
            value={formatDateFull(dateIso)}
            onPress={() => setShowDatePicker(true)}
          />
          <SheetRow
            icon={<Clock size={16} color={theme.textSecondary} strokeWidth={1.8} />}
            label="Heure"
            value={heure ?? 'Toute la journée'}
            onPress={() => setShowTimePicker(true)}
            last
          />
        </SheetRowGroup>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(`${dateIso}T00:00:00`)}
            mode="date"
            display="inline"
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) setDateIso(selected.toISOString().slice(0, 10));
            }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            display="spinner"
            onChange={(_, selected) => {
              setShowTimePicker(false);
              if (selected) {
                const hh = String(selected.getHours()).padStart(2, '0');
                const mm = String(selected.getMinutes()).padStart(2, '0');
                setHeure(`${hh}:${mm}`);
              }
            }}
          />
        )}

        <SheetRowGroup>
          <SheetRow
            icon={<Bell size={16} color={theme.textSecondary} strokeWidth={1.8} />}
            label="Alertes"
            value={ALERTE_LABEL[alerte]}
            onPress={() => {
              const order: AlerteOption[] = ['aucune', 'jour_j', 'veille', 'default'];
              const next = order[(order.indexOf(alerte) + 1) % order.length];
              haptics.selection();
              setAlerte(next);
            }}
            last
          />
        </SheetRowGroup>

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
          <Text
            style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: titre.trim() ? '#fff' : theme.textTertiary }}
          >
            Ajouter
          </Text>
        </Pressable>
      </BottomSheet>

      <BottomSheet visible={!!noteTarget} onClose={() => setNoteTarget(null)}>
        <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary, textAlign: 'center' }}>
          Marquer comme terminé
        </Text>
        <Text style={{ fontFamily: fontFamily.body, fontSize: 13, color: theme.textSecondary, textAlign: 'center' }}>
          {noteTarget?.titre}
        </Text>
        <View style={{ backgroundColor: theme.card, borderRadius: 18, padding: 14, gap: 4 }}>
          <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 11, color: theme.textSecondary }}>
            Note obtenue (optionnel)
          </Text>
          <TextInput
            value={noteInput}
            onChangeText={setNoteInput}
            placeholder="ex. 16"
            keyboardType="numeric"
            placeholderTextColor={theme.textTertiary}
            style={{ fontFamily: fontFamily.headingBold, fontSize: 18, color: theme.textPrimary }}
          />
        </View>
        <Pressable
          onPress={async () => {
            if (!noteTarget) return;
            const parsed = parseFloat(noteInput.replace(',', '.'));
            if (!Number.isNaN(parsed)) {
              await setExamenNoteStore(noteTarget.id, parsed);
            } else {
              await markExamenDone(noteTarget.id);
            }
            haptics.success();
            setNoteTarget(null);
          }}
          style={{ backgroundColor: theme.accent, paddingVertical: 15, borderRadius: radius.pill, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: '#fff' }}>Valider</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}
