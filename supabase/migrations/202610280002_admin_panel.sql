-- CareerMind AI Admin Panel 1.0. Run in Supabase SQL Editor.
-- IMPORTANT: add the initial administrator manually with the separate SQL in instructions.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;

create or replace function public.is_careermind_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_careermind_admin() from public, anon;
grant execute on function public.is_careermind_admin() to authenticated;

-- Admins can review profiles, but not edit another user's profile.
create policy "admin read profiles"
on public.profiles for select to authenticated
using ((select public.is_careermind_admin()));

-- Admins can review tickets and change only their status via RLS + column grants.
create policy "admin read tickets"
on public.support_tickets for select to authenticated
using ((select public.is_careermind_admin()));

create policy "admin update tickets"
on public.support_tickets for update to authenticated
using ((select public.is_careermind_admin()))
with check ((select public.is_careermind_admin()));

-- Existing clients need INSERT and SELECT. Only status edits are admin-enabled.
-- NOTE: column-level UPDATE cannot narrow a pre-existing table-level UPDATE grant.
revoke update on public.support_tickets from authenticated;
grant update (status) on public.support_tickets to authenticated;
-- Restrict status values through an existing check or create one if absent.
alter table public.support_tickets
  add constraint support_tickets_status_admin_check
  check (status in ('open', 'in_progress', 'resolved'));
