/**
 * Subtle tag tints keyed by interest id — calm, not candy.
 */
const FALLBACK = { bg: 'rgba(26, 61, 42, 0.08)', border: 'rgba(26, 61, 42, 0.12)', text: '#2a302c' };

const MAP = {
  science: { bg: 'rgba(45, 90, 120, 0.1)', border: 'rgba(45, 90, 120, 0.18)', text: '#2c4a5c' },
  history: { bg: 'rgba(120, 85, 55, 0.1)', border: 'rgba(120, 85, 55, 0.2)', text: '#5c4330' },
  psychology: { bg: 'rgba(95, 70, 110, 0.1)', border: 'rgba(95, 70, 110, 0.18)', text: '#4a3d52' },
  philosophy: { bg: 'rgba(70, 75, 95, 0.1)', border: 'rgba(70, 75, 95, 0.18)', text: '#3d4250' },
  business: { bg: 'rgba(55, 95, 85, 0.1)', border: 'rgba(55, 95, 85, 0.18)', text: '#2d4540' },
  literature: { bg: 'rgba(110, 75, 65, 0.1)', border: 'rgba(110, 75, 65, 0.18)', text: '#4a3832' },
  music: { bg: 'rgba(75, 55, 95, 0.1)', border: 'rgba(75, 55, 95, 0.16)', text: '#42344d' },
  art: { bg: 'rgba(120, 95, 55, 0.1)', border: 'rgba(120, 95, 55, 0.18)', text: '#524328' },
  nature: { bg: 'rgba(55, 110, 75, 0.1)', border: 'rgba(55, 110, 75, 0.18)', text: '#2d4a38' },
  languages: { bg: 'rgba(55, 85, 110, 0.1)', border: 'rgba(55, 85, 110, 0.18)', text: '#2d4050' },
  wellbeing: { bg: 'rgba(75, 120, 95, 0.1)', border: 'rgba(75, 120, 95, 0.18)', text: '#354a3e' },
  dance: { bg: 'rgba(110, 65, 95, 0.1)', border: 'rgba(110, 65, 95, 0.16)', text: '#4a3042' },
};

export function tagColorsForInterestId(id) {
  if (!id || typeof id !== 'string') return FALLBACK;
  return MAP[id] || FALLBACK;
}

export function tagColorsForTagString(tag) {
  const t = String(tag || '').toLowerCase();
  return MAP[t] || FALLBACK;
}
