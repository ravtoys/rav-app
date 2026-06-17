create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  child_id uuid null references public.child_profiles(id) on delete set null,
  title text not null,
  image_url text null,
  price numeric null,
  product_url text null,
  uploaded_image_url text null,
  detected_price numeric null,
  detected_title text null,
  match_status text not null default 'manual_confirmed',
  status text not null default 'wanted',
  source text not null default 'manual',
  shopify_product_id text null,
  shopify_variant_id text null,
  sku text null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint wishlist_items_status_check check (status in ('wanted', 'reserved', 'purchased', 'unavailable')),
  constraint wishlist_items_match_status_check check (match_status in ('manual_confirmed', 'pending_confirmation', 'shopify_matched')),
  constraint wishlist_items_source_check check (source in ('manual', 'photo', 'rav_link', 'shopify')),
  constraint wishlist_items_price_check check (price is null or price >= 0)
);

create index if not exists wishlist_items_user_id_idx on public.wishlist_items(user_id);
create index if not exists wishlist_items_child_id_idx on public.wishlist_items(child_id);
create index if not exists wishlist_items_status_idx on public.wishlist_items(status);
create index if not exists wishlist_items_match_status_idx on public.wishlist_items(match_status);

create or replace function public.set_wishlist_items_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_wishlist_items_updated_at on public.wishlist_items;
create trigger set_wishlist_items_updated_at
before update on public.wishlist_items
for each row
execute function public.set_wishlist_items_updated_at();

alter table public.wishlist_items enable row level security;

drop policy if exists "Users can view own wishlist items" on public.wishlist_items;
create policy "Users can view own wishlist items"
on public.wishlist_items
for select
using (user_id = auth.uid());

drop policy if exists "Users can insert own wishlist items" on public.wishlist_items;
create policy "Users can insert own wishlist items"
on public.wishlist_items
for insert
with check (
  user_id = auth.uid()
  and (
    child_id is null
    or exists (
      select 1
      from public.child_profiles
      where child_profiles.id = wishlist_items.child_id
      and child_profiles.parent_id = auth.uid()
    )
  )
);

drop policy if exists "Users can update own wishlist items" on public.wishlist_items;
create policy "Users can update own wishlist items"
on public.wishlist_items
for update
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    child_id is null
    or exists (
      select 1
      from public.child_profiles
      where child_profiles.id = wishlist_items.child_id
      and child_profiles.parent_id = auth.uid()
    )
  )
);

drop policy if exists "Users can delete own wishlist items" on public.wishlist_items;
create policy "Users can delete own wishlist items"
on public.wishlist_items
for delete
using (user_id = auth.uid());
