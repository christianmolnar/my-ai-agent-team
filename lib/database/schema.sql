-- F.Insight.AI Database Schema
-- Designed for Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  risk_tolerance TEXT DEFAULT 'MEDIUM' CHECK (risk_tolerance IN ('LOW', 'MEDIUM', 'HIGH')),
  trading_capital DECIMAL(12,2) DEFAULT 100000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE public.portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Main Portfolio',
  description TEXT,
  initial_value DECIMAL(12,2) NOT NULL DEFAULT 100000.00,
  current_value DECIMAL(12,2) NOT NULL DEFAULT 100000.00,
  cash_balance DECIMAL(12,2) NOT NULL DEFAULT 20000.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions table (current holdings)
CREATE TABLE public.positions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  average_cost DECIMAL(10,4) NOT NULL,
  current_price DECIMAL(10,4) NOT NULL,
  market_value DECIMAL(12,2) GENERATED ALWAYS AS (quantity * current_price) STORED,
  unrealized_pnl DECIMAL(12,2) GENERATED ALWAYS AS ((current_price - average_cost) * quantity) STORED,
  unrealized_pnl_percent DECIMAL(8,4) GENERATED ALWAYS AS (((current_price - average_cost) / average_cost) * 100) STORED,
  stop_loss DECIMAL(10,4),
  take_profit DECIMAL(10,4),
  risk_level TEXT DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(portfolio_id, symbol)
);

-- Trades table (historical trades)
CREATE TABLE public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  total_amount DECIMAL(12,2) GENERATED ALWAYS AS (quantity * price) STORED,
  fees DECIMAL(8,2) DEFAULT 0.00,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_confidence_score INTEGER CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
  ai_rationale JSONB,
  realized_pnl DECIMAL(12,2),
  trade_outcome TEXT CHECK (trade_outcome IN ('WIN', 'LOSS', 'BREAK_EVEN', 'PENDING')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio performance snapshots (for charts)
CREATE TABLE public.portfolio_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  snapshot_time TIME NOT NULL DEFAULT CURRENT_TIME,
  total_value DECIMAL(12,2) NOT NULL,
  cash_balance DECIMAL(12,2) NOT NULL,
  daily_return DECIMAL(8,4),
  daily_return_percent DECIMAL(8,4),
  cumulative_return DECIMAL(8,4),
  cumulative_return_percent DECIMAL(8,4),
  benchmark_value DECIMAL(12,2), -- S&P 500 equivalent
  alpha DECIMAL(8,4), -- Performance vs benchmark
  beta DECIMAL(8,4), -- Portfolio volatility vs market
  sharpe_ratio DECIMAL(8,4),
  max_drawdown DECIMAL(8,4),
  volatility DECIMAL(8,4),
  win_rate DECIMAL(8,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(portfolio_id, snapshot_date, snapshot_time)
);

-- AI insights and recommendations
CREATE TABLE public.ai_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('RECOMMENDATION', 'ALERT', 'ANALYSIS', 'RISK_WARNING')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  actionable BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB, -- Store additional structured data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data cache (for real-time prices)
CREATE TABLE public.market_data (
  symbol TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  current_price DECIMAL(10,4) NOT NULL,
  previous_close DECIMAL(10,4) NOT NULL,
  daily_change DECIMAL(10,4) GENERATED ALWAYS AS (current_price - previous_close) STORED,
  daily_change_percent DECIMAL(8,4) GENERATED ALWAYS AS (((current_price - previous_close) / previous_close) * 100) STORED,
  volume BIGINT,
  market_cap BIGINT,
  pe_ratio DECIMAL(8,2),
  fifty_two_week_high DECIMAL(10,4),
  fifty_two_week_low DECIMAL(10,4),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics materialized view for fast queries
CREATE MATERIALIZED VIEW portfolio_performance_summary AS
SELECT 
  p.id as portfolio_id,
  p.user_id,
  p.current_value,
  p.cash_balance,
  p.initial_value,
  ((p.current_value - p.initial_value) / p.initial_value * 100) as total_return_percent,
  (p.current_value - p.initial_value) as total_return_amount,
  COUNT(pos.id) as total_positions,
  SUM(CASE WHEN pos.unrealized_pnl > 0 THEN 1 ELSE 0 END) as winning_positions,
  SUM(pos.market_value) as total_market_value,
  AVG(ps.sharpe_ratio) as avg_sharpe_ratio,
  MAX(ps.max_drawdown) as max_drawdown,
  AVG(ps.volatility) as avg_volatility,
  (SELECT AVG(ai_confidence_score) FROM trades t WHERE t.portfolio_id = p.id AND t.executed_at >= NOW() - INTERVAL '30 days') as avg_ai_confidence
FROM portfolios p
LEFT JOIN positions pos ON p.id = pos.portfolio_id
LEFT JOIN portfolio_snapshots ps ON p.id = ps.portfolio_id AND ps.snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.user_id, p.current_value, p.cash_balance, p.initial_value;

-- Indexes for performance
CREATE INDEX idx_trades_portfolio_date ON trades(portfolio_id, executed_at DESC);
CREATE INDEX idx_snapshots_portfolio_date ON portfolio_snapshots(portfolio_id, snapshot_date DESC);
CREATE INDEX idx_positions_portfolio ON positions(portfolio_id) WHERE quantity > 0;
CREATE INDEX idx_insights_portfolio_priority ON ai_insights(portfolio_id, priority, created_at DESC) WHERE NOT dismissed;

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own portfolios" ON public.portfolios FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own positions" ON public.positions FOR ALL USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));
CREATE POLICY "Users can view own trades" ON public.trades FOR ALL USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));
CREATE POLICY "Users can view own snapshots" ON public.portfolio_snapshots FOR ALL USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));
CREATE POLICY "Users can view own insights" ON public.ai_insights FOR ALL USING (auth.uid() = (SELECT user_id FROM portfolios WHERE id = portfolio_id));

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
