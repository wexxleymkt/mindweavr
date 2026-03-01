# Deploy MindWeavr — GitHub + Hostinger VPS

## Passo 1: Criar o repositório no GitHub

1. Acesse [github.com/new](https://github.com/new).
2. **Repository name:** `mindweavr` (ou outro nome; anote o `usuario/mindweavr`).
3. Deixe **Private** ou **Public** (para repositório privado você vai precisar do secret `GH_DEPLOY_TOKEN` no passo 3).
4. **Não** marque "Add a README" (o projeto já tem código).
5. Clique em **Create repository**.

---

## Passo 2: Adicionar os Secrets do repositório

1. Abra o repositório criado → **Settings** → **Secrets and variables** → **Actions**.
2. Clique em **New repository secret** e crie **um secret por linha**:

| Nome           | Valor |
|----------------|--------|
| `VPS_HOST`     | `187.77.229.241` |
| `VPS_USER`     | `root` |
| `VPS_PASSWORD` | *(a senha root da VPS que você informou)* |

**Importante:** não coloque a senha em nenhum arquivo do projeto; só nos Secrets do GitHub.

Se o repositório for **privado**, crie também:

| Nome               | Valor |
|--------------------|--------|
| `GH_DEPLOY_TOKEN`  | Um Personal Access Token (classic) com escopo **repo** (para o workflow clonar na VPS). |

---

## Passo 3: Primeiro push do projeto

No terminal, na pasta do projeto:

```bash
git init
git add .
git commit -m "Initial commit: MindWeavr"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/mindweavr.git
git push -u origin main
```

Substitua `SEU_USUARIO` pelo seu usuário ou organização do GitHub.

Após o push, o workflow **Deploy to VPS** será disparado. Na primeira vez a VPS vai:

- Instalar Node 20 (via nvm) se não existir
- Clonar o repositório em `~/mindweavr`
- Rodar `npm ci` e `npm run build`
- Subir a app com PM2 (nome `mindweavr`)

---

## Passo 4: Variáveis de ambiente na VPS (obrigatório)

Na primeira vez (ou se ainda não fez), entre na VPS e crie o `.env.local` da aplicação:

```bash
ssh root@187.77.229.241
cd ~/mindweavr
nano .env.local
```

Coloque as mesmas variáveis que você usa em desenvolvimento, por exemplo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://msxswthxpwhwdbhfrsef.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_gemini
```

Salve (Ctrl+O, Enter, Ctrl+X) e reinicie a app:

```bash
pm2 restart mindweavr
```

---

## Passo 5: Domínio mindweavr.app

Quando quiser usar o domínio:

1. **DNS:** No painel do registrador do domínio (onde você comprou mindweavr.app), crie um registro **A** apontando para `187.77.229.241`.
2. **HTTPS (recomendado):** Na VPS, instale nginx e certbot e configure proxy reverso para a porta 3000 e SSL. Exemplo rápido:

```bash
apt update && apt install -y nginx certbot python3-certbot-nginx
certbot --nginx -d mindweavr.app
```

E um site em `/etc/nginx/sites-available/mindweavr`:

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
    }
}
```

Depois: `ln -s /etc/nginx/sites-available/mindweavr /etc/nginx/sites-enabled/` e `nginx -t && systemctl reload nginx`.

---

## Resumo

| Onde              | O que fazer |
|-------------------|-------------|
| GitHub            | Criar repositório e adicionar Secrets: `VPS_HOST`, `VPS_USER`, `VPS_PASSWORD` (e `GH_DEPLOY_TOKEN` se for repo privado). |
| Projeto           | `git init`, `git add .`, `git commit`, `git remote add origin`, `git push -u origin main`. |
| VPS (uma vez)     | Criar `~/mindweavr/.env.local` com Supabase e Gemini; `pm2 restart mindweavr`. |
| DNS               | Apontar mindweavr.app (A) para `187.77.229.241`. |
| HTTPS (opcional)  | Nginx + Certbot na VPS e proxy para porta 3000. |

O workflow está em `.github/workflows/deploy.yml`: a cada **push em `main`** o deploy roda de novo na VPS.
