-- Child profiles connected to each adult RAV Club account.
-- Users can only manage child profiles that belong to their own account.

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  nickname text not null,
  birth_date date not null,
  interests text[] default '{}',
  avatar text default 'alien',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.child_profiles enable row level security;

grant select, insert, update, delete
on public.child_profiles
to authenticated;

drop policy if exists "Users can read own child profiles" on public.child_profiles;
drop policy if exists "Users can create own child profiles" on public.child_profiles;
drop policy if exists "Users can update own child profiles" on public.child_profiles;
drop policy if exists "Users can delete own child profiles" on public.child_profiles;

create policy "Users can read own child profiles"
on public.child_profiles
for select
to authenticated
using (auth.uid() = parent_id);

create policy "Users can create own child profiles"
on public.child_profiles
for insert
to authenticated
with check (auth.uid() = parent_id);

create policy "Users can update own child profiles"
on public.child_profiles
for update
to authenticated
using (auth.uid() = parent_id)
with check (auth.uid() = parent_id);

create policy "Users can delete own child profiles"
on public.child_profiles
for delete
to authenticated
using (auth.uid() = parent_id);
