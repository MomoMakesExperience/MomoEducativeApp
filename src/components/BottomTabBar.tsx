import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, Award, Calendar, User } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fontFamily, radius } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  index: Home,
  matieres: BookOpen,
  examens: Award,
  edt: Calendar,
  profil: User,
};

const LABELS: Record<string, string> = {
  index: 'ACCUEIL',
  matieres: 'MATIÈRES',
  examens: 'EXAMENS',
  edt: 'EDT',
  profil: 'PROFIL',
};

interface MinimalTabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

export function BottomTabBar({ state, navigation }: MinimalTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 12),
        paddingHorizontal: 12,
        backgroundColor: theme.card,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        shadowColor: theme.dark ? '#000' : '#0B0B0C',
        shadowOpacity: theme.dark ? 0.3 : 0.06,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -6 },
      }}
    >
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const Icon = ICONS[route.name] ?? Home;
        const label = LABELS[route.name] ?? route.name;
        const color = focused ? theme.accent : theme.dark ? '#6B7280' : '#94A3B8';
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              haptics.selection();
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
          >
            <Icon size={22} color={color} strokeWidth={1.8} />
            <Text
              style={{
                fontFamily: fontFamily.headingBold,
                fontSize: 10,
                letterSpacing: 0.3,
                color,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
