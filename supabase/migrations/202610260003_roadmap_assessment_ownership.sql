-- Enforce that a roadmap's source assessment belongs to the same user.
-- Run in Supabase SQL Editor. Existing rows are preserved.
do $$
begin
  if exists (
    select 1 from public.learning_roadmaps r
    join public.assessment_attempts a on a.id = r.source_assessment_id
    where r.user_id <> a.user_id
  ) then
    raise exception 'Existing roadmaps reference assessments belonging to other users; inspect and fix those rows before applying this migration';
  end if;
end $$;

create unique index if not exists assessment_attempts_user_id_id_unique_idx
  on public.assessment_attempts(user_id, id);

do $$
begin
 if not exists (
   select 1 from pg_constraint
   where conrelid = 'public.learning_roadmaps'::regclass
   and conname = 'learning_roadmaps_same_user_assessment_fk'
 ) then
   alter table public.learning_roadmaps
     add constraint learning_roadmaps_same_user_assessment_fk
     foreign key (user_id, source_assessment_id)
     references public.assessment_attempts(user_id, id)
     on delete set null (source_assessment_id);
 end if;
end $$;
