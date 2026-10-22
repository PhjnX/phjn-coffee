-- Phjn Coffee — Supabase schema.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- The app fills the menu (36 items) and 12 tables by itself on first start.
--
-- Security: row-level security is ON for every table with NO policies, so the public "anon" key
-- can read or write nothing. Only the server, using the service_role key, talks to the database.

-- ── Menu ─────────────────────────────────────────────────────────────────

create table if not exists categories (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  sort        int  not null default 0
);

-- Choices such as Size, Mức đường, Topping. `options` holds [{id, name, priceDelta, isDefault?}].
create table if not exists option_groups (
  id          text primary key,
  name        text not null,
  select_type text not null check (select_type in ('single', 'multi')),
  is_required boolean not null default false,
  max_select  int check (max_select > 0),
  options     jsonb not null default '[]',
  sort        int not null default 0
);

create table if not exists products (
  id               text primary key,
  slug             text not null unique,
  category_id      text not null references categories(id),
  name             text not null,
  description      text not null default '',
  base_price       int  not null check (base_price >= 0),     -- VND
  is_available     boolean not null default true,
  badge            text check (badge in ('bestseller', 'new', 'signature')),
  option_group_ids text[] not null default '{}',              -- display order
  art              jsonb not null,                             -- drawn fallback (ProductArtSpec)
  image            text,                                       -- cut-out photo
  photo            text,                                       -- framed 4:5 photo
  sort             int not null default 0,
  created_at       timestamptz not null default now()
);

-- ── Tables (QR codes point to /menu?ban=<number>) ───────────────────────

create table if not exists shop_tables (
  number text primary key check (number ~ '^[1-9][0-9]{0,2}$'),
  area   text not null default ''
);

-- ── Orders ───────────────────────────────────────────────────────────────

create table if not exists orders (
  code         text primary key,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  type         text not null check (type in ('delivery', 'table')),
  table_number text,
  name         text not null,
  phone        text not null,
  address      text,
  note         text,
  payment      text not null check (payment in ('cash', 'transfer')),
  status       text not null default 'new' check (status in ('new', 'preparing', 'ready', 'completed', 'cancelled')),
  paid         boolean not null default false,
  lines        jsonb not null,   -- [{productId, name, summary, note, quantity, unitPrice, total}], priced by the server
  subtotal     int not null,
  shipping     int not null default 0,
  total        int not null,
  demo         boolean not null default false
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_demo_idx on orders (demo) where demo;

-- ── Rate limits (login attempts, orders per IP) ──────────────────────────

create table if not exists rate_limits (
  key      text primary key,
  count    int not null,
  reset_at timestamptz not null
);

-- Counts one attempt for p_key and says whether it is within p_limit per p_window_ms. Atomic.
create or replace function hit_rate_limit(p_key text, p_limit int, p_window_ms int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
begin
  insert into rate_limits as r (key, count, reset_at)
  values (p_key, 1, now() + make_interval(secs => p_window_ms / 1000.0))
  on conflict (key) do update
    set count    = case when r.reset_at < now() then 1 else r.count + 1 end,
        reset_at = case when r.reset_at < now() then now() + make_interval(secs => p_window_ms / 1000.0) else r.reset_at end
  returning count into current_count;

  -- Tidy up old keys now and then.
  if random() < 0.01 then
    delete from rate_limits where reset_at < now() - interval '1 day';
  end if;

  return current_count <= p_limit;
end;
$$;

revoke all on function hit_rate_limit(text, int, int) from public, anon, authenticated;

-- ── Grants: only the server's service_role may use these tables ─────────
-- New Supabase projects no longer grant table privileges automatically, so grant them explicitly.

grant usage on schema public to service_role;
grant select, insert, update, delete on categories, option_groups, products, shop_tables, orders, rate_limits to service_role;
grant execute on function hit_rate_limit(text, int, int) to service_role;
revoke all on categories, option_groups, products, shop_tables, orders, rate_limits from anon, authenticated;

-- ── Row-level security: on, no policies ─────────────────────────────────

alter table categories    enable row level security;
alter table option_groups enable row level security;
alter table products      enable row level security;
alter table shop_tables   enable row level security;
alter table orders        enable row level security;
alter table rate_limits   enable row level security;

-- ── Storage bucket for menu photos uploaded from the admin (public read) ──

insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true)
on conflict (id) do nothing;
