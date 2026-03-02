# Deploy MindWeavr — GitHub + Hostinger VPS

Fluxo igual ao Thumbfly: **código no GitHub** e **deploy na Hostinger VPS**. O deploy automático é feito por **webhook**: quando você dá push em `main`, o GitHub envia um POST para a sua aplicação na VPS e ela roda `git pull` + build + restart. Não precisa de SSH de fora (evita timeout de firewall).

---

## Visão geral

1. **Uma vez:** subir a app na VPS (clone, `.env.local`, build, PM2, opcional: nginx + domínio).
2. **Uma vez:** configurar no GitHub um webhook que chama `https://mindweavr.app/api/deploy-webhook` (ou `http://IP_DA_VPS:3000/api/deploy-webhook` se ainda não tiver domínio).
3. **Sempre que der push em `main`:** o GitHub dispara o webhook e a VPS faz o deploy sozinha.

---

## Passo 1: Repositório no GitHub

O repositório já está em **https://github.com/wexxleymkt/mindweavr**. Se for criar outro ou fazer o primeiro push:

```bash
git init
git add .
git commit -m "Initial commit: MindWeavr"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mindweavr.git
git push -u origin main
```

---

## Passo 2: Deploy inicial na VPS (uma vez)

Entre na VPS pela Hostinger (SSH pelo painel ou `ssh root@IP_DA_VPS`).

### 2.1 Node.js (NVM)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc   # ou feche e abra o terminal
nvm install 20
nvm use 20
```

### 2.2 Clonar o projeto e buildar

```bash
cd ~
git clone https://github.com/wexxleymkt/mindweavr.git
cd mindweavr
```

Crie o `.env.local` com as variáveis do Supabase, Gemini, Perfect Pay e o **secret do webhook**:

```bash
nano .env.local
```

Conteúdo (ajuste com seus valores):

```env
NEXT_PUBLIC_SUPABASE_URL=https://msxswthxpwhwdbhfrsef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
REPLICATE_API_TOKEN=seu_token_replicate
PERFECTPAY_TOKEN=seu_token
NEXT_PUBLIC_APP_URL=https://mindweavr.app

# Secret que o GitHub enviará no webhook (invente uma string longa e segura)
DEPLOY_WEBHOOK_SECRET=uma_string_longa_e_secreta_que_voce_escolher
```

Salve (Ctrl+O, Enter, Ctrl+X).

```bash
npm ci
npm run build
npm install -g pm2
pm2 start npm --name mindweavr -- start
pm2 save
pm2 startup   # segue as instruções para iniciar o PM2 no boot
```

A app fica rodando na porta 3000. Se ainda não tiver domínio, teste com `http://IP_DA_VPS:3000`.

### 2.3 Domínio e HTTPS

Para usar **mindweavr.app**:

1. **DNS:** No painel do registrador do domínio, crie um registro **A** (@) apontando para o IP da VPS e, se quiser, CNAME `www` → `mindweavr.app`.
2. **Nginx + Certbot na VPS:** Pode usar o script `scripts/setup-nginx-vps.mjs` (requer SSH configurado) ou seguir os passos manuais abaixo:

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx
```

Crie o site (ex.: `/etc/nginx/sites-available/mindweavr`):

```nginx
server {
    listen 80;
    server_name mindweavr.app;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

**Importante:** Os timeouts `proxy_*_timeout 300s` são necessários para a rota `/api/generate-map` (Replicate pode levar ~1 minuto). Sem isso, o Nginx pode fechar a conexão antes da resposta e a tela fica em "Criando mapa mental" sem terminar. Se o site já estiver no ar, edite o config do Nginx na VPS, adicione essas três linhas dentro do `location /` e rode `nginx -t && systemctl reload nginx`.

Ative e pegue o certificado:

```bash
ln -s /etc/nginx/sites-available/mindweavr /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d mindweavr.app
```

---

## Passo 3: Webhook no GitHub (deploy automático)

1. Abra o repositório no GitHub → **Settings** → **Webhooks** → **Add webhook**.
2. **Payload URL:**  
   - Se já tiver domínio: `https://mindweavr.app/api/deploy-webhook`  
   - Se ainda não: `http://IP_DA_VPS:3000/api/deploy-webhook` (depois troque para o domínio).
3. **Content type:** `application/json`.
4. **Secret:** o **mesmo** valor que você colocou em `DEPLOY_WEBHOOK_SECRET` no `.env.local` da VPS.
5. **Which events:** "Just the push event" (ou "Let me select individual events" e marque **Push**).
6. Salve (**Add webhook**).

A partir daí, a cada **push na branch `main`**, o GitHub envia um POST para essa URL. A aplicação na VPS valida o secret e dispara em background: `git pull origin main`, `npm ci`, `npm run build` e `pm2 restart mindweavr`.

---

## Resumo

| Onde | O que fazer |
|------|-------------|
| GitHub | Repo com o código (ex.: wexxleymkt/mindweavr). Webhook apontando para `https://mindweavr.app/api/deploy-webhook` com o mesmo secret do `.env.local`. |
| VPS (uma vez) | Node 20 (nvm), clone do repo, `.env.local` (incluindo `DEPLOY_WEBHOOK_SECRET`), `npm ci`, `npm run build`, PM2. Opcional: nginx + Certbot para domínio e HTTPS. |
| Depois | Cada `git push origin main` dispara o webhook e a VPS faz o deploy sozinha. |

Não é necessário abrir SSH (porta 22) para o GitHub nem usar GitHub Actions para deploy; o fluxo é **GitHub → POST no seu app → deploy na VPS**.

---

## Opcional: deploy via GitHub Actions (SSH)

Se preferir que o deploy seja feito por um workflow que entra na VPS por SSH (em vez do webhook), use o workflow em `.github/workflows/deploy.yml`. Ele está configurado para rodar **só manualmente** (Actions → Deploy to VPS → Run workflow). Para isso funcionar, a VPS precisa aceitar conexões SSH na porta 22 a partir da internet (firewall/painel Hostinger). Os secrets necessários estão descritos no próprio workflow (`VPS_HOST`, `VPS_USER`, `VPS_PASSWORD`, e opcionalmente os de ambiente para criar `.env.local`).
