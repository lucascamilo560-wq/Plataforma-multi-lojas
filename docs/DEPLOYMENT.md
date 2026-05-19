# Deploy do HubMascate

Este documento descreve como publicar o HubMascate nos ambientes suportados.

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

### URL temporária de produção

Enquanto não houver domínio próprio, o projeto ficará disponível no domínio padrão
da Vercel:

```
https://<nome-do-projeto>.vercel.app
```

A configuração de domínio próprio fica para etapa futura.

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
