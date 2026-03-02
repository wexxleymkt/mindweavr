-- ============================================================
-- MindWeavr — Novos usuários SEM plano até ter compra ativa
-- Cole no Supabase → SQL Editor → Run
-- ============================================================
-- Permite plan = 'none'. Novos usuários ficam com 'none' até
-- terem assinatura ativa em subscriptions. Perfis existentes
-- sem assinatura são atualizados para 'none'.
-- ============================================================

-- 1. Permitir plano 'none' na constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('none', 'essencial', 'creator', 'pro'));

-- 2. Atualizar perfis que NÃO têm assinatura ativa → plan = 'none', créditos 0
UPDATE public.profiles p
SET
  plan               = 'none',
  credits            = 0,
  plan_credits_limit = 0,
  updated_at         = now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s
  WHERE s.email = p.email AND s.status = 'active'
);

-- 3. Trigger: ao criar conta, usar plano da subscription ou 'none'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_plan          TEXT    := 'none';
  v_credits       INTEGER := 0;
  v_credits_limit INTEGER := 0;
BEGIN
  SELECT
    sub.plan,
    CASE sub.plan
      WHEN 'essencial' THEN 5
      WHEN 'creator'   THEN 10
      WHEN 'pro'       THEN 999999
      ELSE 0
    END,
    CASE sub.plan
      WHEN 'essencial' THEN 5
      WHEN 'creator'   THEN 10
      WHEN 'pro'       THEN 999999
      ELSE 0
    END
  INTO v_plan, v_credits, v_credits_limit
  FROM public.subscriptions sub
  WHERE sub.email = NEW.email
    AND sub.status = 'active'
  LIMIT 1;

  IF v_plan IS NULL OR v_plan = '' THEN
    v_plan          := 'none';
    v_credits       := 0;
    v_credits_limit := 0;
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
