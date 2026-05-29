-- ============================================================================
-- JoinMahj — 005_community_schema
-- Reddit-style beginner community: posts, comments, likes.
--
-- Depends on 001_initial_schema: public.set_updated_at().
--
-- Conventions (same as prior migrations):
--   * uuid primary keys (gen_random_uuid)
--   * created_at / updated_at (UTC, auto-maintained)
--   * Row Level Security enabled
--   * denormalized counts kept accurate via SECURITY DEFINER triggers
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- community_posts
-- ============================================================================
create table if not exists public.community_posts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  title           text not null,
  content         text not null,
  likes_count     integer not null default 0,
  comments_count  integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists community_posts_user_id_idx
  on public.community_posts (user_id);
create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);

create trigger community_posts_set_updated_at
  before update on public.community_posts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- community_comments
-- ============================================================================
create table if not exists public.community_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.community_posts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists community_comments_post_id_idx
  on public.community_comments (post_id);
create index if not exists community_comments_post_id_created_at_idx
  on public.community_comments (post_id, created_at);
create index if not exists community_comments_user_id_idx
  on public.community_comments (user_id);

create trigger community_comments_set_updated_at
  before update on public.community_comments
  for each row execute function public.set_updated_at();

-- ============================================================================
-- community_likes
-- ============================================================================
create table if not exists public.community_likes (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.community_posts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists community_likes_post_id_idx
  on public.community_likes (post_id);
create index if not exists community_likes_user_id_idx
  on public.community_likes (user_id);

-- ============================================================================
-- Denormalized count maintenance (SECURITY DEFINER → bypasses RLS so counts
-- update even though users have no UPDATE policy on community_posts).
-- ============================================================================
create or replace function public.sync_post_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.community_posts
      set comments_count = comments_count + 1
      where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.community_posts
      set comments_count = greatest(comments_count - 1, 0)
      where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

create or replace function public.sync_post_likes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.community_posts
      set likes_count = likes_count + 1
      where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.community_posts
      set likes_count = greatest(likes_count - 1, 0)
      where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists community_comments_count_trigger on public.community_comments;
create trigger community_comments_count_trigger
  after insert or delete on public.community_comments
  for each row execute function public.sync_post_comments_count();

drop trigger if exists community_likes_count_trigger on public.community_likes;
create trigger community_likes_count_trigger
  after insert or delete on public.community_likes
  for each row execute function public.sync_post_likes_count();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.community_posts    enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes    enable row level security;

-- ---- community_posts ------------------------------------------------------
-- Everyone can read; authenticated users can create their own. No update/delete.
drop policy if exists "Posts are viewable by everyone" on public.community_posts;
create policy "Posts are viewable by everyone"
  on public.community_posts for select
  using (true);

drop policy if exists "Users can create own posts" on public.community_posts;
create policy "Users can create own posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

-- ---- community_comments ---------------------------------------------------
-- Everyone can read; authenticated users can create their own. No update/delete.
drop policy if exists "Comments are viewable by everyone" on public.community_comments;
create policy "Comments are viewable by everyone"
  on public.community_comments for select
  using (true);

drop policy if exists "Users can create own comments" on public.community_comments;
create policy "Users can create own comments"
  on public.community_comments for insert
  with check (auth.uid() = user_id);

-- ---- community_likes ------------------------------------------------------
-- Everyone can read; users can create and delete only their own likes.
drop policy if exists "Likes are viewable by everyone" on public.community_likes;
create policy "Likes are viewable by everyone"
  on public.community_likes for select
  using (true);

drop policy if exists "Users can create own likes" on public.community_likes;
create policy "Users can create own likes"
  on public.community_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own likes" on public.community_likes;
create policy "Users can delete own likes"
  on public.community_likes for delete
  using (auth.uid() = user_id);
