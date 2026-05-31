-- ============================================================================
-- JoinMahj — 008_analysis_history_upgrade
-- Adds effective tiles and potential hands to saved analyses.
-- Existing rows default to empty arrays (backwards compatible).
-- ============================================================================

alter table public.analysis_history
  add column if not exists effective_tiles jsonb not null default '[]'::jsonb;

alter table public.analysis_history
  add column if not exists potential_hands jsonb not null default '[]'::jsonb;
