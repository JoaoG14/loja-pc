-- Schema for TechParts Store on Supabase
-- Run this in Supabase SQL editor

-- Extensions (Supabase usually has pgcrypto enabled)
create extension if not exists pgcrypto;

-- ENUMs
do $$ begin
  create type user_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  category_id uuid not null references public.categories(id) on delete cascade,
  brand text,
  model text,
  -- common technical fields for filtering
  socket text,
  chipset text,
  tdp_watts integer,
  memory_type text,
  wattage integer,
  form_factor text,
  warranty_months integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper function used by trigger
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $func$
begin
  new.updated_at = now();
  return new;
end;
$func$;

-- Trigger (must be created after the function exists)
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_current_timestamp_updated_at();

-- Product Images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- Product Specs (key/value)
create table if not exists public.product_specs (
  product_id uuid not null references public.products(id) on delete cascade,
  spec_key text not null,
  spec_value text not null,
  primary key (product_id, spec_key)
);

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- Wishlists
create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- Cart Items (persist per user)
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int2 not null check (rating between 1 and 5),
  title text,
  body text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Basic views or indexes
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_reviews_product on public.reviews(product_id);

-- RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_specs enable row level security;
alter table public.profiles enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select using (true);
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products for select using (true);
drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images" on public.product_images for select using (true);
drop policy if exists "Public can read product specs" on public.product_specs;
create policy "Public can read product specs" on public.product_specs for select using (true);
drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews" on public.reviews for select using (true);

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = user_id);
drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile" on public.profiles for insert with check (auth.uid() = user_id);

drop policy if exists "Wishlist owner select" on public.wishlists;
create policy "Wishlist owner select" on public.wishlists for select using (auth.uid() = user_id);
drop policy if exists "Wishlist owner modify" on public.wishlists;
create policy "Wishlist owner modify" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Cart owner select" on public.cart_items;
create policy "Cart owner select" on public.cart_items for select using (auth.uid() = user_id);
drop policy if exists "Cart owner modify" on public.cart_items;
create policy "Cart owner modify" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Reviews public select" on public.reviews;
create policy "Reviews public select" on public.reviews for select using (true);
drop policy if exists "Reviews insert self" on public.reviews;
create policy "Reviews insert self" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "Reviews update self" on public.reviews;
create policy "Reviews update self" on public.reviews for update using (auth.uid() = user_id);
drop policy if exists "Reviews delete self" on public.reviews;
create policy "Reviews delete self" on public.reviews for delete using (auth.uid() = user_id);

-- Create a helper function to check admin role
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles p where p.user_id = uid and p.role = 'admin'
  );
$$;

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
drop policy if exists "Admins manage product specs" on public.product_specs;
create policy "Admins manage product specs" on public.product_specs for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Seed minimal categories (optional)
insert into public.categories (name, slug)
  values ('Placas de Vídeo', 'placas-de-video'),
         ('Processadores', 'processadores'),
         ('Memórias RAM', 'memorias-ram'),
         ('Placas-mãe', 'placas-mae'),
         ('Fontes', 'fontes'),
         ('Coolers', 'coolers'),
         ('Gabinetes', 'gabinetes'),
         ('Periféricos', 'perifericos')
  on conflict (slug) do nothing;


