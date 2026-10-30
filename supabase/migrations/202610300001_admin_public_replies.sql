-- Admin Panel 3.0: administrator replies visible to the ticket owner.
-- Apply in Supabase SQL Editor before using the updated UI.
create table if not exists public.support_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  admin_user_id uuid not null references auth.users(id),
  message text not null check (char_length(btrim(message)) between 1 and 3000),
  created_at timestamptz not null default now()
);
create index if not exists support_replies_ticket_created_idx
  on public.support_replies(ticket_id,created_at);
alter table public.support_replies enable row level security;
revoke all on public.support_replies from public, anon, authenticated;
grant select, insert on public.support_replies to authenticated;

create policy "admin read public replies" on public.support_replies
  for select to authenticated
  using ((select public.is_careermind_admin()));
create policy "ticket owner read replies" on public.support_replies
  for select to authenticated
  using (exists (
    select 1 from public.support_tickets t
    where t.id = ticket_id and t.user_id = (select auth.uid())
  ));
create policy "admin write own public replies" on public.support_replies
  for insert to authenticated
  with check (
    (select public.is_careermind_admin())
    and admin_user_id = (select auth.uid())
    and exists (select 1 from public.support_tickets t where t.id = ticket_id)
  );
-- No UPDATE or DELETE grant/policy: submitted replies are immutable.
