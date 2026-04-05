/**
 * Curated picks for "For you" — scored against onboarding interests (YouTube-style weighting).
 * Each item has stable article_id for history/bookmarks API alignment.
 */
export const RECOMMENDED_ARTICLES = [
  {
    articleId: 'rec-01',
    title: 'The slow art of attention in a loud feed',
    excerpt: 'Why depth beats volume when you only have the margins of a commute.',
    readTimeMin: 6,
    tags: ['psychology', 'wellbeing', 'philosophy'],
    sourceLabel: 'Margin Papers',
    url: 'https://example.com/attention',
    body: `The feed is engineered for another click, not for your calm. Attention is not a tank you drain — it is a rhythm you train.

Start with one source you trust, one session without switching. Notice when curiosity turns into compulsion; that edge is where design meets you.

Carry a single question through the week: what would I still care about if no one saw that I read this? That filter is blunt, and useful.`,
  },
  {
    articleId: 'rec-02',
    title: 'Climate stories beyond the headline temperature',
    excerpt: 'Local adaptation, community grids, and the gap between panic and agency.',
    readTimeMin: 8,
    tags: ['science', 'nature', 'business'],
    sourceLabel: 'Field Notes',
    url: 'https://example.com/climate-local',
    body: `Global averages numb us; local weather shocks wake us. The useful middle is infrastructure you can see: where power comes from, how water moves, who decides.

Agency grows when maps have names you recognize. Follow one watershed, one policy thread, for a month — not to become an expert, but to stop floating above the story.`,
  },
  {
    articleId: 'rec-03',
    title: 'Jazz as conversation, not performance',
    excerpt: 'Call and response, mistakes as doors, and listening as craft.',
    readTimeMin: 5,
    tags: ['music', 'history', 'art'],
    sourceLabel: 'Late Set',
    url: 'https://example.com/jazz-conversation',
    body: `Soloing is the flash; comping is the room. Jazz teaches that listening edits you in real time — you play to what you just heard, not to what you planned.

Try one record where you only follow the drummer for ten minutes. Rhythm is the argument everyone else agrees to.`,
  },
  {
    articleId: 'rec-04',
    title: 'Sleep as the first productivity hack',
    excerpt: 'Circadian honesty, light, and why “grind” is a bad metaphor for minds.',
    readTimeMin: 7,
    tags: ['wellbeing', 'science', 'psychology'],
    sourceLabel: 'Rest Lab',
    url: 'https://example.com/sleep-circadian',
    body: `Brains consolidate with boring consistency. Light after dark whispers “day” to ancient circuits; screens are not evil, but they are loud.

Pick a wind-down you can keep on bad days — dim, slow, same order. Progress is the streak of showing up for sleep, not perfect nights.`,
  },
  {
    articleId: 'rec-05',
    title: 'The novel as empathy gym',
    excerpt: 'Fiction, theory of mind, and why plot is moral technology.',
    readTimeMin: 6,
    tags: ['literature', 'psychology', 'philosophy'],
    sourceLabel: 'Shelf Light',
    url: 'https://example.com/novel-empathy',
    body: `We practice other interiors when we cannot access them in life yet. A good novel asks you to revise your first judgment of a character — that motion is transferable.

Read one chapter twice: first for plot, second for what the narrator does not say aloud.`,
  },
  {
    articleId: 'rec-06',
    title: 'Forest edges and biodiversity',
    excerpt: 'Why the border between two worlds teems with life.',
    readTimeMin: 5,
    tags: ['nature', 'science'],
    sourceLabel: 'Ecotone',
    url: 'https://example.com/forest-edge',
    body: `Ecotones are messy, rich, contested. Conservation often imagines pristine cores; reality is patchwork and migration.

Walk a boundary — water and land, field and wood — and count transitions. Edges are where adaptation rehearses.`,
  },
  {
    articleId: 'rec-07',
    title: 'Strategy without theater',
    excerpt: 'Quiet choices, optionality, and meetings that should have been memos.',
    readTimeMin: 7,
    tags: ['business', 'psychology'],
    sourceLabel: 'Quarterly Quiet',
    url: 'https://example.com/strategy-quiet',
    body: `Real strategy shrinks the surface area of decisions. If everything is a priority, nothing is a trade-off.

Write one page: what we will not do this quarter. That negative space is where focus lives.`,
  },
  {
    articleId: 'rec-08',
    title: 'Ancient skepticism for modern certainty',
    excerpt: 'Pyrrho, inquiry, and the dignity of “I could be wrong.”',
    readTimeMin: 8,
    tags: ['philosophy', 'history'],
    sourceLabel: 'Stoa & Stone',
    url: 'https://example.com/skepticism',
    body: `Skepticism is not cynicism. It is refusing to let the first story colonize your mind. The ancients practiced withholding assent like a muscle.

Try a week of appending “as far as I can tell” to strong claims — not aloud, but in your notes. Watch what softens and what survives.`,
  },
  {
    articleId: 'rec-09',
    title: 'Design systems as shared language',
    excerpt: 'Tokens, constraints, and the politics of “consistent enough.”',
    readTimeMin: 6,
    tags: ['art', 'business', 'languages'],
    sourceLabel: 'Grid & Gesture',
    url: 'https://example.com/design-systems',
    body: `Systems are promises between teams. Too rigid, and craft dies; too loose, and users feel the seams.

Name three decisions your system must make for you, and three it must never automate. That boundary is yours to own.`,
  },
  {
    articleId: 'rec-10',
    title: 'Language acquisition and embarrassment',
    excerpt: 'Why mistakes are data, not verdicts.',
    readTimeMin: 5,
    tags: ['languages', 'psychology', 'wellbeing'],
    sourceLabel: 'Phrasebook',
    url: 'https://example.com/language-mistakes',
    body: `Fluency is repeated repair. Children are not braver; they are less fused to a single self-image.

Schedule small embarrassments: one conversation where you care about content, not polish. The graph of your ability bends there.`,
  },
  {
    articleId: 'rec-11',
    title: 'Dance and the physics of joy',
    excerpt: 'Momentum, floor, and why repetition is not boredom.',
    readTimeMin: 4,
    tags: ['dance', 'music', 'wellbeing'],
    sourceLabel: 'Studio Draft',
    url: 'https://example.com/dance-joy',
    body: `Joy in dance is often physics made legible: you trust the floor, you let gravity do part of the work. The same is true of habits.

Repeat one phrase until your body argues less. Then change one variable — tempo, facing, music. Small edits, deep grooves.`,
  },
  {
    articleId: 'rec-12',
    title: 'History through ordinary objects',
    excerpt: 'A button, a ledger, a chipped cup — archives of the overlooked.',
    readTimeMin: 7,
    tags: ['history', 'art', 'literature'],
    sourceLabel: 'Museum Basement',
    url: 'https://example.com/objects-history',
    body: `Macro history thrills; micro history teaches. Objects carry supply chains, hands, and breakage.

Pick one thing on your desk and trace two generations of its making. You will find politics in the mundane.`,
  },
];
