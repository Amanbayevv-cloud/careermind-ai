-- CareerMind AI: per-user API limit, 5 requests per 60-second window.
-- Run once in Supabase SQL Editor before deploying the updated Edge Function.
create table if not exists public.career_chat_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0)
);
alter table public.career_chat_rate_limits enable row level security;
-- No direct client access. SECURITY DEFINER function owns the atomic counter.
revoke all on public.career_chat_rate_limits from public, anon, authenticated;
create or replace function public.consume_career_chat_quota()
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_uid uuid := (select auth.uid());
  now_utc timestamptz := clock_timestamp();
  started timestamptz;
  count_now integer;
begin
  if current_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  insert into public.career_chat_rate_limits as limits
    (user_id, window_started_at, request_count)
  values (current_uid, now_utc, 1)
  on conflict (user_id) do update
    set window_started_at = case
          when limits.window_started_at <= now_utc - interval '60 seconds'
          then now_utc else limits.window_started_at end,
        request_count = case
          when limits.window_started_at <= now_utc - interval '60 seconds'
          then 1 else limits.request_count + 1 end
  returning window_started_at, request_count
    into started, count_now;

  return query select
    count_now <= 5,
    case when count_now <= 5 then 0
      else greatest(1, ceil(extract(epoch from (started + interval '60 seconds' - now_utc)))::integer)
    end;
end;
$$;
revoke all on function public.consume_career_chat_quota() from public, anon;
grant execute on function public.consume_career_chat_quota() to authenticated;
-- Periodically remove old quota rows for deleted/inactive users if required.
