import { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { getTabBarHeight } from '../../navigation/tabBarMetrics';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { fonts, layout } from '../../theme/typography';
import { RadialKnowledgeGraph } from '../../components/knowledge/RadialKnowledgeGraph';
import { useKnowledgeGraph } from '../../hooks/useKnowledgeGraph';
import { getStoredInterests } from '../../services/localProfileStorage';

export function KnowledgeGraphScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const tabBarH = getTabBarHeight(insets.bottom);
  const { getSubtopicsForInterest, getInterestLabel, source: catalogSource } = useKnowledgeGraph();
  const paramInterestId = route.params?.interestId ?? 'science';
  const [storedInterestIds, setStoredInterestIds] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getStoredInterests().then((ids) => setStoredInterestIds(ids));
    }, [])
  );

  const effectiveInterestId = useMemo(() => {
    if (storedInterestIds === null) return paramInterestId;
    if (!storedInterestIds.length) return null;
    if (storedInterestIds.includes(paramInterestId)) return paramInterestId;
    return storedInterestIds[0];
  }, [storedInterestIds, paramInterestId]);

  const interestId = effectiveInterestId ?? paramInterestId;
  const interestLabel = getInterestLabel(interestId);
  const subtopics = effectiveInterestId ? getSubtopicsForInterest(effectiveInterestId) : [];

  const openTopic = (node) => {
    navigation.navigate('TopicContent', {
      interestId,
      interestLabel,
      subtopicId: node.id,
      subtopicLabel: node.label,
    });
  };

  if (storedInterestIds !== null && storedInterestIds.length === 0) {
    return (
      <SafeAreaView style={styles.safeLight} edges={['top']}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + 32 }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backRow} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color={colors.forest800} />
            <Text style={styles.backLabel}>Learn</Text>
          </Pressable>
          <Text style={styles.title}>No topics yet</Text>
          <Text style={styles.lede}>
            Choose interests first — your graph only shows what you selected.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Interests', { mode: 'edit' })}
            style={styles.primaryLink}
          >
            <Text style={styles.primaryLinkText}>Choose topics</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeDark} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backRowDark, pressed && { opacity: 0.65 }]}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={22} color={colors.onDark} />
          <Text style={styles.backLabelDark}>Learn</Text>
        </Pressable>
        <Text style={styles.immersiveTitle} numberOfLines={1}>
          {interestLabel}
        </Text>
        <View style={{ width: 56 }} />
      </View>
      <Text style={styles.hint}>
        Pinch · pan · tap a branch. Grove is yours to wander.
      </Text>

      <View style={styles.canvasZone}>
        <RadialKnowledgeGraph
          key={`${catalogSource}-${interestId}-${subtopics.length}`}
          immersiveMode
          showImmersiveInPreview={false}
          centerLabel={interestLabel}
          subtopics={subtopics}
          onSelectSubtopic={openTopic}
        />
      </View>

      {subtopics.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={[styles.branchChipScroll, { paddingBottom: tabBarH + 12 }]}
        >
          {subtopics.map((node) => (
            <Pressable
              key={node.id}
              onPress={() => openTopic(node)}
              style={({ pressed }) => [styles.branchChip, pressed && { opacity: 0.88 }]}
            >
              <Text style={styles.branchChipText}>{node.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={{ height: tabBarH }} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeLight: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeDark: {
    flex: 1,
    backgroundColor: colors.forest950,
  },
  scroll: {
    paddingHorizontal: layout.pagePadding,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.pagePadding - 4,
    paddingBottom: 8,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backRowDark: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.forest800,
    marginLeft: 4,
  },
  backLabelDark: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onDark,
    marginLeft: 4,
  },
  immersiveTitle: {
    flex: 1,
    fontFamily: fonts.displaySemibold,
    fontSize: 22,
    color: colors.onDark,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.onDarkMuted,
    paddingHorizontal: layout.pagePadding,
    marginBottom: 8,
  },
  canvasZone: {
    flex: 1,
    minHeight: 380,
    marginHorizontal: 8,
  },
  title: {
    fontFamily: fonts.displaySemibold,
    fontSize: 30,
    color: colors.textDisplay,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  lede: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  branchChipScroll: {
    paddingVertical: 10,
    paddingHorizontal: layout.pagePadding,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,252,247,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,252,247,0.2)',
    marginRight: 8,
  },
  branchChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onDark,
    letterSpacing: 0.2,
  },
  primaryLink: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.mint500,
  },
  primaryLinkText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.forest950,
  },
});

export default KnowledgeGraphScreen;
