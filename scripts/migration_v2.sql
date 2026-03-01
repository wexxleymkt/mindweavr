-- ============================================================
-- MindWeavr — Migration v2
-- Planos: essencial, creator, pro (sem free)
-- Integração PerfectPay via Webhook
-- Cole este SQL no Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- 1. Atualizar constraint de plano na tabela profiles
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('essencial','creator','pro'));

-- Atualizar qualquer perfil com plano 'free' ou 'starter'/'growth' para 'essencial'
UPDATE public.profiles
  SET plan = 'essencial'
  WHERE plan NOT IN ('essencial','creator','pro');

-- Atualizar coluna de créditos por plano
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- ═══════════════════════════════════════════════════════════
-- 2. TABELA: subscriptions
--    Uma linha por email de comprador, reflete estado atual
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT        NOT NULL,
  plan            TEXT        NOT NULL CHECK (plan IN ('essencial','creator','pro')),
  plan_code       TEXT        NOT NULL,   -- ex: PPLQQOQSE
  product_code    TEXT,                   -- ex: PPU38CQ8AMR
  sale_id         TEXT,                   -- ID da venda na PerfectPay
  status          TEXT        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','cancelled','refunded','pending')),
  buyer_name      TEXT,
  buyer_phone     TEXT,
  amount          INTEGER,                -- em centavos
  payment_method  TEXT,
  activated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_email  ON public.subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ═══════════════════════════════════════════════════════════
-- 3. TABELA: webhook_events
--    Log de todos os webhooks recebidos da PerfectPay
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id         TEXT,
  sale_status     TEXT,
  plan_code       TEXT,
  buyer_email     TEXT,
  raw_payload     JSONB       NOT NULL DEFAULT '{}',
  processed       BOOLEAN     NOT NULL DEFAULT false,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_sale_id     ON public.webhook_events(sale_id);
CREATE INDEX IF NOT EXISTS idx_webhook_buyer_email ON public.webhook_events(buyer_email);

-- ═══════════════════════════════════════════════════════════
-- 4. RLS — subscriptions (somente service role acessa)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own"   ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_service_all"  ON public.subscriptions;

-- Usuário autenticado pode ver sua própria subscription
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (
    email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

-- RLS — webhook_events (somente service role)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
-- Nenhuma política pública — somente service_role acessa

-- ═══════════════════════════════════════════════════════════
-- 5. Trigger: atualiza updated_at em subscriptions
-- ═══════════════════════════════════════════════════════════
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════════════════════════
-- 6. Atualizar trigger handle_new_user:
--    Ao criar conta, busca plano na tabela subscriptions
--    pelo email e aplica o plano correto
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_plan          TEXT := 'essencial';
  v_credits       INTEGER := 5;
  v_credits_limit INTEGER := 5;
BEGIN
  -- Busca plano ativo na tabela subscriptions pelo email
  SELECT
    sub.plan,
    CASE sub.plan
      WHEN 'essencial' THEN 5
      WHEN 'creator'   THEN 10
      WHEN 'pro'       THEN 999999
    END,
    CASE sub.plan
      WHEN 'essencial' THEN 5
      WHEN 'creator'   THEN 10
      WHEN 'pro'       THEN 999999
    END
  INTO v_plan, v_credits, v_credits_limit
  FROM public.subscriptions sub
  WHERE sub.email = NEW.email
    AND sub.status = 'active'
  LIMIT 1;

  -- Fallback se não encontrar (não deveria acontecer com a nova lógica)
  IF v_plan IS NULL THEN
    v_plan := 'essencial';
    v_credits := 5;
    v_credits_limit := 5;
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, avatar_url,
    plan, credits, plan_credits_limit, credits_reset_at, whatsapp
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    v_plan,
    v_credits,
    v_credits_limit,
    now() + interval '30 days',
    NEW.raw_user_meta_data->>'whatsapp'
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
-- 7. Atualizar plano do usuário suporte para Pro
-- ═══════════════════════════════════════════════════════════

-- Garante subscription ativa para o usuário suporte
INSERT INTO public.subscriptions (email, plan, plan_code, product_code, status, buyer_name)
VALUES (
  'suporte.euwesleysilvaa@gmail.com',
  'pro',
  'PPLQQOQSC',
  'PPU38CQ8AMP',
  'active',
  'Suporte MindWeavr'
)
ON CONFLICT (email) DO UPDATE SET
  plan        = 'pro',
  plan_code   = 'PPLQQOQSC',
  status      = 'active',
  updated_at  = now();

-- Atualiza perfil existente para Pro
UPDATE public.profiles
SET
  plan               = 'pro',
  credits            = 999999,
  plan_credits_limit = 999999,
  updated_at         = now()
WHERE email = 'suporte.euwesleysilvaa@gmail.com';

-- ═══════════════════════════════════════════════════════════
-- 8. Verificação final
-- ═══════════════════════════════════════════════════════════
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles','map_generations','subscriptions','webhook_events')
ORDER BY tablename;
