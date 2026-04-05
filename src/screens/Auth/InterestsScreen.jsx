import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { setStoredInterests, getStoredInterests } from '../../services/localProfileStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { fonts, layout } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

const INTERESTS = [
  { id: 'history', label: 'History' },
  { id: 'psychology', label: 'Psychology' },
  { id: 'music', label: 'Music' },
  { id: 'dance', label: 'Dance' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'science', label: 'Science' },
  { id: 'business', label: 'Business' },
  { id: 'literature', label: 'Literature' },
  { id: 'art', label: 'Art & design' },
  { id: 'nature', label: 'Nature' },
  { id: 'languages', label: 'Languages' },
  { id: 'wellbeing', label: 'Wellbeing' },
];

export function InterestsScreen({ navigation }) {
  const route = useRoute();
  const isEdit = route.params?.mode === 'edit';
  const [picked, setPicked] = useState(() => new Set());

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    getStoredInterests().then((ids) => {
      if (!cancelled && ids.length) setPicked(new Set(ids));
    });
    return () => {
      cancelled = true;
    };
  }, [isEdit]);

  const toggle = (id) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFinish = async () => {
    if (picked.size === 0) return;
    try {
      await setStoredInterests([...picked]);
    } catch {
      /* ignore */
    }
    if (isEdit) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
        {isEdit ? (
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.6 }]}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={22} color={colors.forest800} />
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        ) : null}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Interests</Text>
          <Text style={styles.title}>What pulls your curiosity?</Text>
          <Text style={styles.subtitle}>
            Choose a few. This only steers recommendations — you can refine it anytime.
          </Text>
        </View>

        <View style={styles.grid}>
          {INTERESTS.map((item) => {
            const active = picked.has(item.id);
            return (
              <View key={item.id} style={styles.gridItem}>
                <Card
                  selected={active}
                  onPress={() => toggle(item.id)}
                  contentStyle={styles.chipInner}
                >
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {item.label}
                  </Text>
                </Card>
              </View>
            );
          })}
        </View>

        <Text style={styles.count}>
          {picked.size === 0
            ? 'Select at least one'
            : `${picked.size} selected`}
        </Text>

        <Button
          title={isEdit ? 'Save topics' : 'Enter the app'}
          onPress={handleFinish}
          disabled={picked.size === 0}
          style={styles.cta}
        />
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
    paddingHorizontal: layout.pagePadding,
    paddingBottom: 36,
    paddingTop: 12,
  },
  column: {
    width: '100%',
    maxWidth: layout.contentMax + 40,
    alignSelf: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.forest800,
    marginLeft: 4,
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.displaySemibold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textDisplay,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  chipInner: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  chipLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  chipLabelActive: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textPrimary,
  },
  count: {
    fontFamily: fonts.body,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  cta: {
    marginTop: 4,
  },
});

export default InterestsScreen;
