import React from 'react';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={(props) => <BottomTabBar {...(props as any)} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="matieres" />
      <Tabs.Screen name="examens" />
      <Tabs.Screen name="edt" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
