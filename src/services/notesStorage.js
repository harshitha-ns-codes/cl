import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@cl2_notes_v1';

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(notes) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export async function getAllNotes() {
  const list = await readAll();
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function saveTextNote({ title, body, meta = {} }) {
  const notes = await readAll();
  const entry = {
    id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type: 'text',
    title: title || 'Thought',
    body,
    meta,
    createdAt: new Date().toISOString(),
  };
  notes.unshift(entry);
  await writeAll(notes);
  return entry;
}

export async function saveAudioNote({ title, audioUri, meta = {} }) {
  const notes = await readAll();
  const entry = {
    id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type: 'audio',
    title: title || 'Heard',
    audioUri,
    meta,
    createdAt: new Date().toISOString(),
  };
  notes.unshift(entry);
  await writeAll(notes);
  return entry;
}
