import { INTEREST_OPTIONS } from '../data/knowledgeGraphData';

const INTEREST_LABEL = Object.fromEntries(INTEREST_OPTIONS.map((o) => [o.id, o.label]));

const MAX_TOPICS = 6;
const MAX_LEAVES_PER_TOPIC = 6;

/**
 * Resolve a display topic for mind-map grouping from note meta / title.
 */
export function topicForNote(note) {
  const m = note?.meta || {};
  if (note?.type === 'audio') {
    if (m.kind?.includes('ingest') || m.sourceUrl) return 'Heard · links';
    if (m.kind?.includes('foryou')) return 'Heard · For you';
    return 'Heard clips';
  }
  if (m.kind?.includes('foryou') || (m.articleId && String(m.articleId).startsWith('rec-'))) {
    return 'For you';
  }
  if (m.kind?.includes('ingest') || m.sourceUrl) {
    return 'From links';
  }
  if (m.interestLabel) return m.interestLabel;
  if (m.interestId) return INTEREST_LABEL[m.interestId] || m.interestId;
  const t = note?.title || '';
  if (t.includes('·')) {
    const head = t.split('·')[0].replace(/^(Thought|Summary)\s*/i, '').trim();
    if (head.length > 0 && head.length < 36) return head;
  }
  return 'Library';
}

/**
 * @returns {{ topic: string, notes: object[], overflow: number }[]}
 */
export function groupNotesForMindMap(notes) {
  const list = Array.isArray(notes) ? notes : [];
  const map = new Map();
  for (const n of list) {
    const topic = topicForNote(n);
    if (!map.has(topic)) map.set(topic, []);
    map.get(topic).push(n);
  }
  const entries = [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  if (entries.length <= MAX_TOPICS) {
    return entries.map(([topic, arr]) => ({
      topic,
      notes: arr.slice(0, MAX_LEAVES_PER_TOPIC),
      overflow: Math.max(0, arr.length - MAX_LEAVES_PER_TOPIC),
    }));
  }
  const top = entries.slice(0, MAX_TOPICS - 1);
  const rest = entries.slice(MAX_TOPICS - 1).flatMap(([, arr]) => arr);
  return [
    ...top.map(([topic, arr]) => ({
      topic,
      notes: arr.slice(0, MAX_LEAVES_PER_TOPIC),
      overflow: Math.max(0, arr.length - MAX_LEAVES_PER_TOPIC),
    })),
    {
      topic: 'More',
      notes: rest.slice(0, MAX_LEAVES_PER_TOPIC),
      overflow: Math.max(0, rest.length - MAX_LEAVES_PER_TOPIC),
    },
  ];
}
