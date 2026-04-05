import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@cl2_streak_v1';

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function parsePrev(raw) {
  if (!raw) return { lastActiveYmd: null, count: 0 };
  try {
    const o = JSON.parse(raw);
    return {
      lastActiveYmd: o.lastActiveYmd ?? null,
      count: typeof o.count === 'number' ? o.count : 0,
    };
  } catch {
    return { lastActiveYmd: null, count: 0 };
  }
}

/**
 * Call once per day when user opens the app (e.g. Home focus).
 * Consecutive calendar days increment streak; gap > 1 day resets.
 */
export async function touchLocalStreak() {
  const today = ymd();
  const raw = await AsyncStorage.getItem(KEY);
  const prev = parsePrev(raw);

  if (prev.lastActiveYmd === today) {
    return { streak: prev.count, lastActiveYmd: today };
  }

  let count = prev.count;
  if (!prev.lastActiveYmd) {
    count = 1;
  } else {
    const last = new Date(prev.lastActiveYmd + 'T12:00:00Z');
    const t0 = new Date(today + 'T12:00:00Z');
    const diffDays = Math.round((t0 - last) / (86400000));
    if (diffDays === 1) count += 1;
    else if (diffDays > 1) count = 1;
    else count = Math.max(1, count);
  }

  const next = { lastActiveYmd: today, count };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return { streak: next.count, lastActiveYmd: next.lastActiveYmd };
}

export async function getLocalStreak() {
  const raw = await AsyncStorage.getItem(KEY);
  const prev = parsePrev(raw);
  return { streak: prev.count, lastActiveYmd: prev.lastActiveYmd };
}
