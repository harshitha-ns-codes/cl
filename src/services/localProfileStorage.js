import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  userId: '@cl2_user_id',
  interests: '@cl2_profile_interests',
  displayName: '@cl2_display_name',
  email: '@cl2_email',
  seenArticles: '@cl2_seen_article_ids',
  bookmarks: '@cl2_bookmarks_v1',
};

function randomId() {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export async function getOrCreateUserId() {
  let id = await AsyncStorage.getItem(KEYS.userId);
  if (!id) {
    id = randomId();
    await AsyncStorage.setItem(KEYS.userId, id);
  }
  return id;
}

export async function getStoredInterests() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.interests);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => typeof x === 'string');
  } catch {
    return [];
  }
}

export async function setStoredInterests(ids) {
  await AsyncStorage.setItem(KEYS.interests, JSON.stringify(ids));
}

export async function getDisplayProfile() {
  const [name, email] = await Promise.all([
    AsyncStorage.getItem(KEYS.displayName),
    AsyncStorage.getItem(KEYS.email),
  ]);
  return {
    name: name || 'Reader',
    email: email || '',
  };
}

export async function setDisplayProfile({ name, email }) {
  if (name != null) await AsyncStorage.setItem(KEYS.displayName, name);
  if (email != null) await AsyncStorage.setItem(KEYS.email, email);
}

export async function getSeenArticleIds() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.seenArticles);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export async function markArticleSeen(articleId) {
  const set = await getSeenArticleIds();
  set.add(articleId);
  await AsyncStorage.setItem(KEYS.seenArticles, JSON.stringify([...set]));
}

/** @returns {Promise<Array<{ articleId, title, url, createdAt }>>} */
export async function getLocalBookmarks() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.bookmarks);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function addLocalBookmark({ articleId, title, url }) {
  const list = await getLocalBookmarks();
  if (list.some((b) => b.articleId === articleId)) return list;
  const next = [
    { articleId, title, url: url || '', createdAt: new Date().toISOString() },
    ...list,
  ];
  await AsyncStorage.setItem(KEYS.bookmarks, JSON.stringify(next));
  return next;
}

export async function removeLocalBookmark(articleId) {
  const list = await getLocalBookmarks();
  const next = list.filter((b) => b.articleId !== articleId);
  await AsyncStorage.setItem(KEYS.bookmarks, JSON.stringify(next));
  return next;
}
