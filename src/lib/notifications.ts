import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AlerteOption } from '@/db/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function offsetsForAlerte(alerte: AlerteOption): number[] {
  switch (alerte) {
    case 'aucune':
      return [];
    case 'veille':
      return [24 * 60 * 60 * 1000];
    case 'jour_j':
      return [60 * 60 * 1000];
    case 'default':
    default:
      return [24 * 60 * 60 * 1000, 60 * 60 * 1000];
  }
}

export async function scheduleExamenReminder(params: {
  titre: string;
  dateIso: string;
  heure: string | null;
  alerte: AlerteOption;
}): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;

  const [h, m] = (params.heure ?? '08:00').split(':').map((v) => parseInt(v, 10) || 0);
  const target = new Date(`${params.dateIso}T00:00:00`);
  target.setHours(h, m, 0, 0);

  const offsets = offsetsForAlerte(params.alerte);
  if (offsets.length === 0) return null;

  const triggerDate = new Date(target.getTime() - offsets[0]);
  if (triggerDate.getTime() <= Date.now()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: params.titre,
      body: `Prévu le ${params.dateIso}${params.heure ? ' à ' + params.heure : ''}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
  return id;
}

export async function cancelReminder(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}

export async function scheduleFocusEndNotification(seconds: number): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Session terminée',
      body: 'Bravo, ta session de concentration est finie.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, seconds),
    },
  });
}
