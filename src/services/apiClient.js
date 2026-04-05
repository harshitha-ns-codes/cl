/**
 * Optional Flask backend (backend/run.py). Set EXPO_PUBLIC_API_URL e.g. http://192.168.1.5:5000
 */

const base = () => (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

async function jsonFetch(path, options = {}) {
  const b = base();
  if (!b) return null;
  const url = `${b}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export function isApiConfigured() {
  return Boolean(base());
}

export async function postHistory({ user_id, article_id, title, time_spent }) {
  const b = base();
  if (!b) return null;
  try {
    return await jsonFetch('/history', {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        article_id,
        title,
        time_spent,
      }),
    });
  } catch {
    return null;
  }
}

export async function getProfileSummary(userId) {
  const b = base();
  if (!b) return null;
  try {
    const res = await fetch(`${b}/profile/${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function postBookmark({ user_id, article_id, title, url }) {
  const b = base();
  if (!b) return null;
  try {
    return await jsonFetch('/bookmark', {
      method: 'POST',
      body: JSON.stringify({ user_id, article_id, title, url }),
    });
  } catch {
    return null;
  }
}

export async function deleteBookmark(userId, articleId) {
  const b = base();
  if (!b) return null;
  try {
    await fetch(
      `${b}/bookmark/${encodeURIComponent(articleId)}?user_id=${encodeURIComponent(userId)}`,
      { method: 'DELETE' }
    );
    return true;
  } catch {
    return false;
  }
}
