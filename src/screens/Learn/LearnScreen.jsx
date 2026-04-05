import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getTabBarHeight } from '../../navigation/tabBarMetrics';
import colors from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { PressableScale } from '../../components/ui/PressableScale';
import { RadialKnowledgeGraph } from '../../components/knowledge/RadialKnowledgeGraph';
import { tagColorsForTagString } from '../../theme/interestTagColors';
import { useKnowledgeGraph } from '../../hooks/useKnowledgeGraph';
import { getStoredInterests, getSeenArticleIds } from '../../services/localProfileStorage';
import { getRecommendedArticles } from '../../services/recommendationEngine';

/** Short labels so row tabs are not truncated on narrow phones */
const SECTIONS = [
  { id: 'grove', label: 'Grove', a11yLabel: 'Knowledge Grove' },
  { id: 'ingest', label: 'Ingest', a11yLabel: 'Ingest' },
  { id: 'foryou', label: 'For you', a11yLabel: 'For You' },
];

function normalizeIngestUrl(input) {
  const t = String(input ?? '').trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Learn hub: three calm top sections (tabs) switching body content.
 * Tree, reader, and recommendations will plug in later.
 */
export function LearnScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const tabBarHeight = getTabBarHeight(insets.bottom);
  const grovePagerRef = useRef(null);
  /** Page width matches horizontal padding (24 × 2) in scroll content. */
  const grovePageWidth = Math.max(280, winW - 48);
  const {
    interestOptions,
    getSubtopicsForInterest,
    getInterestLabel,
    loading: catalogLoading,
    error: catalogError,
    source: catalogSource,
  } = useKnowledgeGraph();
  const [active, setActive] = useState('grove');
  const [url, setUrl] = useState('');
  const [graphInterest, setGraphInterest] = useState('science');
  const [forYouFeed, setForYouFeed] = useState([]);
  const [storedInterestIds, setStoredInterestIds] = useState(null);
  const appVersion = Constants.expoConfig?.version ?? '—';

  /** Only topics the user picked in onboarding (or Profile → Edit topics). */
  const myInterestOptions = useMemo(() => {
    if (storedInterestIds === null) return null;
    const allowed = new Set(storedInterestIds);
    return interestOptions.filter((o) => allowed.has(o.id));
  }, [interestOptions, storedInterestIds]);

  useEffect(() => {
    if (!myInterestOptions?.length) return;
    if (!myInterestOptions.some((i) => i.id === graphInterest)) {
      setGraphInterest(myInterestOptions[0].id);
    }
  }, [myInterestOptions, graphInterest]);

  useEffect(() => {
    if (route.params?.section === 'foryou') {
      setActive('foryou');
    }
  }, [route.params?.section]);

  const refreshForYou = useCallback(async () => {
    try {
      const interests = await getStoredInterests();
      const seen = await getSeenArticleIds();
      if (!interests.length) {
        setForYouFeed([]);
        return;
      }
      setForYouFeed(getRecommendedArticles(interests, seen));
    } catch (e) {
      if (__DEV__) console.warn('[LearnScreen] For you feed', e);
      setForYouFeed([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshForYou();
      getStoredInterests().then((ids) => setStoredInterestIds(ids));
    }, [refreshForYou])
  );

  const openTopicForInterest = useCallback(
    (interestId, node) => {
      if (!node?.id) return;
      navigation.navigate('TopicContent', {
        interestId,
        interestLabel: getInterestLabel(interestId),
        subtopicId: node.id,
        subtopicLabel: node.label,
      });
    },
    [navigation, getInterestLabel]
  );

  const scrollGroveToInterestId = useCallback(
    (interestId) => {
      if (!myInterestOptions?.length) return;
      const idx = myInterestOptions.findIndex((o) => o.id === interestId);
      if (idx < 0) return;
      grovePagerRef.current?.scrollToOffset({
        offset: idx * grovePageWidth,
        animated: true,
      });
    },
    [myInterestOptions, grovePageWidth]
  );

  const openIngestReader = () => {
    const normalized = normalizeIngestUrl(url);
    if (!normalized) {
      Alert.alert('Link needed', 'Paste a valid web address (e.g. https://example.com or a video page).');
      return;
    }
    navigation.navigate('IngestReader', { url: normalized });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + 28 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        bounces
      >
        <Text style={styles.screenTitle}>Learn</Text>
        <Text style={styles.screenSubtitle}>Grow in the margins of your day.</Text>

        {/* Top section tabs — soft green, paper-like */}
        <View style={styles.tabRow}>
          {SECTIONS.map((s) => {
            const on = active === s.id;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={s.a11yLabel}
                onPress={() => setActive(s.id)}
                style={({ pressed }) => [
                  styles.tab,
                  on && styles.tabOn,
                  pressed && styles.tabPressed,
                ]}
              >
                <Text style={[styles.tabText, on && styles.tabTextOn]} numberOfLines={2}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.panel}>
          {active === 'grove' && (
            <>
              <Card contentStyle={styles.panelInner}>
                <Text style={styles.panelTitle}>Knowledge Grove</Text>
                <Text style={styles.panelBody}>
                  Each selected topic has its own map. Swipe the graphs horizontally (or tap a chip)
                  to switch. Tap a branch for a generated reading — or open fullscreen for the current
                  topic.
                </Text>
                <View style={styles.catalogStatusRow}>
                  {catalogLoading ? (
                    <ActivityIndicator size="small" color={colors.forest800} style={styles.catalogSpinner} />
                  ) : null}
                  <Text style={styles.catalogStatusText}>
                    {catalogLoading
                      ? 'Loading catalog…'
                      : catalogSource === 'supabase'
                        ? 'Catalog: Supabase'
                        : 'Catalog: built-in (add .env for live data)'}
                  </Text>
                  <Text style={styles.buildStamp}> · v{appVersion}</Text>
                </View>
                {catalogError ? (
                  <Text style={styles.catalogErrorText}>{catalogError}</Text>
                ) : null}
                <Text style={styles.chipLegend}>Your topics</Text>
                {myInterestOptions === null ? (
                  <View style={styles.interestLoading}>
                    <ActivityIndicator size="small" color={colors.forest800} />
                    <Text style={styles.interestLoadingText}>Loading your picks…</Text>
                  </View>
                ) : myInterestOptions.length === 0 ? (
                  <View style={styles.emptyInterests}>
                    <Text style={styles.emptyInterestsText}>
                      No topics selected yet. Choose a few so your grove and For you feed match what
                      you care about.
                    </Text>
                    <Button
                      title="Choose topics"
                      onPress={() => navigation.navigate('Interests', { mode: 'edit' })}
                      style={styles.emptyInterestsBtn}
                    />
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipScroll}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {myInterestOptions.map((opt) => {
                      const on = graphInterest === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => {
                            setGraphInterest(opt.id);
                            scrollGroveToInterestId(opt.id);
                          }}
                          style={({ pressed }) => [
                            styles.chip,
                            on && styles.chipOn,
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <Text style={[styles.chipText, on && styles.chipTextOn]}>{opt.label}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}
                <Button
                  title="Fullscreen graph"
                  variant="secondary"
                  disabled={!myInterestOptions?.length}
                  onPress={() =>
                    navigation.navigate('KnowledgeGraph', { interestId: graphInterest })
                  }
                  style={styles.graphCta}
                />
              </Card>

              <View style={styles.graphBlock} collapsable={false}>
                <Text style={styles.graphBlockTitle}>Topic maps</Text>
                {!myInterestOptions?.length ? (
                  <View style={styles.graphPlaceholder}>
                    <Text style={styles.placeholderText}>
                      Your radial map appears here once you have at least one selected topic.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.groveSwipeHint}>Swipe sideways · one graph per topic</Text>
                    <FlatList
                      ref={grovePagerRef}
                      key={myInterestOptions.map((o) => o.id).join('|')}
                      data={myInterestOptions}
                      keyExtractor={(item) => item.id}
                      horizontal
                      pagingEnabled
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      showsHorizontalScrollIndicator
                      decelerationRate="fast"
                      style={{ width: grovePageWidth, alignSelf: 'center' }}
                      onMomentumScrollEnd={(e) => {
                        const idx = Math.round(
                          e.nativeEvent.contentOffset.x / grovePageWidth
                        );
                        const opt = myInterestOptions[idx];
                        if (opt) setGraphInterest(opt.id);
                      }}
                      getItemLayout={(_, index) => ({
                        length: grovePageWidth,
                        offset: grovePageWidth * index,
                        index,
                      })}
                      renderItem={({ item }) => {
                        const subs = getSubtopicsForInterest(item.id);
                        return (
                          <View style={[styles.groveSlide, { width: grovePageWidth }]}>
                            <Text style={styles.groveSlideTitle}>{getInterestLabel(item.id)}</Text>
                            <RadialKnowledgeGraph
                              key={`${catalogSource}-${item.id}-${subs.length}`}
                              embedded
                              centerLabel={getInterestLabel(item.id)}
                              subtopics={subs}
                              onSelectSubtopic={(node) => openTopicForInterest(item.id, node)}
                              showImmersiveInPreview
                              onOpenImmersive={() =>
                                navigation.navigate('KnowledgeGraph', { interestId: item.id })
                              }
                            />
                            {subs.length > 0 ? (
                              <>
                                <Text style={styles.branchListLegend}>Explore branches</Text>
                                <ScrollView
                                  horizontal
                                  nestedScrollEnabled
                                  showsHorizontalScrollIndicator={false}
                                  keyboardShouldPersistTaps="handled"
                                  contentContainerStyle={styles.branchChipScroll}
                                >
                                  {subs.map((node) => (
                                    <Pressable
                                      key={node.id}
                                      onPress={() => openTopicForInterest(item.id, node)}
                                      style={({ pressed }) => [
                                        styles.branchChip,
                                        pressed && { opacity: 0.88 },
                                      ]}
                                    >
                                      <Text style={styles.branchChipText}>{node.label}</Text>
                                    </Pressable>
                                  ))}
                                </ScrollView>
                              </>
                            ) : null}
                          </View>
                        );
                      }}
                    />
                    <View style={styles.groveDots}>
                      {myInterestOptions.map((o) => {
                        const on = graphInterest === o.id;
                        return (
                          <View
                            key={o.id}
                            style={[styles.groveDot, on && styles.groveDotOn]}
                          />
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            </>
          )}

          {active === 'ingest' && (
            <Card contentStyle={styles.panelInner}>
              <Text style={styles.panelTitle}>Ingest</Text>
              <Text style={styles.panelBody}>
                Open a link below the address bar: Listen, Summarize, Save thought, and Save heard
                stay visible above the page so you never hunt for them.
              </Text>
              <Text style={styles.fieldLabel}>Page or media URL</Text>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://"
                placeholderTextColor={colors.textPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.urlInput}
              />
              <View style={styles.actionStack}>
                <Button title="Open in reader" onPress={openIngestReader} />
              </View>
            </Card>
          )}

          {active === 'foryou' && (
            <View style={styles.forYouWrap}>
              <Card contentStyle={styles.panelInner}>
                <Text style={styles.panelTitle}>For you</Text>
                <Text style={styles.panelBody}>
                  Articles are ranked using only your selected interests. Open a card — Listen,
                  Summarize, Save thought, and Save heard sit right under the title.
                </Text>
              </Card>
              <FlatList
                data={forYouFeed}
                keyExtractor={(item) => item.articleId}
                scrollEnabled={false}
                contentContainerStyle={styles.forYouList}
                ListEmptyComponent={
                  <View style={styles.forYouEmpty}>
                    <Text style={styles.placeholderText}>
                      {storedInterestIds && storedInterestIds.length === 0
                        ? 'Choose topics in Profile (or tap Choose topics in Grove) to see recommendations.'
                        : 'Nothing to show yet — pull to focus Learn or add more interests.'}
                    </Text>
                  </View>
                }
                renderItem={({ item, index }) => (
                  <PressableScale
                    onPress={() =>
                      navigation.navigate('RecommendedArticle', { article: item })
                    }
                    style={styles.recCard}
                  >
                    <LinearGradient
                      colors={index % 2 === 0 ? ['#e8f5ec', '#fdfaf0'] : ['#f0ebe3', '#fdfaf0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.recGradient}
                    >
                      <View style={styles.recTop}>
                        <Text style={styles.recSource}>{item.sourceLabel}</Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.forest800} />
                      </View>
                      <Text style={styles.recTitle}>{item.title}</Text>
                      <Text style={styles.recExcerpt} numberOfLines={3}>
                        {item.excerpt}
                      </Text>
                      <View style={styles.recMeta}>
                        <Text style={styles.recTime}>{item.readTimeMin} min</Text>
                        {item.tags?.slice(0, 2).map((t) => {
                          const tc = tagColorsForTagString(t);
                          return (
                            <View
                              key={t}
                              style={[
                                styles.recTag,
                                {
                                  backgroundColor: tc.bg,
                                  borderColor: tc.border,
                                },
                              ]}
                            >
                              <Text style={[styles.recTagText, { color: tc.text }]}>{t}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </LinearGradient>
                  </PressableScale>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 8,
  },
  screenTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 30,
    color: colors.textDisplay,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 22,
    letterSpacing: 0.1,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.creamMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabOn: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.selectedBorder,
  },
  tabPressed: {
    opacity: 0.92,
  },
  tabText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.2,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  tabTextOn: {
    color: colors.textPrimary,
  },
  panel: {
    minHeight: 280,
  },
  panelInner: {
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  panelTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 22,
    color: colors.textDisplay,
    marginBottom: 8,
  },
  panelBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  placeholderBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingVertical: 36,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  forYouWrap: {
    width: '100%',
  },
  forYouList: {
    paddingBottom: 8,
    gap: 12,
  },
  recCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.forest800,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: { elevation: 3 },
    }),
  },
  recGradient: {
    padding: 18,
  },
  recTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recSource: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  recTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.textDisplay,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  recExcerpt: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  recMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  recTime: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.forest800,
  },
  recTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  recTagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
  },
  fieldLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  urlInput: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    marginBottom: 18,
  },
  actionStack: {
    gap: 12,
  },
  chipLegend: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },
  chipScroll: {
    paddingVertical: 4,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.creamMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipOn: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.selectedBorder,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  chipTextOn: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
  graphCta: {
    marginTop: 12,
    marginBottom: 0,
  },
  catalogStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  catalogSpinner: {
    marginRight: 8,
  },
  catalogStatusText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.forest800,
    letterSpacing: 0.2,
  },
  buildStamp: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  catalogErrorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  graphBlock: {
    marginTop: 20,
    width: '100%',
  },
  graphBlockTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 12,
  },
  branchListLegend: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 8,
  },
  branchChipScroll: {
    paddingVertical: 2,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginRight: 8,
  },
  branchChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  groveSwipeHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  groveSlide: {
    paddingBottom: 8,
  },
  groveSlideTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 17,
    color: colors.textDisplay,
    marginBottom: 10,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  groveDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  groveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  groveDotOn: {
    width: 22,
    backgroundColor: colors.forest800,
  },
  interestLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    marginBottom: 8,
  },
  interestLoadingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyInterests: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  emptyInterestsText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  emptyInterestsBtn: {
    alignSelf: 'flex-start',
  },
  graphPlaceholder: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingVertical: 36,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
  },
  forYouEmpty: {
    paddingVertical: 28,
    paddingHorizontal: 8,
  },
});

export default LearnScreen;
