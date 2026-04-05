import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSupabase } from '../lib/supabase';

const KEYS_TO_REMOVE = [
  '@cl2_user_id',
  '@cl2_profile_interests',
  '@cl2_display_name',
  '@cl2_email',
  '@cl2_seen_article_ids',
  '@cl2_bookmarks_v1',
  '@cl2_streak_v1',
  '@cl2_reading_sessions_v1',
];

/**
 * Clears local session (profile, interests, bookmarks, streak, reading stats, device user id).
 * Does not delete saved Notes. Signs out Supabase auth when configured.
 */
export async function signOutLocalSession() {
  try {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    /* ignore auth errors */
  }
  await AsyncStorage.multiRemove(KEYS_TO_REMOVE);
}
