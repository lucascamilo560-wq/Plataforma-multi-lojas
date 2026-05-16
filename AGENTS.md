# Guia para agentes — Plataforma Multi-lojas

Este arquivo orienta agentes/Codex antes de qualquer alteração no repositório.

## Direção atual do produto

A Plataforma Multi-lojas **não é** um marketplace aberto nem um shopping público onde o cliente entra e vê todas as lojas.

A direção correta é:

> Cada lojista cria sua própria vitrine digital, compartilha um link/QR Code e o cliente acessa a loja por convite. O cliente vê somente lojas acessadas por link, salvas ou seguidas.

## Regra central

Não reintroduza fluxo de marketplace público sem pedido explícito.

Evite qualquer alteração que faça o cliente comum:

- listar todas as lojas automaticamente;
- ver lojas fake/demo sem convite;
- navegar como se estivesse em um shopping geral;
- escolher lojas aleatórias que não recebeu por link;
- carregar todos os produtos/lojas por padrão.

## Fluxo correto do lojista

1. Lojista entra.
2. Se não tiver loja, vai para `/lojista/criar-loja`.
3. Cria a loja.
4. Acessa painel da própria loja.
5. Cadastra produtos, serviços e links externos.
6. Configura pagamento/entrega próprios.
7. Vai para **Minha Vitrine**.
8. Copia link público ou QR Code.
9. Envia para clientes.

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

## Fluxo oficial cliente-first por convite

O HubMascate começa pela loja que convidou o cliente, não por uma vitrine global de lojas.

### Princípio central

- Cliente entra no HubMascate principalmente porque **recebeu um link ou QR Code de uma loja**.
- O link da loja deve carregar e preservar o contexto da loja convidante.
- O login/cadastro deve preservar esse contexto — o cliente não perde a referência da loja ao se autenticar.
- O cliente deve ver a loja convidante imediatamente depois de autenticar.
- Lojista não é o fluxo principal do app/navegador para o cliente; é uma **entrada secundária**.
- Cliente sem convite continua sem ver lojas fake ou catálogo global.

### Fluxo desejado passo a passo

1. Lojista compartilha o link da loja (ex.: `hubmascate.app/loja/minha-loja`).
2. Cliente abre o link no navegador.
3. O app identifica a loja convidante pelo `slug` na URL.
4. Se o cliente **não estiver autenticado**:
   - Exibe tela de login/cadastro com contexto da loja:
     - `"Você foi convidado para acessar {store.name}"`
     - `"Uma loja HubMascate"`
5. Cliente cria conta ou faz login.
6. Cliente completa perfil obrigatório antes da primeira compra (ver seção “Perfil completo do cliente”).
7. Depois de autenticado e com perfil completo:
   - Ação principal: **"Ver loja {store.name}"**
   - Ação secundária: **"Baixar o app"**
8. Ao baixar o app e fazer login:
   - O usuário deve ser reconhecido (requer backend real — ver seção “Autenticação real futura”).
   - A loja convidante/salva deve abrir ou ficar destacada.

### Posição do cadastro de lojista

- No login e na tela inicial, o fluxo **cliente** é o caminho principal.
- O cadastro de lojista deve ser discreto: entrada secundária tipo “Tenho uma loja” ou “Quero vender pelo HubMascate”.
- No futuro, lojistas terão fluxo de cadastro separado e específico.

## Fluxo correto do cliente

1. Cliente recebe link ou QR Code do lojista.
2. Acessa `/loja/:slug`.
3. Vê somente aquela loja.
4. Pode seguir/salvar a loja.
5. Compra ou solicita produtos daquela loja.
6. Acompanha pedidos daquela loja.

Se o cliente entrar sem link:

- mostrar estado vazio/instrução;
- permitir colar link ou código da loja;
- não mostrar lojas demo automaticamente;
- não listar catálogo global.

Rotas principais:

- `/cliente`
- `/cliente/minhas-lojas`
- `/cliente/pedidos`
- `/cliente/perfil`
- `/loja/:slug`
- `/loja/:slug/carrinho`
- `/loja/:slug/checkout`
- `/loja/:slug/pedido/:orderId`

A rota `/cliente/explorar` não deve ser o fluxo principal. No MVP, ela pode permanecer como “em breve” para lojas públicas futuras.

## Perfil completo do cliente

O cliente precisa ter perfil completo antes de realizar a primeira compra, para reduzir atrito no checkout.

### Campos obrigatórios antes da primeira compra

- nome completo
- telefone / WhatsApp
- endereço principal:
  - logradouro e número
  - complemento (opcional)
  - bairro
  - cidade
  - estado
  - CEP
  - referência de entrega (opcional)

### Regras

- O perfil serve para evitar preencher dados em todo checkout.
- O checkout deve reaproveitar os dados salvos no perfil.
- O cliente pode editar os dados antes de confirmar cada pedido.
- Não pedir dados desnecessários no primeiro contato.
- Exigir perfil completo antes da **primeira compra** (não no cadastro inicial).
- Não bloquear navegação da loja por causa de perfil incompleto — apenas bloquear a confirmação do pedido.

## Vínculo cliente ↔ loja

### Conceito

Cada cliente se vincula a lojas específicas que acessou por convite, QR Code ou de forma manual.

### Estrutura futura (`customer_store_links`)

```ts
interface CustomerStoreLink {
  customer_id: string;
  store_id: string;
  source: 'invite_link' | 'qr_code' | 'manual';
  invited_at: string;       // ISO 8601
  accepted_at: string;      // ISO 8601
  last_accessed_at: string; // ISO 8601
  is_active: boolean;
}
```

### Regras

- O cliente só vê lojas que acessou, aceitou ou salvou.
- A loja convidante deve ser priorizada logo após o login.
- Nunca listar todas as lojas do sistema para o cliente comum.
- Super Admin continua sendo o único perfil que vê todas as lojas por padrão.

## Autenticação real futura

### Limitação atual (localStorage)

O fluxo navegador → app baixado **não funciona de forma confiável** apenas com `localStorage`:

- O `localStorage` do navegador não é o mesmo ambiente do app instalado (PWA ou nativo).
- Sessões não são compartilhadas automaticamente entre navegador e app.
- Não há como reconhecer o mesmo usuário em dispositivos diferentes sem backend real.

### O que será necessário

Para reconhecer o usuário entre navegador, app instalado e múltiplos dispositivos, será necessário:

- **Supabase Auth** (ou equivalente) para autenticação persistente baseada em JWT.
- Tabelas dedicadas: `profiles`, `customer_addresses`, `customer_store_links`.
- O contexto da loja convidante deve ser preservado no fluxo de auth (ex.: parâmetro de redirect ou state no OAuth).

### Candidato futuro

```ts
// Supabase Auth + tabelas de perfil
supabase.auth.signUp({ email, password })
supabase.from('profiles').upsert({ ... })
supabase.from('customer_store_links').insert({ customer_id, store_id, source: 'invite_link' })
```

**Não implementar Supabase sem PR específica e aprovação explícita.**

## Comportamento mock atual (localStorage)

O app está em modo mock/localStorage. Enquanto isso:

- PRs futuras podem **simular** o convite e o perfil localmente via `localMockStore`.
- A simulação não deve fingir segurança real (não simular JWT, tokens ou criptografia real).
- Sempre deixar claro nos comentários/componentes que o backend real virá em fase própria.
- Não misturar lógica mock com chamadas reais à API sem PR específica.

> Para documentação detalhada do fluxo completo do produto, ver [`docs/PRODUCT_FLOW.md`](docs/PRODUCT_FLOW.md).
> Para o modelo de dados futuro com Supabase, ver [`docs/SUPABASE_FUTURE_MODEL.md`](docs/SUPABASE_FUTURE_MODEL.md).

## Fluxo correto do Super Admin

Super Admin pode ver todas as lojas, lojistas, clientes, pedidos e configurações globais.

O Super Admin é o único perfil onde faz sentido listar todas as lojas por padrão.

## Lojas demo/fake

Podem existir seeds para desenvolvimento, como Mercado Central, Casa do Café e Moda Urbana.

Mas essas lojas não devem aparecer automaticamente para o cliente comum.

Regras:

- Cliente só vê loja por link/convite/salva.
- Super Admin pode ver todas.
- Lojista novo não escolhe loja fake no login; cria sua própria loja.

## Produto e monetização futura

Tipos de produto:

- `physical`: produto físico da loja, pode ir para carrinho.
- `service`: serviço local, não deve usar carrinho padrão obrigatoriamente.
- `external_link`: produto por link externo, abre fora da plataforma.
- `affiliate`: oferta/parceiro/marketing digital, abre fora da plataforma.

Regras:

- Apenas `physical` entra no carrinho.
- `external_link` e `affiliate` precisam de URL externa.
- Produto externo/afiliado deve exibir aviso claro.
- Não implementar pagamento digital real para produtos externos sem revisão de política.
- Não adicionar SDK real de anúncios sem pedido explícito.

## Arquitetura de dados atual

O app ainda está em modo mock/localStorage. Ver seção “Comportamento mock atual” para as regras de simulação.

Arquivos importantes:

- `src/services/localMockStore.ts`
- `src/services/mockData.ts`
- `src/hooks/useMockSession.ts`
- `src/utils/publicUrl.ts`

Não conecte Supabase em PRs de fluxo/visual sem pedido explícito.
Ver modelo futuro detalhado em [`docs/SUPABASE_FUTURE_MODEL.md`](docs/SUPABASE_FUTURE_MODEL.md).

## Futuro Supabase

Quando conectar Supabase, a vitrine pública deve buscar somente a loja acessada por slug.

Use o conceito:

```ts
getPublicStorefront(slug)
```

Não buscar todas as lojas/produtos para a experiência do cliente.

Ver modelo de dados completo em [`docs/SUPABASE_FUTURE_MODEL.md`](docs/SUPABASE_FUTURE_MODEL.md).

## Regras visuais

O app deve parecer:

- vitrine digital profissional;
- mini-app exclusivo da loja;
- painel de vendas do lojista;
- experiência mobile-first.

Não deve parecer:

- site de notícias;
- dashboard branco genérico;
- marketplace aberto;
- protótipo com lojas aleatórias;
- catálogo público global.

## Workflow obrigatório antes de qualquer PR

Antes de sugerir, iniciar ou finalizar qualquer PR, o agent **deve**:

1. Verificar PRs recentes para evitar retrabalho e sobreposição de escopo.
2. Confirmar o número **real** da próxima PR antes de citar número no título/texto.
3. Validar se a tarefa já foi implementada (total ou parcialmente) em PR anterior.
4. Abrir e ler os arquivos diretamente afetados antes de alterar qualquer coisa.
5. Não recriar sistemas/fluxos já existentes sem lacuna objetiva comprovada.
6. Não repetir prompt, tema ou escopo de PR já mesclado.
7. Manter PR pequena, focada em uma dor real e com objetivo verificável.
8. Evitar misturar visual + regra de negócio + banco + refatoração estrutural na mesma PR.

Regra de segurança de escopo:

- Se o pedido estiver amplo, quebrar em etapas menores e propor primeiro a menor entrega útil.
- Se houver dúvida entre “mudar” e “preservar”, preservar o comportamento existente.

## Estado recente do produto

Resumo dos blocos entregues recentemente (usar como referência para não repetir trabalho):

- PR #27/#28: Super Admin funcional.
- PR #28: checkout com cards de pagamento e instruções de pagamento manual.
- PR #29: sistema de tema/personalização visual da loja.
- PR #30: refinamento premium inicial da vitrine.
- PR #31: responsividade mobile.
- PR #32: limpeza do bloco de fidelização e ajustes de textos.
- PR #33: lapidação visual fina da vitrine.
- PR #34: onboarding guiado do lojista.
- PR #52: documentação do fluxo oficial cliente-first por convite e perfil completo.

Observação importante:

- Já houve divergência entre número citado no título e número real no GitHub.
- Sempre conferir a numeração real no GitHub antes de mencionar número de PR.

## Princípios de economia de uso dos agents

- Fazer PRs pequenas e objetivas.
- Não investigar o projeto inteiro sem necessidade do escopo.
- Usar os arquivos afetados como fonte primária de verdade.
- Evitar prompts amplos/genéricos como “melhore tudo”.
- Preferir mudanças incrementais e testáveis.
- Em caso de dúvida, preservar comportamento existente.
- Não trocar arquitetura inteira sem pedido explícito.

## Checklist obrigatório antes de PR

Antes de abrir ou finalizar um PR, confirme:

- O escopo ficou pequeno e focado?
- A tarefa já não havia sido feita em PR anterior?
- O fluxo por convite foi preservado?
- Cliente sem convite continua sem ver lojas fake?
- Lojista continua isolado na própria loja?
- Super Admin continua sendo o único que vê tudo?
- localStorage/localMockStore foi preservado?
- Não conectou Supabase sem pedido explícito?
- Não implementou pagamento/anúncio real sem pedido explícito?
- `npm run lint` passa.
- `npm run build` passa.
- Cliente sem convite não vê lojas fake.
- Lojista sem loja é direcionado para criar loja.
- Link público usa `/loja/:slug`.
- Links públicos usam `src/utils/publicUrl.ts` quando precisam de URL absoluta.
- O PR não reintroduz “Explorar lojas” como fluxo principal.
- O PR não conecta Supabase sem solicitação explícita.
- O PR não implementa pagamento/anúncio real sem solicitação explícita.

## Como propor próximos PRs

Toda proposta de próxima PR deve incluir, no mínimo:

- número real da PR (conferido no GitHub);
- nome claro e específico;
- problema atual (dor real);
- objetivo da entrega;
- arquivos prováveis a alterar;
- tarefas planejadas;
- critérios de aceitação verificáveis;
- o que **não** será feito nessa PR (limites de escopo).

## Quando parar e pedir revisão humana

Interrompa implementação e peça revisão humana quando houver necessidade de:

- pagamento real (gateway, adquirente, split, tokenização real);
- Supabase real (migração de dados, políticas, autenticação ou produção);
- mudança de modelo de negócio da plataforma;
- reabrir fluxo de marketplace público para cliente comum;
- afetar dados financeiros reais;
- exigir política de privacidade/termos legais novos;
- resolver conflito entre README e comportamento real do código sem decisão explícita.

## Frase guia

> O produto não vende “mais uma loja em um shopping”. Ele vende “sua própria vitrine/app para compartilhar com seus clientes”.
