-- RAV Passport stamp events.
-- Each row is one child adventure/visit/mission recorded by the RAV team.

create table if not exists public.child_passport_stamps (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  stamp_key text not null,
  stamp_name text not null,
  points_awarded int default 0,
  notes text,
  created_at timestamptz default now()
);

alter table public.child_passport_stamps enable row level security;

grant select
on public.child_passport_stamps
to authenticated;

drop policy if exists "Users can read own passport stamps" on public.child_passport_stamps;

create policy "Users can read own passport stamps"
on public.child_passport_stamps
for select
to authenticated
using (auth.uid() = parent_id);
