/**
 * Migration via Supabase REST + service_role key
 * Uses the pg function approach: calls sql directly via supabase-js admin client
 */

const PROJECT   = 'msxswthxpwhwdbhfrsef';
const SUPABASE_URL = `https://${PROJECT}.supabase.co`;
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeHN3dGh4cHdod2RiaGZyc2VmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA2NDg4MywiZXhwIjoyMDg3NjQwODgzfQ.QDvIMGckI4C-2bUpyyYhU8_vutK1krJtIAh5TB_raMQ';
const ANON_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zeHN3dGh4cHdod2RiaGZyc2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjQ4ODMsImV4cCI6MjA4NzY0MDg4M30.BJyenosR4zD__CV_DsLYyuA3kphqP84wjg4NV6_OK-E';

import { createClient } from '@supabase/supabase-js';

// Admin client — bypasses RLS
const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Execute raw SQL via the pg REST proxy (Supabase exposes this for service_role)
async function execSQL(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer':        'return=minimal',
    },
    body: JSON.stringify({ query }),
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

// Alternative: use pg-meta endpoint Supabase exposes
async function execViaPgMeta(query) {
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query }),
  });
  return { ok: res.ok, status: res.status, body: await res.text() };
}

// The most reliable way: use supabase-js .rpc() with a SQL function
// First try to create the exec_sql helper, then use it
async function bootstrap() {
  // Try creating a temp SQL execution function via REST POST to /rest/v1/rpc  
  // Actually, let's try the pg endpoint at port format Supabase uses internally
  const endpoints = [
    `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
    `${SUPABASE_URL}/pg-meta/v1/query`,
    `${SUPABASE_URL}/graphql/v1`,
  ];
  
  for (const ep of endpoints) {
    const r = await fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ sql: 'SELECT 1', query: 'SELECT 1' }),
    });
    console.log(`  ${ep} → ${r.status}`);
  }
}

// ── Full migration SQL (single statement for reliability) ──────────────────
const FULL_MIGRATION = `
-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT        NOT NULL DEFAULT '',
  full_name           TEXT,
  avatar_url          TEXT,
  plan                TEXT        NOT NULL DEFAULT 'free' CHECK (plan IN ('free','essencial','creator','pro')),
  credits             INTEGER     NOT NULL DEFAULT 10,
  plan_credits_limit  INTEGER     NOT NULL DEFAULT 10,
  credits_reset_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- map_generations
CREATE TABLE IF NOT EXISTS public.map_generations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL DEFAULT 'Sem título',
  prompt     TEXT,
  map_data   JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.map_generations ADD COLUMN IF NOT EXISTS user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.map_generations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- indexes
CREATE INDEX IF NOT EXISTS idx_map_gen_user_id ON public.map_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_map_gen_created ON public.map_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email  ON public.profiles(email);

-- RLS profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS map_generations
ALTER TABLE public.map_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "map_gen_select" ON public.map_generations;
DROP POLICY IF EXISTS "map_gen_insert" ON public.map_generations;
DROP POLICY IF EXISTS "map_gen_update" ON public.map_generations;
DROP POLICY IF EXISTS "map_gen_delete" ON public.map_generations;
DROP POLICY IF EXISTS "user_select" ON public.map_generations;
DROP POLICY IF EXISTS "user_insert" ON public.map_generations;
DROP POLICY IF EXISTS "user_update" ON public.map_generations;
DROP POLICY IF EXISTS "user_delete" ON public.map_generations;
CREATE POLICY "map_gen_select" ON public.map_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "map_gen_insert" ON public.map_generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "map_gen_update" ON public.map_generations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "map_gen_delete" ON public.map_generations FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS \$\$ BEGIN NEW.updated_at = now(); RETURN NEW; END; \$\$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_map_gen_updated_at ON public.map_generations;
CREATE TRIGGER trg_map_gen_updated_at BEFORE UPDATE ON public.map_generations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS \$\$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, plan, credits, plan_credits_limit, credits_reset_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email,''), '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free', 10, 10, now() + interval '30 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;
CREATE TRIGGER trg_new_user AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

console.log('\n🚀  MindMap AI — Database Migration');
console.log(`    Project: ${PROJECT}\n`);

// Try all known Supabase SQL endpoints
console.log('  Probing endpoints...');
await bootstrap();

// Now use supabase-js admin client to test direct table access
console.log('\n  Testing admin client access...');
const { data: testData, error: testErr } = await admin.from('profiles').select('count').limit(1);
if (testErr) {
  console.log(`  profiles via admin: ${testErr.message}`);
} else {
  console.log(`  profiles via admin: ✅ accessible`);
}

const { data: testData2, error: testErr2 } = await admin.from('map_generations').select('count').limit(1);
if (testErr2) {
  console.log(`  map_generations via admin: ${testErr2.message}`);
} else {
  console.log(`  map_generations via admin: ✅ accessible`);
}

// Try the pg-meta endpoint that Supabase studio uses
console.log('\n  Trying pg-meta query endpoint...');
const pgMetaRes = await fetch(`${SUPABASE_URL}/pg-meta/v1/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ query: 'SELECT current_database()' }),
});
console.log(`  pg-meta/v1/query: ${pgMetaRes.status} - ${(await pgMetaRes.text()).slice(0, 100)}`);
