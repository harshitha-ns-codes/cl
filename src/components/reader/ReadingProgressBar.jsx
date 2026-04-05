import { View, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

/** Subtle top progress (0–1) driven by scroll in the parent reader. */
export function ReadingProgressBar({ progress = 0 }) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${p * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 2,
    backgroundColor: 'rgba(26, 61, 42, 0.07)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 1,
    backgroundColor: colors.mint500,
  },
});
