import { useEffect, useState, useRef, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { fonts, layout } from '../../theme/typography';
import { summarizeContent } from '../../services/llmService';
import { saveTextNote, saveAudioNote } from '../../services/notesStorage';
import { ReaderActionsPanel } from '../../components/reader/ReaderActionsPanel';

const HEARD_MAX_MS = 30000;

const EXTRACT_SCRIPT = `
(function() {
  function send() {
    try {
      var title = document.title || '';
      var text = '';
      if (document.body) text = document.body.innerText || '';
      text = (text || '').replace(/\\s+/g, ' ').trim();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ingest_extract',
        title: title,
        text: text.slice(0, 50000)
      }));
    } catch (e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ingest_extract', error: String(e) }));
    }
  }
  send();
  setTimeout(send, 1500);
  true;
})();
`;

export function IngestReaderScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const url = route.params?.url?.trim() ?? '';

  const [pageTitle, setPageTitle] = useState('');
  const [pageText, setPageText] = useState('');
  const [webLoading, setWebLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [sumLoading, setSumLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thoughtOpen, setThoughtOpen] = useState(false);
  const [thoughtDraft, setThoughtDraft] = useState('');
  const [heardActive, setHeardActive] = useState(false);
  const [heardMs, setHeardMs] = useState(0);

  const recordingRef = useRef(null);
  const heardTimerRef = useRef(null);
  const heardStoppingRef = useRef(false);
  const webRef = useRef(null);

  useEffect(() => {
    if (!url) {
      Alert.alert('Reader', 'Missing link.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  }, [url, navigation]);

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

  const onWebMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type !== 'ingest_extract') return;
      if (data.title) setPageTitle((t) => t || data.title);
      if (typeof data.text === 'string' && data.text.length > 0) {
        setPageText((prev) => (data.text.length > prev.length ? data.text : prev));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const displayTitle =
    pageTitle ||
    (() => {
      try {
        return url ? new URL(url).hostname : 'Reader';
      } catch {
        return 'Reader';
      }
    })();

  const speakSource = [pageText, pageTitle, url].filter(Boolean).join('\n\n').slice(0, 12000);

  const onListen = () => {
    const chunk = speakSource.trim() || url;
    if (!chunk) return;
    Speech.stop();
    Speech.speak(chunk, { rate: 0.94, pitch: 1, language: 'en-US' });
  };

  const onStopListen = () => Speech.stop();

  const onSummarize = async () => {
    const body = pageText.trim();
    if (!body) {
      Alert.alert(
        'Summarize',
        'No page text yet — wait for the page to finish loading, or this site may hide text in the reader.'
      );
      return;
    }
    setSumLoading(true);
    try {
      const { summary: s } = await summarizeContent(body);
      setSummary(s);
      await saveTextNote({
        title: `Summary · ${displayTitle}`.slice(0, 120),
        body: `${s}\n\n— Source —\n${url}`,
        meta: { sourceUrl: url, kind: 'ingest_summary' },
      });
      Alert.alert('Saved', 'Summary added to Notes.');
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
    setSaving(true);
    try {
      await saveTextNote({
        title: `Thought · ${displayTitle}`.slice(0, 120),
        body: `${t}\n\n— Source —\n${url}`,
        meta: { sourceUrl: url, kind: 'ingest_thought' },
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
          const name = `heard_ingest_${Date.now()}.m4a`;
          const dest = `${FileSystem.documentDirectory}${name}`;
          await FileSystem.copyAsync({ from: uri, to: dest });
          await saveAudioNote({
            title: `Heard · ${displayTitle}`.slice(0, 120),
            audioUri: dest,
            meta: { sourceUrl: url, kind: 'ingest_heard' },
          });
          Alert.alert('Saved', 'Up to 30s saved to Notes.');
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
      Alert.alert('Recording', 'Could not start recording on this device.');
    }
  };

  if (!url) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.missing}>Invalid link.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.flex}>
        <View style={styles.toolbar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.55 }]}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={22} color={colors.forest800} />
            <Text style={styles.backLabel}>Learn</Text>
          </Pressable>
          <Text style={styles.urlHint} numberOfLines={1}>
            {url}
          </Text>
        </View>

        <View style={styles.actionsWrap}>
          <ReaderActionsPanel
            compact
            onListen={onListen}
            onStopListen={onStopListen}
            onSummarize={onSummarize}
            sumLoading={sumLoading}
            onSaveThought={onSaveThoughtPress}
            saving={saving}
            onSaveHeard={onSaveHeard}
            heardActive={heardActive}
            heardMs={heardMs}
            listenDisabled={!speakSource.trim()}
          />
        </View>

        {!pageText && !webLoading ? (
          <Text style={styles.hintBanner}>
            If Listen/Summarize are weak here, this page may load content with scripts the reader cannot
            read — video and audio still play in the page.
          </Text>
        ) : null}

        {summary ? (
          <View style={styles.summaryPreview}>
            <Text style={styles.summaryPreviewLabel}>Last summary (also in Notes)</Text>
            <Text style={styles.summaryPreviewText} numberOfLines={3}>
              {summary}
            </Text>
          </View>
        ) : null}

        <View style={styles.webWrap}>
          <WebView
            ref={webRef}
            source={{ uri: url }}
            style={styles.web}
            onLoadStart={() => setWebLoading(true)}
            onLoadEnd={() => {
              setWebLoading(false);
              webRef.current?.injectJavaScript(EXTRACT_SCRIPT);
            }}
            onMessage={onWebMessage}
            injectedJavaScript={EXTRACT_SCRIPT}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={Platform.OS === 'ios'}
            setSupportMultipleWindows={false}
            originWhitelist={['*']}
            mixedContentMode="compatibility"
            onError={() => setWebLoading(false)}
            onHttpError={() => setWebLoading(false)}
          />
          {webLoading ? (
            <View style={styles.webLoading} pointerEvents="none">
              <ActivityIndicator color={colors.forest800} />
              <Text style={styles.webLoadingText}>Loading page…</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Modal visible={thoughtOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setThoughtOpen(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Save thought</Text>
            <Text style={styles.modalSub}>What stayed with you? This saves to Notes with the link.</Text>
            <TextInput
              value={thoughtDraft}
              onChangeText={setThoughtDraft}
              placeholder="Your thought…"
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
                <Text style={styles.modalBtnPrimaryText}>{saving ? 'Saving…' : 'Save to Notes'}</Text>
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
  missing: { padding: 24, fontFamily: fonts.body, color: colors.textSecondary },
  toolbar: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.forest800,
    marginLeft: 4,
  },
  urlHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  actionsWrap: {
    paddingHorizontal: layout.pagePadding,
    paddingBottom: 4,
  },
  hintBanner: {
    marginHorizontal: layout.pagePadding,
    marginBottom: 6,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },
  summaryPreview: {
    marginHorizontal: layout.pagePadding,
    marginBottom: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.accentMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryPreviewLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryPreviewText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  webWrap: {
    flex: 1,
    position: 'relative',
  },
  web: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 250, 240, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webLoadingText: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 40, 30, 0.35)',
  },
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
  modalBtnGhost: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
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

export default IngestReaderScreen;
