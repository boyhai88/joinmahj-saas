-- ============================================================================
-- JoinMahj — 009_user_usage_plan
-- Free/Pro membership flag on profiles + daily Analyze Strategy usage tracking.
-- Stripe will set profiles.plan later; for now it can be set manually.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Plan flag on profiles (free | pro).
alter table public.profiles
  add column if not exists plan text not null default 'free';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_plan_check check (plan in ('free', 'pro'));
  end if;
end
$$;

-- Daily usage counter for Analyze Strategy (free-tier limiting).
create table if not exists public.user_usage (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  analysis_count  integer not null default 0,
  usage_date      date not null,
  created_at      timestamptz not null default now(),
  unique (user_id, usage_date)
);

create index if not exists user_usage_user_id_idx on public.user_usage (user_id);
create index if not exists user_usage_user_id_date_idx
  on public.user_usage (user_id, usage_date);

alter table public.user_usage enable row level security;

drop policy if exists "Usage viewable by owner" on public.user_usage;
create policy "Usage viewable by owner"
  on public.user_usage for select
  using (auth.uid() = user_id);

drop policy if exists "Usage insertable by owner" on public.user_usage;
create policy "Usage insertable by owner"
  on public.user_usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "Usage updatable by owner" on public.user_usage;
create policy "Usage updatable by owner"
  on public.user_usage for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
