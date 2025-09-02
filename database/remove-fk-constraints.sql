-- Temporarily remove foreign key constraints for data population
-- Run this BEFORE the populate script

ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE public.portfolios DROP CONSTRAINT IF EXISTS portfolios_user_id_fkey;
ALTER TABLE public.positions DROP CONSTRAINT IF EXISTS positions_user_id_fkey;
ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_user_id_fkey;
ALTER TABLE public.portfolio_history DROP CONSTRAINT IF EXISTS portfolio_history_user_id_fkey;
ALTER TABLE public.ai_insights DROP CONSTRAINT IF EXISTS ai_insights_user_id_fkey;
ALTER TABLE public.performance_metrics DROP CONSTRAINT IF EXISTS performance_metrics_user_id_fkey;
