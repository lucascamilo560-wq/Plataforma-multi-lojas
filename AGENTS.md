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

O app ainda está em modo mock/localStorage.

Arquivos importantes:

- `src/services/localMockStore.ts`
- `src/services/mockData.ts`
- `src/hooks/useMockSession.ts`
- `src/utils/publicUrl.ts`

Não conecte Supabase em PRs de fluxo/visual sem pedido explícito.

## Futuro Supabase

Quando conectar Supabase, a vitrine pública deve buscar somente a loja acessada por slug.

Use o conceito:

```ts
getPublicStorefront(slug)
```

Não buscar todas as lojas/produtos para a experiência do cliente.

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
