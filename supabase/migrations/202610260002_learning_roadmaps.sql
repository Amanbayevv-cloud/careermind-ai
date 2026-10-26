create table if not exists public.learning_roadmaps (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 career_id text not null,
 duration_months integer not null check (duration_months in (3,6)),
 source_assessment_id uuid references public.assessment_attempts(id) on delete set null,
 plan_data jsonb not null,
 completed_tasks jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 unique(user_id,career_id,duration_months)
);
alter table public.learning_roadmaps enable row level security;
create policy "roadmaps select own" on public.learning_roadmaps for select to authenticated using ((select auth.uid())=user_id);
create policy "roadmaps insert own" on public.learning_roadmaps for insert to authenticated with check ((select auth.uid())=user_id);
create policy "roadmaps update own" on public.learning_roadmaps for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "roadmaps delete own" on public.learning_roadmaps for delete to authenticated using ((select auth.uid())=user_id);
