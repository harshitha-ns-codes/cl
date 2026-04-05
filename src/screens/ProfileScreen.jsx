import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getTabBarHeight } from '../navigation/tabBarMetrics';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import {
  getDisplayProfile,
  setDisplayProfile,
  getStoredInterests,
  getLocalBookmarks,
  removeLocalBookmark,
  getOrCreateUserId,
} from '../services/localProfileStorage';
import { getLocalStreak } from '../services/localStreak';
import { getLocalReadingAnalytics } from '../services/localReadingStats';
import { getProfileSummary, isApiConfigured } from '../services/apiClient';
import { signOutLocalSession } from '../services/sessionSignOut';
import { resetToOnboarding } from '../navigation/resetToOnboarding';
import { INTEREST_OPTIONS } from '../data/knowledgeGraphData';

const INTEREST_LABEL = Object.fromEntries(
  INTEREST_OPTIONS.map((o) => [o.id, o.label])
);

function initialsFromName(name) {
  const t = (name || 'R').trim();
  if (!t) return '?';
  return t.slice(0, 1).toUpperCase();
}

export function ProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarH = getTabBarHeight(insets.bottom);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [streak, setStreak] = useState(0);
  const [interests, setInterests] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [analytics, setAnalytics] = useState({
    total_time_spent: 0,
    articles_read: 0,
    avg_time_per_article: 0,
  });
  const [remoteSummary, setRemoteSummary] = useState(null);

  const load = useCallback(async () => {
    try {
      const [p, uid, st, intr, bm, a] = await Promise.all([
        getDisplayProfile(),
        getOrCreateUserId(),
        getLocalStreak(),
        getStoredInterests(),
        getLocalBookmarks(),
        getLocalReadingAnalytics(),
      ]);
      setName(p?.name ?? 'Reader');
      setEmail(p?.email ?? '');
      setUserId(uid ?? '');
      setStreak(typeof st?.streak === 'number' ? st.streak : 0);
      setInterests(Array.isArray(intr) ? intr : []);
      setBookmarks(Array.isArray(bm) ? bm : []);
      setAnalytics(
        a && typeof a === 'object'
          ? {
              total_time_spent: Number(a.total_time_spent) || 0,
              articles_read: Number(a.articles_read) || 0,
              avg_time_per_article: Number(a.avg_time_per_article) || 0,
            }
          : {
              total_time_spent: 0,
              articles_read: 0,
              avg_time_per_article: 0,
            }
      );

      if (isApiConfigured() && uid) {
        const remote = await getProfileSummary(uid);
        setRemoteSummary(remote && typeof remote === 'object' ? remote : null);
      } else {
        setRemoteSummary(null);
      }
    } catch {
      setInterests([]);
      setBookmarks([]);
      setRemoteSummary(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const saveProfile = async () => {
    try {
      await setDisplayProfile({ name: name.trim() || 'Reader', email: email.trim() });
      Alert.alert('Saved', 'Profile updated on this device.');
      load();
    } catch {
      Alert.alert('Error', 'Could not save.');
    }
  };

  const removeBookmark = async (articleId) => {
    await removeLocalBookmark(articleId);
    setBookmarks(await getLocalBookmarks());
  };

  const interestList = Array.isArray(interests) ? interests : [];
  const minsRead = Math.round(analytics.total_time_spent / 60);

  const onSignOut = () => {
    Alert.alert(
      'Sign out',
      'Clears this device: profile, selected topics, bookmarks, streak, and reading history. Your saved Notes stay. You can sign in again from the welcome screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutLocalSession();
            } catch {
              Alert.alert('Error', 'Could not complete sign out.');
              return;
            }
            resetToOnboarding(navigation);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={['#14532d', '#166534', '#22c55e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEyebrow}>Profile</Text>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarLetter}>{initialsFromName(name)}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{name.trim() || 'Reader'}</Text>
          {email ? <Text style={styles.heroEmail}>{email}</Text> : null}
        </LinearGradient>

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Account</Text>
          <Text style={styles.sheetHint}>Stored on this device</Text>
          <Text style={styles.idLine} numberOfLines={1} selectable>
            {userId}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Display name"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email (optional)"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Pressable onPress={saveProfile} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.92 }]}>
            <Text style={styles.saveBtnText}>Save changes</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={22} color={colors.forest800} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="bookmark-outline" size={22} color={colors.forest800} />
            <Text style={styles.statValue}>{bookmarks.length}</Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={22} color={colors.forest800} />
            <Text style={styles.statValue}>{analytics.articles_read}</Text>
            <Text style={styles.statLabel}>Reads</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Your focus</Text>
            <Pressable
              onPress={() => navigation.navigate('Interests', { mode: 'edit' })}
              style={({ pressed }) => [styles.editChip, pressed && { opacity: 0.85 }]}
            >
              <Ionicons name="pencil" size={14} color={colors.forest800} />
              <Text style={styles.editChipText}>Edit topics</Text>
            </Pressable>
          </View>
          {interestList.length === 0 ? (
            <Text style={styles.muted}>No topics yet — they power your grove and For you feed.</Text>
          ) : (
            <View style={styles.chipWrap}>
              {interestList.map((id) => (
                <View key={id} style={styles.chip}>
                  <Text style={styles.chipText}>{INTEREST_LABEL[id] || id}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reading</Text>
          <View style={styles.readingCard}>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Time reading</Text>
              <Text style={styles.readingValue}>{minsRead} min</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Articles opened</Text>
              <Text style={styles.readingValue}>{analytics.articles_read}</Text>
            </View>
            <View style={styles.readingRow}>
              <Text style={styles.readingLabel}>Avg. time / article</Text>
              <Text style={styles.readingValue}>{analytics.avg_time_per_article}s</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bookmarks</Text>
          {bookmarks.filter((b) => b && b.articleId != null).length === 0 ? (
            <Text style={styles.muted}>Save articles from For you — they show up here.</Text>
          ) : (
            bookmarks
              .filter((b) => b && b.articleId != null)
              .map((b) => (
                <View key={String(b.articleId)} style={styles.bmCard}>
                  <View style={styles.bmCardBody}>
                    <Text style={styles.bmTitle} numberOfLines={2}>
                      {b.title ?? 'Untitled'}
                    </Text>
                    {b.url ? (
                      <Pressable onPress={() => Linking.openURL(b.url).catch(() => {})}>
                        <Text style={styles.bmLink} numberOfLines={1}>
                          Open link
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <Pressable onPress={() => removeBookmark(b.articleId)} hitSlop={10} style={styles.bmTrash}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </Pressable>
                </View>
              ))
          )}
        </View>

        {remoteSummary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synced summary</Text>
            <View style={styles.serverCard}>
              <Text style={styles.serverPreview} selectable>
                {remoteSummary.bookmarks_count != null
                  ? `Bookmarks on server: ${remoteSummary.bookmarks_count}\n`
                  : ''}
                {remoteSummary.streak != null && remoteSummary.streak !== ''
                  ? `Streak (server): ${remoteSummary.streak}\n`
                  : ''}
                {remoteSummary.analytics?.articles_read != null
                  ? `Articles read: ${remoteSummary.analytics.articles_read}`
                  : 'Connected to your API.'}
              </Text>
            </View>
          </View>
        ) : isApiConfigured() ? (
          <Text style={styles.mutedFoot}>Could not load server profile. Check that the API is running.</Text>
        ) : (
          <View style={styles.apiFoot}>
            <Ionicons name="cloud-outline" size={20} color={colors.textMuted} />
            <Text style={styles.apiFootText}>
              Optional: set EXPO_PUBLIC_API_URL to sync history and bookmarks with your backend.
            </Text>
          </View>
        )}

        <View style={styles.signOutSection}>
          <Pressable
            onPress={onSignOut}
            style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.88 }]}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
          <Text style={styles.signOutHint}>
            Returns to the welcome flow and clears local account data on this device.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 0 },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 52,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  avatarRing: {
    padding: 3,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 14,
  },
  avatarInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#fdfaf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.displaySemibold,
    fontSize: 36,
    color: colors.forest900,
  },
  heroName: {
    fontFamily: fonts.displaySemibold,
    fontSize: 26,
    color: '#fff',
    letterSpacing: -0.3,
  },
  heroEmail: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
  sheet: {
    marginTop: -36,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
    }),
  },
  sheetTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    color: colors.textDisplay,
    marginBottom: 4,
  },
  sheetHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
  },
  idLine: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 14,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 10,
    backgroundColor: colors.creamMuted,
  },
  saveBtn: {
    backgroundColor: colors.forest900,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.onAccent,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: colors.creamMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 6,
  },
  statValue: {
    fontFamily: fonts.displaySemibold,
    fontSize: 22,
    color: colors.textDisplay,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 18,
    color: colors.textDisplay,
    letterSpacing: -0.2,
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  editChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.forest800,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  readingCard: {
    borderRadius: 16,
    backgroundColor: colors.creamMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readingLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
  },
  readingValue: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textDisplay,
  },
  bmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 12,
  },
  bmCardBody: {
    flex: 1,
  },
  bmTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bmLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.forest800,
  },
  bmTrash: {
    padding: 4,
  },
  serverCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.creamMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  serverPreview: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  mutedFoot: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  apiFoot: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.creamMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  apiFootText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  signOutSection: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(185, 28, 28, 0.35)',
    backgroundColor: 'rgba(254, 242, 242, 0.6)',
  },
  signOutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.error,
  },
  signOutHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
  },
});

export default ProfileScreen;
