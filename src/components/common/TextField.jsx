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
  rightAccessory,
  ...inputProps
}) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={colors.textPlaceholder}
          style={[
            styles.input,
            rightAccessory ? styles.inputFlex : null,
            error ? styles.inputError : null,
            inputStyle,
          ]}
          {...inputProps}
        />
        {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
    minWidth: 0,
  },
  accessory: {
    marginLeft: 8,
    marginBottom: 2,
    justifyContent: 'center',
  },
  rule: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.inputBorder,
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
