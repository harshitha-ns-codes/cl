import { getSupabase } from '../lib/supabase';
import {
  INTEREST_OPTIONS as LOCAL_INTERESTS,
  SUBTOPICS_BY_INTEREST as LOCAL_SUBTOPICS,
} from '../data/knowledgeGraphData';

export function getLocalKnowledgeGraph() {
  return {
    interestOptions: LOCAL_INTERESTS,
    subtopicsByInterest: { ...LOCAL_SUBTOPICS },
    source: 'local',
  };
}

/**
 * Loads interests + subtopics from Supabase (tables: interests, subtopics).
 * Throws on network/PostgREST errors or empty interests.
 */
export async function fetchKnowledgeGraphFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data: interests, error: interestsError } = await supabase
    .from('interests')
    .select('id,label,sort_order')
    .order('sort_order', { ascending: true });

  const { data: subtopicRows, error: subtopicsError } = await supabase
    .from('subtopics')
    .select('id,interest_id,label,sort_order')
    .order('sort_order', { ascending: true });

  if (interestsError) throw interestsError;
  if (subtopicsError) throw subtopicsError;
  if (!interests?.length) {
    throw new Error('No rows in interests');
  }

  const interestOptions = interests.map((row) => ({
    id: row.id,
    label: row.label,
  }));

  const subtopicsByInterest = {};
  for (const row of subtopicRows ?? []) {
    const key = row.interest_id;
    if (!subtopicsByInterest[key]) subtopicsByInterest[key] = [];
    subtopicsByInterest[key].push({ id: row.id, label: row.label });
  }

  return {
    interestOptions,
    subtopicsByInterest,
    source: 'supabase',
  };
}
