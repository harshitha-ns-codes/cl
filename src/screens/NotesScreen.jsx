import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getTabBarHeight } from '../navigation/tabBarMetrics';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { getAllNotes } from '../services/notesStorage';
import { NotesMindMap } from '../components/notes/NotesMindMap';
import { topicForNote } from '../utils/groupNotesByTopic';

export function NotesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarH = getTabBarHeight(insets.bottom);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [detailNote, setDetailNote] = useState(null);
  const soundRef = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await getAllNotes();
    setNotes(list);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      };
    }, [refresh])
  );

  const stopPlayback = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
        /* ignore */
      }
      soundRef.current = null;
    }
    setPlayingId(null);
  };

  const playAudio = async (id, uri) => {
    await stopPlayback();
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      setPlayingId(id);
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) {
          stopPlayback();
        }
      });
      await sound.playAsync();
    } catch {
      setPlayingId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Pressable onPress={() => setDetailNote(item)}>
        <View style={styles.cardTop}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.type === 'audio'
                ? 'Heard'
                : item.meta?.kind === 'ingest_summary' || item.meta?.kind === 'foryou_summary'
                  ? 'Summary'
                  : 'Thought'}
            </Text>
          </View>
          <Text style={styles.topicPill}>{topicForNote(item)}</Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.type === 'text' && item.body ? (
          <Text style={styles.cardBody} numberOfLines={6}>
            {item.body}
          </Text>
        ) : null}
      </Pressable>
      {item.type === 'audio' && item.audioUri ? (
        <Pressable
          onPress={() =>
            playingId === item.id ? stopPlayback() : playAudio(item.id, item.audioUri)
          }
          style={({ pressed }) => [styles.playRow, pressed && { opacity: 0.8 }]}
        >
          <Ionicons
            name={playingId === item.id ? 'stop-circle' : 'play-circle'}
            size={28}
            color={colors.forest800}
          />
          <Text style={styles.playLabel}>
            {playingId === item.id ? 'Stop' : 'Play clip'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <Text style={styles.subtitle}>
          Mind map by topic — tap a leaf to open. Switch to list for full history.
        </Text>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setViewMode('map')}
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnOn]}
          >
            <Ionicons
              name="git-network-outline"
              size={18}
              color={viewMode === 'map' ? colors.onAccent : colors.forest800}
            />
            <Text style={[styles.toggleLabel, viewMode === 'map' && styles.toggleLabelOn]}>
              Map
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('list')}
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnOn]}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={viewMode === 'list' ? colors.onAccent : colors.forest800}
            />
            <Text style={[styles.toggleLabel, viewMode === 'list' && styles.toggleLabelOn]}>
              List
            </Text>
          </Pressable>
        </View>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.forest800} />
        </View>
      ) : viewMode === 'map' ? (
        <ScrollView
          contentContainerStyle={[styles.mapScroll, { paddingBottom: tabBarH + 24 }]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <NotesMindMap notes={notes} onSelectNote={setDetailNote} bottomInset={tabBarH} />
          <Text style={styles.mapHint}>
            Branches follow where you saved from (Grove topic, For you, links, or heard clips).
            “+N more” means open List to see the rest.
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarH + 24 }]}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nothing saved yet. Use Learn → Grove, For you, or Ingest to build your map.
            </Text>
          }
        />
      )}

      <Modal
        visible={!!detailNote}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailNote(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDetailNote(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTopic}>{detailNote ? topicForNote(detailNote) : ''}</Text>
              <Pressable onPress={() => setDetailNote(null)} hitSlop={12}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.modalTitle}>{detailNote?.title}</Text>
            <Text style={styles.modalDate}>
              {detailNote
                ? new Date(detailNote.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : ''}
            </Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {detailNote?.type === 'text' && detailNote.body ? (
                <Text style={styles.modalBody}>{detailNote.body}</Text>
              ) : null}
              {detailNote?.type === 'audio' && detailNote.audioUri ? (
                <Pressable
                  onPress={() =>
                    detailNote && (playingId === detailNote.id
                      ? stopPlayback()
                      : playAudio(detailNote.id, detailNote.audioUri))
                  }
                  style={styles.modalPlay}
                >
                  <Ionicons
                    name={playingId === detailNote?.id ? 'stop-circle' : 'play-circle'}
                    size={36}
                    color={colors.forest800}
                  />
                  <Text style={styles.modalPlayLabel}>
                    {playingId === detailNote?.id ? 'Stop' : 'Play recording'}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    fontFamily: fonts.displaySemibold,
    fontSize: 30,
    color: colors.textDisplay,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    letterSpacing: 0.1,
    marginBottom: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.creamMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  toggleBtnOn: {
    backgroundColor: colors.forest800,
    borderColor: colors.forest900,
  },
  toggleLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  toggleLabelOn: {
    color: colors.onAccent,
  },
  loader: { paddingTop: 40, alignItems: 'center' },
  mapScroll: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  mapHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textAlign: 'center',
  },
  list: { paddingHorizontal: 28 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#14532d',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: { elevation: 3 },
    }),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.accentMuted,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.forest800,
    textTransform: 'uppercase',
  },
  topicPill: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    maxWidth: '55%',
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cardBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  playLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.forest800,
    marginLeft: 10,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 40, 30, 0.4)',
  },
  modalSheet: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalTopic: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.forest800,
    flex: 1,
    paddingRight: 8,
  },
  modalTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textDisplay,
    marginBottom: 6,
  },
  modalDate: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
  },
  modalScroll: {
    maxHeight: 420,
  },
  modalBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textPrimary,
  },
  modalPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  modalPlayLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.forest800,
  },
});

export default NotesScreen;
