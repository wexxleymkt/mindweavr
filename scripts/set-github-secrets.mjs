#!/usr/bin/env node
/**
 * Configura os secrets do repositório GitHub para o workflow de deploy.
 * Uso: GITHUB_TOKEN=seu_token node scripts/set-github-secrets.mjs
 * Ou no PowerShell: $env:GITHUB_TOKEN="seu_token"; node scripts/set-github-secrets.mjs
 */
const OWNER = 'wexxleymkt';
const REPO = 'mindweavr';
const SECRETS = {
  VPS_HOST: process.env.VPS_HOST || '187.77.229.241',
  VPS_USER: process.env.VPS_USER || 'root',
  VPS_PASSWORD: process.env.VPS_PASSWORD || '',
};

async function getPublicKey(token) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/secrets/public-key`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
  );
  if (!res.ok) throw new Error(`Public key: ${res.status} ${await res.text()}`);
  return res.json();
}

async function setSecret(token, name, value, keyId, publicKeyBase64) {
  const lib = await import('libsodium-wrappers');
  const sodium = lib.default;
  await sodium.ready;
  const binKey = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL);
  const binSec = sodium.from_string(value);
  const encBytes = sodium.crypto_box_seal(binSec, binKey);
  const encryptedValue = sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL);

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/secrets/${name}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ encrypted_value: encryptedValue, key_id: keyId }),
    }
  );
  if (!res.ok) throw new Error(`${name}: ${res.status} ${await res.text()}`);
  console.log(`OK: ${name}`);
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('Defina GITHUB_TOKEN (ex: $env:GITHUB_TOKEN="ghp_xxx"; node scripts/set-github-secrets.mjs)');
    process.exit(1);
  }
  if (!SECRETS.VPS_PASSWORD) {
    console.error('Defina VPS_PASSWORD (ex: $env:VPS_PASSWORD="sua_senha"; node scripts/set-github-secrets.mjs)');
    process.exit(1);
  }
  const { key_id, key } = await getPublicKey(token);
  for (const [name, value] of Object.entries(SECRETS)) {
    await setSecret(token, name, value, key_id, key);
  }
  console.log('Secrets configurados.');
}

main().catch((e) => { console.error(e); process.exit(1); });
