-- RAV Club database security rules.
-- Run this only after Vercel has:
-- 1. SUPABASE_SERVICE_ROLE_KEY
-- 2. RAV_ADMIN_PASSWORD

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.redemptions enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can read own transactions" on public.transactions;
drop policy if exists "Users can read own redemptions" on public.redemptions;

revoke update on public.profiles from anon, authenticated;
revoke insert, update, delete on public.transactions from anon, authenticated;
revoke insert, update, delete on public.redemptions from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;
grant select on public.transactions to authenticated;
grant select on public.redemptions to authenticated;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read own transactions"
on public.transactions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can read own redemptions"
on public.redemptions
for select
to authenticated
using (auth.uid() = user_id);
