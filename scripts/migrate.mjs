/**
 * Migration script — run once to set up all tables, RLS and triggers.
 * Usage: node scripts/migrate.mjs <SERVICE_ROLE_KEY>
 */

const SUPABASE_URL = 'https://ypyztpegiwdocgkjjaua.supabase.co';
const SERVICE_KEY  = process.argv[2];

if (!SERVICE_KEY) {
  console.error('Usage: node scripts/migrate.mjs <SERVICE_ROLE_KEY>');
  console.error('Get it from: Supabase dashboard → Settings → API → service_role key');
  process.exit(1);
}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

/* ────────────────────────────────────────────────
   Full SQL migration
──────────────────────────────────────────────── */
const SQL = `
-- ═══════════════════════════════════════
-- 1. PROFILES TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT        NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  plan                TEXT        NOT NULL DEFAULT 'free'
                        CHECK (plan IN ('free','essencial','creator','pro')),
  credits             INTEGER     NOT NULL DEFAULT 10,
  plan_credits_limit  INTEGER     NOT NULL DEFAULT 10,
  credits_reset_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════
-- 2. MAP_GENERATIONS TABLE
-- ═══════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.map_generations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT 'Sem título',
  prompt      TEXT,
  map_data    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add user_id column if it doesn't exist (idempotent)
ALTER TABLE public.map_generations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.map_generations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Index
CREATE INDEX IF NOT EXISTS idx_map_gen_user_id ON public.map_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_map_gen_created_at ON public.map_generations(created_at DESC);

-- RLS
ALTER TABLE public.map_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "map_gen_select" ON public.map_generations;
DROP POLICY IF EXISTS "map_gen_insert" ON public.map_generations;
DROP POLICY IF EXISTS "map_gen_update" ON public.map_generations;
DROP POLICY IF EXISTS "map_gen_delete" ON public.map_generations;
DROP POLICY IF EXISTS "user_select"    ON public.map_generations;
DROP POLICY IF EXISTS "user_insert"    ON public.map_generations;
DROP POLICY IF EXISTS "user_update"    ON public.map_generations;
DROP POLICY IF EXISTS "user_delete"    ON public.map_generations;

CREATE POLICY "map_gen_select" ON public.map_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "map_gen_insert" ON public.map_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "map_gen_update" ON public.map_generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "map_gen_delete" ON public.map_generations
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- 3. AUTO-UPDATE updated_at TRIGGER
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at    ON public.profiles;
DROP TRIGGER IF EXISTS trg_map_gen_updated_at     ON public.map_generations;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_map_gen_updated_at
  BEFORE UPDATE ON public.map_generations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, plan, credits, plan_credits_limit, credits_reset_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    10,
    10,
    now() + interval '30 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_user ON auth.users;

CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

/* ────────────────────────────────────────────────
   Execute via rpc or direct REST
──────────────────────────────────────────────── */
async function runSQL(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  // Try via Management API
  const mgmtUrl = `${SUPABASE_URL.replace('https://', 'https://api.supabase.com/v1/projects/').replace('.supabase.co','')}/database/query`;

  // Use the pg endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  });

  return response;
}

// Split and run each statement individually via supabase.rpc if available
// Otherwise use the pg REST proxy
async function main() {
  console.log('🔌 Connecting to Supabase...');
  console.log(`   URL: ${SUPABASE_URL}`);

  // Try the SQL via POST to postgres REST endpoint
  const projectRef = 'ypyztpegiwdocgkjjaua';
  const sqlEndpoint = `https://${projectRef}.supabase.co/rest/v1/rpc/query`;

  // Split into individual statements for batch execution
  const statements = SQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 10);

  let ok = 0, fail = 0;
  for (const stmt of statements) {
    const fullStmt = stmt + ';';
    const { error } = await supabase.rpc('exec_sql', { sql: fullStmt }).single().catch(() => ({ error: { message: 'rpc not available' } }));
    if (error && error.message !== 'rpc not available') {
      // Try via raw fetch to the SQL endpoint  
      try {
        const res = await fetch(`https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'apikey': SERVICE_KEY,
          },
          body: JSON.stringify({ sql: fullStmt }),
        });
        if (res.ok) { ok++; } else { 
          const txt = await res.text();
          console.warn('⚠', fullStmt.slice(0, 60), '->', txt.slice(0, 100));
          fail++;
        }
      } catch (e) {
        console.warn('⚠ fetch error:', e.message);
        fail++;
      }
    } else if (!error) {
      ok++;
    }
  }

  console.log(`\n✅ Done — ${ok} statements OK, ${fail} failed`);
  console.log('\nVerifying tables...');
  const { count: pc } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: mc } = await supabase.from('map_generations').select('*', { count: 'exact', head: true });
  console.log(`  profiles rows: ${pc ?? 'accessible'}`);
  console.log(`  map_generations rows: ${mc ?? 'accessible'}`);
}

main().catch(console.error);
