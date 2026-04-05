/**
 * Topic content: optional Supabase Edge Function `generate-topic`, else local mock.
 * Summarize: mock until you wire an edge function or external API.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function buildMockArticle(interestLabel, subtopicLabel) {
  return {
    title: subtopicLabel,
    introduction: `${subtopicLabel} sits at a fascinating intersection within ${interestLabel}. Think of it as a lens: it changes how you notice patterns in the world — from what you read to what you observe on a quiet commute.`,
    breakdown: [
      {
        heading: 'What it is',
        text: `In plain terms, ${subtopicLabel} is a way of organizing ideas and evidence so they stay coherent. Specialists refine definitions over time, but the core is accessible without jargon if we keep examples close to everyday life.`,
      },
      {
        heading: 'Why it matters',
        text: `Understanding ${subtopicLabel} helps you ask sharper questions. Instead of memorizing labels, you learn to see how causes, contexts, and trade-offs connect — a skill that transfers far beyond this one topic.`,
      },
      {
        heading: 'How people work with it',
        text: `Researchers and practitioners use observation, structured experiments, and careful argument. You can borrow that rhythm: start with a small question, gather one solid source, then revise your mental model.`,
      },
    ],
    keyPoints: [
      `Start with one concrete example of ${subtopicLabel} you have already seen (a headline, a habit, a place).`,
      'Separate what is widely agreed from what is still debated — both are useful.',
      'Revisit the idea after a day; spacing beats cramming for durable memory.',
      `Connect ${subtopicLabel} to a second domain (art, policy, health) to make it stick.`,
    ],
  };
}

async function tryEdgeGenerateTopic(body) {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.functions.invoke('generate-topic', { body });
  if (error) {
    if (__DEV__) {
      console.warn('[llmService] generate-topic:', error.message);
    }
    return null;
  }
  if (data && typeof data === 'object' && typeof data.introduction === 'string') {
    return data;
  }
  return null;
}

export async function generateTopicContent({ interestId, interestLabel, subtopicId, subtopicLabel }) {
  if (isSupabaseConfigured()) {
    const remote = await tryEdgeGenerateTopic({
      interestId,
      interestLabel,
      subtopicId,
      subtopicLabel,
    });
    if (remote) return remote;
  }

  await delay(900 + Math.random() * 400);
  return buildMockArticle(interestLabel, subtopicLabel);
}

export async function summarizeContent(fullPlainText) {
  await delay(700 + Math.random() * 300);
  const trimmed = fullPlainText.slice(0, 4000);
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  return {
    summary: `In about ${Math.min(words, 220)} words worth of material: the piece moves from a clear definition into why the topic matters, then into practical habits for exploring it further. The through-line is curiosity with discipline — notice, question, revise — rather than collecting facts without structure.`,
  };
}

export function articleToPlainText(article) {
  if (!article) return '';
  const parts = [
    article.introduction,
    ...(article.breakdown?.map((b) => `${b.heading}\n${b.text}`) ?? []),
    ...(article.keyPoints?.map((k) => `• ${k}`) ?? []),
  ];
  return parts.join('\n\n');
}
