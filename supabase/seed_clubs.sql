-- ============================================================================
-- JoinMahj — seed_clubs.sql  (demo data, NOT a migration)
--
-- Seeds 3 public clubs + owner memberships + 2 upcoming events per club so the
-- /clubs page can be tested. Safe to rerun:
--   * clubs            → ON CONFLICT (slug) DO UPDATE
--   * club_members     → ON CONFLICT (club_id, user_id) DO NOTHING
--   * events           → guarded with NOT EXISTS (club_id, title)
--
-- Owner = the first existing profile (public.profiles). Create a user first if
-- the table is empty.
-- ============================================================================

do $$
declare
  v_owner uuid;
begin
  select id into v_owner
  from public.profiles
  order by created_at
  limit 1;

  if v_owner is null then
    raise notice 'No profiles found — sign up a user before running this seed.';
    return;
  end if;

  -- 1) Clubs (idempotent on slug)
  insert into public.clubs (owner_id, name, slug, description, city, location, is_public)
  values
    (v_owner, 'New York Mahj Circle', 'new-york-mahj-circle',
      'A welcoming circle for New York beginners and regulars.',
      'New York', 'Manhattan', true),
    (v_owner, 'West Coast Mahjong Nights', 'west-coast-mahjong-nights',
      'Relaxed evening tables up and down the West Coast.',
      'San Francisco', 'Bay Area', true),
    (v_owner, 'Beginner Friendly Table', 'beginner-friendly-table',
      'Zero intimidation — perfect for your very first game.',
      'Austin', 'Downtown', true)
  on conflict (slug) do update
    set name        = excluded.name,
        description = excluded.description,
        city        = excluded.city,
        location    = excluded.location,
        is_public   = excluded.is_public;

  -- 2) Owner membership for each seeded club
  insert into public.club_members (club_id, user_id, role)
  select c.id, v_owner, 'owner'::public.club_member_role
  from public.clubs c
  where c.slug in (
    'new-york-mahj-circle',
    'west-coast-mahjong-nights',
    'beginner-friendly-table'
  )
  on conflict (club_id, user_id) do nothing;

  -- 3) Two upcoming events per club (guarded against duplicates by title)
  insert into public.events (club_id, created_by, title, description, location, starts_at, ends_at, capacity)
  select
    c.id,
    v_owner,
    e.title,
    e.description,
    e.location,
    e.starts_at,
    e.ends_at,
    e.capacity
  from public.clubs c
  cross join (
    values
      ('Beginner Night',
        'A gentle intro session for newcomers.',
        'Main Hall',
        (now() + interval '7 days'),
        (now() + interval '7 days' + interval '2 hours'),
        16),
      ('Weekly Social Table',
        'Our regular social game — all levels welcome.',
        'Community Room',
        (now() + interval '14 days'),
        (now() + interval '14 days' + interval '2 hours'),
        12)
  ) as e(title, description, location, starts_at, ends_at, capacity)
  where c.slug in (
    'new-york-mahj-circle',
    'west-coast-mahjong-nights',
    'beginner-friendly-table'
  )
  and not exists (
    select 1
    from public.events ev
    where ev.club_id = c.id
      and ev.title = e.title
  );
end
$$;
