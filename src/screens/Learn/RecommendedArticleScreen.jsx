import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { fonts, layout } from '../../theme/typography';
import { getTabBarHeight } from '../../navigation/tabBarMetrics';
import { summarizeContent } from '../../services/llmService';
import { saveTextNote, saveAudioNote } from '../../services/notesStorage';
import {
  markArticleSeen,
  addLocalBookmark,
  getLocalBookmarks,
  removeLocalBookmark,
  getOrCreateUserId,
} from '../../services/localProfileStorage';
import { recordReadingSession } from '../../services/localReadingStats';
import { postHistory, postBookmark, deleteBookmark, isApiConfigured } from '../../services/apiClient';
import { ReaderActionsPanel } from '../../components/reader/ReaderActionsPanel';

const HEARD_MAX_MS = 30000;

export function RecommendedArticleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const tabBarH = getTabBarHeight(insets.bottom);

  const article = route.params?.article;
  const articleId = article?.articleId ?? '';
  const title = article?.title ?? 'Article';
  const body = article?.body ?? '';
  const excerpt = article?.excerpt ?? '';
  const readTimeMin = article?.readTimeMin ?? 5;
  const tags = article?.tags ?? [];
  const sourceLabel = article?.sourceLabel ?? '';
  const url = article?.url ?? '';

  const [summary, setSummary] = useState('');
  const [sumLoading, setSumLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [thoughtDraft, setThoughtDraft] = useState('');
  const [heardActive, setHeardActive] = useState(false);
  const [heardMs, setHeardMs] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);

  const recordingRef = useRef(null);
  const heardTimerRef = useRef(null);
  const heardStoppingRef = useRef(false);
  const sessionStartRef = useRef(null);

  const plainForSpeech = [excerpt, body].filter(Boolean).join('\n\n').slice(0, 12000);

  useFocusEffect(
    useCallback(() => {
      sessionStartRef.current = Date.now();
      markArticleSeen(articleId).catch(() => {});
      getLocalBookmarks().then((list) => {
        setBookmarked(list.some((b) => b.articleId === articleId));
      });
      return () => {
        const start = sessionStartRef.current;
        if (start && articleId) {
          const secs = Math.round((Date.now() - start) / 1000);
          if (secs >= 3) {
            recordReadingSession({ articleId, title, timeSpentSeconds: secs });
            getOrCreateUserId().then((uid) => {
              postHistory({
                user_id: uid,
                article_id: articleId,
                title,
                time_spent: secs,
              });
            });
          }
        }
      };
    }, [articleId, title])
  );

  useEffect(() => {
    return () => {
      Speech.stop();
      if (heardTimerRef.current) clearInterval(heardTimerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  const toggleBookmark = async () => {
    if (!articleId) return;
    const uid = await getOrCreateUserId();
    if (bookmarked) {
      await removeLocalBookmark(articleId);
      if (isApiConfigured()) await deleteBookmark(uid, articleId);
      setBookmarked(false);
    } else {
      await addLocalBookmark({ articleId, title, url });
      if (isApiConfigured()) {
        await postBookmark({ user_id: uid, article_id: articleId, title, url });
      }
      setBookmarked(true);
      Alert.alert('Bookmarked', 'Saved to your list on Profile.');
    }
  };

  const onListen = () => {
    if (!plainForSpeech.trim()) return;
    Speech.stop();
    Speech.speak(plainForSpeech, { rate: 0.94, pitch: 1, language: 'en-US' });
  };

  const onStopListen = () => Speech.stop();

  const onSummarize = async () => {
    if (!body.trim()) return;
    setSumLoading(true);
    try {
      const { summary: s } = await summarizeContent(body);
      setSummary(s);
      await saveTextNote({
        title: `Summary · ${title}`.slice(0, 120),
        body: `${s}\n\n— Source —\n${sourceLabel}${url ? `\n${url}` : ''}`,
        meta: { articleId, kind: 'foryou_summary' },
      });
      Alert.alert('Saved', 'Summary stored in Notes.');
    } catch {
      Alert.alert('Summarize', 'Something went wrong.');
    } finally {
      setSumLoading(false);
    }
  };

  const onSaveThoughtPress = () => {
    setThoughtDraft('');
    setThoughtOpen(true);
  };

  const onConfirmThought = async () => {
    const t = thoughtDraft.trim();
    if (!t) {
      Alert.alert('Thought', 'Write something first.');
      return;
    }
    setSaving(true);
    try {
      await saveTextNote({
        title: `Thought · ${title}`.slice(0, 120),
        body: `${t}\n\n— From For you —\n${title}${url ? `\n${url}` : ''}`,
        meta: { articleId, kind: 'foryou_thought' },
      });
      setThoughtOpen(false);
      Alert.alert('Saved', 'Added to Notes.');
    } catch {
      Alert.alert('Save', 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const stopHeardRecording = async (save) => {
    if (heardStoppingRef.current) return;
    heardStoppingRef.current = true;
    if (heardTimerRef.current) {
      clearInterval(heardTimerRef.current);
      heardTimerRef.current = null;
    }
    setHeardActive(false);
    setHeardMs(0);
    const rec = recordingRef.current;
    recordingRef.current = null;
    try {
      if (rec) {
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI();
        if (save && uri) {
          const name = `heard_foryou_${Date.now()}.m4a`;
          const dest = `${FileSystem.documentDirectory}${name}`;
          await FileSystem.copyAsync({ from: uri, to: dest });
          await saveAudioNote({
            title: `Heard · ${title}`.slice(0, 120),
            audioUri: dest,
            meta: { articleId, kind: 'foryou_heard' },
          });
          Alert.alert('Saved', 'Up to 30s saved to Notes.');
        }
      }
    } catch {
      Alert.alert('Recording', 'Could not finish.');
    } finally {
      heardStoppingRef.current = false;
    }
  };

  const onSaveHeard = async () => {
    if (heardActive) {
      await stopHeardRecording(true);
      return;
    }
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Microphone', 'Permission required.');
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setHeardActive(true);
      setHeardMs(0);
      let elapsedSec = 0;
      heardTimerRef.current = setInterval(async () => {
        elapsedSec += 1;
        setHeardMs(elapsedSec * 1000);
        if (elapsedSec * 1000 >= HEARD_MAX_MS) {
          if (heardTimerRef.current) {
            clearInterval(heardTimerRef.current);
            heardTimerRef.current = null;
          }
          await stopHeardRecording(true);
        }
      }, 1000);
    } catch {
      Alert.alert('Recording', 'Could not start.');
    }
  };

  if (!article) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.miss}>Missing article.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + 28 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.column}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.55 }]}
                hitSlop={12}
              >
                <Ionicons name="chevron-back" size={22} color={colors.forest800} />
                <Text style={styles.backLabel}>For you</Text>
              </Pressable>
              <Pressable onPress={toggleBookmark} style={styles.iconBtn} hitSlop={12}>
                <Ionicons
                  name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={colors.forest800}
                />
              </Pressable>
            </View>

            <LinearGradient
              colors={['rgba(232,245,236,0.95)', 'rgba(253,250,240,0.98)']}
              style={styles.hero}
            >
              <Text style={styles.kicker}>{sourceLabel}</Text>
              <Text style={styles.headline}>{title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{readTimeMin} min read</Text>
                {tags.slice(0, 3).map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <ReaderActionsPanel
              onListen={onListen}
              onStopListen={onStopListen}
              onSummarize={onSummarize}
              sumLoading={sumLoading}
              onSaveThought={onSaveThoughtPress}
              saving={saving}
              onSaveHeard={onSaveHeard}
              heardActive={heardActive}
              heardMs={heardMs}
              listenDisabled={!plainForSpeech.trim()}
            />

            {excerpt ? (
              <Text style={styles.excerpt}>{excerpt}</Text>
            ) : null}

            <Text style={styles.prose}>{body}</Text>

            {summary ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryHeading}>Summary</Text>
                <Text style={styles.prose}>{summary}</Text>
              </View>
            ) : null}

            {url ? (
              <Pressable
                onPress={() => Linking.openURL(url).catch(() => {})}
                style={styles.linkOut}
              >
                <Text style={styles.linkOutText}>Open original link</Text>
                <Ionicons name="open-outline" size={18} color={colors.forest800} />
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </View>

      <Modal visible={thoughtOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setThoughtOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Save thought</Text>
            <Text style={styles.modalSub}>Saved to Notes with this pick.</Text>
            <TextInput
              value={thoughtDraft}
              onChangeText={setThoughtDraft}
              placeholder="What stayed with you?"
              placeholderTextColor={colors.textPlaceholder}
              multiline
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setThoughtOpen(false)} style={styles.modalBtnGhost}>
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={onConfirmThought}
                disabled={saving}
                style={({ pressed }) => [
                  styles.modalBtnPrimary,
                  pressed && { opacity: 0.9 },
                  saving && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.modalBtnPrimaryText}>{saving ? 'Saving…' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  miss: { padding: 24, fontFamily: fonts.body, color: colors.textSecondary },
  scroll: { paddingHorizontal: layout.pagePadding, paddingTop: 4 },
  column: { maxWidth: layout.contentMax + 24, width: '100%', alignSelf: 'center' },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.forest800,
    marginLeft: 4,
  },
  iconBtn: { padding: 4 },
  hero: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  headline: {
    fontFamily: fonts.displaySemibold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textDisplay,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tagText: { fontFamily: fonts.bodyMedium, fontSize: 11, color: colors.textPrimary },
  excerpt: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 25,
    color: colors.textSecondary,
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  prose: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 28,
    color: colors.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  summaryCard: {
    backgroundColor: colors.creamMuted,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryHeading: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    color: colors.textDisplay,
    marginBottom: 8,
  },
  linkOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  linkOutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.forest800,
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(20, 40, 30, 0.35)' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modalTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 22,
    color: colors.textDisplay,
    marginBottom: 6,
  },
  modalSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  modalInput: {
    minHeight: 120,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    padding: 14,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  modalBtnGhost: { paddingVertical: 12, paddingHorizontal: 16 },
  modalBtnGhostText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
  modalBtnPrimary: {
    backgroundColor: colors.forest900,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  modalBtnPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.onAccent,
  },
});

export default RecommendedArticleScreen;
