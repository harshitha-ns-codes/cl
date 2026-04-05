import { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { groupNotesForMindMap } from '../../utils/groupNotesByTopic';
import colors from '../../theme/colors';
import { fonts } from '../../theme/typography';

/** Pastel branch colors — reference: soft purple, peach, teal, coral */
const BRANCH_COLORS = [
  { fill: '#e9d5ff', border: '#a78bfa', line: 'rgba(109, 40, 217, 0.35)' },
  { fill: '#ffedd5', border: '#fb923c', line: 'rgba(194, 65, 12, 0.35)' },
  { fill: '#ccfbf1', border: '#2dd4bf', line: 'rgba(15, 118, 110, 0.35)' },
  { fill: '#fce7f3', border: '#f472b6', line: 'rgba(157, 23, 77, 0.3)' },
  { fill: '#e0e7ff', border: '#818cf8', line: 'rgba(67, 56, 202, 0.3)' },
  { fill: '#fef3c7', border: '#fbbf24', line: 'rgba(180, 83, 9, 0.35)' },
  { fill: '#d1fae5', border: '#34d399', line: 'rgba(5, 122, 85, 0.3)' },
];

const CENTER_W = 128;
const CENTER_H = 56;
const TOPIC_W = 100;
const TOPIC_H = 44;
const LEAF_W = 92;
const LEAF_H = 36;

function orbit(cx, cy, n, radius, start = -Math.PI / 2) {
  if (n <= 0) return [];
  return Array.from({ length: n }, (_, i) => {
    const a = start + (i * 2 * Math.PI) / n;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  });
}

/**
 * Hub mind map: center → topic nodes → note leaves. Tap a leaf to open detail.
 */
export function NotesMindMap({ notes, onSelectNote, bottomInset = 0 }) {
  const { width: winW } = useWindowDimensions();
  const canvasW = Math.min(winW - 16, 400);
  const canvasH = Math.min(520, Math.max(420, 360 + bottomInset * 0.15));
  const cx = canvasW / 2;
  const cy = canvasH / 2 - 8;

  const groups = useMemo(() => groupNotesForMindMap(notes), [notes]);

  const layout = useMemo(() => {
    const r1 = Math.min(canvasW, canvasH) * 0.26;
    const r2 = Math.min(canvasW, canvasH) * 0.2;
    const topicPts = orbit(cx, cy, groups.length || 1, r1);
    const edges = [];
    const topicBoxes = [];
    const leafBoxes = [];

    groups.forEach((g, i) => {
      const tp = topicPts[i] || { x: cx, y: cy - r1 };
      const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
      topicBoxes.push({
        key: `t-${g.topic}`,
        topic: g.topic,
        left: tp.x - TOPIC_W / 2,
        top: tp.y - TOPIC_H / 2,
        width: TOPIC_W,
        height: TOPIC_H,
        color,
      });
      edges.push({
        x1: cx,
        y1: cy,
        x2: tp.x,
        y2: tp.y,
        stroke: color.line,
      });

      const nLeaves = g.notes.length + (g.overflow > 0 ? 1 : 0);
      const leafPts = orbit(tp.x, tp.y, Math.max(nLeaves, 1), r2, -Math.PI / 2 + (i * 0.35));
      g.notes.forEach((note, j) => {
        const lp = leafPts[j] || tp;
        const label =
          note.title?.length > 22 ? `${note.title.slice(0, 20)}…` : note.title || 'Note';
        leafBoxes.push({
          key: note.id,
          note,
          label,
          left: lp.x - LEAF_W / 2,
          top: lp.y - LEAF_H / 2,
          width: LEAF_W,
          height: LEAF_H,
          color,
        });
        edges.push({
          x1: tp.x,
          y1: tp.y,
          x2: lp.x,
          y2: lp.y,
          stroke: color.line,
        });
      });
      if (g.overflow > 0) {
        const j = g.notes.length;
        const lp = leafPts[j] || { x: tp.x, y: tp.y + r2 };
        leafBoxes.push({
          key: `more-${g.topic}`,
          note: null,
          label: `+${g.overflow} more`,
          left: lp.x - LEAF_W / 2,
          top: lp.y - LEAF_H / 2,
          width: LEAF_W,
          height: LEAF_H,
          color,
          isOverflow: true,
        });
        edges.push({
          x1: tp.x,
          y1: tp.y,
          x2: lp.x,
          y2: lp.y,
          stroke: color.line,
        });
      }
    });

    return { edges, topicBoxes, leafBoxes };
  }, [groups, canvasW, canvasH, cx, cy]);

  if (!notes?.length) {
    return (
      <View style={[styles.emptyWrap, { minHeight: canvasH }]}>
        <Text style={styles.emptyText}>
          Save thoughts, summaries, or heard clips — your map will grow by topic.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hScroll}
      nestedScrollEnabled
    >
      <View style={[styles.shell, { width: canvasW, minHeight: canvasH }]}>
        <Svg width={canvasW} height={canvasH} style={StyleSheet.absoluteFill}>
          {layout.edges.map((e, idx) => (
            <Line
              key={`e-${idx}`}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={e.stroke}
              strokeWidth={2}
              strokeLinecap="round"
            />
          ))}
        </Svg>

        <View
          style={[
            styles.centerNode,
            {
              left: cx - CENTER_W / 2,
              top: cy - CENTER_H / 2,
              width: CENTER_W,
              height: CENTER_H,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.centerLabel}>Your notes</Text>
          <Text style={styles.centerHint}>map</Text>
        </View>

        {layout.topicBoxes.map((b) => (
          <View
            key={b.key}
            style={[
              styles.topicNode,
              {
                left: b.left,
                top: b.top,
                width: b.width,
                height: b.height,
                backgroundColor: b.color.fill,
                borderColor: b.color.border,
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.topicText} numberOfLines={2}>
              {b.topic}
            </Text>
          </View>
        ))}

        {layout.leafBoxes.map((b) => (
          <Pressable
            key={b.key}
            onPress={() => {
              if (b.isOverflow || !b.note) return;
              onSelectNote?.(b.note);
            }}
            style={({ pressed }) => [
              styles.leafNode,
              {
                left: b.left,
                top: b.top,
                width: b.width,
                height: b.height,
                backgroundColor: b.color.fill,
                borderColor: b.color.border,
                opacity: b.isOverflow ? 0.75 : pressed ? 0.88 : 1,
              },
            ]}
            disabled={b.isOverflow}
          >
            <Text style={styles.leafText} numberOfLines={2}>
              {b.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hScroll: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  shell: {
    position: 'relative',
    backgroundColor: '#fdfaf0',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(20, 83, 45, 0.12)',
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#14532d',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
    }),
  },
  centerNode: {
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: '#ddd6fe',
    borderWidth: 2,
    borderColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  centerLabel: {
    fontFamily: fonts.displaySemibold,
    fontSize: 13,
    color: '#4c1d95',
    letterSpacing: 0.3,
  },
  centerHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: '#6d28d9',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topicNode: {
    position: 'absolute',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  topicText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  leafNode: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
  },
  leafText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },
  emptyWrap: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdfaf0',
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotesMindMap;
