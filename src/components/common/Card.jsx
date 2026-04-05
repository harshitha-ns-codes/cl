import { View, Pressable, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export function Card({ children, onPress, selected = false, style, contentStyle }) {
  const Wrapper = onPress ? Pressable : View;

  const inner = (
    <View style={[styles.inner, selected && styles.innerSelected, contentStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Wrapper
        onPress={onPress}
        style={({ pressed }) => [
          styles.wrapper,
          selected && styles.wrapperSelected,
          pressed && styles.wrapperPressed,
          style,
        ]}
      >
        {inner}
      </Wrapper>
    );
  }

  return (
    <View style={[styles.wrapper, selected && styles.wrapperSelected, style]}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  wrapperSelected: {
    borderColor: colors.selectedBorder,
    backgroundColor: colors.selectedBackground,
  },
  wrapperPressed: {
    backgroundColor: colors.pressedOverlay,
  },
  inner: {
    padding: 20,
  },
  innerSelected: {},
});

export default Card;
