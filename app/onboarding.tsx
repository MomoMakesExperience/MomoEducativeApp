import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award, Folder, Timer } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius } from '@/theme/tokens';
import { useAppStore } from '@/state/useAppStore';
import { haptics } from '@/lib/haptics';

const SLIDES = [
  {
    icon: Folder,
    color: '#1E90FF',
    title: 'Fini les post-it et les fichiers Excel',
    body: 'Toutes tes matières, examens et notes centralisés au même endroit.',
  },
  {
    icon: Award,
    color: '#0E9B7A',
    title: 'Ton bulletin, calculé pour toi',
    body: 'Ta moyenne générale mise à jour automatiquement à chaque note ajoutée.',
  },
  {
    icon: Timer,
    color: '#111111',
    title: 'Reste concentré, chaque jour',
    body: 'Des sessions de concentration guidées pour avancer sur tes révisions.',
  },
];

const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2'];

export default function Onboarding() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [prenom, setPrenom] = useState('');
  const [universite, setUniversite] = useState('');
  const [niveau, setNiveau] = useState('L2');

  if (step === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#1E90FF',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          paddingBottom: insets.bottom,
        }}
      >
        <Image
          source={require('../assets/images/momo-logo.png')}
          style={{ width: 140, height: 93, resizeMode: 'contain' }}
        />
        <Pressable
          onPress={() => {
            haptics.selection();
            setStep(1);
          }}
          style={{
            backgroundColor: '#fff',
            paddingVertical: 14,
            paddingHorizontal: 36,
            borderRadius: radius.pill,
          }}
        >
          <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: '#1E90FF' }}>
            Commencer
          </Text>
        </Pressable>
      </View>
    );
  }

  if (step >= 1 && step <= 3) {
    const slide = SLIDES[step - 1];
    const Icon = slide.icon;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.bg,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 28,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ alignItems: 'center', gap: 20 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 26,
              backgroundColor: slide.color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={36} color="#fff" strokeWidth={1.8} />
          </View>
          <Text
            style={{
              fontFamily: fontFamily.headingBold,
              fontSize: 22,
              color: theme.textPrimary,
              textAlign: 'center',
            }}
          >
            {slide.title}
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.body,
              fontSize: 14,
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {slide.body}
          </Text>
        </View>

        <View style={{ gap: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === step - 1 ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === step - 1 ? '#1E90FF' : theme.cardAlt,
                }}
              />
            ))}
          </View>
          <Pressable
            onPress={() => {
              haptics.selection();
              setStep(step + 1);
            }}
            style={{
              backgroundColor: '#1E90FF',
              paddingVertical: 15,
              borderRadius: radius.pill,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 15, color: '#fff' }}>
              Suivant
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 24,
        gap: 20,
      }}
    >
      <Text style={{ fontFamily: fontFamily.headingBold, fontSize: 24, color: theme.textPrimary }}>
        Crée ton profil
      </Text>

      <View style={{ backgroundColor: theme.card, borderRadius: radius.md, padding: 16, gap: 4 }}>
        <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 12, color: theme.textSecondary }}>
          Prénom
        </Text>
        <TextInput
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Ton prénom"
          placeholderTextColor={theme.textTertiary}
          style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary, paddingVertical: 4 }}
        />
      </View>

      <View style={{ backgroundColor: theme.card, borderRadius: radius.md, padding: 16, gap: 4 }}>
        <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 12, color: theme.textSecondary }}>
          Université
        </Text>
        <TextInput
          value={universite}
          onChangeText={setUniversite}
          placeholder="Ton université"
          placeholderTextColor={theme.textTertiary}
          style={{ fontFamily: fontFamily.headingBold, fontSize: 16, color: theme.textPrimary, paddingVertical: 4 }}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: fontFamily.bodySemibold, fontSize: 12, color: theme.textSecondary }}>
          Niveau
        </Text>
        <View style={{ flexDirection: 'row', backgroundColor: theme.cardAlt, borderRadius: radius.pill, padding: 3 }}>
          {NIVEAUX.map((n) => {
            const active = n === niveau;
            return (
              <Pressable
                key={n}
                onPress={() => {
                  haptics.selection();
                  setNiveau(n);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  backgroundColor: active ? theme.card : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: fontFamily.headingBold,
                    fontSize: 13,
                    color: active ? theme.textPrimary : theme.textSecondary,
                  }}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        disabled={!prenom.trim()}
        onPress={async () => {
          haptics.success();
          await completeOnboarding({ prenom: prenom.trim(), universite: universite.trim(), niveau });
          router.replace('/(tabs)');
        }}
        style={{
          marginTop: 12,
          backgroundColor: prenom.trim() ? '#1E90FF' : theme.cardAlt,
          paddingVertical: 15,
          borderRadius: radius.pill,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: fontFamily.headingBold,
            fontSize: 15,
            color: prenom.trim() ? '#fff' : theme.textTertiary,
          }}
        >
          C'est parti
        </Text>
      </Pressable>
    </ScrollView>
  );
}
