-- CareerMind AI: read-only RLS audit. Run in Supabase SQL Editor.
-- IMPORTANT: SQL Editor runs with administrator privileges and bypasses RLS.
-- These queries inspect configuration; they do NOT prove two-user isolation.

-- 1. RLS enabled on every user-data table?
select c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public'
and c.relkind='r'
and c.relname in ('profiles','assessment_attempts','support_tickets','learning_roadmaps')
order by table_name;

-- 2. List policies and their precise conditions.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public'
and tablename in ('profiles','assessment_attempts','support_tickets','learning_roadmaps')
order by tablename, cmd, policyname;

-- 3. Database access granted to anonymous vs authenticated API roles.
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema='public'
and table_name in ('profiles','assessment_attempts','support_tickets','learning_roadmaps')
and grantee in ('anon','authenticated')
order by table_name, grantee, privilege_type;

-- 4. Confirm roadmaps reference assessment rows via FK, but note:
-- the original FK only validates assessment id existence, not ownership.
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid='public.learning_roadmaps'::regclass
order by conname;
