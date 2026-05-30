-- ============================================================================
-- JoinMahj — 006_community_post_image
-- Adds an optional image to community posts (e.g. a shared Mahjong hand photo).
-- Reuses the existing community_posts table; no new tables.
-- ============================================================================

alter table public.community_posts
  add column if not exists image_url text;
