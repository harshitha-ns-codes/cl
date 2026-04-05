/**
 * Interest → subtopics for the radial knowledge graph.
 * IDs align with onboarding Interests where possible.
 */
export const INTEREST_OPTIONS = [
  { id: 'science', label: 'Science' },
  { id: 'history', label: 'History' },
  { id: 'psychology', label: 'Psychology' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'business', label: 'Business' },
  { id: 'literature', label: 'Literature' },
  { id: 'music', label: 'Music' },
  { id: 'art', label: 'Art & design' },
  { id: 'nature', label: 'Nature' },
  { id: 'languages', label: 'Languages' },
  { id: 'wellbeing', label: 'Wellbeing' },
  { id: 'dance', label: 'Dance' },
];

export const SUBTOPICS_BY_INTEREST = {
  science: [
    { id: 'cosmology', label: 'Cosmology' },
    { id: 'genetics', label: 'Genetics' },
    { id: 'climate', label: 'Climate' },
    { id: 'neuro', label: 'Neuroscience' },
    { id: 'physics', label: 'Physics' },
    { id: 'chem', label: 'Chemistry' },
  ],
  history: [
    { id: 'ancient', label: 'Ancient worlds' },
    { id: 'medieval', label: 'Medieval' },
    { id: 'modern', label: 'Modern era' },
    { id: 'industrial', label: 'Industrial age' },
    { id: 'coldwar', label: 'Cold War' },
    { id: 'decolonial', label: 'Decolonization' },
  ],
  psychology: [
    { id: 'cognitive', label: 'Cognitive' },
    { id: 'social', label: 'Social' },
    { id: 'development', label: 'Development' },
    { id: 'clinical', label: 'Clinical' },
    { id: 'positive', label: 'Positive psych' },
  ],
  philosophy: [
    { id: 'ethics', label: 'Ethics' },
    { id: 'metaphysics', label: 'Metaphysics' },
    { id: 'epistemology', label: 'Epistemology' },
    { id: 'existential', label: 'Existentialism' },
    { id: 'eastern', label: 'Eastern thought' },
  ],
  business: [
    { id: 'strategy', label: 'Strategy' },
    { id: 'product', label: 'Product' },
    { id: 'finance', label: 'Finance' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'markets', label: 'Markets' },
  ],
  literature: [
    { id: 'poetry', label: 'Poetry' },
    { id: 'novel', label: 'The novel' },
    { id: 'drama', label: 'Drama' },
    { id: 'criticism', label: 'Criticism' },
    { id: 'translation', label: 'Translation' },
  ],
  music: [
    { id: 'theory', label: 'Theory' },
    { id: 'composition', label: 'Composition' },
    { id: 'jazz', label: 'Jazz' },
    { id: 'classical', label: 'Classical' },
    { id: 'production', label: 'Production' },
  ],
  art: [
    { id: 'renaissance', label: 'Renaissance' },
    { id: 'modernism', label: 'Modernism' },
    { id: 'contemporary', label: 'Contemporary' },
    { id: 'design', label: 'Design' },
    { id: 'photography', label: 'Photography' },
  ],
  nature: [
    { id: 'ecology', label: 'Ecology' },
    { id: 'geology', label: 'Geology' },
    { id: 'oceans', label: 'Oceans' },
    { id: 'forests', label: 'Forests' },
    { id: 'wildlife', label: 'Wildlife' },
  ],
  languages: [
    { id: 'linguistics', label: 'Linguistics' },
    { id: 'acquisition', label: 'Acquisition' },
    { id: 'phonetics', label: 'Phonetics' },
    { id: 'writing', label: 'Writing systems' },
  ],
  wellbeing: [
    { id: 'sleep', label: 'Sleep' },
    { id: 'movement', label: 'Movement' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'mindfulness', label: 'Mindfulness' },
    { id: 'stress', label: 'Stress' },
  ],
  dance: [
    { id: 'ballet', label: 'Ballet' },
    { id: 'contemporaryd', label: 'Contemporary' },
    { id: 'folk', label: 'Folk' },
    { id: 'hiphop', label: 'Hip-hop' },
  ],
};

export function getSubtopicsForInterest(interestId) {
  return SUBTOPICS_BY_INTEREST[interestId] ?? SUBTOPICS_BY_INTEREST.science;
}

export function getInterestLabel(interestId) {
  return INTEREST_OPTIONS.find((i) => i.id === interestId)?.label ?? 'Explore';
}
