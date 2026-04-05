import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getTabBarHeight } from '../navigation/tabBarMetrics';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { touchLocalStreak, getLocalStreak } from '../services/localStreak';
import { getLocalReadingAnalytics } from '../services/localReadingStats';
import { getDisplayProfile } from '../services/localProfileStorage';

export function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarH = getTabBarHeight(insets.bottom);

  const [streak, setStreak] = useState(0);
  const [analytics, setAnalytics] = useState({
    total_time_spent: 0,
    articles_read: 0,
    avg_time_per_article: 0,
  });
  const [greetingName, setGreetingName] = useState('');

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const s = await touchLocalStreak();
        const a = await getLocalReadingAnalytics();
        const p = await getDisplayProfile();
        if (!mounted) return;
        setStreak(s.streak);
        setAnalytics(a);
        setGreetingName(p.name || 'there');
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const minsRead = Math.round(analytics.total_time_spent / 60);

  const openForYou = () => {
    navigation.navigate('Learn', {
      screen: 'LearnMain',
      params: { section: 'foryou' },
    });
  };

  const openIngest = () => {
    navigation.navigate('Learn', {
      screen: 'LearnMain',
      params: { section: 'ingest' },
    });
  };

  const openNotes = () => navigation.navigate('Notes');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#e8f5ec', '#fdfaf0', '#f5f0e6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.hello}>Hello, {greetingName}</Text>
          <Text style={styles.heroTitle}>Your quiet desk{'\n'}in motion</Text>
          <Text style={styles.heroSub}>
            Streaks, reading time, and picks tuned to you — without the noise of a default feed.
          </Text>
        </LinearGradient>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={22} color={colors.forest800} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={22} color={colors.forest800} />
            <Text style={styles.statValue}>{minsRead}</Text>
            <Text style={styles.statLabel}>min reading</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={22} color={colors.forest800} />
            <Text style={styles.statValue}>{analytics.articles_read}</Text>
            <Text style={styles.statLabel}>articles</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Continue</Text>
        <Pressable
          onPress={openForYou}
          style={({ pressed }) => [styles.ctaCard, pressed && { opacity: 0.94 }]}
        >
          <LinearGradient
            colors={['#166534', '#14532d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaInner}
          >
            <View style={styles.ctaTextBlock}>
              <Text style={styles.ctaKicker}>For you</Text>
              <Text style={styles.ctaTitle}>Open today’s recommendations</Text>
              <Text style={styles.ctaSub}>Weighted by your interests — refresh anytime.</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={40} color={colors.onAccent} />
          </LinearGradient>
        </Pressable>

        <View style={styles.rowTwo}>
          <Pressable
            onPress={openIngest}
            style={({ pressed }) => [styles.halfCard, pressed && { opacity: 0.92 }]}
          >
            <Ionicons name="link-outline" size={26} color={colors.forest800} />
            <Text style={styles.halfTitle}>Ingest a link</Text>
            <Text style={styles.halfSub}>Read inside the app</Text>
          </Pressable>
          <Pressable
            onPress={openNotes}
            style={({ pressed }) => [styles.halfCard, pressed && { opacity: 0.92 }]}
          >
            <Ionicons name="document-text-outline" size={26} color={colors.forest800} />
            <Text style={styles.halfTitle}>Notes</Text>
            <Text style={styles.halfSub}>Thoughts & clips</Text>
          </Pressable>
        </View>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            “One tab at a time, one margin at a time — that is how a library grows on a phone.”
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 24, paddingTop: 12 },
  hero: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  hello: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.textDisplay,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 25,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statValue: {
    fontFamily: fonts.displaySemibold,
    fontSize: 22,
    color: colors.textDisplay,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
  },
  ctaCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#14532d',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
    }),
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  ctaTextBlock: { flex: 1, paddingRight: 12 },
  ctaKicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(253,250,240,0.75)',
    marginBottom: 6,
  },
  ctaTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.onAccent,
    marginBottom: 6,
  },
  ctaSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(253,250,240,0.85)',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  halfCard: {
    flex: 1,
    backgroundColor: colors.creamMuted,
    borderRadius: 18,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  halfTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 10,
  },
  halfSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  quote: {
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  quoteText: {
    fontFamily: fonts.displaySemibold,
    fontSize: 17,
    lineHeight: 26,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default HomeScreen;
