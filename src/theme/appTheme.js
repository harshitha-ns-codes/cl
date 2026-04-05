/**
 * Frontend design tokens — edit this file to change colors, type scale, layout, and tag tints app-wide.
 *
 * Fonts: values must match the keys passed to useFonts() in App.js (e.g. Inter_400Regular, Cormorant_600SemiBold).
 */

// ─── Colors ─────────────────────────────────────────────────────────────────
export const colors = {
  forest950: '#0a1f14',
  forest900: '#0f291c',
  forest850: '#143224',
  forest800: '#1a3d2a',
  forest700: '#234d36',
  mint500: '#5eb88a',
  mint300: '#9fd4b8',
  mintGlow: 'rgba(158, 212, 184, 0.35)',

  paper: '#f6f4ef',
  paperWarm: '#f2efe8',
  paperDeep: '#eae6dd',
  background: '#f4f2ec',
  surface: '#faf8f4',
  surfaceElevated: '#fffcf7',
  surfaceGlass: 'rgba(255, 252, 247, 0.72)',

  cream: '#f6f4ef',
  creamMuted: '#ebe7de',
  creamDeep: '#e0dbd2',

  textPrimary: '#2a302c',
  textSecondary: '#4a524c',
  textMuted: '#6b736d',
  textPlaceholder: '#949b94',
  textDisplay: '#1c2420',
  onDark: '#f2efe8',
  onDarkMuted: 'rgba(242, 238, 232, 0.72)',

  border: 'rgba(26, 61, 42, 0.08)',
  borderMuted: 'rgba(26, 61, 42, 0.05)',
  borderFocus: 'rgba(30, 90, 58, 0.45)',
  hairline: 'rgba(26, 61, 42, 0.06)',

  accent: '#1a3d2a',
  accentMuted: 'rgba(26, 61, 42, 0.09)',
  accentSoft: 'rgba(94, 184, 138, 0.25)',
  onAccent: '#f6f4ef',

  groveCanvas: '#0f1f17',
  groveCanvasMid: '#152820',
  groveVein: 'rgba(158, 212, 184, 0.07)',
  groveEdge: 'rgba(158, 212, 184, 0.22)',
  groveEdgePulse: 'rgba(190, 230, 205, 0.45)',

  selectedBackground: 'rgba(26, 61, 42, 0.07)',
  selectedBorder: '#1a3d2a',
  pressedOverlay: 'rgba(26, 61, 42, 0.04)',

  inputBackground: 'transparent',
  inputBorder: 'rgba(26, 61, 42, 0.14)',

  error: '#6b4a42',
  errorBackground: 'rgba(107, 74, 66, 0.06)',

  tabInactive: '#6b736d',
  tabActive: '#1a3d2a',

  glassBorder: 'rgba(255, 252, 247, 0.55)',
  glassHighlight: 'rgba(255, 255, 255, 0.12)',
};

// ─── Typography (font family keys → loaded in App.js) ───────────────────────
export const fonts = {
  displaySemibold: 'Cormorant_600SemiBold',
  displayMedium: 'Cormorant_500Medium',
  displayRegular: 'Cormorant_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
};

export const layout = {
  pagePadding: 28,
  contentMax: 400,
  fieldGap: 22,
};

/** Longform reader: size / line-height / tracking */
export const reading = {
  fontSize: 18,
  lineHeight: 31,
  letterSpacing: 0.2,
};

// ─── Interest tag pills (For you, etc.) ─────────────────────────────────────
const INTEREST_TAG_FALLBACK = {
  bg: 'rgba(26, 61, 42, 0.08)',
  border: 'rgba(26, 61, 42, 0.12)',
  text: '#2a302c',
};

const INTEREST_TAG_MAP = {
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
  if (!id || typeof id !== 'string') return INTEREST_TAG_FALLBACK;
  return INTEREST_TAG_MAP[id] || INTEREST_TAG_FALLBACK;
}

export function tagColorsForTagString(tag) {
  const t = String(tag || '').toLowerCase();
  return INTEREST_TAG_MAP[t] || INTEREST_TAG_FALLBACK;
}

export default colors;
