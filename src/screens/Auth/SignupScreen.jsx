import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { fonts, layout } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { TextField } from '../../components/common/TextField';

export function SignupScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const trimmedFirst = firstName.trim();
  const trimmedLast = lastName.trim();

  const validation = useMemo(() => {
    const errors = {};
    if (!trimmedFirst) errors.firstName = 'Please enter your first name.';
    if (!trimmedLast) errors.lastName = 'Please enter your last name.';
    if (!email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) errors.password = 'Choose a password.';
    else if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (!confirmPassword) errors.confirm = 'Confirm your password.';
    else if (password !== confirmPassword) errors.confirm = 'Passwords do not match.';
    return errors;
  }, [trimmedFirst, trimmedLast, email, password, confirmPassword]);

  const canSubmit = Object.keys(validation).length === 0;

  const handleSignup = () => {
    setAttempted(true);
    if (!canSubmit) return;
    navigation.reset({ index: 0, routes: [{ name: 'Commute' }] });
  };

  const showErr = (key) => (attempted ? validation[key] : undefined);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.column}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={14}
              style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.55 }]}
            >
              <Ionicons name="chevron-back" size={22} color={colors.forest800} />
              <Text style={styles.backLabel}>Back</Text>
            </Pressable>

            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.lede}>Use your legal name so your account stays clear and recoverable.</Text>

            <View style={styles.form}>
              <View style={styles.nameRow}>
                <TextField
                  label="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Given name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  error={showErr('firstName')}
                  containerStyle={styles.nameCol}
                />
                <TextField
                  label="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Family name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  error={showErr('lastName')}
                  containerStyle={styles.nameCol}
                />
              </View>

              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="name@domain.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={showErr('email')}
                containerStyle={styles.fieldAfterRow}
              />

              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 characters"
                secureTextEntry={!passwordVisible}
                textContentType="newPassword"
                autoCorrect={false}
                error={showErr('password')}
                containerStyle={styles.fieldSpaced}
                rightAccessory={
                  <Pressable
                    onPress={() => setPasswordVisible((v) => !v)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                  >
                    <Ionicons
                      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.forest800}
                    />
                  </Pressable>
                }
              />

              <TextField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                secureTextEntry={!confirmVisible}
                textContentType="newPassword"
                autoCorrect={false}
                error={showErr('confirm')}
                containerStyle={styles.fieldSpaced}
                rightAccessory={
                  <Pressable
                    onPress={() => setConfirmVisible((v) => !v)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel={confirmVisible ? 'Hide password' : 'Show password'}
                  >
                    <Ionicons
                      name={confirmVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.forest800}
                    />
                  </Pressable>
                }
              />
            </View>

            <Button title="Continue" onPress={handleSignup} style={styles.submit} />

            <View style={styles.footer}>
              <Text style={styles.footerMuted}>Registered already?</Text>
              <Pressable onPress={() => navigation.navigate('Login')} hitSlop={10}>
                <Text style={styles.link}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: 36,
    paddingTop: 8,
  },
  column: {
    width: '100%',
    maxWidth: layout.contentMax,
    alignSelf: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: -4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.forest800,
    letterSpacing: 0.2,
    marginLeft: 4,
  },
  title: {
    fontFamily: fonts.displaySemibold,
    fontSize: 32,
    letterSpacing: -0.4,
    color: colors.textDisplay,
    marginBottom: 10,
  },
  lede: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 32,
    letterSpacing: 0.15,
  },
  form: {
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  },
  nameCol: {
    flex: 1,
    minWidth: 0,
  },
  fieldAfterRow: {
    marginTop: layout.fieldGap,
  },
  fieldSpaced: {
    marginTop: layout.fieldGap,
  },
  submit: {
    marginTop: 28,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
    flexWrap: 'wrap',
  },
  footerMuted: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  link: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.forest800,
    letterSpacing: 0.2,
  },
});

export default SignupScreen;
