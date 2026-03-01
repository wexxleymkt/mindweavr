-- ============================================================
-- MindMap AI — Database Migration
-- Cole este SQL no Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- 1. TABELA: profiles
--    Criada automaticamente quando um usuário faz signup
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
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
);

-- Adiciona colunas faltantes (seguro rodar múltiplas vezes)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url     TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at     TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMPTZ;

-- ═══════════════════════════════════════════════════════════
-- 2. TABELA: map_generations
--    Armazena cada mapa criado pelo usuário
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.map_generations (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL DEFAULT 'Sem título',
  prompt      TEXT,
  map_data    JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adiciona colunas faltantes
ALTER TABLE public.map_generations ADD COLUMN IF NOT EXISTS user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.map_generations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ═══════════════════════════════════════════════════════════
-- 3. ÍNDICES
-- ═══════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_map_gen_user_id   ON public.map_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_map_gen_created   ON public.map_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email    ON public.profiles(email);

-- ═══════════════════════════════════════════════════════════
-- 4. RLS — profiles
-- ═══════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════
-- 5. RLS — map_generations
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.map_generations ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas (nomes variados que podem existir)
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

-- ═══════════════════════════════════════════════════════════
-- 6. TRIGGER: atualiza updated_at automaticamente
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at  ON public.profiles;
DROP TRIGGER IF EXISTS trg_map_gen_updated_at   ON public.map_generations;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_map_gen_updated_at
  BEFORE UPDATE ON public.map_generations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 7. TRIGGER: cria perfil automaticamente no signup
--    Toda vez que um usuário se registra, um profile é criado
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    plan,
    credits,
    plan_credits_limit,
    credits_reset_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
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

-- ═══════════════════════════════════════════════════════════
-- 8. VERIFICAÇÃO FINAL
-- ═══════════════════════════════════════════════════════════
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'map_generations')
ORDER BY tablename;
