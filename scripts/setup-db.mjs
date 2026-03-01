/**
 * Run: node scripts/setup-db.mjs <SERVICE_ROLE_KEY>
 * 
 * Get your service_role key from:
 * Supabase Dashboard → Project Settings → API → service_role (secret)
 */

const SUPABASE_URL = 'https://ypyztpegiwdocgkjjaua.supabase.co';
const PROJECT_REF  = 'ypyztpegiwdocgkjjaua';
const SERVICE_KEY  = process.argv[2];

if (!SERVICE_KEY) {
  console.error('\n❌  Missing service_role key');
  console.error('   Usage: node scripts/setup-db.mjs <SERVICE_ROLE_KEY>');
  console.error('   Get it: Supabase Dashboard → Settings → API → service_role\n');
  process.exit(1);
}

const STATEMENTS = [

// ── 1. profiles ──────────────────────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT        NOT NULL DEFAULT '',
  full_name           TEXT,
  avatar_url          TEXT,
  plan                TEXT        NOT NULL DEFAULT 'free'
                        CHECK (plan IN ('free','essencial','creator','pro')),
  credits             INTEGER     NOT NULL DEFAULT 10,
  plan_credits_limit  INTEGER     NOT NULL DEFAULT 10,
  credits_reset_at    TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
)`,

// ── 2. map_generations ───────────────────────────────────────────────────────
`CREATE TABLE IF NOT EXISTS public.map_generations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT 'Sem título',
  prompt      TEXT,
  map_data    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
)`,

// Add columns idempotently
`ALTER TABLE public.map_generations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`,
`ALTER TABLE public.map_generations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`,

// ── 3. indexes ───────────────────────────────────────────────────────────────
`CREATE INDEX IF NOT EXISTS idx_map_gen_user_id   ON public.map_generations(user_id)`,
`CREATE INDEX IF NOT EXISTS idx_map_gen_created   ON public.map_generations(created_at DESC)`,
`CREATE INDEX IF NOT EXISTS idx_profiles_email    ON public.profiles(email)`,

// ── 4. RLS on profiles ────────────────────────────────────────────────────────
`ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
`DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles`,
`DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles`,
`DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles`,
`CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id)`,
`CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)`,
`CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id)`,

// ── 5. RLS on map_generations ────────────────────────────────────────────────
`ALTER TABLE public.map_generations ENABLE ROW LEVEL SECURITY`,
`DROP POLICY IF EXISTS "map_gen_select" ON public.map_generations`,
`DROP POLICY IF EXISTS "map_gen_insert" ON public.map_generations`,
`DROP POLICY IF EXISTS "map_gen_update" ON public.map_generations`,
`DROP POLICY IF EXISTS "map_gen_delete" ON public.map_generations`,
`DROP POLICY IF EXISTS "user_select"    ON public.map_generations`,
`DROP POLICY IF EXISTS "user_insert"    ON public.map_generations`,
`DROP POLICY IF EXISTS "user_update"    ON public.map_generations`,
`DROP POLICY IF EXISTS "user_delete"    ON public.map_generations`,
`CREATE POLICY "map_gen_select" ON public.map_generations FOR SELECT USING (auth.uid() = user_id)`,
`CREATE POLICY "map_gen_insert" ON public.map_generations FOR INSERT WITH CHECK (auth.uid() = user_id)`,
`CREATE POLICY "map_gen_update" ON public.map_generations FOR UPDATE USING (auth.uid() = user_id)`,
`CREATE POLICY "map_gen_delete" ON public.map_generations FOR DELETE USING (auth.uid() = user_id)`,

// ── 6. updated_at trigger function ───────────────────────────────────────────
`CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql`,

`DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles`,
`CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`,

`DROP TRIGGER IF EXISTS trg_map_gen_updated_at ON public.map_generations`,
`CREATE TRIGGER trg_map_gen_updated_at
  BEFORE UPDATE ON public.map_generations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()`,

// ── 7. auto-create profile on signup ─────────────────────────────────────────
`CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, avatar_url,
    plan, credits, plan_credits_limit, credits_reset_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email,''), '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    10,
    10,
    now() + interval '30 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER`,

`DROP TRIGGER IF EXISTS trg_new_user ON auth.users`,
`CREATE TRIGGER trg_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`,

];

// ── execute via Supabase Management API ──────────────────────────────────────
async function execSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function main() {
  console.log('\n🔌  Supabase DB Setup');
  console.log(`    Project: ${PROJECT_REF}\n`);

  let ok = 0, warn = 0;
  for (let i = 0; i < STATEMENTS.length; i++) {
    const sql = STATEMENTS[i].trim();
    const label = sql.replace(/\s+/g, ' ').slice(0, 70);
    const { ok: success, status, body } = await execSQL(sql);
    
    if (success) {
      console.log(`  ✅ [${String(i+1).padStart(2,'0')}] ${label.slice(0,65)}`);
      ok++;
    } else {
      // "already exists" type errors are warnings, not failures
      const msg = body?.message || body?.error || JSON.stringify(body);
      const isWarning = msg.includes('already exists') || msg.includes('does not exist') || msg.includes('duplicate');
      console.log(`  ${isWarning ? '⚠️ ' : '❌'} [${String(i+1).padStart(2,'0')}] ${label.slice(0,60)}`);
      if (!isWarning) console.log(`        → ${msg.slice(0,120)}`);
      warn++;
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`  ${ok} OK  |  ${warn} already-exists (normal)\n`);
  console.log('  Done! Your database is ready.\n');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
