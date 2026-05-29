-- ============================================================================
-- JoinMahj — 003_courses_lessons_schema
-- Learning schema: courses, lessons, lesson_progress, quizzes,
-- quiz_questions, quiz_attempts.
--
-- Depends on 001_initial_schema:
--   * public.profiles
--   * public.subscriptions
--   * public.set_updated_at()
--   * public.progress_status enum  (reused for lesson_progress.status)
--
-- Conventions (same as 001/002):
--   * uuid primary keys (gen_random_uuid)
--   * created_at / updated_at on every table (UTC, auto-maintained)
--   * foreign keys with ON DELETE CASCADE
--   * indexes on all foreign keys + common lookups
--   * Row Level Security enabled on every table
--
-- Capabilities:
--   * courses contain lessons (ordered)
--   * lessons can be free or premium
--   * users can track lesson progress
--   * quizzes belong to lessons
--   * users can submit quiz attempts
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'quiz_question_type') then
    create type public.quiz_question_type as enum (
      'single_choice', 'multiple_choice', 'boolean', 'text'
    );
  end if;
end
$$;

-- ============================================================================
-- courses
-- ============================================================================
create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  title         text not null,
  description   text,
  is_published  boolean not null default false,
  position      integer not null default 0,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now())
);

create unique index if not exists courses_slug_key on public.courses (slug);
create index if not exists courses_is_published_idx on public.courses (is_published);
create index if not exists courses_position_idx on public.courses (position);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- ============================================================================
-- lessons  (belong to a course; free or premium)
-- ============================================================================
create table if not exists public.lessons (
  id                uuid primary key default gen_random_uuid(),
  course_id         uuid not null references public.courses (id) on delete cascade,
  slug              text not null,
  title             text not null,
  content           text,
  is_premium        boolean not null default false,
  position          integer not null default 0,
  duration_minutes  integer check (duration_minutes is null or duration_minutes >= 0),
  created_at        timestamptz not null default timezone('utc', now()),
  updated_at        timestamptz not null default timezone('utc', now()),
  unique (course_id, slug)
);

create index if not exists lessons_course_id_idx on public.lessons (course_id);
create index if not exists lessons_course_id_position_idx
  on public.lessons (course_id, position);
create index if not exists lessons_is_premium_idx on public.lessons (is_premium);

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

-- ============================================================================
-- lesson_progress  (per user per lesson)
-- ============================================================================
create table if not exists public.lesson_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  lesson_id       uuid not null references public.lessons (id) on delete cascade,
  status          public.progress_status not null default 'not_started',
  completed_at    timestamptz,
  last_viewed_at  timestamptz,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now()),
  unique (user_id, lesson_id)
);

create index if not exists lesson_progress_user_id_idx
  on public.lesson_progress (user_id);
create index if not exists lesson_progress_lesson_id_idx
  on public.lesson_progress (lesson_id);

create trigger lesson_progress_set_updated_at
  before update on public.lesson_progress
  for each row execute function public.set_updated_at();

-- ============================================================================
-- quizzes  (belong to a lesson)
-- ============================================================================
create table if not exists public.quizzes (
  id             uuid primary key default gen_random_uuid(),
  lesson_id      uuid not null references public.lessons (id) on delete cascade,
  title          text not null,
  description    text,
  passing_score  integer not null default 0 check (passing_score >= 0),
  created_at     timestamptz not null default timezone('utc', now()),
  updated_at     timestamptz not null default timezone('utc', now())
);

create index if not exists quizzes_lesson_id_idx on public.quizzes (lesson_id);

create trigger quizzes_set_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- quiz_questions  (belong to a quiz)
-- correct_answer is sensitive — see RLS note below.
-- ============================================================================
create table if not exists public.quiz_questions (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes (id) on delete cascade,
  prompt          text not null,
  question_type   public.quiz_question_type not null default 'single_choice',
  options         jsonb not null default '[]'::jsonb,
  correct_answer  jsonb,
  points          integer not null default 1 check (points >= 0),
  position        integer not null default 0,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index if not exists quiz_questions_quiz_id_idx
  on public.quiz_questions (quiz_id);
create index if not exists quiz_questions_quiz_id_position_idx
  on public.quiz_questions (quiz_id, position);

create trigger quiz_questions_set_updated_at
  before update on public.quiz_questions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- quiz_attempts  (a user's submission for a quiz)
-- ============================================================================
create table if not exists public.quiz_attempts (
  id            uuid primary key default gen_random_uuid(),
  quiz_id       uuid not null references public.quizzes (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  answers       jsonb not null default '[]'::jsonb,
  score         integer,
  max_score     integer,
  passed        boolean,
  started_at    timestamptz not null default timezone('utc', now()),
  completed_at  timestamptz,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now())
);

create index if not exists quiz_attempts_quiz_id_idx
  on public.quiz_attempts (quiz_id);
create index if not exists quiz_attempts_user_id_idx
  on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_user_id_quiz_id_idx
  on public.quiz_attempts (user_id, quiz_id);

create trigger quiz_attempts_set_updated_at
  before update on public.quiz_attempts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- SECURITY DEFINER helpers (bypass RLS to avoid recursion + centralize gating)
-- ============================================================================

-- Active paid subscription (member or club_pro).
create or replace function public.has_premium_access()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.subscriptions s
    where s.user_id = auth.uid()
      and s.plan in ('member', 'club_pro')
      and s.status in ('active', 'trialing')
  );
$$;

create or replace function public.course_is_published(_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.courses c
    where c.id = _course_id and c.is_published
  );
$$;

-- A lesson is accessible when its course is published AND the lesson is either
-- free or the user holds premium access.
create or replace function public.lesson_is_accessible(_lesson_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = _lesson_id
      and c.is_published
      and (l.is_premium = false or public.has_premium_access())
  );
$$;

create or replace function public.quiz_is_accessible(_quiz_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.quizzes q
    where q.id = _quiz_id
      and public.lesson_is_accessible(q.lesson_id)
  );
$$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.courses         enable row level security;
alter table public.lessons         enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes         enable row level security;
alter table public.quiz_questions  enable row level security;
alter table public.quiz_attempts   enable row level security;

-- ---- courses: published courses are readable by everyone --------------------
-- Authoring/writes are performed by the service role, which bypasses RLS.
drop policy if exists "Published courses are viewable" on public.courses;
create policy "Published courses are viewable"
  on public.courses for select
  using (is_published);

-- ---- lessons: readable when course published; premium gated -----------------
drop policy if exists "Accessible lessons are viewable" on public.lessons;
create policy "Accessible lessons are viewable"
  on public.lessons for select
  using (
    public.course_is_published(course_id)
    and (is_premium = false or public.has_premium_access())
  );

-- ---- lesson_progress: full owner-scoped CRUD --------------------------------
drop policy if exists "Lesson progress viewable by owner" on public.lesson_progress;
create policy "Lesson progress viewable by owner"
  on public.lesson_progress for select
  using (user_id = auth.uid());

drop policy if exists "Lesson progress insertable by owner" on public.lesson_progress;
create policy "Lesson progress insertable by owner"
  on public.lesson_progress for insert
  with check (user_id = auth.uid() and public.lesson_is_accessible(lesson_id));

drop policy if exists "Lesson progress updatable by owner" on public.lesson_progress;
create policy "Lesson progress updatable by owner"
  on public.lesson_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Lesson progress deletable by owner" on public.lesson_progress;
create policy "Lesson progress deletable by owner"
  on public.lesson_progress for delete
  using (user_id = auth.uid());

-- ---- quizzes: readable when their lesson is accessible ----------------------
drop policy if exists "Accessible quizzes are viewable" on public.quizzes;
create policy "Accessible quizzes are viewable"
  on public.quizzes for select
  using (public.lesson_is_accessible(lesson_id));

-- ---- quiz_questions ---------------------------------------------------------
-- NOTE: rows include the sensitive `correct_answer`. RLS is row-level, not
-- column-level, so to prevent answer leakage the recommendation is to serve
-- questions to clients through a server route / restricted view that omits
-- `correct_answer`, and to grade attempts with the service role.
-- The policy below allows reads only for users who can access the lesson.
drop policy if exists "Accessible quiz questions are viewable" on public.quiz_questions;
create policy "Accessible quiz questions are viewable"
  on public.quiz_questions for select
  using (public.quiz_is_accessible(quiz_id));

-- ---- quiz_attempts: owner-scoped (grading finalized by service role) --------
drop policy if exists "Quiz attempts viewable by owner" on public.quiz_attempts;
create policy "Quiz attempts viewable by owner"
  on public.quiz_attempts for select
  using (user_id = auth.uid());

drop policy if exists "Quiz attempts insertable by owner" on public.quiz_attempts;
create policy "Quiz attempts insertable by owner"
  on public.quiz_attempts for insert
  with check (user_id = auth.uid() and public.quiz_is_accessible(quiz_id));

drop policy if exists "Quiz attempts updatable by owner" on public.quiz_attempts;
create policy "Quiz attempts updatable by owner"
  on public.quiz_attempts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
