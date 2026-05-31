-- ============================================================================
-- JoinMahj — storage_community_media.sql  (Supabase Storage setup, NOT a migration)
--
-- Creates the `community-media` public bucket and access policies:
--   * anyone can read (public bucket → getPublicUrl works)
--   * authenticated users can upload/update/delete only within their own
--     folder: community-media/{auth.uid}/...
--
-- Accepted types (enforced in the app layer, mirrored here on the bucket):
--   * images: jpg, jpeg, png, webp   (max 10MB)
--   * videos: mp4, webm              (max 100MB)
--
-- Safe to rerun. Run in the Supabase SQL Editor.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media',
  'community-media',
  true,
  104857600, -- 100MB hard cap (videos); app enforces 10MB for images
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "community-media public read" on storage.objects;
create policy "community-media public read"
  on storage.objects for select
  using (bucket_id = 'community-media');

-- Authenticated users can upload into their own {userId}/ folder
drop policy if exists "community-media insert own" on storage.objects;
create policy "community-media insert own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'community-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own objects
drop policy if exists "community-media update own" on storage.objects;
create policy "community-media update own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'community-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'community-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own objects
drop policy if exists "community-media delete own" on storage.objects;
create policy "community-media delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'community-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
