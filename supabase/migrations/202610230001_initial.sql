-- Run in Supabase SQL Editor. Auth accounts live in auth.users.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  profile_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  version text not null default '2.0',
  answers jsonb not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists assessment_attempts_user_created_idx
  on public.assessment_attempts (user_id, created_at desc);
alter table public.profiles enable row level security;
alter table public.assessment_attempts enable row level security;
create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "assessments select own" on public.assessment_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "assessments insert own" on public.assessment_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "assessments delete own" on public.assessment_attempts for delete to authenticated using ((select auth.uid()) = user_id);
