import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import colors from '../../theme/colors';
import { fonts } from '../../theme/typography';

const tapSpring = { damping: 20, stiffness: 400, mass: 0.42 };

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

function IconWell({ children, active }) {
  return (
    <View style={[styles.iconWell, active && styles.iconWellActive]}>{children}</View>
  );
}

/**
 * Glass reader chrome: Listen / Stop, Summarize / Save thought, Save heard.
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
  const heardSeconds = Math.min(30, Math.ceil(heardMs / 1000));
  const heardLabel = heardActive
    ? `Recording · ${heardSeconds}s — tap to save`
    : 'Save heard · up to 30s';

  const pad = compact ? 14 : 18;
  const tileMinH = compact ? 76 : 86;

  const inner = (
    <>
      <LinearGradient
        colors={['rgba(255,252,247,0.72)', 'rgba(240,236,228,0.5)', 'rgba(255,252,247,0.55)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.innerPad, { padding: pad }]}>
        <Text style={[styles.kicker, compact && styles.kickerCompact]}>Reader tools</Text>
        <Text style={[styles.subline, compact && styles.sublineCompact]}>
          Listen, summarize, or save without leaving the page.
        </Text>

        {/* Primary: listen + stop as one balanced bar */}
        <View style={[styles.listenBar, compact && styles.listenBarCompact]}>
          <GlassPressable
            onPress={onListen}
            disabled={listenDisabled}
            style={[
              styles.listenMain,
              compact && styles.listenMainCompact,
              listenDisabled && styles.disabledTile,
            ]}
          >
            <LinearGradient
              colors={[colors.forest700, colors.forest800, colors.forest900]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.listenMainInner, compact && styles.listenMainInnerCompact]}>
              <View style={styles.listenIconCircle}>
                <Ionicons
                  name="volume-high"
                  size={compact ? 16 : 18}
                  color={colors.onAccent}
                />
              </View>
              <Text style={[styles.listenTitle, compact && styles.listenTitleCompact]}>
                Listen
              </Text>
            </View>
          </GlassPressable>

          <GlassPressable
            onPress={onStopListen}
            style={[styles.stopTile, compact && styles.stopTileCompact]}
          >
            <View style={styles.stopIconCircle}>
              <Ionicons name="stop" size={compact ? 16 : 17} color={colors.forest800} />
            </View>
            <Text style={[styles.stopTileLabel, compact && styles.stopTileLabelCompact]}>Stop</Text>
          </GlassPressable>
        </View>

        {/* Secondary: equal tiles */}
        <View style={[styles.tileRow, { minHeight: tileMinH }]}>
          <GlassPressable
            onPress={onSummarize}
            disabled={sumLoading}
            style={[
              styles.tile,
              compact && styles.tileCompact,
              sumLoading && styles.disabledTile,
            ]}
          >
            <IconWell active={sumLoading}>
              <Ionicons
                name={sumLoading ? 'hourglass-outline' : 'sparkles'}
                size={22}
                color={colors.forest800}
              />
            </IconWell>
            <Text style={[styles.tileLabel, compact && styles.tileLabelCompact]} numberOfLines={2}>
              {sumLoading ? 'Working…' : 'Summarize'}
            </Text>
          </GlassPressable>

          <GlassPressable
            onPress={onSaveThought}
            disabled={saving}
            style={[
              styles.tile,
              compact && styles.tileCompact,
              saving && styles.disabledTile,
            ]}
          >
            <IconWell active={saving}>
              <Ionicons
                name={saving ? 'hourglass-outline' : 'bookmark-outline'}
                size={22}
                color={colors.forest800}
              />
            </IconWell>
            <Text style={[styles.tileLabel, compact && styles.tileLabelCompact]} numberOfLines={2}>
              {saving ? 'Saving…' : 'Save thought'}
            </Text>
          </GlassPressable>
        </View>

        {/* Capture */}
        <GlassPressable
          onPress={onSaveHeard}
          style={[
            styles.heardTile,
            compact && styles.heardTileCompact,
            heardActive && styles.heardTileRecording,
          ]}
        >
          <View style={[styles.iconWell, heardActive && styles.iconWellRecording]}>
            <Ionicons
              name={heardActive ? 'mic' : 'mic-outline'}
              size={22}
              color={heardActive ? colors.onAccent : colors.forest800}
            />
          </View>
          <View style={styles.heardTextCol}>
            <Text
              style={[
                styles.heardTitle,
                heardActive && styles.heardTitleOn,
                compact && styles.heardTitleCompact,
              ]}
            >
              {heardActive ? 'Recording' : 'Save heard'}
            </Text>
            <Text
              style={[
                styles.heardCaption,
                heardActive && styles.heardCaptionOn,
                compact && styles.heardCaptionCompact,
              ]}
              numberOfLines={2}
            >
              {heardLabel}
            </Text>
          </View>
          {heardActive ? (
            <View style={styles.recDot} />
          ) : (
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          )}
        </GlassPressable>
      </View>
    </>
  );

  return (
    <View style={[styles.outer, compact && styles.outerCompact]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={34} tint="light" style={styles.blur}>
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
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26, 61, 42, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: colors.forest900,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
    }),
  },
  outerCompact: {
    borderRadius: 20,
  },
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurAndroid: {
    backgroundColor: 'rgba(252, 250, 245, 0.94)',
  },
  innerPad: {
    position: 'relative',
  },
  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.forest800,
    opacity: 0.75,
    marginBottom: 6,
  },
  kickerCompact: {
    fontSize: 9,
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  subline: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginBottom: 18,
  },
  sublineCompact: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  listenBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    marginBottom: 12,
  },
  listenBarCompact: {
    gap: 6,
    marginBottom: 10,
  },
  listenMain: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,252,247,0.22)',
    justifyContent: 'center',
  },
  listenMainCompact: {
    minHeight: 44,
    borderRadius: 12,
  },
  listenMainInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  listenMainInnerCompact: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  listenIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,252,247,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.onAccent,
    letterSpacing: 0.15,
  },
  listenTitleCompact: {
    fontSize: 14,
  },
  stopTile: {
    width: 68,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(26, 61, 42, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  stopTileCompact: {
    width: 62,
    borderRadius: 12,
    paddingVertical: 5,
    gap: 3,
  },
  stopIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(26, 61, 42, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopTileLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  stopTileLabelCompact: {
    fontSize: 9,
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(26, 61, 42, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWellActive: {
    backgroundColor: 'rgba(94, 184, 138, 0.2)',
  },
  iconWellRecording: {
    backgroundColor: 'rgba(255,252,247,0.16)',
  },
  tileRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tile: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(26, 61, 42, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 10,
  },
  tileCompact: {
    borderRadius: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tileLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 17,
  },
  tileLabelCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
  heardTile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(26, 61, 42, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 14,
  },
  heardTileCompact: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  heardTileRecording: {
    backgroundColor: colors.forest800,
    borderColor: 'rgba(255,252,247,0.2)',
  },
  heardTextCol: {
    flex: 1,
  },
  heardTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  heardTitleCompact: {
    fontSize: 13,
  },
  heardTitleOn: {
    color: colors.onAccent,
  },
  heardCaption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    marginTop: 2,
  },
  heardCaptionCompact: {
    fontSize: 11,
    lineHeight: 15,
  },
  heardCaptionOn: {
    color: 'rgba(246,244,239,0.8)',
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mint300,
  },
  disabledTile: {
    opacity: 0.48,
  },
});

export default ReaderActionsPanel;
