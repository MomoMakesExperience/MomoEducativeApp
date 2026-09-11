import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function guard(fn: () => Promise<unknown>) {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
}

export const haptics = {
  light: () => guard(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => guard(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => guard(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  selection: () => guard(() => Haptics.selectionAsync()),
};
