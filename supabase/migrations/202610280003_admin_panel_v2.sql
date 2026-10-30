-- CareerMind Admin Panel 2.0. Run in Supabase SQL Editor as project administrator.
-- Private admin-only internal notes and immutable status change log.
create table if not exists public.support_admin_notes (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  admin_user_id uuid not null references auth.users(id),
  note text not null check (char_length(note) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.support_admin_notes enable row level security;
revoke all on public.support_admin_notes from public, anon, authenticated;
grant select, insert on public.support_admin_notes to authenticated;
create policy "admin select internal notes" on public.support_admin_notes
  for select to authenticated using ((select public.is_careermind_admin()));
create policy "admin insert own internal notes" on public.support_admin_notes
  for insert to authenticated
  with check ((select public.is_careermind_admin()) and admin_user_id = (select auth.uid()));

create table if not exists public.support_status_audit (
  id bigint generated always as identity primary key,
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  admin_user_id uuid references auth.users(id),
  old_status text not null,
  new_status text not null,
  changed_at timestamptz not null default now()
);
alter table public.support_status_audit enable row level security;
revoke all on public.support_status_audit from public, anon, authenticated;
grant select on public.support_status_audit to authenticated;
create policy "admin read status audit" on public.support_status_audit
  for select to authenticated using ((select public.is_careermind_admin()));

-- Trigger runs as its owner to write audit entries; clients cannot write audit rows.
create or replace function public.log_support_status_change()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.support_status_audit
      (ticket_id, admin_user_id, old_status, new_status)
    values (new.id, (select auth.uid()), old.status, new.status);
  end if;
  return new;
end;
$$;
revoke all on function public.log_support_status_change() from public, anon, authenticated;
drop trigger if exists log_support_status_change_trigger on public.support_tickets;
create trigger log_support_status_change_trigger
  after update of status on public.support_tickets
  for each row execute function public.log_support_status_change();
