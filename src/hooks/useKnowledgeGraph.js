import { useState, useEffect, useMemo, useCallback } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchKnowledgeGraphFromSupabase,
  getLocalKnowledgeGraph,
} from '../services/knowledgeSupabase';

function firstSubtopicList(map) {
  const direct = map.science;
  if (direct?.length) return direct;
  const first = Object.values(map).find((arr) => Array.isArray(arr) && arr.length);
  return first ?? [];
}

export function useKnowledgeGraph() {
  const local = useMemo(() => getLocalKnowledgeGraph(), []);
  const [interestOptions, setInterestOptions] = useState(local.interestOptions);
  const [subtopicsByInterest, setSubtopicsByInterest] = useState(local.subtopicsByInterest);
  const [source, setSource] = useState('local');
  const [loading, setLoading] = useState(() => isSupabaseConfigured());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await fetchKnowledgeGraphFromSupabase();
        if (cancelled) return;
        setInterestOptions(data.interestOptions);
        setSubtopicsByInterest(data.subtopicsByInterest);
        setSource(data.source);
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message ?? 'Could not load catalog from Supabase');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const getSubtopicsForInterest = useCallback(
    (interestId) => {
      const list = subtopicsByInterest[interestId];
      if (list?.length) return list;
      return firstSubtopicList(subtopicsByInterest);
    },
    [subtopicsByInterest]
  );

  const getInterestLabel = useCallback(
    (interestId) => interestOptions.find((i) => i.id === interestId)?.label ?? 'Explore',
    [interestOptions]
  );

  return {
    interestOptions,
    getSubtopicsForInterest,
    getInterestLabel,
    loading,
    error,
    source,
  };
}
