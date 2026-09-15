import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AlerteOption } from '@/db/types';

if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.warn('expo-notifications: setNotificationHandler failed', e);
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch (e) {
    console.warn('expo-notifications: permission request failed', e);
    return false;
  }
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

  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: params.titre,
        body: `Prévu le ${params.dateIso}${params.heure ? ' à ' + params.heure : ''}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
  } catch (e) {
    console.warn('expo-notifications: scheduleExamenReminder failed', e);
    return null;
  }
}

export async function cancelReminder(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}

export async function scheduleFocusEndNotification(seconds: number): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const granted = await ensureNotificationPermission();
  if (!granted) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
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
  } catch (e) {
    console.warn('expo-notifications: scheduleFocusEndNotification failed', e);
    return null;
  }
}
