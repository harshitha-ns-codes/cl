-- Run once in Supabase Dashboard → SQL → New query.
-- Creates public.interests + public.subtopics, RLS for anonymous read, and seed data
-- matching src/data/knowledgeGraphData.js.

create table if not exists public.interests (
  id text primary key,
  label text not null,
  sort_order int not null default 0
);

create table if not exists public.subtopics (
  id text primary key,
  interest_id text not null references public.interests (id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

create index if not exists subtopics_interest_id_idx on public.subtopics (interest_id);

alter table public.interests enable row level security;
alter table public.subtopics enable row level security;

drop policy if exists "allow_read_interests" on public.interests;
drop policy if exists "allow_read_subtopics" on public.subtopics;

create policy "allow_read_interests" on public.interests for select using (true);
create policy "allow_read_subtopics" on public.subtopics for select using (true);

insert into public.interests (id, label, sort_order) values
  ('science', 'Science', 0),
  ('history', 'History', 1),
  ('psychology', 'Psychology', 2),
  ('philosophy', 'Philosophy', 3),
  ('business', 'Business', 4),
  ('literature', 'Literature', 5),
  ('music', 'Music', 6),
  ('art', 'Art & design', 7),
  ('nature', 'Nature', 8),
  ('languages', 'Languages', 9),
  ('wellbeing', 'Wellbeing', 10),
  ('dance', 'Dance', 11)
on conflict (id) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;

insert into public.subtopics (id, interest_id, label, sort_order) values
  ('cosmology', 'science', 'Cosmology', 0),
  ('genetics', 'science', 'Genetics', 1),
  ('climate', 'science', 'Climate', 2),
  ('neuro', 'science', 'Neuroscience', 3),
  ('physics', 'science', 'Physics', 4),
  ('chem', 'science', 'Chemistry', 5),
  ('ancient', 'history', 'Ancient worlds', 0),
  ('medieval', 'history', 'Medieval', 1),
  ('modern', 'history', 'Modern era', 2),
  ('industrial', 'history', 'Industrial age', 3),
  ('coldwar', 'history', 'Cold War', 4),
  ('decolonial', 'history', 'Decolonization', 5),
  ('cognitive', 'psychology', 'Cognitive', 0),
  ('social', 'psychology', 'Social', 1),
  ('development', 'psychology', 'Development', 2),
  ('clinical', 'psychology', 'Clinical', 3),
  ('positive', 'psychology', 'Positive psych', 4),
  ('ethics', 'philosophy', 'Ethics', 0),
  ('metaphysics', 'philosophy', 'Metaphysics', 1),
  ('epistemology', 'philosophy', 'Epistemology', 2),
  ('existential', 'philosophy', 'Existentialism', 3),
  ('eastern', 'philosophy', 'Eastern thought', 4),
  ('strategy', 'business', 'Strategy', 0),
  ('product', 'business', 'Product', 1),
  ('finance', 'business', 'Finance', 2),
  ('leadership', 'business', 'Leadership', 3),
  ('markets', 'business', 'Markets', 4),
  ('poetry', 'literature', 'Poetry', 0),
  ('novel', 'literature', 'The novel', 1),
  ('drama', 'literature', 'Drama', 2),
  ('criticism', 'literature', 'Criticism', 3),
  ('translation', 'literature', 'Translation', 4),
  ('theory', 'music', 'Theory', 0),
  ('composition', 'music', 'Composition', 1),
  ('jazz', 'music', 'Jazz', 2),
  ('classical', 'music', 'Classical', 3),
  ('production', 'music', 'Production', 4),
  ('renaissance', 'art', 'Renaissance', 0),
  ('modernism', 'art', 'Modernism', 1),
  ('contemporary', 'art', 'Contemporary', 2),
  ('design', 'art', 'Design', 3),
  ('photography', 'art', 'Photography', 4),
  ('ecology', 'nature', 'Ecology', 0),
  ('geology', 'nature', 'Geology', 1),
  ('oceans', 'nature', 'Oceans', 2),
  ('forests', 'nature', 'Forests', 3),
  ('wildlife', 'nature', 'Wildlife', 4),
  ('linguistics', 'languages', 'Linguistics', 0),
  ('acquisition', 'languages', 'Acquisition', 1),
  ('phonetics', 'languages', 'Phonetics', 2),
  ('writing', 'languages', 'Writing systems', 3),
  ('sleep', 'wellbeing', 'Sleep', 0),
  ('movement', 'wellbeing', 'Movement', 1),
  ('nutrition', 'wellbeing', 'Nutrition', 2),
  ('mindfulness', 'wellbeing', 'Mindfulness', 3),
  ('stress', 'wellbeing', 'Stress', 4),
  ('ballet', 'dance', 'Ballet', 0),
  ('contemporaryd', 'dance', 'Contemporary', 1),
  ('folk', 'dance', 'Folk', 2),
  ('hiphop', 'dance', 'Hip-hop', 3)
on conflict (id) do update set
  interest_id = excluded.interest_id,
  label = excluded.label,
  sort_order = excluded.sort_order;
