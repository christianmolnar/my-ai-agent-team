-- Temporarily disable RLS for data population
-- Run this BEFORE the populate script

ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data DISABLE ROW LEVEL SECURITY;
