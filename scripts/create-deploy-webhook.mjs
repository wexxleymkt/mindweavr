#!/usr/bin/env node
/**
 * Cria o webhook de deploy no repositório GitHub (wexxleymkt/mindweavr).
 * Gera DEPLOY_WEBHOOK_SECRET e grava em .deploy-webhook-secret para o setup-vps-env usar.
 * Uso: GITHUB_TOKEN=seu_token node scripts/create-deploy-webhook.mjs
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const OWNER = 'wexxleymkt';
const REPO = 'mindweavr';
const WEBHOOK_URL = 'https://mindweavr.app/api/deploy-webhook';

async function listHooks(token) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/hooks`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
  if (!res.ok) throw new Error(`List hooks: ${res.status} ${await res.text()}`);
  return res.json();
}

async function createHook(token, secret) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/hooks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: WEBHOOK_URL,
          content_type: 'json',
          secret,
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`Create hook: ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('Defina GITHUB_TOKEN (ex: $env:GITHUB_TOKEN="ghp_xxx"; node scripts/create-deploy-webhook.mjs)');
    process.exit(1);
  }

  const existing = await listHooks(token);
  const already = existing.find((h) => h.config?.url === WEBHOOK_URL);
  if (already) {
    console.log('Webhook já existe para', WEBHOOK_URL, '(id:', already.id, ')');
    console.log('Se precisar do secret na VPS, use o valor em .deploy-webhook-secret ou defina DEPLOY_WEBHOOK_SECRET manualmente.');
    return;
  }

  const secret = crypto.randomBytes(32).toString('hex');
  const hook = await createHook(token, secret);
  console.log('Webhook criado. Id:', hook.id);

  const secretPath = path.join(process.cwd(), '.deploy-webhook-secret');
  fs.writeFileSync(secretPath, secret, 'utf8');
  console.log('Secret gravado em', secretPath, '(adicione DEPLOY_WEBHOOK_SECRET no .env.local da VPS com esse valor)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
