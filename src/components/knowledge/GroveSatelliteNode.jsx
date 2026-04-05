import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import colors from '../../theme/colors';
import { fonts } from '../../theme/typography';

const springConfig = { damping: 18, stiffness: 260, mass: 0.65 };
const springBack = { damping: 20, stiffness: 200, mass: 0.55 };

export function GroveSatelliteNode({ node, style, onCommitTap }) {
  const pullX = useSharedValue(0);
  const pullY = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pullX.value },
      { translateY: pullY.value },
      { scale: scale.value },
    ],
    opacity: 1,
  }));

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      pullX.value = e.translationX * 0.45;
      pullY.value = e.translationY * 0.45;
    })
    .onEnd((e) => {
      const small = Math.abs(e.translationX) < 10 && Math.abs(e.translationY) < 10;
      if (small) {
        runOnJS(onCommitTap)();
      }
      pullX.value = withSpring(0, springBack);
      pullY.value = withSpring(0, springBack);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, springConfig);
    })
    .onBegin(() => {
      scale.value = withSpring(0.96, springConfig);
    });

  const g = pan;

  return (
    <GestureDetector gesture={g}>
      <Animated.View
        style={[style, animatedStyle]}
        collapsable={false}
      >
        <Animated.View style={[styles.satGlass, StyleSheet.absoluteFillObject]}>
          <Text style={styles.satText} numberOfLines={2}>
            {node.label}
          </Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  satGlass: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 252, 247, 0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 252, 247, 0.55)',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  satText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
