# Deploy de aplicação via Webhook do GitHub (VPS)

**Documento geral** — use em **qualquer aplicação** (Next.js ou similar). Basta solicitar “o guia de deploy via webhook do GitHub” e seguir este documento; em cada projeto, substitua apenas: nome da app no PM2, domínio, repositório e credenciais da VPS.

Sempre que quiser fazer deploy na VPS usando webhook do GitHub (push em `main` → deploy automático), siga os itens abaixo.

---

## 1. Visão geral do fluxo

1. **Código no GitHub** (repositório da aplicação).
2. **VPS** com a app rodando (Node/Next.js + PM2) e **Nginx** na frente (porta 80/443).
3. **Webhook no GitHub**: ao dar push em `main`, o GitHub envia um POST para a sua aplicação (ex.: `https://seu-dominio.com/api/deploy-webhook`).
4. A aplicação recebe o POST, valida o secret e dispara em background: `git pull`, `npm ci`, `npm run build`, `pm2 restart <nome-da-app>`.

Assim você **não precisa** de SSH a partir do GitHub (evita timeout de firewall). A própria app na VPS puxa o código e faz o deploy.

---

## 2. O que colocar na aplicação (em todo novo projeto)

### 2.1 Rota do webhook (Next.js App Router)

Crie o arquivo **`app/api/deploy-webhook/route.ts`** (ou `pages/api/deploy-webhook.ts` se usar Pages Router).

Substitua **`NOME_DA_APP_PM2`** pelo nome que você usa no PM2 (ex.: `mindweavr`, `minha-api`).

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import crypto from 'crypto';

const DEPLOY_SECRET = process.env.DEPLOY_WEBHOOK_SECRET;
const PM2_APP_NAME = 'NOME_DA_APP_PM2'; // ex: mindweavr, minha-api

function verifyGitHubSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!DEPLOY_SECRET || !signatureHeader?.startsWith('sha256=')) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', DEPLOY_SECRET).update(rawBody, 'utf8').digest('hex');
  if (signatureHeader.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  if (!DEPLOY_SECRET) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }
  if (!verifyGitHubSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: { ref?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.ref !== 'refs/heads/main') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'not main' }, { status: 200 });
  }

  const appDir = process.cwd();
  const script = `set -e; cd "${appDir}" && git pull origin main && npm ci && npm run build && (command -v pm2 >/dev/null && (pm2 restart ${PM2_APP_NAME} --update-env || pm2 start npm --name ${PM2_APP_NAME} -- start) && pm2 save || true)`;

  const child = spawn('sh', ['-c', script], {
    cwd: appDir,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PATH: process.env.PATH ?? '' },
  });
  child.unref();

  return NextResponse.json({ ok: true, message: 'Deploy started' }, { status: 202 });
}
```

### 2.2 Variável de ambiente

No **`.env.local`** da aplicação (e na VPS), adicione:

```env
DEPLOY_WEBHOOK_SECRET=<uma_string_longa_e_secreta>
```

Esse valor será o **mesmo** que você configurar no webhook do GitHub (campo "Secret").

---

## 3. O que configurar no GitHub (em todo novo projeto)

| Onde | O quê |
|------|--------|
| **Repositório** | Código da aplicação em um repo (ex.: `usuario/nome-do-app`). |
| **Settings → Webhooks → Add webhook** | **Payload URL:** `https://SEU-DOMINIO.com/api/deploy-webhook` |
| | **Content type:** `application/json` |
| | **Secret:** o mesmo valor de `DEPLOY_WEBHOOK_SECRET` |
| | **Which events:** "Just the push event" (ou só Push) |

Se o domínio ainda não estiver no ar, use temporariamente: `http://IP_DA_VPS:3000/api/deploy-webhook` (e depois altere para o domínio).

---

## 4. O que fazer na VPS (uma vez por aplicação)

### 4.1 Acesso

- SSH: `ssh root@IP_DA_VPS` (ou usuário que você usar).
- Ter **Node.js** (recomendado via NVM, ex.: Node 20) e **PM2** instalados globalmente (`npm install -g pm2`).

### 4.2 Deploy inicial

1. **Clonar o repositório**  
   Ex.: `git clone https://github.com/usuario/nome-do-app.git ~/nome-do-app`  
   `cd ~/nome-do-app`

2. **Criar `.env.local`**  
   Incluir todas as variáveis da aplicação e **`DEPLOY_WEBHOOK_SECRET`** (mesmo valor do webhook no GitHub).

3. **Build e start com PM2**  
   ```bash
   npm ci
   npm run build
   pm2 start npm --name NOME_DA_APP_PM2 -- start
   pm2 save
   pm2 startup   # seguir instruções para iniciar no boot
   ```

4. **Nginx** (se ainda não tiver)  
   - Instalar: `apt install -y nginx certbot python3-certbot-nginx`  
   - Criar site em `/etc/nginx/sites-available/meu-app` com proxy para `http://127.0.0.1:3000` (ou a porta que a app usar).  
   - Ativar: `ln -sf /etc/nginx/sites-available/meu-app /etc/nginx/sites-enabled/`  
   - Testar: `nginx -t && systemctl reload nginx`  
   - SSL: `certbot --nginx -d seu-dominio.com`

5. **Firewall**  
   Liberar portas **80**, **443** e **22** (no painel da VPS ou com UFW).

---

## 5. Scripts que você pode reutilizar (por projeto)

Ajuste **OWNER**, **REPO**, **WEBHOOK_URL**, **nome da app no PM2** e (se usar) **credenciais da VPS** em cada script.

### 5.1 Criar o webhook no GitHub

Script que gera um secret, cria o webhook no repositório e grava o secret em `.deploy-webhook-secret` (para colocar no `.env.local` da VPS).

- **Uso:** `GITHUB_TOKEN=seu_token node scripts/create-deploy-webhook.mjs`
- **O que editar no script:** `OWNER`, `REPO`, `WEBHOOK_URL` (ex.: `https://seu-dominio.com/api/deploy-webhook`).
- **Resultado:** webhook criado no GitHub + arquivo `.deploy-webhook-secret` com o valor a ser usado em `DEPLOY_WEBHOOK_SECRET`.

Adicione **`.deploy-webhook-secret`** ao `.gitignore`.

### 5.2 Configurar ambiente e app na VPS (uma vez)

Script que conecta na VPS por SSH, cria/atualiza o `.env.local` (incluindo `DEPLOY_WEBHOOK_SECRET` lido de `.deploy-webhook-secret`), faz clone/pull, build e inicia/reinicia o PM2.

- **O que editar:** `HOST`, `USER`, `PASSWORD`, conteúdo de `ENV_CONTENT`, nome do diretório (ex.: `~/mindweavr`), nome do processo no PM2.
- Mantenha esse script **fora do versionamento** (ex.: no `.gitignore`) se tiver senha.

### 5.3 Configurar Nginx + Certbot na VPS (uma vez)

Script que instala Nginx e Certbot, escreve o config de proxy para a porta da app e obtém certificado SSL.

- **O que editar:** `HOST`, `USER`, `PASSWORD`, `server_name`, domínio no Certbot, porta do proxy (ex.: 3000).

### 5.4 Só reiniciar a app (PM2)

Script que entra na VPS e roda `pm2 restart NOME_DA_APP_PM2` (útil após 502 ou reinício do servidor).

- **O que editar:** `HOST`, `USER`, `PASSWORD`, nome do processo no PM2 no comando.

---

## 6. Checklist rápido (o que “mandar” / configurar em cada app nova)

Use esta lista para não esquecer nada.

- [ ] **Na aplicação**
  - [ ] Criar `app/api/deploy-webhook/route.ts` (ou equivalente) com o **nome correto do processo no PM2**.
  - [ ] Documentar/colocar no `.env.example`: `DEPLOY_WEBHOOK_SECRET=...`.
- [ ] **No repositório**
  - [ ] Código no GitHub (ex.: `usuario/nome-do-app`).
  - [ ] Rodar o script que cria o webhook (ou criar o webhook manualmente).
  - [ ] Em **Settings → Webhooks**: URL = `https://seu-dominio.com/api/deploy-webhook`, **Secret** = valor de `DEPLOY_WEBHOOK_SECRET`, evento = **Push**.
- [ ] **Na VPS (uma vez)**
  - [ ] Node (NVM) + `npm install -g pm2`.
  - [ ] Clone do repo, `.env.local` (com `DEPLOY_WEBHOOK_SECRET`), `npm ci`, `npm run build`, `pm2 start ...`, `pm2 save` e `pm2 startup`.
  - [ ] Nginx: proxy 80/443 → porta da app; Certbot para HTTPS.
  - [ ] Firewall: 22, 80, 443 liberados.
- [ ] **DNS**
  - [ ] Registro **A** do domínio apontando para o IP da VPS (e nameservers corretos).

Depois disso, a cada **push em `main`** o GitHub dispara o webhook e a VPS faz o deploy sozinha (pull + build + restart).

---

## 7. Resumo em uma frase

**Na app:** rota `/api/deploy-webhook` + `DEPLOY_WEBHOOK_SECRET`. **No GitHub:** webhook com a URL dessa rota e o mesmo secret. **Na VPS:** deploy inicial (clone, env, build, PM2) + Nginx + firewall; o resto é automático no push.
