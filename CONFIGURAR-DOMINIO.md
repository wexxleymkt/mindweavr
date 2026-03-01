# Apontar mindweavr.app para a VPS

O domínio **mindweavr.app** precisa apontar para o IP da sua VPS: **187.77.229.241**.

---

## Onde o domínio foi registrado?

O domínio foi comprado em um **registrador** (Registro.br, Hostinger, GoDaddy, Namecheap, etc.). É lá que você altera o DNS.

- **Registro.br** → [registro.br](https://registro.br)
- **Hostinger** → Painel Hostinger → Domínios
- **GoDaddy** → My Products → Domínios → DNS
- **Namecheap** → Domain List → Manage → Advanced DNS
- **Cloudflare** → Se você usa Cloudflare como DNS, é no painel deles

---

## O que configurar (em qualquer painel)

Você precisa criar **registros de tipo A** apontando para o IP da VPS.

| Tipo | Nome / Host / Subdomínio | Valor / Aponta para / Conteúdo | TTL (opcional) |
|------|---------------------------|---------------------------------|----------------|
| **A** | `@` (ou vazio, ou `mindweavr.app`) | `187.77.229.241` | 300 ou 3600 |
| **A** | `www` | `187.77.229.241` | 300 ou 3600 |

- **@** = domínio raiz (mindweavr.app)
- **www** = www.mindweavr.app

Em alguns painéis o “Nome” é:
- `@` ou em branco para o domínio principal
- `www` para o subdomínio www

**Valor** deve ser sempre: **187.77.229.241**

---

## Exemplos por provedor

### Registro.br

1. Acesse [registro.br](https://registro.br) e faça login.
2. Clique no domínio **mindweavr.app**.
3. Vá em **Alterar DNS** ou **Editar zona**.
4. Adicione/edite:
   - **Tipo:** A | **Nome:** @ | **Dados:** 187.77.229.241
   - **Tipo:** A | **Nome:** www | **Dados:** 187.77.229.241
5. Salve e aguarde a propagação (minutos a algumas horas).

### Hostinger

1. Painel Hostinger → **Domínios** → **mindweavr.app** → **Gerenciar**.
2. Aba **DNS / Nameservers** ou **Zona DNS**.
3. Adicione registros:
   - Tipo **A**, Host **@**, Aponta para **187.77.229.241**.
   - Tipo **A**, Host **www**, Aponta para **187.77.229.241**.
4. Salve.

### GoDaddy

1. **My Products** → **Domínios** → **mindweavr.app** → **DNS** ou **Manage DNS**.
2. Em **Records** (Registros), adicione:
   - **Type:** A | **Name:** @ | **Value:** 187.77.229.241
   - **Type:** A | **Name:** www | **Value:** 187.77.229.241
3. Salve.

### Namecheap

1. **Domain List** → **Manage** ao lado de mindweavr.app.
2. Aba **Advanced DNS**.
3. **Add New Record**:
   - **Type:** A Record | **Host:** @ | **Value:** 187.77.229.241
   - **Type:** A Record | **Host:** www | **Value:** 187.77.229.241
4. Salve (ícone de check).

### Cloudflare (se usar)

1. Selecione o site **mindweavr.app**.
2. **DNS** → **Records**.
3. Adicione:
   - **Type:** A | **Name:** @ | **IPv4 address:** 187.77.229.241 | **Proxy:** DNS only (cinza) no início.
   - **Type:** A | **Name:** www | **IPv4 address:** 187.77.229.241 | **Proxy:** DNS only.
4. Salve.

---

## Depois de salvar o DNS

- A propagação pode levar de **5 minutos** a **48 horas** (geralmente 15–60 minutos).
- Para testar no seu computador:
  - `ping mindweavr.app` → deve mostrar **187.77.229.241**.
  - Ou acesse no navegador: **http://mindweavr.app** (sem HTTPS ainda).

---

## Ativar HTTPS (recomendado)

Quando **mindweavr.app** já estiver apontando para a VPS (ping e http funcionando), você pode ativar HTTPS na própria VPS com Nginx e Certbot.

1. Conectar na VPS:
   ```bash
   ssh root@187.77.229.241
   ```

2. Instalar Nginx e Certbot:
   ```bash
   apt update && apt install -y nginx certbot python3-certbot-nginx
   ```

3. Criar o site Nginx:
   ```bash
   nano /etc/nginx/sites-available/mindweavr
   ```
   Cole (e salve com Ctrl+O, Enter, Ctrl+X):
   ```nginx
   server {
       listen 80;
       server_name mindweavr.app www.mindweavr.app;
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Ativar o site e testar:
   ```bash
   ln -sf /etc/nginx/sites-available/mindweavr /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   ```

5. Em seguida, pedir o certificado SSL (HTTPS):
   ```bash
   certbot --nginx -d mindweavr.app -d www.mindweavr.app
   ```
   Siga as perguntas (email, aceitar termos). O Certbot ajusta o Nginx para HTTPS.

Depois disso, **https://mindweavr.app** deve abrir com cadeado.

---

## Resumo rápido

| Etapa | Onde | O que fazer |
|-------|------|-------------|
| 1 | Painel do registrador do domínio | Criar registro **A** para **@** e **www** → **187.77.229.241** |
| 2 | Aguardar | 15 min a 48 h de propagação |
| 3 | Testar | `ping mindweavr.app` e abrir http://mindweavr.app |
| 4 | VPS (opcional) | Nginx + Certbot para HTTPS |

Se disser em qual registrador o **mindweavr.app** está (Registro.br, Hostinger, etc.), dá para descrever os cliques exatos na tela desse painel.
