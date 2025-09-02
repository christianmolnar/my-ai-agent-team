-- Cleanup script to remove temporary service role policies
-- Run this AFTER the populate script is complete

-- Remove temporary service role insert policies
DROP POLICY IF EXISTS "Allow service role inserts" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.portfolios;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.positions;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.trades;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.portfolio_history;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.ai_insights;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.performance_metrics;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.market_data;
