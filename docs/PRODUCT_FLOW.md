# Fluxo do Produto — HubMascate

Este documento descreve o fluxo oficial do produto HubMascate, as regras de cada perfil de usuário e as decisões de produto que orientam o desenvolvimento.

---

## Visão do produto

O HubMascate **não é** um marketplace aberto. Cada lojista cria sua própria vitrine digital, compartilha um link/QR Code com seus clientes e eles acessam somente aquela loja.

> O HubMascate começa pela loja que convidou o cliente, não por uma vitrine global de lojas.

---

## Fluxo do lojista

1. Lojista entra no app.
2. Se não tiver loja, é redirecionado para `/lojista/criar-loja`.
3. Cria a loja (nome, slug, descrição, logo, tema).
4. Acessa o painel da própria loja.
5. Cadastra produtos, serviços e links externos.
6. Configura formas de pagamento e entrega próprias.
7. Vai para **Minha Vitrine**.
8. Copia o link público (`/loja/:slug`) ou gera o QR Code.
9. Envia o link/QR para os clientes.

### Rotas do lojista

| Rota | Descrição |
|------|-----------|
| `/lojista` | Dashboard principal |
| `/lojista/criar-loja` | Criação da loja (obrigatório para lojistas sem loja) |
| `/lojista/minha-loja` | Configurações da loja |
| `/lojista/minha-vitrine` | Visualização e compartilhamento do link/QR |
| `/lojista/produtos` | Listagem de produtos |
| `/lojista/produtos/novo` | Cadastro de produto |
| `/lojista/pedidos` | Gestão de pedidos |
| `/lojista/promocoes` | Promoções ativas |
| `/lojista/cupons` | Cupons de desconto |
| `/lojista/clientes` | Base de clientes da loja |
| `/lojista/pagamentos` | Configuração de pagamentos |
| `/lojista/entrega` | Configuração de entrega |
| `/lojista/marca` | Personalização visual (tema, cores, logo) |
| `/lojista/relatorios` | Relatórios e métricas |

---

## Fluxo do cliente por convite

### Princípio

O cliente **sempre chega ao HubMascate via link ou QR Code de uma loja específica**. O contexto da loja convidante deve ser preservado durante todo o fluxo de entrada.

### Passo a passo

1. Lojista compartilha o link: `hubmascate.app/loja/minha-loja`
2. Cliente abre o link no navegador.
3. O app identifica a loja convidante pelo `slug` na URL.
4. Se o cliente **não estiver autenticado**:
   - Exibe tela de login/cadastro contextualizada para aquela loja.
5. Cliente cria conta ou faz login.
6. Cliente completa perfil obrigatório (ver seção "Perfil completo").
7. Depois de autenticado e com perfil completo:
   - Ação principal: **"Ver loja {store.name}"**
   - Ação secundária: **"Baixar o app"**
8. Cliente acessa a loja, navega e realiza compras.

### Se o cliente entrar sem link

- Mostrar estado vazio com instrução.
- Permitir colar link ou código da loja.
- Não mostrar lojas demo automaticamente.
- Não listar catálogo global.

### Rotas do cliente

| Rota | Descrição |
|------|-----------|
| `/cliente` | Área do cliente (minhas lojas, pedidos) |
| `/cliente/minhas-lojas` | Lojas salvas/seguidas pelo cliente |
| `/cliente/pedidos` | Histórico de pedidos |
| `/cliente/perfil` | Perfil completo (dados pessoais e endereço) |
| `/loja/:slug` | Vitrine pública de uma loja |
| `/loja/:slug/carrinho` | Carrinho da loja |
| `/loja/:slug/checkout` | Checkout da loja |
| `/loja/:slug/pedido/:orderId` | Acompanhamento de pedido |

> A rota `/cliente/explorar` não deve ser o fluxo principal. No MVP, pode permanecer como "em breve" para lojas públicas futuras.

---

## Login/cadastro contextualizado

Quando o cliente acessa `/loja/:slug` sem estar autenticado:

- Preservar o `slug` da loja no estado da navegação (ex.: query param `?from=/loja/minha-loja` ou localStorage temporário).
- Exibir na tela de login/cadastro:
  - Nome ou logo da loja convidante.
  - Texto: `"Você foi convidado para acessar {store.name}"`.
  - Subtexto: `"Uma loja HubMascate"`.
- Após login/cadastro bem-sucedido, redirecionar de volta para a loja.

### Posição do cadastro de lojista

- O fluxo **cliente** é o caminho principal no login e na tela inicial.
- Cadastro de lojista deve ser uma entrada secundária discreta:
  - Texto sugerido: `"Tenho uma loja"` ou `"Quero vender pelo HubMascate"`.
- No futuro, lojistas terão fluxo de cadastro separado.

---

## Perfil completo do cliente

### Por que é obrigatório

Evita preencher dados em todo checkout e melhora a experiência de compra.

### Campos obrigatórios antes da primeira compra

| Campo | Obrigatoriedade |
|-------|----------------|
| Nome completo | Obrigatório |
| Telefone / WhatsApp | Obrigatório |
| Logradouro e número | Obrigatório |
| Complemento | Opcional |
| Bairro | Obrigatório |
| Cidade | Obrigatório |
| Estado | Obrigatório |
| CEP | Obrigatório |
| Referência de entrega | Opcional |

### Regras

- O perfil é preenchido antes da **primeira compra**, não no cadastro inicial.
- Não bloquear a navegação da loja por perfil incompleto.
- Bloquear somente a **confirmação do pedido** se o perfil estiver incompleto.
- O checkout deve reaproveitar os dados salvos no perfil.
- O cliente pode editar os dados antes de confirmar cada pedido.

---

## Vínculo cliente ↔ loja

### Conceito

Cada cliente se vincula a lojas específicas que acessou por convite, QR Code ou salvou manualmente.

### Estrutura futura

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
- Super Admin é o único perfil que vê todas as lojas por padrão.

---

## Fluxo do Super Admin

- Acessa todas as lojas, lojistas, clientes, pedidos e configurações globais.
- Único perfil onde faz sentido listar todas as lojas por padrão.
- Não deve ser confundido com o fluxo do cliente ou do lojista.

---

## Futuro Supabase/Auth

Ver [`docs/SUPABASE_FUTURE_MODEL.md`](SUPABASE_FUTURE_MODEL.md) para o modelo de dados e autenticação futura.

---

## Fora de escopo atual (MVP)

Os itens abaixo estão fora do escopo do MVP e não devem ser implementados sem PR específica e aprovação explícita:

- Marketplace aberto para cliente comum (listar todas as lojas).
- Autenticação real com Supabase Auth ou qualquer outro provider.
- Pagamento digital real (gateway, adquirente, split).
- SDK de anúncios ou afiliados.
- Multi-device sync sem backend real.
- App nativo (iOS/Android) com reconhecimento de usuário entre plataformas.
- Programa de fidelidade real.
