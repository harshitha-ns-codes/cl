import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import { fonts } from '../../theme/typography';

/**
 * Aligned form control: label, underline-style field, optional error.
 */
export function TextField({
  label,
  error,
  containerStyle,
  inputStyle,
  ...inputProps
}) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textPlaceholder}
        style={[styles.input, error ? styles.inputError : null, inputStyle]}
        {...inputProps}
      />
      <View style={[styles.rule, error && styles.ruleError]} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 22,
    color: colors.textPrimary,
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  inputError: {
    color: colors.textPrimary,
  },
  rule: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.inputUnderline,
    marginTop: 2,
  },
  ruleError: {
    backgroundColor: colors.error,
    opacity: 0.7,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.error,
    marginTop: 8,
    lineHeight: 18,
  },
});

export default TextField;
