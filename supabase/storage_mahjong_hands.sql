-- ============================================================================
-- JoinMahj — storage_mahjong_hands.sql  (Supabase Storage setup, NOT a migration)
--
-- Creates the `mahjong-hands` public bucket and access policies:
--   * anyone can read (public bucket → getPublicUrl works)
--   * authenticated users can upload/update/delete only within their own
--     folder: mahjong-hands/{auth.uid}/...
--
-- Safe to rerun. Run in the Supabase SQL Editor.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('mahjong-hands', 'mahjong-hands', true)
on conflict (id) do update set public = excluded.public;

-- Public read
drop policy if exists "mahjong-hands public read" on storage.objects;
create policy "mahjong-hands public read"
  on storage.objects for select
  using (bucket_id = 'mahjong-hands');

-- Authenticated users can upload into their own {userId}/ folder
drop policy if exists "mahjong-hands insert own" on storage.objects;
create policy "mahjong-hands insert own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'mahjong-hands'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own objects
drop policy if exists "mahjong-hands update own" on storage.objects;
create policy "mahjong-hands update own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'mahjong-hands'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'mahjong-hands'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own objects
drop policy if exists "mahjong-hands delete own" on storage.objects;
create policy "mahjong-hands delete own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'mahjong-hands'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
