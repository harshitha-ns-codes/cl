import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { fonts, layout } from '../../theme/typography';
import { Button } from '../../components/common/Button';

function LogoMark() {
  return (
    <View style={mark.wrap}>
      <LinearGradient
        colors={['#166534', '#22c55e', '#86efac']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={mark.ring}
      >
        <View style={mark.inner}>
          <Ionicons name="leaf" size={42} color={colors.forest900} />
        </View>
      </LinearGradient>
      <Text style={mark.wordmark}>Grove</Text>
      <Text style={mark.tagline}>Read in the margins</Text>
    </View>
  );
}

export function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#ecfdf5', '#fdfaf0', '#f5f0e6']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.gradientFill}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.column}>
            <Text style={styles.overline}>Welcome</Text>

            <LogoMark />

            <View style={styles.heroCard}>
              <Text style={styles.headline}>
                Calm learning{'\n'}for busy days
              </Text>
              <View style={styles.divider} />
              <Text style={styles.body}>
                Turn short gaps into steady progress: curated topics, articles tuned to your interests,
                and notes that remember what you saved — without the endless feed.
              </Text>
            </View>

            <View style={styles.pillRow}>
              <View style={styles.pill}>
                <Ionicons name="git-network-outline" size={18} color={colors.forest800} />
                <Text style={styles.pillText}>Your topic map</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="headset-outline" size={18} color={colors.forest800} />
                <Text style={styles.pillText}>Listen & capture</Text>
              </View>
            </View>

            <View style={styles.ctaBlock}>
              <Button
                title="Begin"
                onPress={() => navigation.navigate('Signup')}
                style={styles.primaryBtn}
              />
              <Pressable
                onPress={() => navigation.navigate('Login')}
                style={({ pressed }) => [styles.textLinkWrap, pressed && { opacity: 0.65 }]}
              >
                <Text style={styles.textLink}>Already have an account</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const mark = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  ring: {
    width: 112,
    height: 112,
    borderRadius: 36,
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#14532d',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
    }),
  },
  inner: {
    flex: 1,
    borderRadius: 33,
    backgroundColor: '#fdfaf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: 18,
    fontFamily: fonts.displaySemibold,
    fontSize: 34,
    letterSpacing: -0.8,
    color: colors.textDisplay,
  },
  tagline: {
    marginTop: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradientFill: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: layout.pagePadding,
  },
  column: {
    width: '100%',
    maxWidth: layout.contentMax,
    alignSelf: 'center',
  },
  overline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: 'rgba(255, 252, 247, 0.88)',
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(20, 83, 45, 0.1)',
  },
  headline: {
    fontFamily: fonts.displaySemibold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    color: colors.textDisplay,
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: colors.forest800,
    opacity: 0.25,
    borderRadius: 2,
    marginBottom: 16,
    alignSelf: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textSecondary,
    letterSpacing: 0.15,
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 252, 247, 0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  ctaBlock: {
    width: '100%',
    gap: 4,
  },
  primaryBtn: {
    width: '100%',
  },
  textLinkWrap: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  textLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.forest800,
    letterSpacing: 0.2,
  },
});

export default OnboardingScreen;
