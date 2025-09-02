-- Add service role insert policies (safe to run multiple times)

-- Drop any existing service role policies first
DROP POLICY IF EXISTS "Allow service role inserts" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.portfolios;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.positions;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.trades;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.portfolio_history;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.ai_insights;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.performance_metrics;
DROP POLICY IF EXISTS "Allow service role inserts" ON public.market_data;

-- Create service role insert policies
CREATE POLICY "Allow service role inserts" ON public.user_profiles 
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role inserts" ON public.portfolios 
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role inserts" ON public.positions 
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role inserts" ON public.trades 
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role inserts" ON public.portfolio_history 
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role inserts" ON public.ai_insights 
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role inserts" ON public.performance_metrics 
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role inserts" ON public.market_data 
  FOR INSERT TO service_role WITH CHECK (true);
