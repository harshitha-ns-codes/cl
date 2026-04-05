import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import colors from '../../theme/colors';
import { fonts } from '../../theme/typography';

const tapSpring = { damping: 18, stiffness: 420, mass: 0.4 };

function GlassPressable({ children, style, onPress, disabled }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) s.value = withSpring(0.97, tapSpring);
      }}
      onPressOut={() => {
        s.value = withSpring(1, tapSpring);
      }}
    >
      <Animated.View style={[style, a]}>{children}</Animated.View>
    </Pressable>
  );
}

/**
 * Glass-morphic actions: Listen, Summarize, Save thought, Save heard.
 */
export function ReaderActionsPanel({
  onListen,
  onStopListen,
  onSummarize,
  sumLoading,
  onSaveThought,
  saving,
  onSaveHeard,
  heardActive,
  heardMs,
  listenDisabled = false,
  compact = false,
}) {
  const heardLabel = heardActive
    ? `Recording ${Math.min(30, Math.ceil(heardMs / 1000))}s · tap to save`
    : 'Save heard (≤30s)';

  const inner = (
    <>
      <LinearGradient
        colors={['rgba(255,252,247,0.5)', 'rgba(246,244,239,0.35)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.innerPad}>
        <Text style={[styles.panelTitle, compact && styles.panelTitleCompact]}>Listen & capture</Text>
        <Text style={[styles.panelHint, compact && styles.panelHintCompact]}>
          Listen, distill, and save — without leaving the reading flow.
        </Text>

        <View style={styles.listenRow}>
          <GlassPressable
            onPress={onListen}
            disabled={listenDisabled}
            style={[
              styles.listenPrimary,
              compact && styles.listenPrimaryCompact,
              listenDisabled && { opacity: 0.45 },
            ]}
          >
            <Ionicons name="headset" size={compact ? 20 : 24} color={colors.onAccent} />
            <Text style={[styles.listenPrimaryText, compact && styles.listenPrimaryTextCompact]}>
              Listen
            </Text>
          </GlassPressable>
          <GlassPressable onPress={onStopListen} style={[styles.stopBtn, compact && styles.stopBtnCompact]}>
            <Ionicons name="stop-circle" size={compact ? 22 : 26} color={colors.forest800} />
            <Text style={[styles.stopLabel, compact && styles.stopLabelCompact]}>Stop</Text>
          </GlassPressable>
        </View>

        <View style={styles.grid}>
          <GlassPressable
            onPress={onSummarize}
            disabled={sumLoading}
            style={[styles.cell, compact && styles.cellCompact, sumLoading && { opacity: 0.5 }]}
          >
            <Ionicons name="sparkles-outline" size={22} color={colors.forest800} />
            <Text style={[styles.cellLabel, compact && styles.cellLabelCompact]} numberOfLines={2}>
              {sumLoading ? 'Summarizing…' : 'Summarize'}
            </Text>
          </GlassPressable>
          <GlassPressable
            onPress={onSaveThought}
            disabled={saving}
            style={[styles.cell, compact && styles.cellCompact, saving && { opacity: 0.5 }]}
          >
            <Ionicons name="create-outline" size={22} color={colors.forest800} />
            <Text style={[styles.cellLabel, compact && styles.cellLabelCompact]} numberOfLines={2}>
              {saving ? 'Saving…' : 'Save thought'}
            </Text>
          </GlassPressable>
        </View>

        <GlassPressable
          onPress={onSaveHeard}
          style={[
            styles.heardRow,
            compact && styles.heardRowCompact,
            heardActive && styles.heardRowActive,
          ]}
        >
          <Ionicons
            name={heardActive ? 'mic' : 'mic-outline'}
            size={22}
            color={heardActive ? colors.onAccent : colors.forest800}
          />
          <Text
            style={[
              styles.heardLabel,
              heardActive && styles.heardLabelOn,
              compact && styles.heardLabelCompact,
            ]}
            numberOfLines={2}
          >
            {heardLabel}
          </Text>
        </GlassPressable>
      </View>
    </>
  );

  return (
    <View style={[styles.outer, compact && styles.outerCompact]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={28} tint="light" style={styles.blur}>
          {inner}
        </BlurView>
      ) : (
        <View style={[styles.blur, styles.blurAndroid]}>{inner}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: colors.forest900,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 5 },
    }),
  },
  outerCompact: {
    borderRadius: 18,
  },
  blur: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurAndroid: {
    backgroundColor: 'rgba(255, 252, 247, 0.88)',
  },
  innerPad: {
    padding: 18,
    position: 'relative',
  },
  panelTitle: {
    fontFamily: fonts.displaySemibold,
    fontSize: 20,
    color: colors.textDisplay,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  panelTitleCompact: {
    fontSize: 17,
  },
  panelHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  panelHintCompact: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  listenRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginBottom: 12,
  },
  listenPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.forest800,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,252,247,0.2)',
  },
  listenPrimaryCompact: {
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  listenPrimaryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 17,
    color: colors.onAccent,
    letterSpacing: 0.3,
  },
  listenPrimaryTextCompact: {
    fontSize: 15,
  },
  stopBtn: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,252,247,0.65)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: 4,
  },
  stopBtnCompact: {
    width: 76,
    borderRadius: 14,
  },
  stopLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  stopLabelCompact: {
    fontSize: 11,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  cell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,252,247,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cellCompact: {
    paddingVertical: 11,
    paddingHorizontal: 10,
    gap: 8,
  },
  cellLabel: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  cellLabelCompact: {
    fontSize: 13,
  },
  heardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,252,247,0.5)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  heardRowCompact: {
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  heardRowActive: {
    backgroundColor: colors.forest800,
    borderColor: 'rgba(255,252,247,0.2)',
  },
  heardLabel: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  heardLabelCompact: {
    fontSize: 13,
  },
  heardLabelOn: {
    color: colors.onAccent,
  },
});

export default ReaderActionsPanel;
