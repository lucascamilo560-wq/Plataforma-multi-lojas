# Plataforma Multi-lojas

Plataforma marketplace multi-lojas para conectar comércios locais, lojistas e clientes finais em um único ambiente digital.

## Objetivo

Permitir que pequenos e médios negócios criem sua própria vitrine digital, cadastrem produtos, recebam pedidos, gerenciem clientes e acompanhem vendas, enquanto a plataforma central administra lojas, planos, suporte e configurações globais.

## Perfis do sistema

- Super Admin
- Lojista / Dono da loja
- Funcionário da loja
- Cliente final

## Módulos principais

### Super Admin
- Dashboard geral
- Gestão de lojas
- Planos e assinaturas
- Financeiro
- Suporte e moderação
- Configurações globais

### Lojista
- Dashboard da loja
- Cadastro de produtos
- Gestão de pedidos
- Clientes
- Cupons e promoções
- Perfil da loja
- Relatórios
- Configurações de entrega

### Cliente
- Explorar lojas
- Ver produtos
- Carrinho
- Checkout
- Meus pedidos
- Avaliações
- Perfil

## Stack prevista

- React
- TypeScript
- Vite
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- PWA

## Setup local

1. Instale dependências:

```bash
npm ci
```

2. Crie seu arquivo de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

4. Inicie o projeto:

```bash
npm run dev
```

## Qualidade mínima

Comandos de verificação da base:

```bash
npm run lint
npm run build
```

## Banco de dados e Supabase

### Migrations

As migrations SQL ficam em `supabase/migrations/`. Cada arquivo representa uma versão incremental do schema, nomeado com um timestamp no formato `YYYYMMDDHHMMSS_<descricao>.sql`.

#### Como aplicar as migrations

Instale a CLI do Supabase e vincule ao seu projeto:

```bash
npx supabase login
npx supabase link --project-ref <SEU_PROJECT_REF>
```

Aplique todas as migrations pendentes:

```bash
npx supabase db push
```

Para resetar o banco local (ambiente de desenvolvimento):

```bash
npx supabase db reset
```

### Tipos TypeScript

O arquivo `src/types/database.ts` contém os tipos e interfaces que espelham o schema do banco (tabelas, enums e payloads de inserção). Ele deve ser atualizado sempre que uma nova migration for criada.

O tipo `Database` exportado é compatível com `createClient<Database>()` do `@supabase/supabase-js`, possibilitando consultas tipadas.

### Estado atual: mocks e services reais

Algumas telas ainda consomem dados estáticos definidos em `src/services/mockData.ts`. Isso é intencional nesta etapa. A substituição dos mocks pelos services reais (via Supabase) será feita progressivamente nos PRs seguintes, sem quebrar o build ou o funcionamento da aplicação.

Não há ainda:
- Pagamento real integrado.
- Upload de imagens (Supabase Storage).

## Deploy SPA (evitar 404 em refresh)

Este repositório inclui `vercel.json` com rewrite para `index.html`, evitando erro 404 ao atualizar rotas como `/admin` e `/dashboard`.
