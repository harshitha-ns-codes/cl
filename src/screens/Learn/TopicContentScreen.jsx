import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getTabBarHeight } from '../../navigation/tabBarMetrics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { fonts, layout, reading } from '../../theme/typography';
import {
  generateTopicContent,
  summarizeContent,
  articleToPlainText,
} from '../../services/llmService';
import { saveTextNote, saveAudioNote } from '../../services/notesStorage';
import { ReaderActionsPanel } from '../../components/reader/ReaderActionsPanel';
import { ReadingProgressBar } from '../../components/reader/ReadingProgressBar';

const HEARD_MAX_MS = 30000;

/**
 * Rolling buffer: we keep a single long-lived recording while this screen is focused.
 * On "Save Heard", we stop and persist the file (Expo cannot trim to last 30s without native code —
 * this captures audio from session start / last start, up to 30s chunks via timed restart in v2).
 *
 * v1 UX: "Save Heard" starts a dedicated clip up to 30s (clear, reliable on Expo).
 */
export function TopicContentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const tabBarH = getTabBarHeight(insets.bottom);
  const {
    interestId = 'science',
    interestLabel = 'Science',
    subtopicId = 'topic',
    subtopicLabel = 'Topic',
  } = route.params ?? {};

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sumLoading, setSumLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heardMs, setHeardMs] = useState(0);
  const [heardActive, setHeardActive] = useState(false);
  const heardTimerRef = useRef(null);
  const recordingRef = useRef(null);
  const heardStoppingRef = useRef(false);
  const [readProgress, setReadProgress] = useState(0);
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [thoughtDraft, setThoughtDraft] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await generateTopicContent({
        interestId,
        interestLabel,
        subtopicId,
        subtopicLabel,
      });
      setArticle(data);
    } catch (e) {
      setErr('Could not load this topic. Try again.');
    } finally {
      setLoading(false);
    }
  }, [interestId, interestLabel, subtopicId, subtopicLabel]);

  useEffect(() => {
    load();
  }, [load]);

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

  const plainBody = article ? articleToPlainText(article) : '';
  const speakText = [
    article?.introduction,
    ...(article?.breakdown?.map((b) => `${b.heading}. ${b.text}`) ?? []),
    ...(article?.keyPoints?.map((k) => k) ?? []),
    summary ? `Summary. ${summary}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const onSummarize = async () => {
    if (!plainBody) return;
    setSumLoading(true);
    try {
      const full = `${plainBody}\n\n${summary ?? ''}`;
      const { summary: s } = await summarizeContent(full);
      setSummary(s);
    } catch {
      Alert.alert('Summarize', 'Something went wrong. Try again.');
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
    if (!article) return;
    setSaving(true);
    try {
      const footer = [
        '— Grove reading —',
        `${subtopicLabel} · ${interestLabel}`,
        article.title ? `Lesson: ${article.title}` : null,
        summary ? `Your summary:\n${summary}` : null,
      ]
        .filter(Boolean)
        .join('\n');
      const body = `${t}\n\n${footer}`;
      await saveTextNote({
        title: `Thought · ${subtopicLabel}`.slice(0, 120),
        body,
        meta: {
          interestId,
          subtopicId,
          subtopicLabel,
          kind: 'grove_thought',
        },
      });
      setThoughtOpen(false);
      setThoughtDraft('');
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
          const name = `heard_${Date.now()}.m4a`;
          const dest = `${FileSystem.documentDirectory}${name}`;
          await FileSystem.copyAsync({ from: uri, to: dest });
          await saveAudioNote({
            title: `Heard · ${subtopicLabel}`,
            audioUri: dest,
            meta: { interestId, subtopicId, subtopicLabel },
          });
          Alert.alert('Saved', 'Audio clip stored in Notes.');
        }
      }
    } catch {
      Alert.alert('Recording', 'Could not finish recording.');
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
      Alert.alert('Microphone', 'Permission is required to record.');
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
      Alert.alert('Recording', 'Could not start. On iOS Simulator recording is not supported.');
    }
  };

  const onListen = () => {
    if (!speakText.trim()) return;
    Speech.stop();
    Speech.speak(speakText, {
      rate: 0.94,
      pitch: 1,
      language: 'en-US',
    });
  };

  const onStopListen = () => Speech.stop();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.flex}>
        <View style={styles.progressWrap}>
          <ReadingProgressBar progress={readProgress} />
        </View>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + 28 }]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            const max = contentSize.height - layoutMeasurement.height;
            if (max <= 0) {
              setReadProgress(0);
              return;
            }
            setReadProgress(Math.min(1, Math.max(0, contentOffset.y / max)));
          }}
        >
          <View style={styles.column}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.55 }]}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={22} color={colors.forest800} />
              <Text style={styles.backLabel}>Graph</Text>
            </Pressable>

            {loading && (
              <View style={styles.centerPad}>
                <ActivityIndicator size="large" color={colors.forest800} />
                <Text style={styles.loadingText}>Composing your lesson…</Text>
              </View>
            )}

            {err && !loading && (
              <Text style={styles.errorText}>{err}</Text>
            )}

            {!loading && article && (
              <>
                <LinearGradient
                  colors={['rgba(232,245,236,0.95)', 'rgba(253,250,240,0.98)']}
                  style={styles.heroCard}
                >
                  <Text style={styles.kicker}>{interestLabel}</Text>
                  <Text style={styles.headline}>{article.title}</Text>
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
                  listenDisabled={!speakText.trim()}
                />

                <View style={styles.section}>
                  <Text style={styles.prose}>{article.introduction}</Text>
                </View>

                {article.breakdown?.map((block) => (
                  <View key={block.heading} style={styles.breakCard}>
                    <Text style={styles.breakTitle}>{block.heading}</Text>
                    <Text style={styles.prose}>{block.text}</Text>
                  </View>
                ))}

                <View style={styles.keyCard}>
                  <Text style={styles.keyHeading}>Key points</Text>
                  {article.keyPoints?.map((k, i) => (
                    <View key={i} style={styles.keyRow}>
                      <View style={styles.keyDot} />
                      <Text style={styles.keyText}>{k}</Text>
                    </View>
                  ))}
                </View>

                {summary && (
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryHeading}>Summary</Text>
                    <Text style={styles.prose}>{summary}</Text>
                  </View>
                )}
              </>
            )}
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
            <Text style={styles.modalSub}>
              {subtopicLabel} · {interestLabel} — saved to Notes with this branch.
            </Text>
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
  progressWrap: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: 4,
    paddingBottom: 6,
  },
  scroll: {
    paddingHorizontal: layout.pagePadding,
    paddingTop: 4,
  },
  column: {
    maxWidth: layout.contentMax + 24,
    width: '100%',
    alignSelf: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginLeft: -4,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.forest800,
    marginLeft: 4,
  },
  centerPad: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 15,
  },
  errorText: {
    fontFamily: fonts.body,
    color: colors.error,
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(20,83,45,0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#14532d',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
    }),
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  headline: {
    fontFamily: fonts.displaySemibold,
    fontSize: 32,
    lineHeight: 38,
    color: colors.textDisplay,
    letterSpacing: -0.5,
  },
  section: { marginBottom: 22 },
  prose: {
    fontFamily: fonts.body,
    fontSize: reading.fontSize,
    lineHeight: reading.lineHeight,
    color: colors.textSecondary,
    letterSpacing: reading.letterSpacing,
  },
  breakCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  breakTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    color: colors.textDisplay,
    marginBottom: 10,
  },
  keyCard: {
    backgroundColor: 'rgba(26, 61, 42, 0.06)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(26, 61, 42, 0.1)',
  },
  keyHeading: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.forest800,
    marginBottom: 14,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  keyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.forest800,
    marginTop: 9,
    opacity: 0.5,
  },
  keyText: {
    flex: 1,
    marginLeft: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: colors.creamMuted,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryHeading: {
    fontFamily: fonts.displaySemibold,
    fontSize: 22,
    color: colors.textDisplay,
    marginBottom: 10,
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

export default TopicContentScreen;
