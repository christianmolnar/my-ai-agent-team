-- Temporary policies to allow service role to insert mock data
-- Run this BEFORE the populate script, then run the cleanup script after

-- Allow service role to insert into all tables
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
