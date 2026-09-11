import React, { useEffect } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

export function BottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(400);
  const dragY = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      dragY.value = 0;
      translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(400, { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const close = () => onClose();

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) dragY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        dragY.value = withTiming(400, { duration: 180 });
        runOnJS(close)();
      } else {
        dragY.value = withTiming(0, { duration: 180 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + dragY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            { position: 'absolute', inset: 0, backgroundColor: 'rgba(11,11,12,0.45)' },
            backdropStyle,
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            {
              backgroundColor: theme.sheetBg,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
              maxHeight: '88%',
              paddingBottom: insets.bottom + 12,
            },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={panGesture}>
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
              <View
                style={{
                  width: 36,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.25)' : 'rgba(11,11,12,0.15)',
                }}
              />
            </View>
          </GestureDetector>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 18, gap: 16 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
