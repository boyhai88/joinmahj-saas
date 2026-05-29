-- ============================================================================
-- JoinMahj — 002_clubs_events_schema
-- Community schema: clubs, club_members, events, event_registrations.
--
-- Depends on 001_initial_schema (public.profiles, public.set_updated_at()).
--
-- Conventions (same as 001):
--   * uuid primary keys (gen_random_uuid)
--   * created_at / updated_at on every table (UTC, auto-maintained)
--   * foreign keys with ON DELETE CASCADE
--   * indexes on all foreign keys + common lookups
--   * Row Level Security enabled on every table
--
-- Capabilities:
--   * clubs are owned by a user
--   * users can join clubs (club_members)
--   * clubs can create events
--   * users can register for events (event_registrations)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'club_member_role') then
    create type public.club_member_role as enum ('owner', 'admin', 'member');
  end if;

  if not exists (select 1 from pg_type where typname = 'event_registration_status') then
    create type public.event_registration_status as enum (
      'registered', 'waitlisted', 'attended', 'canceled'
    );
  end if;
end
$$;

-- ============================================================================
-- clubs  (owned by a user)
-- ============================================================================
create table if not exists public.clubs (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  name         text not null,
  slug         text not null,
  description  text,
  city         text,
  location     text,
  is_public    boolean not null default true,
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

create unique index if not exists clubs_slug_key on public.clubs (slug);
create index if not exists clubs_owner_id_idx on public.clubs (owner_id);
create index if not exists clubs_is_public_idx on public.clubs (is_public);

create trigger clubs_set_updated_at
  before update on public.clubs
  for each row execute function public.set_updated_at();

-- ============================================================================
-- club_members  (membership join table: users <-> clubs)
-- ============================================================================
create table if not exists public.club_members (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references public.clubs (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  role        public.club_member_role not null default 'member',
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now()),
  unique (club_id, user_id)
);

create index if not exists club_members_club_id_idx on public.club_members (club_id);
create index if not exists club_members_user_id_idx on public.club_members (user_id);

create trigger club_members_set_updated_at
  before update on public.club_members
  for each row execute function public.set_updated_at();

-- ============================================================================
-- events  (created within a club)
-- ============================================================================
create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references public.clubs (id) on delete cascade,
  created_by   uuid references public.profiles (id) on delete set null,
  title        text not null,
  description  text,
  location     text,
  starts_at    timestamptz not null,
  ends_at      timestamptz,
  capacity     integer check (capacity is null or capacity >= 0),
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

create index if not exists events_club_id_idx on public.events (club_id);
create index if not exists events_created_by_idx on public.events (created_by);
create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_club_id_starts_at_idx
  on public.events (club_id, starts_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ============================================================================
-- event_registrations  (users <-> events)
-- ============================================================================
create table if not exists public.event_registrations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  status        public.event_registration_status not null default 'registered',
  registered_at timestamptz not null default timezone('utc', now()),
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now()),
  unique (event_id, user_id)
);

create index if not exists event_registrations_event_id_idx
  on public.event_registrations (event_id);
create index if not exists event_registrations_user_id_idx
  on public.event_registrations (user_id);

create trigger event_registrations_set_updated_at
  before update on public.event_registrations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- SECURITY DEFINER helpers
-- These run with the definer's privileges and therefore bypass RLS, which
-- prevents infinite recursion between mutually-referencing policies
-- (e.g. clubs <-> club_members).
-- ============================================================================
create or replace function public.is_club_owner(_club_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.clubs c
    where c.id = _club_id and c.owner_id = auth.uid()
  );
$$;

create or replace function public.is_club_member(_club_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.club_members m
    where m.club_id = _club_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.club_is_public(_club_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.clubs c
    where c.id = _club_id and c.is_public
  );
$$;

create or replace function public.is_event_host(_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.events e
    join public.clubs c on c.id = e.club_id
    where e.id = _event_id and c.owner_id = auth.uid()
  );
$$;

create or replace function public.event_is_visible(_event_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.events e
    join public.clubs c on c.id = e.club_id
    where e.id = _event_id
      and (
        c.is_public
        or c.owner_id = auth.uid()
        or exists (
          select 1 from public.club_members m
          where m.club_id = c.id and m.user_id = auth.uid()
        )
      )
  );
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.clubs               enable row level security;
alter table public.club_members        enable row level security;
alter table public.events              enable row level security;
alter table public.event_registrations enable row level security;

-- ---- clubs ----------------------------------------------------------------
-- Visible if public, owned by the user, or the user is a member.
drop policy if exists "Clubs are viewable when public or member" on public.clubs;
create policy "Clubs are viewable when public or member"
  on public.clubs for select
  using (
    is_public
    or owner_id = auth.uid()
    or public.is_club_member(id)
  );

drop policy if exists "Clubs are insertable by owner" on public.clubs;
create policy "Clubs are insertable by owner"
  on public.clubs for insert
  with check (owner_id = auth.uid());

drop policy if exists "Clubs are updatable by owner" on public.clubs;
create policy "Clubs are updatable by owner"
  on public.clubs for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "Clubs are deletable by owner" on public.clubs;
create policy "Clubs are deletable by owner"
  on public.clubs for delete
  using (owner_id = auth.uid());

-- ---- club_members ---------------------------------------------------------
-- Visible to the member themselves, the club owner, and fellow members.
drop policy if exists "Memberships are viewable by member or club owner" on public.club_members;
create policy "Memberships are viewable by member or club owner"
  on public.club_members for select
  using (
    user_id = auth.uid()
    or public.is_club_owner(club_id)
    or public.is_club_member(club_id)
  );

-- A user can join a public club themselves; a club owner can add members.
drop policy if exists "Users can join clubs" on public.club_members;
create policy "Users can join clubs"
  on public.club_members for insert
  with check (
    (user_id = auth.uid() and public.club_is_public(club_id))
    or public.is_club_owner(club_id)
  );

-- Club owners can change member roles.
drop policy if exists "Club owners manage memberships" on public.club_members;
create policy "Club owners manage memberships"
  on public.club_members for update
  using (public.is_club_owner(club_id))
  with check (public.is_club_owner(club_id));

-- Users can leave; club owners can remove members.
drop policy if exists "Users leave or owners remove memberships" on public.club_members;
create policy "Users leave or owners remove memberships"
  on public.club_members for delete
  using (user_id = auth.uid() or public.is_club_owner(club_id));

-- ---- events ---------------------------------------------------------------
-- Visible if the parent club is public, owned, or the user is a member.
drop policy if exists "Events are viewable with club access" on public.events;
create policy "Events are viewable with club access"
  on public.events for select
  using (
    public.club_is_public(club_id)
    or public.is_club_owner(club_id)
    or public.is_club_member(club_id)
  );

-- Only the club owner can create events (and must attribute themselves).
drop policy if exists "Club owners create events" on public.events;
create policy "Club owners create events"
  on public.events for insert
  with check (public.is_club_owner(club_id) and created_by = auth.uid());

drop policy if exists "Club owners update events" on public.events;
create policy "Club owners update events"
  on public.events for update
  using (public.is_club_owner(club_id))
  with check (public.is_club_owner(club_id));

drop policy if exists "Club owners delete events" on public.events;
create policy "Club owners delete events"
  on public.events for delete
  using (public.is_club_owner(club_id));

-- ---- event_registrations --------------------------------------------------
-- Visible to the registrant and the hosting club owner.
drop policy if exists "Registrations viewable by user or host" on public.event_registrations;
create policy "Registrations viewable by user or host"
  on public.event_registrations for select
  using (user_id = auth.uid() or public.is_event_host(event_id));

-- Users register themselves, only for events they can see.
drop policy if exists "Users register for visible events" on public.event_registrations;
create policy "Users register for visible events"
  on public.event_registrations for insert
  with check (user_id = auth.uid() and public.event_is_visible(event_id));

-- Registrant can update their registration; host can manage too.
drop policy if exists "Users or host update registrations" on public.event_registrations;
create policy "Users or host update registrations"
  on public.event_registrations for update
  using (user_id = auth.uid() or public.is_event_host(event_id))
  with check (user_id = auth.uid() or public.is_event_host(event_id));

-- Registrant can cancel/remove; host can remove.
drop policy if exists "Users or host delete registrations" on public.event_registrations;
create policy "Users or host delete registrations"
  on public.event_registrations for delete
  using (user_id = auth.uid() or public.is_event_host(event_id));
