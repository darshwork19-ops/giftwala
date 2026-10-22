-- GIFTWALA database schema for Supabase.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Row Level Security means each signed-in shopper can only read and write
-- their own profile and orders; the public "anon" key can't read anyone's.

-- Profiles: one row per signed-in user (auth.users is managed by Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (phone ~ '^(\+?91)?[6-9][0-9]{9}$'),
  dob date not null,
  anniversary date,
  -- Saved checkout details (delivery, billing, contact) so they follow the user across devices
  checkout jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles
  for select using ((select auth.uid()) = id);

drop policy if exists "Create own profile" on public.profiles;
create policy "Create own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Orders: the full order (lines, addresses, simulated payment) as JSON
create table if not exists public.orders (
  ref text primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  total integer not null check (total >= 0),
  status text not null default 'paid',
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_created on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Read own orders" on public.orders;
create policy "Read own orders" on public.orders
  for select using ((select auth.uid()) = user_id);

drop policy if exists "Create own orders" on public.orders;
create policy "Create own orders" on public.orders
  for insert with check ((select auth.uid()) = user_id);

-- Orders can't be edited or deleted from the site (no update/delete policies).
