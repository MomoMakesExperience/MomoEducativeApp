import { Redirect } from 'expo-router';
import { useAppStore } from '@/state/useAppStore';

export default function Index() {
  const profile = useAppStore((s) => s.profile);
  if (profile && !profile.onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
