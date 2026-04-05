import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { fonts, layout } from '../../theme/typography';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

const DURATIONS = [
  { id: '10', label: '10 min', hint: 'A single focused stretch' },
  { id: '20', label: '20 min', hint: 'Room for a chapter or two' },
  { id: '30', label: '30 min', hint: 'A satisfying session' },
  { id: '45', label: '45 min', hint: 'Deeper dives' },
  { id: '60+', label: '60+ min', hint: 'Long commutes or quiet evenings' },
];

export function CommuteScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  const handleContinue = () => {
    if (!selected) return;
    navigation.navigate('Interests');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Your rhythm</Text>
            <Text style={styles.title}>How long is your usual commute?</Text>
            <Text style={styles.subtitle}>
              We use this to suggest lengths that fit naturally — never to rush you.
            </Text>
          </View>

          <View style={styles.list}>
            {DURATIONS.map((item) => (
              <Card
                key={item.id}
                selected={selected === item.id}
                onPress={() => setSelected(item.id)}
                style={styles.cardOuter}
                contentStyle={styles.cardInner}
              >
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardHint}>{item.hint}</Text>
              </Card>
            ))}
          </View>

          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
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
    maxWidth: layout.contentMax,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 28,
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
  list: {
    gap: 12,
    marginBottom: 28,
  },
  cardOuter: {
    marginBottom: 0,
  },
  cardInner: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  cardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  cardHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  cta: {
    marginTop: 8,
  },
});

export default CommuteScreen;
