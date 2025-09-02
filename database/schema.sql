-- F.Insight.AI Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  risk_tolerance TEXT CHECK (risk_tolerance IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')),
  trading_experience TEXT CHECK (trading_experience IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  investment_goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio table
CREATE TABLE public.portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_pnl_percent DECIMAL(8,4) NOT NULL DEFAULT 0,
  cash_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  buying_power DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions table
CREATE TABLE public.positions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  entry_price DECIMAL(10,4) NOT NULL,
  current_price DECIMAL(10,4) NOT NULL,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
  pnl DECIMAL(15,2) DEFAULT 0,
  pnl_percent DECIMAL(8,4) DEFAULT 0,
  decision_score INTEGER CHECK (decision_score >= 0 AND decision_score <= 100),
  stop_loss DECIMAL(10,4),
  take_profit DECIMAL(10,4),
  risk_level TEXT CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  ai_rationale TEXT[],
  technical_signals TEXT[],
  fundamental_factors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trades table
CREATE TABLE public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  symbol TEXT NOT NULL,
  action TEXT CHECK (action IN ('BUY', 'SELL')) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  trade_date TIMESTAMP WITH TIME ZONE NOT NULL,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  pnl DECIMAL(15,2),
  outcome TEXT CHECK (outcome IN ('WIN', 'LOSS', 'PENDING')) DEFAULT 'PENDING',
  ai_reasoning TEXT,
  market_conditions TEXT,
  position_id UUID REFERENCES public.positions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio history for time-series data
CREATE TABLE public.portfolio_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  portfolio_value DECIMAL(15,2) NOT NULL,
  daily_return DECIMAL(8,4) NOT NULL,
  total_return DECIMAL(8,4) NOT NULL,
  positions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- AI insights table
CREATE TABLE public.ai_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  insight_text TEXT NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('OPPORTUNITY', 'RISK', 'ANALYSIS', 'RECOMMENDATION')) NOT NULL,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  related_symbols TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE public.performance_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  period TEXT CHECK (period IN ('DAY', 'WEEK', 'MONTH', 'YEAR', '3_YEAR', '5_YEAR')) NOT NULL,
  total_return DECIMAL(8,4) NOT NULL,
  annualized_return DECIMAL(8,4) NOT NULL,
  volatility DECIMAL(8,4) NOT NULL,
  sharpe_ratio DECIMAL(6,4) NOT NULL,
  max_drawdown DECIMAL(8,4) NOT NULL,
  win_rate DECIMAL(8,4) NOT NULL,
  best_day DECIMAL(8,4) NOT NULL,
  worst_day DECIMAL(8,4) NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data cache table (for real-time data)
CREATE TABLE public.market_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  symbol TEXT NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  volume BIGINT,
  change_percent DECIMAL(8,4),
  market_cap BIGINT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, timestamp)
);

-- Indexes for performance
CREATE INDEX idx_positions_user_status ON public.positions(user_id, status);
CREATE INDEX idx_trades_user_date ON public.trades(user_id, trade_date DESC);
CREATE INDEX idx_portfolio_history_user_date ON public.portfolio_history(user_id, date DESC);
CREATE INDEX idx_ai_insights_user_created ON public.ai_insights(user_id, created_at DESC);
CREATE INDEX idx_market_data_symbol_timestamp ON public.market_data(symbol, timestamp DESC);

-- Unique constraint for performance metrics (one per user, period, and calculated_at)
CREATE UNIQUE INDEX idx_performance_metrics_unique ON public.performance_metrics(user_id, period, calculated_at);

-- Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own portfolio" ON public.portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own positions" ON public.positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own positions" ON public.positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions" ON public.positions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own portfolio history" ON public.portfolio_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio history" ON public.portfolio_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own AI insights" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI insights" ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own performance metrics" ON public.performance_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own performance metrics" ON public.performance_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Market data is public (read-only for users)
CREATE POLICY "Anyone can view market data" ON public.market_data FOR SELECT TO authenticated USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
