# Modelo de dados futuro — Supabase

Este documento registra o modelo de dados e autenticação planejados para quando o HubMascate migrar do modo mock/localStorage para backend real com Supabase.

**Não implementar sem PR específica e aprovação explícita.**

---

## Limitação atual (localStorage)

O app está em modo mock/localStorage. Isso significa:

- `localStorage` do navegador não é o mesmo ambiente do app instalado (PWA ou nativo).
- Sessões não são compartilhadas entre navegador e app.
- Não há como reconhecer o mesmo usuário em dispositivos diferentes.
- O contexto de loja convidante pode se perder ao instalar o app.
- Dados de perfil e pedidos existem apenas no dispositivo do usuário.

---

## Supabase Auth

### Fluxo básico

```ts
// Cadastro do cliente
const { data, error } = await supabase.auth.signUp({
  email: 'cliente@email.com',
  password: 'senha_segura',
  options: {
    data: {
      role: 'customer', // ou 'seller'
      invited_by_store_slug: 'minha-loja', // contexto de convite
    },
  },
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'cliente@email.com',
  password: 'senha_segura',
})
```

### Preservar contexto de convite

Ao fazer login/cadastro via link de loja, o `slug` deve ser preservado:

```ts
// Antes do redirect para login
localStorage.setItem('pending_store_invite', JSON.stringify({
  slug: 'minha-loja',
  timestamp: Date.now(),
}))

// Após login bem-sucedido
const pendingInvite = localStorage.getItem('pending_store_invite')
if (pendingInvite) {
  const { slug } = JSON.parse(pendingInvite)
  await linkCustomerToStore(userId, slug, 'invite_link')
  localStorage.removeItem('pending_store_invite')
  navigate(`/loja/${slug}`)
}
```

---

## Tabelas principais

### `profiles`

Perfil do usuário (cliente ou lojista).

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('customer', 'seller', 'admin')),
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `customer_addresses`

Endereços do cliente (pode ter múltiplos).

```sql
create table customer_addresses (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references profiles(id) on delete cascade not null,
  label text,                 -- ex.: "Casa", "Trabalho"
  street text not null,
  number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  reference text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `stores`

Lojas criadas por lojistas.

```sql
create table stores (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  slug text unique not null,
  name text not null,
  description text,
  logo_url text,
  banner_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `customer_store_links`

Vínculo entre cliente e loja (acesso por convite, QR Code ou manual).

```sql
create table customer_store_links (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references profiles(id) on delete cascade not null,
  store_id uuid references stores(id) on delete cascade not null,
  source text not null check (source in ('invite_link', 'qr_code', 'manual')),
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  last_accessed_at timestamptz,
  is_active boolean default true,
  unique (customer_id, store_id)
);
```

---

## Row Level Security (RLS)

### `profiles`

```sql
-- Usuário pode ler e atualizar apenas o próprio perfil
alter table profiles enable row level security;

create policy "Own profile read" on profiles
  for select using (auth.uid() = id);

create policy "Own profile update" on profiles
  for update using (auth.uid() = id);
```

### `customer_addresses`

```sql
-- Cliente acessa apenas os próprios endereços
alter table customer_addresses enable row level security;

create policy "Own addresses" on customer_addresses
  for all using (auth.uid() = customer_id);
```

### `customer_store_links`

```sql
-- Cliente acessa apenas seus próprios vínculos
alter table customer_store_links enable row level security;

create policy "Own store links" on customer_store_links
  for all using (auth.uid() = customer_id);
```

### `stores`

```sql
-- Vitrine pública: qualquer pessoa pode ler lojas ativas
alter table stores enable row level security;

create policy "Public storefront read" on stores
  for select using (is_active = true);

-- Lojista gerencia apenas a própria loja
create policy "Owner store write" on stores
  for all using (auth.uid() = owner_id);
```

---

## Consultas planejadas

### Vitrine pública

```ts
// Busca apenas a loja acessada por slug — nunca todas as lojas
async function getPublicStorefront(slug: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return { data, error }
}
```

### Lojas do cliente (minhas lojas)

```ts
// Busca apenas as lojas vinculadas ao cliente autenticado
async function getCustomerStores(customerId: string) {
  const { data, error } = await supabase
    .from('customer_store_links')
    .select('store_id, source, last_accessed_at, stores(*)')
    .eq('customer_id', customerId)
    .eq('is_active', true)
    .order('last_accessed_at', { ascending: false })
  return { data, error }
}
```

### Vincular cliente à loja

```ts
async function linkCustomerToStore(
  customerId: string,
  storeSlug: string,
  source: 'invite_link' | 'qr_code' | 'manual'
) {
  const store = await getPublicStorefront(storeSlug)
  if (!store.data) return { error: 'Store not found' }

  const { data, error } = await supabase
    .from('customer_store_links')
    .upsert({
      customer_id: customerId,
      store_id: store.data.id,
      source,
      accepted_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
      is_active: true,
    }, { onConflict: 'customer_id,store_id' })
  return { data, error }
}
```

---

## Regras importantes

- **Nunca buscar todas as lojas** para a experiência do cliente comum — sempre filtrar por `slug` ou por `customer_store_links`.
- **Super Admin** é o único perfil que pode contornar o RLS para ver todas as lojas (via service role ou política específica de admin).
- **Não implementar** nenhuma dessas tabelas ou políticas sem PR específica.
- **Não misturar** chamadas Supabase com lógica mock sem refatoração completa da camada de serviço.

---

## Fase de migração (quando vier)

1. Criar PR específica para: Supabase Auth + tabela `profiles`.
2. Criar PR específica para: tabelas `stores` + migração das lojas mock.
3. Criar PR específica para: `customer_addresses` + perfil completo do cliente.
4. Criar PR específica para: `customer_store_links` + fluxo de convite real.
5. Criar PR específica para: RLS completo + testes de segurança.
6. Criar PR específica para: remoção da camada mock após validação.

Cada etapa deve ser validada isoladamente antes de avançar para a próxima.
