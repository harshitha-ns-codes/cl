import { RECOMMENDED_ARTICLES } from '../data/recommendationsData';

/**
 * Score articles like a simple recommender: match tags to user interests,
 * slight penalty for already seen, small random jitter so the feed reshuffles.
 */
export function rankRecommendations(userInterestIds, seenIds = new Set()) {
  const interests = new Set(userInterestIds);
  const scored = RECOMMENDED_ARTICLES.map((article) => {
    let score = 0;
    const tags = Array.isArray(article.tags) ? article.tags : [];
    for (const tag of tags) {
      if (interests.has(tag)) score += 3;
    }
    if (tags.some((t) => interests.has(t))) score += 1;
    if (seenIds.has(article.articleId)) score -= 1.5;
    score += Math.random() * 1.2;
    return { article, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.article);
}

export function getRecommendedArticles(userInterestIds, seenIds) {
  const list = rankRecommendations(userInterestIds, seenIds);
  return list.length ? list : [...RECOMMENDED_ARTICLES];
}
