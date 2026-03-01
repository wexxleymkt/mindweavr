import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import crypto from 'crypto';

/**
 * Webhook de deploy: GitHub envia POST ao dar push em main.
 * A VPS recebe, valida o secret e dispara git pull + build + pm2 restart.
 * Assim o deploy é "GitHub + Hostinger VPS" sem precisar de SSH de fora (evita timeout de firewall).
 *
 * No GitHub: Settings → Webhooks → Add webhook
 * - Payload URL: https://mindweavr.app/api/deploy-webhook
 * - Secret: mesmo valor de DEPLOY_WEBHOOK_SECRET no .env.local da VPS
 * - Events: Just the push event (ou "Let me select" → Push)
 */

const DEPLOY_SECRET = process.env.DEPLOY_WEBHOOK_SECRET;

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
    console.warn('[deploy-webhook] DEPLOY_WEBHOOK_SECRET não configurado');
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

  const ref = payload.ref;
  if (ref !== 'refs/heads/main') {
    return NextResponse.json({ ok: true, skipped: true, reason: 'not main branch' }, { status: 200 });
  }

  const appDir = process.cwd();
  const script = `set -e; cd "${appDir}" && git pull origin main && npm ci && npm run build && (command -v pm2 >/dev/null && (pm2 restart mindweavr --update-env || pm2 start npm --name mindweavr -- start) && pm2 save || true)`;

  const child = spawn('sh', ['-c', script], {
    cwd: appDir,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PATH: process.env.PATH ?? '' },
  });
  child.unref();

  return NextResponse.json({ ok: true, message: 'Deploy started' }, { status: 202 });
}
