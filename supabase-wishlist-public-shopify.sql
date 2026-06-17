-- Wishlist public sharing + Shopify catalog matching

alter table public.profiles
add column if not exists wishlist_share_token text,
add column if not exists wishlist_public boolean not null default true;

create unique index if not exists profiles_wishlist_share_token_idx
on public.profiles(wishlist_share_token)
where wishlist_share_token is not null;

alter table public.wishlist_items
drop constraint if exists wishlist_items_status_check;

alter table public.wishlist_items
add constraint wishlist_items_status_check
check (status in ('wanted', 'reserved', 'purchased', 'unavailable'));

-- If you previously added a source check manually, this keeps Shopify valid.
alter table public.wishlist_items
drop constraint if exists wishlist_items_source_check;

alter table public.wishlist_items
add constraint wishlist_items_source_check
check (source in ('manual', 'photo', 'rav_link', 'shopify'));

-- Public access is served through /api/public-wishlist/[token], not direct anon table reads.
