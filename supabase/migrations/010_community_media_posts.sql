-- ============================================================================
-- JoinMahj — 010_community_media_posts
-- Upgrades community posts to support media (image / video) and tags.
-- Backwards compatible: existing rows keep working (media_* null, tags '{}').
-- ============================================================================

alter table public.community_posts
  add column if not exists media_url text;

alter table public.community_posts
  add column if not exists media_type text;

alter table public.community_posts
  add column if not exists tags text[] not null default '{}'::text[];

-- media_type must be one of the known kinds (or null for legacy/text posts).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'community_posts_media_type_check'
  ) then
    alter table public.community_posts
      add constraint community_posts_media_type_check
      check (media_type is null or media_type in ('text', 'image', 'video'));
  end if;
end
$$;
