-- ============================================================================
-- JoinMahj — 004_ai_usage_schema
-- Daily AI Coach usage tracking for free-tier rate limiting.
--
-- Depends on 001_initial_schema: public.set_updated_at().
--
-- Conventions (same as prior migrations):
--   * uuid primary key (gen_random_uuid)
--   * created_at / updated_at (UTC, auto-maintained)
--   * Row Level Security enabled with owner-scoped policies
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.ai_usage (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  usage_date     date not null,
  message_count  integer not null default 0,
  created_at     timestamptz not null default timezone('utc', now()),
  updated_at     timestamptz not null default timezone('utc', now()),
  unique (user_id, usage_date)
);

create index if not exists ai_usage_user_id_idx on public.ai_usage (user_id);
create index if not exists ai_usage_user_id_usage_date_idx
  on public.ai_usage (user_id, usage_date);

create trigger ai_usage_set_updated_at
  before update on public.ai_usage
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security: owner-scoped CRUD.
-- ----------------------------------------------------------------------------
alter table public.ai_usage enable row level security;

drop policy if exists "Usage viewable by owner" on public.ai_usage;
create policy "Usage viewable by owner"
  on public.ai_usage for select
  using (auth.uid() = user_id);

drop policy if exists "Usage insertable by owner" on public.ai_usage;
create policy "Usage insertable by owner"
  on public.ai_usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usage updatable by owner" on public.ai_usage;
create policy "Usage updatable by owner"
  on public.ai_usage for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
