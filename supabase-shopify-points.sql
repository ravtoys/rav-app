-- Tracks Shopify orders that already awarded RAV stars.
-- This prevents the same Shopify order from giving points twice.

create table if not exists public.shopify_point_awards (
  id uuid primary key default gen_random_uuid(),
  shopify_order_id text not null unique,
  order_name text,
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  subtotal numeric not null default 0,
  currency text not null default 'COP',
  points_awarded int not null default 0,
  status text not null default 'matched',
  created_at timestamptz not null default now()
);

alter table public.shopify_point_awards enable row level security;

revoke all on public.shopify_point_awards from anon, authenticated;
