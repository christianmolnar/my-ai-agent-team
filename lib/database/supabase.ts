// Supabase Database Configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface Portfolio {
  id: string
  user_id: string
  total_value: number
  total_pnl: number
  total_pnl_percent: number
  cash_balance: number
  buying_power: number
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  user_id: string
  symbol: string
  company_name: string
  sector: string
  quantity: number
  entry_price: number
  current_price: number
  entry_date: string
  status: 'OPEN' | 'CLOSED'
  pnl: number
  pnl_percent: number
  decision_score: number
  stop_loss?: number
  take_profit?: number
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
  ai_rationale: string[]
  technical_signals: string[]
  fundamental_factors: string[]
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  user_id: string
  symbol: string
  action: 'BUY' | 'SELL'
  quantity: number
  price: number
  trade_date: string
  confidence_score: number
  pnl?: number
  outcome: 'WIN' | 'LOSS' | 'PENDING'
  ai_reasoning: string
  market_conditions: string
  position_id?: string
  created_at: string
}

export interface PortfolioHistory {
  id: string
  user_id: string
  date: string
  portfolio_value: number
  daily_return: number
  total_return: number
  positions_count: number
  created_at: string
}

export interface AIInsight {
  id: string
  user_id: string
  insight_text: string
  insight_type: 'OPPORTUNITY' | 'RISK' | 'ANALYSIS' | 'RECOMMENDATION'
  confidence: number
  related_symbols?: string[]
  created_at: string
}

export interface PerformanceMetrics {
  id: string
  user_id: string
  period: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | '3_YEAR' | '5_YEAR'
  total_return: number
  annualized_return: number
  volatility: number
  sharpe_ratio: number
  max_drawdown: number
  win_rate: number
  best_day: number
  worst_day: number
  calculated_at: string
  created_at: string
}
