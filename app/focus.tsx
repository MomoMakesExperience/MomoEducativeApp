import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Play, Pause, X, Flame } from 'lucide-react-native';
import { useAppStore } from '@/state/useAppStore';
import { fontFamily } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';
import { scheduleFocusEndNotification } from '@/lib/notifications';

const DURATION = 25 * 60;
const RING_SIZE = 220;
const STROKE = 14;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Focus() {
  const insets = useSafeAreaInsets();
  const matieres = useAppStore((s) => s.matieres);
  const sessionsToday = useAppStore((s) => s.sessionsToday);
  const streakDays = useAppStore((s) => s.streakDays);
  const recordFocusSession = useAppStore((s) => s.recordFocusSession);

  const [subjectId, setSubjectId] = useState<string | null>(matieres[0]?.id ?? null);
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            haptics.success();
            recordFocusSession(subjectId, DURATION, true);
            return DURATION;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const toggle = async () => {
    haptics.medium();
    if (!running) {
      await scheduleFocusEndNotification(secondsLeft);
    }
    setRunning((r) => !r);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const progress = 1 - secondsLeft / DURATION;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const subjectName = matieres.find((m) => m.id === subjectId)?.nom ?? 'Session libre';

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0C', paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            router.back();
          }}
          style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: '#1A1B1E', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} color="#fff" />
        </Pressable>
      </View>

      {matieres.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 16, gap: 8 }}
        >
          {matieres.map((m) => {
            const active = m.id === subjectId;
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  haptics.selection();
                  setSubjectId(m.id);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? m.couleur : '#1A1B1E',
                }}
              >
                <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 12, color: '#fff' }}>{m.nom}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="#1A1B1E"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="#1E90FF"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation={-90}
              originX={RING_SIZE / 2}
              originY={RING_SIZE / 2}
            />
          </Svg>
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 40, color: '#fff' }}>
              {mm}:{ss}
            </Text>
            <Text style={{ fontFamily: fontFamily.body, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              {subjectName}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={toggle}
          style={{
            width: 76,
            height: 76,
            borderRadius: 999,
            backgroundColor: '#1E90FF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {running ? <Pause size={28} color="#fff" /> : <Play size={28} color="#fff" style={{ marginLeft: 3 }} />}
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 32 }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 18, color: '#fff' }}>{sessionsToday}</Text>
            <Text style={{ fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              sessions aujourd'hui
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Flame size={14} color="#1E90FF" />
              <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 18, color: '#fff' }}>{streakDays}</Text>
            </View>
            <Text style={{ fontFamily: fontFamily.body, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
              streak jours
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
