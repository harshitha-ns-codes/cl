import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Line } from 'react-native-svg';

const AnimatedLine = Animated.createAnimatedComponent(Line);

export function PulsingEdge({ x1, y1, x2, y2, delay = 0, strokeBase = 'rgba(158, 212, 184, 0.35)' }) {
  const pulse = useSharedValue(0.2);

  useEffect(() => {
    const t = setTimeout(() => {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.18, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }, delay);
    return () => clearTimeout(t);
  }, [delay, pulse]);

  const animatedProps = useAnimatedProps(() => ({
    strokeOpacity: pulse.value,
  }));

  return (
    <AnimatedLine
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={strokeBase}
      strokeWidth={2}
      strokeLinecap="round"
      animatedProps={animatedProps}
    />
  );
}
