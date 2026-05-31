-- ============================================================================
-- JoinMahj — 007_analysis_history_schema
-- Stores a user's saved AI hand analyses.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.analysis_history (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  image_url          text,
  tiles              jsonb not null default '[]'::jsonb,
  shanten            integer,
  discard            text,
  reason             text,
  winning_potential  text,
  created_at         timestamptz not null default now()
);

create index if not exists analysis_history_user_id_idx
  on public.analysis_history (user_id);
create index if not exists analysis_history_user_id_created_at_idx
  on public.analysis_history (user_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Row Level Security: owner-scoped.
-- ----------------------------------------------------------------------------
alter table public.analysis_history enable row level security;

drop policy if exists "Analyses viewable by owner" on public.analysis_history;
create policy "Analyses viewable by owner"
  on public.analysis_history for select
  using (auth.uid() = user_id);

drop policy if exists "Analyses insertable by owner" on public.analysis_history;
create policy "Analyses insertable by owner"
  on public.analysis_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Analyses deletable by owner" on public.analysis_history;
create policy "Analyses deletable by owner"
  on public.analysis_history for delete
  using (auth.uid() = user_id);
