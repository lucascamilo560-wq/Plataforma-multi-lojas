# Deploy do HubMascate

Este documento descreve como publicar o HubMascate nos ambientes suportados.

---

## URL pública atual

O HubMascate está publicado na Vercel com a seguinte URL temporária oficial:

```
https://hubmascate.vercel.app
```

> Esta é a URL pública atual, sem domínio próprio.
> A configuração de domínio próprio fica para etapa futura.
> Enquanto estiver na Vercel, `VITE_BASE_PATH` deve ser `/`.

---

## Vercel (recomendado)

### Configurações do projeto na Vercel

| Campo            | Valor           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Install command  | `npm ci`        |
| Build command    | `npm run build` |
| Output directory | `dist`          |

### Variáveis de ambiente

| Variável          | Valor | Descrição                                    |
| ----------------- | ----- | -------------------------------------------- |
| `VITE_BASE_PATH`  | `/`   | Base path da SPA. Use `/` na Vercel.         |

> As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` só são necessárias
> quando a integração real com Supabase for ativada.

### SPA fallback (rotas no reload)

O arquivo `vercel.json` na raiz do projeto já garante o fallback para `index.html`,
evitando erro 404 ao recarregar rotas como `/admin`, `/lojista`, `/loja/:slug`, etc.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## GitHub Pages (compatibilidade mantida)

O projeto mantém compatibilidade com GitHub Pages via variável de ambiente.

### Variável necessária

| Variável         | Valor                        | Descrição                         |
| ---------------- | ---------------------------- | --------------------------------- |
| `VITE_BASE_PATH` | `/Plataforma-multi-lojas/`   | Subfolder do repositório no Pages |

### Comando de build para GitHub Pages

```bash
VITE_BASE_PATH=/Plataforma-multi-lojas/ npm run build
```

### Links públicos

Os links públicos gerados pelo app usam `src/utils/publicUrl.ts` para respeitar
o `BASE_URL` configurado, tanto na Vercel quanto no GitHub Pages.

---

## Qualidade mínima antes do deploy

```bash
npm run lint
npm run build
```

---

## Checklist pós-deploy

Execute estes testes manualmente após cada deploy para confirmar que o app está funcional em produção.

- [ ] Abrir `/login` e confirmar que a página carrega sem erros.
- [ ] Abrir `/cliente` e confirmar que a página carrega sem erros.
- [ ] Abrir `/cliente/minhas-lojas` e confirmar estado vazio correto para usuário sem lojas.
- [ ] Abrir `/loja/mercado-central` e confirmar que a vitrine carrega.
- [ ] Atualizar (F5) em `/loja/mercado-central` e confirmar que **não** dá erro 404 (SPA fallback ativo).
- [ ] No painel do lojista, acessar **Minha Vitrine** e copiar o link da loja.
- [ ] Confirmar que o link copiado usa `hubmascate.vercel.app` (ou o domínio atual), e **não** `github.io` ou `localhost`.
- [ ] Compartilhar um produto e verificar se o link gerado abre o produto correto.
- [ ] Abrir o link compartilhado em uma aba anônima e confirmar que a vitrine carrega.
- [ ] Confirmar que o QR Code gerado aponta para a URL correta do domínio atual.
- [ ] Confirmar que o botão de WhatsApp do lojista inclui o link correto da loja.

---

## Limitações do modo mock/localStorage

O app ainda opera em modo mock com localStorage. Esteja ciente das seguintes limitações ao testar em produção:

- Dados de cliente, perfil, vínculo loja, carrinho e pedidos são armazenados apenas no `localStorage` do navegador.
- Em outro dispositivo ou em uma aba anônima, os dados **não existem** — o cliente aparece como novo.
- Pedidos realizados em um dispositivo não aparecem em outro.
- Não há sincronização real de dados entre sessões.
- A sincronização real entre dispositivos virá somente com a integração Supabase/Auth, em fase futura.
