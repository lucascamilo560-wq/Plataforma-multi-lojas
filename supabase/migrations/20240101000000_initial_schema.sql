-- ============================================================
-- Migration inicial – Plataforma Multi-lojas
-- ============================================================

-- ------------------------------------------------------------
-- Extensões
-- ------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
create type user_role as enum ('customer', 'store_admin', 'super_admin');
create type store_status as enum ('pending', 'active', 'suspended', 'inactive');
create type order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled'
);
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type payment_method as enum ('pix', 'card', 'cash', 'pickup_payment');

-- ------------------------------------------------------------
-- Tabela: profiles
-- Espelha auth.users com dados de perfil do usuário.
-- ------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabela: stores
-- ------------------------------------------------------------
create table stores (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references profiles (id) on delete restrict,
  name         text not null,
  slug         text not null unique,
  description  text,
  category     text,
  logo_url     text,
  banner_url   text,
  status       store_status not null default 'pending',
  city         text,
  state        text,
  address      text,
  phone        text,
  email        text,
  website      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabela: store_members
-- Relaciona usuários (funcionários/admins) às lojas.
-- ------------------------------------------------------------
create table store_members (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  role       user_role not null default 'store_admin',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

-- ------------------------------------------------------------
-- Tabela: categories
-- ------------------------------------------------------------
create table categories (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores (id) on delete cascade,
  name       text not null,
  slug       text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);

-- ------------------------------------------------------------
-- Tabela: products
-- ------------------------------------------------------------
create table products (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references stores (id) on delete cascade,
  category_id  uuid references categories (id) on delete set null,
  name         text not null,
  description  text,
  price        numeric(12, 2) not null check (price >= 0),
  stock        integer not null default 0 check (stock >= 0),
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabela: customer_addresses
-- ------------------------------------------------------------
create table customer_addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  label        text,
  street       text not null,
  number       text,
  complement   text,
  neighborhood text,
  city         text not null,
  state        text not null,
  zip_code     text not null,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabela: orders
-- ------------------------------------------------------------
create table orders (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null references stores (id) on delete restrict,
  customer_id      uuid not null references profiles (id) on delete restrict,
  address_id       uuid references customer_addresses (id) on delete set null,
  status           order_status not null default 'pending',
  payment_status   payment_status not null default 'pending',
  payment_method   payment_method,
  subtotal         numeric(12, 2) not null check (subtotal >= 0),
  delivery_fee     numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  total            numeric(12, 2) not null check (total >= 0),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabela: order_items
-- ------------------------------------------------------------
create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders (id) on delete cascade,
  product_id   uuid references products (id) on delete set null,
  product_name text not null,
  quantity     integer not null check (quantity > 0),
  unit_price   numeric(12, 2) not null check (unit_price >= 0),
  total_price  numeric(12, 2) not null check (total_price >= 0),
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabela: cart_items
-- ------------------------------------------------------------
create table cart_items (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================
-- Índices
-- ============================================================
create index idx_stores_owner_id      on stores (owner_id);
create index idx_stores_status        on stores (status);
create index idx_products_store_id    on products (store_id);
create index idx_products_is_active   on products (is_active);
create index idx_orders_store_id      on orders (store_id);
create index idx_orders_customer_id   on orders (customer_id);
create index idx_order_items_order_id on order_items (order_id);
create index idx_store_members_user_id  on store_members (user_id);
create index idx_store_members_store_id on store_members (store_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table profiles          enable row level security;
alter table stores             enable row level security;
alter table store_members      enable row level security;
alter table categories         enable row level security;
alter table products           enable row level security;
alter table customer_addresses enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table cart_items         enable row level security;

-- ------------------------------------------------------------
-- Funções auxiliares de RLS
-- ------------------------------------------------------------

-- Retorna o papel do usuário autenticado
create or replace function get_user_role()
returns user_role
language sql
stable
security definer
as $$
  select role from profiles where id = auth.uid();
$$;

-- Verifica se o usuário é membro de uma loja
create or replace function is_store_member(p_store_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from store_members
    where store_id = p_store_id
      and user_id  = auth.uid()
  );
$$;

-- ============================================================
-- Políticas de RLS
-- ============================================================

-- ---- profiles ----
create policy "Super admin lê todos os perfis"
  on profiles for select
  using (get_user_role() = 'super_admin');

create policy "Usuário lê e edita o próprio perfil"
  on profiles for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---- stores ----
create policy "Super admin gerencia lojas"
  on stores for all
  using (get_user_role() = 'super_admin');

create policy "Lojista gerencia a própria loja"
  on stores for all
  using (is_store_member(id))
  with check (is_store_member(id));

create policy "Cliente lista lojas ativas"
  on stores for select
  using (status = 'active');

-- ---- store_members ----
create policy "Super admin gerencia membros"
  on store_members for all
  using (get_user_role() = 'super_admin');

create policy "Lojista vê membros da própria loja"
  on store_members for select
  using (is_store_member(store_id));

-- ---- categories ----
create policy "Super admin gerencia categorias"
  on categories for all
  using (get_user_role() = 'super_admin');

create policy "Lojista gerencia categorias da própria loja"
  on categories for all
  using (is_store_member(store_id))
  with check (is_store_member(store_id));

create policy "Cliente lista categorias de lojas ativas"
  on categories for select
  using (
    exists (
      select 1 from stores
      where stores.id = categories.store_id
        and stores.status = 'active'
    )
  );

-- ---- products ----
create policy "Super admin gerencia produtos"
  on products for all
  using (get_user_role() = 'super_admin');

create policy "Lojista gerencia produtos da própria loja"
  on products for all
  using (is_store_member(store_id))
  with check (is_store_member(store_id));

create policy "Cliente lista produtos ativos de lojas ativas"
  on products for select
  using (
    is_active = true
    and exists (
      select 1 from stores
      where stores.id = products.store_id
        and stores.status = 'active'
    )
  );

-- ---- customer_addresses ----
create policy "Super admin lê endereços"
  on customer_addresses for select
  using (get_user_role() = 'super_admin');

create policy "Cliente gerencia seus endereços"
  on customer_addresses for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---- orders ----
create policy "Super admin gerencia pedidos"
  on orders for all
  using (get_user_role() = 'super_admin');

create policy "Lojista vê pedidos da própria loja"
  on orders for select
  using (is_store_member(store_id));

create policy "Lojista atualiza status de pedidos da própria loja"
  on orders for update
  using (is_store_member(store_id))
  with check (is_store_member(store_id));

create policy "Cliente gerencia os próprios pedidos"
  on orders for all
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- ---- order_items ----
create policy "Super admin gerencia itens de pedido"
  on order_items for all
  using (get_user_role() = 'super_admin');

create policy "Lojista vê itens de pedidos da própria loja"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and is_store_member(orders.store_id)
    )
  );

create policy "Cliente vê itens dos próprios pedidos"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

create policy "Cliente insere itens nos próprios pedidos"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

-- ---- cart_items ----
create policy "Super admin gerencia carrinho"
  on cart_items for all
  using (get_user_role() = 'super_admin');

create policy "Cliente gerencia o próprio carrinho"
  on cart_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
