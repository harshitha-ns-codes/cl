import { useState } from 'react';
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

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Commute' }] });
  };

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

            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.lede}>Welcome back. Your place is as you left it.</Text>

            <View style={styles.form}>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="name@domain.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                secureTextEntry
                textContentType="password"
                containerStyle={styles.fieldSpaced}
              />
            </View>

            <Button title="Continue" onPress={handleLogin} style={styles.submit} />

            <View style={styles.footer}>
              <Text style={styles.footerMuted}>New here?</Text>
              <Pressable onPress={() => navigation.navigate('Signup')} hitSlop={10}>
                <Text style={styles.link}>Create an account</Text>
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

export default LoginScreen;
