# HubMascate

HubMascate é uma plataforma de vitrines digitais para vendedores locais criarem, compartilharem e gerenciarem sua própria loja no celular.

> Direção atual do produto: este app **não** deve ser tratado como marketplace aberto, shopping público, Mercado Livre, Shopee ou catálogo global de todas as lojas. O cliente entra principalmente pelo convite/link de um lojista e vê somente aquela loja.

## Objetivo

Permitir que cada lojista crie sua própria vitrine digital, personalize sua marca, cadastre produtos, compartilhe um link/QR Code com clientes, receba pedidos, configure formas próprias de pagamento/entrega e fidelize clientes dentro do app.

A plataforma central continua existindo para Super Admin gerenciar lojistas, lojas, planos, suporte e configurações globais, mas a experiência do cliente final deve ser orientada por convite de loja, não por exploração pública de todas as lojas.

## Princípios do produto

1. **Cada lojista tem sua própria vitrine/app dentro da plataforma.**
2. **O link público oficial da loja é `/loja/:slug`.**
3. **O cliente só deve ver lojas acessadas por link, QR Code, convite ou lojas que ele salvou/seguiu.**
4. **O cliente sem convite não vê uma lista de lojas fake ou catálogo global.**
5. **Explorar lojas não é fluxo principal do MVP.** Pode existir no futuro para lojas públicas, mas não deve reintroduzir marketplace aberto.
6. **Lojas de demonstração são apenas seed/dev.** Elas não devem aparecer automaticamente para cliente comum.
7. **O lojista novo começa sem loja e precisa criar a própria loja.**
8. **O Super Admin pode ver todas as lojas. O cliente não.**

## Perfis do sistema

- Super Admin
- Lojista / Dono da loja
- Funcionário da loja (previsto)
- Cliente final

## Fluxos principais

### Lojista

Fluxo correto:

1. Entra como lojista.
2. Se não tiver loja vinculada, vai para `/lojista/criar-loja`.
3. Cria a própria loja com nome, categoria, cidade, descrição, WhatsApp, cores, logo e banner.
4. Acessa o painel da loja.
5. Cadastra produtos, serviços e produtos por link.
6. Configura formas próprias de pagamento e entrega/retirada.
7. Acessa **Minha Vitrine**.
8. Copia/compartilha o link público ou QR Code da loja.

Rotas principais:

- `/lojista`
- `/lojista/criar-loja`
- `/lojista/minha-loja`
- `/lojista/minha-vitrine`
- `/lojista/produtos`
- `/lojista/produtos/novo`
- `/lojista/pedidos`
- `/lojista/promocoes`
- `/lojista/cupons`
- `/lojista/clientes`
- `/lojista/pagamentos`
- `/lojista/entrega`
- `/lojista/marca`
- `/lojista/relatorios`

### Cliente

Fluxo correto:

1. Recebe link ou QR Code de um lojista.
2. Acessa `/loja/:slug`.
3. Vê somente aquela loja.
4. Pode seguir/salvar a loja.
5. Adiciona produtos físicos ao carrinho daquela loja.
6. Finaliza pedido naquela loja.
7. Acompanha pedidos e ofertas daquela loja.

Se o cliente entrar sem link ou convite:

- Não deve ver lojas fake.
- Não deve ver catálogo global.
- Deve ver estado vazio com campo para colar link/código da loja ou instrução para pedir o link ao lojista.

Rotas principais:

- `/cliente`
- `/cliente/minhas-lojas`
- `/cliente/pedidos`
- `/cliente/perfil`
- `/loja/:slug`
- `/loja/:slug/carrinho`
- `/loja/:slug/checkout`
- `/loja/:slug/pedido/:orderId`

A rota `/cliente/explorar` pode existir, mas no MVP deve ficar secundária/desabilitada com mensagem de “em breve”, sem listar lojas fake automaticamente.

### Super Admin

O Super Admin gerencia a plataforma inteira e pode ver todas as lojas.

Rotas principais:

- `/admin`
- `/admin/lojas`
- `/admin/lojistas`
- `/admin/clientes`
- `/admin/planos`
- `/admin/pedidos`
- `/admin/suporte`
- `/admin/configuracoes`

## Produtos

O app deve suportar tipos diferentes de produto:

- `physical`: produto físico da loja, pode ir para carrinho.
- `service`: serviço local, deve direcionar para solicitação/contato.
- `external_link`: produto por link externo, não vai para carrinho.
- `affiliate`: oferta externa/parceiro/marketing digital, não vai para carrinho.

Regras:

- Apenas produtos `physical` entram no carrinho.
- Produtos `external_link` e `affiliate` exigem `externalUrl`.
- Produtos externos devem exibir aviso claro de que o cliente será direcionado para fora da plataforma.
- Não implementar pagamento digital real interno para produtos externos sem revisão de política da loja/app.

## Stack prevista

- React
- TypeScript
- Vite
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- PWA

## Estado atual da aplicação

Nesta etapa, o app usa mocks/localStorage para validar fluxo e produto antes da conexão real com Supabase.

Camadas importantes:

- `src/services/localMockStore.ts`: fonte local persistente de lojas, produtos, pedidos, carrinho, lojas seguidas, loja ativa e loja do lojista.
- `src/services/mockData.ts`: wrappers compatíveis para consumo das telas.
- `src/utils/publicUrl.ts`: geração correta de links públicos respeitando o `BASE_URL`, especialmente no GitHub Pages.

Ainda não há:

- Pagamento real integrado.
- Upload real de imagens.
- AdMob/anúncios reais.
- Deep link nativo real.
- Supabase conectado às telas principais.

## Lojas demo

Existem lojas seed/dev como Mercado Central, Casa do Café e Moda Urbana para desenvolvimento. Elas não devem ser usadas para criar a experiência principal do cliente.

Regra:

- Cliente comum não lista todas as lojas.
- Cliente acessa loja por `/loja/:slug`.
- Super Admin pode ver todas as lojas.
- Lojista novo cria sua própria loja em `/lojista/criar-loja`.

## Setup local

1. Instale dependências:

```bash
npm ci
```

2. Crie seu arquivo de ambiente:

```bash
cp .env.example .env
```

3. Preencha as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` quando a integração real com Supabase for ativada.

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

### Estratégia de conexão futura

Quando migrar para Supabase, a vitrine pública deve buscar somente os dados da loja acessada por slug. Não carregar todas as lojas/produtos por padrão.

Preferir um ponto de entrada como:

```ts
getPublicStorefront(slug)
```

Esse método deve futuramente resolver apenas:

- dados públicos da loja do slug;
- produtos ativos daquela loja;
- categorias daquela loja;
- formas de pagamento/entrega daquela loja;
- promoções/ofertas daquela loja.

## Deploy SPA (evitar 404 em refresh)

Este repositório inclui `vercel.json` com rewrite para `index.html`, evitando erro 404 ao atualizar rotas como `/admin` e `/lojista`.

No GitHub Pages, o projeto usa `VITE_BASE_PATH=/Plataforma-multi-lojas/`. Links públicos copiados pelo app devem usar `src/utils/publicUrl.ts` para respeitar esse base path.
