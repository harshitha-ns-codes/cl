import { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import Svg from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import colors from '../../theme/colors';
import { fonts, layout } from '../../theme/typography';
import { GroveVeinTexture } from './GroveVeinTexture';
import { PulsingEdge } from './PulsingEdge';
import { GroveSatelliteNode } from './GroveSatelliteNode';
import { GroveBranchPreviewSheet } from './GroveBranchPreviewSheet';
import { ImmersiveGroveCanvas } from './ImmersiveGroveCanvas';

const CENTER_SIZE_FULL = 124;
const CENTER_SIZE_EMB = 104;
const SAT_W = 112;
const SAT_H = 48;
const GRAPH_H_FULL = 440;
const GRAPH_H_EMBEDDED = 368;

const ringSpring = { damping: 22, stiffness: 200, mass: 0.75 };
const centerSpring = { damping: 20, stiffness: 220, mass: 0.6 };

function computeOrbit(cx, cy, n, radius) {
  if (n <= 0) return [];
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      x: cx + radius * Math.cos(angle) - SAT_W / 2,
      y: cy + radius * Math.sin(angle) - SAT_H / 2,
      lx: cx + radius * Math.cos(angle),
      ly: cy + radius * Math.sin(angle),
    };
  });
}

/**
 * Living grove map: spring ring, pulsing edges, elastic node pull, optional preview sheet.
 * By default, tapping a branch calls onSelectSubtopic immediately (TopicContent / LLM reading).
 * Set enableNodePreview to show the bottom sheet first (Generate reading / Immersive).
 */
export function RadialKnowledgeGraph({
  centerLabel,
  subtopics = [],
  onSelectSubtopic,
  embedded = false,
  enableNodePreview = false,
  showImmersiveInPreview = true,
  onOpenImmersive,
  /** Larger canvas + pinch/pan wrapper (fullscreen grove). */
  immersiveMode = false,
}) {
  const graphH = embedded ? GRAPH_H_EMBEDDED : GRAPH_H_FULL;
  const centerSz = embedded ? CENTER_SIZE_EMB : CENTER_SIZE_FULL;
  const [ringOpen, setRingOpen] = useState(true);
  const [previewNode, setPreviewNode] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { width: winW } = useWindowDimensions();
  const inset = embedded ? 40 : layout.pagePadding * 2;
  const safeW = Math.max(320, Math.floor(winW) || 360);
  const canvasW = Math.max(280, Math.min(safeW - inset, 400));
  const canvasWFinal = immersiveMode ? Math.min(Math.max(safeW - 24, 320), 540) : canvasW;
  const cx = canvasWFinal / 2;
  const cy = graphH / 2;
  const orbitR = Math.min(canvasWFinal, graphH) * (immersiveMode ? 0.38 : 0.36);

  const ringProgress = useSharedValue(1);
  const centerScale = useSharedValue(1);

  useEffect(() => {
    ringProgress.value = withSpring(ringOpen ? 1 : 0, ringSpring);
  }, [ringOpen, ringProgress]);

  const nodes = Array.isArray(subtopics) && subtopics.length > 0 ? subtopics : [];

  const positions = useMemo(
    () => computeOrbit(cx, cy, nodes.length, orbitR),
    [cx, cy, nodes.length, orbitR]
  );

  const edgeStyle = useAnimatedStyle(() => ({
    opacity: ringProgress.value * 0.95,
  }));

  const satShellStyle = useAnimatedStyle(() => ({
    opacity: ringProgress.value,
    transform: [{ scale: 0.9 + ringProgress.value * 0.1 }],
  }));

  const centerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerScale.value }],
  }));

  const toggleRing = () => {
    centerScale.value = withSpring(0.94, centerSpring, () => {
      centerScale.value = withSpring(1, centerSpring);
    });
    setRingOpen((o) => !o);
  };

  const handleNodeTap = (node) => {
    if (enableNodePreview) {
      setPreviewNode(node);
      setSheetOpen(true);
    } else {
      onSelectSubtopic?.(node);
    }
  };

  const graphInner = (
    <View
      style={[
        styles.shell,
        { minHeight: graphH, height: graphH },
        immersiveMode && styles.shellImmersive,
      ]}
      collapsable={false}
    >
      <View style={styles.bgClip} pointerEvents="none" collapsable={false}>
        <LinearGradient
          colors={
            immersiveMode
              ? [colors.groveCanvas, colors.groveCanvasMid, colors.forest900]
              : [colors.forest850, colors.forest800, colors.forest700]
          }
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <GroveVeinTexture width={canvasWFinal} height={graphH} opacity={immersiveMode ? 0.22 : 0.12} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.12)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      <View
        style={[styles.canvas, { width: canvasWFinal, height: graphH }]}
        collapsable={false}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, { zIndex: 1 }, edgeStyle]}
          pointerEvents="none"
          collapsable={false}
        >
          <Svg width={canvasWFinal} height={graphH}>
            {positions.map((p, i) => (
              <PulsingEdge
                key={`e-${nodes[i]?.id ?? i}`}
                x1={cx}
                y1={cy}
                x2={p.lx}
                y2={p.ly}
                delay={i * 180}
                strokeBase={colors.groveEdge}
              />
            ))}
          </Svg>
        </Animated.View>

        {nodes.map((node, i) => {
          const pos = positions[i];
          if (!pos) return null;
          return (
            <Animated.View
              key={node.id}
              pointerEvents={ringOpen ? 'auto' : 'none'}
              style={[
                {
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: SAT_W,
                  height: SAT_H,
                  zIndex: 10,
                },
                satShellStyle,
              ]}
              collapsable={false}
            >
              <GroveSatelliteNode
                node={node}
                style={StyleSheet.absoluteFill}
                onCommitTap={() => handleNodeTap(node)}
              />
            </Animated.View>
          );
        })}

        <Animated.View
          style={[
            centerAnimStyle,
            {
              position: 'absolute',
              left: cx - centerSz / 2,
              top: cy - centerSz / 2,
              width: centerSz,
              height: centerSz,
              zIndex: 20,
            },
          ]}
        >
          <Pressable
            onPress={toggleRing}
            style={styles.centerPress}
            android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
          >
            <LinearGradient
              colors={[colors.mint500, colors.forest800, colors.forest900]}
              style={styles.centerGradient}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.9, y: 1 }}
            >
              <Text
                style={[styles.centerLabel, { fontSize: embedded ? 15 : 17 }]}
                numberOfLines={2}
              >
                {centerLabel || 'Topic'}
              </Text>
              <Text style={styles.centerHint}>{ringOpen ? 'Fold branches' : 'Grow branches'}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {nodes.length === 0 && (
          <View style={[styles.emptyHint, { top: cy + centerSz / 2 + 12 }]} pointerEvents="none">
            <Text style={styles.emptyHintText}>No subtopics for this interest.</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.root, immersiveMode && styles.rootImmersive]}>
      {immersiveMode ? <ImmersiveGroveCanvas>{graphInner}</ImmersiveGroveCanvas> : graphInner}

      <GroveBranchPreviewSheet
        visible={sheetOpen}
        node={previewNode}
        onClose={() => {
          setSheetOpen(false);
          setPreviewNode(null);
        }}
        onGenerateReading={(node) => {
          if (node) onSelectSubtopic?.(node);
        }}
        onOpenImmersive={onOpenImmersive}
        showImmersiveAction={showImmersiveInPreview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  rootImmersive: {
    flex: 1,
    minHeight: 360,
  },
  shell: {
    width: '100%',
    borderRadius: 26,
    backgroundColor: colors.groveCanvas,
    position: 'relative',
    ...Platform.select({
      ios: {
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
      },
      android: {
        overflow: 'hidden',
        elevation: 6,
      },
    }),
  },
  shellImmersive: {
    borderRadius: 20,
    minHeight: GRAPH_H_FULL,
  },
  bgClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    overflow: 'hidden',
  },
  canvas: {
    alignSelf: 'center',
    marginVertical: 4,
    zIndex: 2,
  },
  centerPress: {
    flex: 1,
    borderRadius: 999,
  },
  centerGradient: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  centerLabel: {
    fontFamily: fonts.displaySemibold,
    fontSize: 16,
    color: colors.onDark,
    textAlign: 'center',
    lineHeight: 20,
  },
  centerHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.onDarkMuted,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  emptyHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  emptyHintText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onDarkMuted,
  },
});

export default RadialKnowledgeGraph;
