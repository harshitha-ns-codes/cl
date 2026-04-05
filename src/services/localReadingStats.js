import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@cl2_reading_sessions_v1';

async function readSessions() {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeSessions(list) {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(list.slice(0, 500)));
}

export async function recordReadingSession({ articleId, title, timeSpentSeconds }) {
  if (!articleId || timeSpentSeconds < 1) return;
  const list = await readSessions();
  list.unshift({
    articleId,
    title: title || 'Article',
    timeSpent: Math.min(timeSpentSeconds, 3600),
    timestamp: new Date().toISOString(),
  });
  await writeSessions(list);
}

export async function getLocalReadingAnalytics() {
  const list = await readSessions();
  const total_time_spent = list.reduce((s, r) => s + (r.timeSpent || 0), 0);
  const articles_read = list.length;
  const avg_time_per_article =
    articles_read > 0 ? Math.round(total_time_spent / articles_read) : 0;
  return {
    total_time_spent,
    articles_read,
    avg_time_per_article,
  };
}
