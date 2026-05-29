-- ============================================================================
-- JoinMahj — 001_initial_schema
-- Initial application schema: profiles, subscriptions, ai_chats, ai_messages,
-- progress.
--
-- Conventions:
--   * uuid primary keys (gen_random_uuid)
--   * created_at / updated_at on every table (UTC, auto-maintained)
--   * foreign keys with ON DELETE CASCADE
--   * indexes on all foreign keys + common lookups
--   * Row Level Security enabled on every table with owner-scoped policies
--
-- Out of scope (intentionally NOT created here): clubs, events.
-- ============================================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_plan') then
    create type public.subscription_plan as enum ('free', 'member', 'club_pro');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum (
      'active', 'trialing', 'past_due', 'canceled', 'incomplete'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'ai_message_role') then
    create type public.ai_message_role as enum ('system', 'user', 'assistant');
  end if;

  if not exists (select 1 from pg_type where typname = 'progress_status') then
    create type public.progress_status as enum (
      'not_started', 'in_progress', 'completed'
    );
  end if;
end
$$;

-- ----------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on UPDATE
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ============================================================================
-- profiles  (1:1 with auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_email_idx on public.profiles (email);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile row whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- subscriptions  (1:1 with profiles)
-- ============================================================================
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.profiles (id) on delete cascade,
  plan                   public.subscription_plan   not null default 'free',
  status                 public.subscription_status not null default 'active',
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default timezone('utc', now()),
  updated_at             timestamptz not null default timezone('utc', now())
);

create unique index if not exists subscriptions_user_id_key
  on public.subscriptions (user_id);
create unique index if not exists subscriptions_stripe_subscription_id_key
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ai_chats  (a conversation thread, N per user)
-- ============================================================================
create table if not exists public.ai_chats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null default 'New conversation',
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now())
);

create index if not exists ai_chats_user_id_idx on public.ai_chats (user_id);
create index if not exists ai_chats_user_id_updated_at_idx
  on public.ai_chats (user_id, updated_at desc);

create trigger ai_chats_set_updated_at
  before update on public.ai_chats
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ai_messages  (N per chat)
-- ============================================================================
create table if not exists public.ai_messages (
  id          uuid primary key default gen_random_uuid(),
  chat_id     uuid not null references public.ai_chats (id) on delete cascade,
  role        public.ai_message_role not null,
  content     text not null,
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now())
);

create index if not exists ai_messages_chat_id_idx on public.ai_messages (chat_id);
create index if not exists ai_messages_chat_id_created_at_idx
  on public.ai_messages (chat_id, created_at);

create trigger ai_messages_set_updated_at
  before update on public.ai_messages
  for each row execute function public.set_updated_at();

-- ============================================================================
-- progress  (7-day beginner roadmap progress, 1 row per user per day)
-- ============================================================================
create table if not exists public.progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  day           smallint not null check (day between 1 and 7),
  status        public.progress_status not null default 'not_started',
  completed_at  timestamptz,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now()),
  unique (user_id, day)
);

create index if not exists progress_user_id_idx on public.progress (user_id);

create trigger progress_set_updated_at
  before update on public.progress
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_chats      enable row level security;
alter table public.ai_messages   enable row level security;
alter table public.progress      enable row level security;

-- profiles: a user can read and edit only their own profile.
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- subscriptions: owner read-only. Writes happen server-side (service role,
-- e.g. Stripe webhooks) which bypasses RLS.
drop policy if exists "Subscriptions are viewable by owner" on public.subscriptions;
create policy "Subscriptions are viewable by owner"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ai_chats: full owner-scoped CRUD.
drop policy if exists "Chats are viewable by owner" on public.ai_chats;
create policy "Chats are viewable by owner"
  on public.ai_chats for select
  using (auth.uid() = user_id);

drop policy if exists "Chats are insertable by owner" on public.ai_chats;
create policy "Chats are insertable by owner"
  on public.ai_chats for insert
  with check (auth.uid() = user_id);

drop policy if exists "Chats are updatable by owner" on public.ai_chats;
create policy "Chats are updatable by owner"
  on public.ai_chats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Chats are deletable by owner" on public.ai_chats;
create policy "Chats are deletable by owner"
  on public.ai_chats for delete
  using (auth.uid() = user_id);

-- ai_messages: owner-scoped via the parent chat.
drop policy if exists "Messages are viewable by chat owner" on public.ai_messages;
create policy "Messages are viewable by chat owner"
  on public.ai_messages for select
  using (
    exists (
      select 1 from public.ai_chats c
      where c.id = ai_messages.chat_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Messages are insertable by chat owner" on public.ai_messages;
create policy "Messages are insertable by chat owner"
  on public.ai_messages for insert
  with check (
    exists (
      select 1 from public.ai_chats c
      where c.id = ai_messages.chat_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Messages are deletable by chat owner" on public.ai_messages;
create policy "Messages are deletable by chat owner"
  on public.ai_messages for delete
  using (
    exists (
      select 1 from public.ai_chats c
      where c.id = ai_messages.chat_id and c.user_id = auth.uid()
    )
  );

-- progress: full owner-scoped CRUD.
drop policy if exists "Progress is viewable by owner" on public.progress;
create policy "Progress is viewable by owner"
  on public.progress for select
  using (auth.uid() = user_id);

drop policy if exists "Progress is insertable by owner" on public.progress;
create policy "Progress is insertable by owner"
  on public.progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Progress is updatable by owner" on public.progress;
create policy "Progress is updatable by owner"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Progress is deletable by owner" on public.progress;
create policy "Progress is deletable by owner"
  on public.progress for delete
  using (auth.uid() = user_id);
