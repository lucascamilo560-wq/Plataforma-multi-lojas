# Compartilhamento e Preview Rica no HubMascate

## Como o compartilhamento funciona hoje

O HubMascate usa a [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) para abrir o menu nativo de compartilhamento do dispositivo.

Quando a Web Share API não está disponível (navegadores de desktop ou contextos não-HTTPS), a função `shareOrCopy` (`src/utils/share.ts`) faz fallback copiando o texto completo para a área de transferência.

### Payload do compartilhamento de produto

O helper `buildProductSharePayload` (`src/utils/productShare.ts`) monta o payload:

- **title**: `{nome do produto} — {nome da loja}`
- **text**: `Olha esse produto na {loja}: {produto} por {preço}. Veja aqui:` (preço omitido quando não aplicável)
- **url**: `/loja/:slug/produto/:productId`
- **copyText**: texto completo + URL (copiado no fallback)

---

## Por que a preview com imagem do produto não funciona no WhatsApp

Quando um link é compartilhado no WhatsApp (ou Telegram, Facebook, etc.), a plataforma faz uma requisição ao servidor para ler as metatags Open Graph do HTML inicial:

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="..." />
```

O HubMascate é uma **SPA (Single Page Application)** estática gerada pelo Vite/React. Todas as rotas servem o mesmo `index.html`. Isso significa:

- As metatags globais do `index.html` aparecem para qualquer rota, incluindo `/loja/:slug/produto/:productId`.
- **Não é possível garantir preview dinâmica por produto** apenas com React no cliente, porque o WhatsApp lê o HTML bruto do servidor antes de qualquer JavaScript ser executado.
- Atualizar `document.title` ou metatags via React (ex.: `react-helmet`) melhora o título da aba do navegador e pode ajudar rastreadores que executam JavaScript, mas **não garante preview no WhatsApp**.

### Metatags globais atuais (index.html)

O `index.html` inclui metatags genéricas do HubMascate:

- `og:title`, `og:description`, `og:site_name`, `og:type`, `og:url`
- `twitter:card`, `twitter:title`, `twitter:description`

Essas metatags garantem uma preview básica da plataforma quando qualquer link do HubMascate é compartilhado.

> **Imagem global (og:image / twitter:image):** ainda não há um asset público de banner/OG configurado.
> Quando um arquivo `public/og-hubmascate.png` for adicionado (recomendado: 1200×630 px), adicionar ao `index.html`:
> ```html
> <meta property="og:image" content="https://hubmascate.vercel.app/og-hubmascate.png" />
> <meta name="twitter:image" content="https://hubmascate.vercel.app/og-hubmascate.png" />
> ```

---

## Caminhos futuros para preview rica por produto

Para exibir imagem, título e preço específicos do produto no preview do WhatsApp, uma das opções abaixo será necessária:

### Opção 1 — Vercel Edge Function por rota de produto

Criar uma Edge Function na Vercel que intercepta requisições para `/loja/:slug/produto/:productId`, busca os dados do produto e retorna um HTML mínimo com as metatags corretas. O React SPA continua funcionando normalmente para usuários normais.

**Prós:** não exige migração de framework, funciona na Vercel.  
**Contras:** requer backend/API real para buscar dados do produto.

### Opção 2 — SSR/SSG com Next.js ou Remix

Migrar o app para um framework com renderização no servidor (Next.js, Remix) que permite gerar o HTML com metatags por rota dinamicamente.

**Prós:** solução completa e escalável.  
**Contras:** mudança de arquitetura significativa.

### Opção 3 — Página pública server-rendered só para o produto

Criar uma rota de "snapshot" server-rendered apenas para scraping (ex.: `/preview/loja/:slug/produto/:productId`) que serve HTML estático com as metatags, enquanto o app SPA principal continua inalterado.

### Opção 4 — Geração dinâmica de imagem OG

Usar um serviço como [Vercel OG Image Generation](https://vercel.com/docs/functions/og-image-generation) para gerar imagens com texto/produto dinamicamente. Pode ser combinado com as opções acima.

---

## O que não fazer nesta fase

- Não implementar nenhuma dessas opções sem PR específica de backend/SSR.
- Não conectar Supabase para esse fim sem decisão explícita.
- Não migrar para Next.js sem planejamento e aprovação.

---

## Referências

- [Open Graph Protocol](https://ogp.me/)
- [WhatsApp — Link Preview](https://developers.facebook.com/docs/sharing/webmasters/)
- [Web Share API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Vercel OG Image Generation](https://vercel.com/docs/functions/og-image-generation)
