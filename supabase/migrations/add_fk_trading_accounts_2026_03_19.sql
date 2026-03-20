-- ─────────────────────────────────────────────────────────────────────────────
-- Migración: FK entre trading_accounts_2026_02_08_22_02
--            y client_profiles_2026_02_08_22_02
-- Fecha: 2026-03-19
-- Permite que PostgREST (Supabase) resuelva el JOIN automático entre
-- client_profiles y trading_accounts en ClientsManager.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Asegurarse de que user_id en trading_accounts apunta a client_profiles
ALTER TABLE public.trading_accounts_2026_02_08_22_02
  ADD CONSTRAINT fk_trading_accounts_client_profile
  FOREIGN KEY (user_id)
  REFERENCES public.client_profiles_2026_02_08_22_02 (user_id)
  ON DELETE CASCADE;

-- 2. Índice para mejorar performance del JOIN
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id
  ON public.trading_accounts_2026_02_08_22_02 (user_id);

-- 3. Recargar schema cache de PostgREST
NOTIFY pgrst, 'reload schema';
