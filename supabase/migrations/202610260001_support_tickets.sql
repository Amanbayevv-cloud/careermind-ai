-- Apply in Supabase SQL Editor once.
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (char_length(subject) between 5 and 120),
  category text not null check (category in ('account','assessment','technical','suggestion','other')),
  description text not null check (char_length(description) between 15 and 3000),
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  created_at timestamptz not null default now()
);
create index if not exists support_tickets_user_created_idx on public.support_tickets(user_id, created_at desc);
alter table public.support_tickets enable row level security;
create policy "support select own" on public.support_tickets for select to authenticated using ((select auth.uid()) = user_id);
create policy "support insert own" on public.support_tickets for insert to authenticated
 with check ((select auth.uid()) = user_id and status = 'open');
-- Users cannot change a ticket's status; project staff can manage tickets in the Supabase dashboard.
