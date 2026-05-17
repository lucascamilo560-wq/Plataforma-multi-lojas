# Fluxo oficial de produto — HubMascate (cliente-first por convite)

## Visão do produto

O HubMascate não é um marketplace aberto.

A experiência principal começa quando um cliente recebe o link/QR Code de uma loja específica e acessa aquela vitrine.

> O HubMascate começa pela loja que convidou o cliente, não por uma vitrine global de lojas.

## Fluxo do lojista

1. Lojista cria e configura a própria loja.
2. Gera e compartilha link/QR Code da vitrine.
3. Cliente acessa a loja por convite.

## Fluxo do cliente por convite (cliente-first)

1. Cliente recebe link/QR Code de uma loja.
2. Cliente abre o link no navegador.
3. O HubMascate identifica a loja convidante (slug/contexto da loja).
4. Se não autenticado, o cliente deve ver login/cadastro contextualizado:
   - “Você foi convidado para acessar {store.name}”
   - “Uma loja HubMascate”
5. Cliente cria conta ou entra com conta existente.
6. Cliente conclui perfil obrigatório antes da primeira compra.
7. Depois de autenticado e com perfil completo, o fluxo principal é “Ver loja {store.name}”, com opção secundária “Baixar app”.
8. No app baixado, quando houver backend/auth real, o usuário deve ser reconhecido e a loja convidante/salva deve abrir ou ficar destacada.

## Login/cadastro contextualizado

Regras do fluxo oficial:

- O contexto da loja convidante deve ser preservado entre abertura do link e autenticação.
- Após autenticar, o cliente deve continuar no contexto da loja que originou o convite.
- Cliente sem convite continua sem catálogo global e sem listagem automática de lojas demo/fake.
- Entrada de lojista no login/app deve ser secundária (ex.: “Tenho uma loja”, “Quero vender pelo HubMascate”).

## Perfil completo do cliente

Objetivo: reduzir fricção no checkout, reaproveitando dados já salvos.

Campos futuros de perfil:

- nome completo
- telefone/WhatsApp
- endereço principal
- complemento
- bairro
- cidade
- estado
- CEP
- referência de entrega (quando necessário)

Regras:

- Não exigir dados excessivos no primeiro contato.
- Exigir perfil completo antes da primeira compra.
- Checkout deve reutilizar dados salvos.
- Cliente pode editar dados antes de confirmar pedido.

## Vínculo cliente ↔ loja (modelo futuro)

Conceito futuro de tabela:

`customer_store_links`

- `customer_id`
- `store_id`
- `source` (`invite_link` | `qr_code` | `manual`)
- `invited_at`
- `accepted_at`
- `last_accessed_at`
- `is_active`

Regras:

- Cliente só vê lojas acessadas/aceitas/salvas.
- Loja convidante deve ser priorizada após login.
- Cliente comum não lista todas as lojas do sistema.
- Super Admin continua como único perfil com visão global padrão.

## Futuro Supabase/Auth (não implementar nesta fase)

O fluxo navegador → app baixado não é confiável apenas com localStorage.

Motivos:

- localStorage do navegador não é compartilhado automaticamente com app instalado/PWA em todos os cenários.
- Reconhecimento entre navegador, app e múltiplos dispositivos exige backend/auth real.

Candidato futuro:

- Supabase Auth
- `profiles`
- `customer_addresses`
- `customer_store_links`

Limite desta fase:

- Não conectar Supabase sem PR específica.
- Não implementar autenticação real nesta etapa de documentação.

## Comportamento mock/localStorage atual

Enquanto o app permanece em localStorage:

- PRs podem simular convite e perfil localmente para validar experiência.
- Simulações não devem ser apresentadas como segurança/autenticação real.
- Sempre documentar que o backend real virá em fase própria.

## Fora de escopo desta decisão

- Implementar tela de cadastro/login.
- Implementar autenticação real.
- Conectar Supabase.
- Criar tabelas reais no banco.
- Alterar checkout, vitrine, pedidos, painel de lojista ou app instalado/PWA.
