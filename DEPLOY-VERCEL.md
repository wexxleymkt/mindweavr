# Deploy MindWeavr via Vercel (opcional)

Se preferir não usar a Hostinger VPS, você pode hospedar na **Vercel**. O deploy recomendado (GitHub + Hostinger VPS) está em **[DEPLOY-GUIA.md](./DEPLOY-GUIA.md)** (webhook na VPS).

---

## 1. Código no GitHub

O repositório já está em: **https://github.com/wexxleymkt/mindweavr**

A cada `git push origin main` você pode fazer o deploy na Vercel (ou a Vercel faz sozinha se estiver conectada).

---

## 2. Conectar o repositório à Vercel

1. Acesse **[vercel.com](https://vercel.com)** e faça login (use “Continue with GitHub” se quiser).
2. Clique em **Add New…** → **Project**.
3. **Import** o repositório **wexxleymkt/mindweavr** (se não aparecer, clique em “Adjust GitHub App Permissions” e autorize a Vercel a ver o repo).
4. **Framework Preset:** Next.js (deve ser detectado).
5. **Root Directory:** deixe em branco (raiz do repo).
6. **Build Command:** `npm run build` (padrão).
7. **Output Directory:** `.next` (padrão).
8. Não marque “Override” a menos que precise.

---

## 3. Variáveis de ambiente na Vercel

Antes de dar **Deploy**, em **Environment Variables** adicione (os mesmos do seu `.env.local`):

| Nome | Valor | Ambiente |
|------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://msxswthxpwhwdbhfrsef.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(sua anon key do Supabase)* | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | *(sua service role key)* | Production, Preview, Development |
| `REPLICATE_API_TOKEN` | *(token em replicate.com/account – Gemini 2.5 Flash)* | Production, Preview, Development |
| `PERFECTPAY_TOKEN` | *(token público Perfect Pay)* | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://mindweavr.app` (ou a URL que a Vercel der, ex. `https://mindweavr.vercel.app`) | Production, Preview, Development |

Marque **Sensitive** para `SUPABASE_SERVICE_ROLE_KEY` e para a chave da Gemini se quiser.

---

## 4. Deploy

1. Clique em **Deploy**.
2. A Vercel vai rodar `npm install` e `npm run build` nos servidores dela (sem usar sua VPS).
3. Quando terminar, você recebe uma URL tipo `https://mindweavr-xxx.vercel.app`.

---

## 5. Domínio mindweavr.app (opcional)

1. Na Vercel: **Project** → **Settings** → **Domains**.
2. Adicione **mindweavr.app** (e opcionalmente **www.mindweavr.app**).
3. A Vercel mostra as instruções de DNS (geralmente um registro **CNAME** para `cname.vercel-dns.com` ou um **A** para o IP dela).
4. No painel do registrador do domínio (Hostinger, etc.), configure o DNS conforme a Vercel indicar.
5. A Vercel cuida do HTTPS (certificado automático).

Depois de propagar o DNS, **NEXT_PUBLIC_APP_URL** pode ser atualizado para `https://mindweavr.app` nas variáveis de ambiente e um novo deploy aplica a mudança.

---

## 6. Deploys seguintes

- **Push em `main`** → a Vercel faz **deploy automático** (igual ao Thumbfly).
- Ou em **Deployments** você pode clicar em **Redeploy** para o último commit.

Não é necessário SSH, nem abrir firewall da Hostinger, nem GitHub Actions na VPS.

---

## Resumo (igual ao Thumbfly)

| Etapa | Onde | Ação |
|--------|------|------|
| 1 | GitHub | Código já está em `wexxleymkt/mindweavr`. |
| 2 | Vercel | Add New Project → Import `wexxleymkt/mindweavr`. |
| 3 | Vercel | Configurar variáveis de ambiente (Supabase, Gemini, Perfect Pay, APP_URL). |
| 4 | Vercel | Deploy (automático após o primeiro). |
| 5 | DNS (opcional) | Apontar mindweavr.app para a Vercel conforme instruções em Domains. |

Se quiser usar a **Hostinger VPS** no futuro (por exemplo para rodar algo além do Next.js), você pode fazer deploy manual por SSH ou usar um job que rode **na própria VPS** puxando do GitHub (Deploy from Git no painel da Hostinger, se existir), em vez do GitHub Actions conectando de fora na VPS.
