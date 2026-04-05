import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

/**
 * Pinch + pan infinite-feel canvas. Child should be a large graph; user explores by gesture.
 */
export function ImmersiveGroveCanvas({ children, minScale = 0.65, maxScale = 2.4 }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.min(maxScale, Math.max(minScale, next));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  /** Let subtopic taps hit the graph first; only pan canvas after a clear drag. */
  const pan = Gesture.Pan()
    .minDistance(24)
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const composed = Gesture.Simultaneous(pinch, pan);

  return (
    <View style={styles.clip}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.canvas, style]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    minHeight: 320,
    overflow: 'hidden',
  },
  canvas: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
