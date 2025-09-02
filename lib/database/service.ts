// Database service layer for F.Insight.AI
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  initial_value: number;
  current_value: number;
  cash_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  portfolio_id: string;
  symbol: string;
  company_name: string;
  sector: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  stop_loss?: number;
  take_profit?: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  portfolio_id: string;
  symbol: string;
  company_name: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total_amount: number;
  fees: number;
  executed_at: string;
  ai_confidence_score: number;
  ai_rationale: any;
  realized_pnl?: number;
  trade_outcome: 'WIN' | 'LOSS' | 'BREAK_EVEN' | 'PENDING';
  created_at: string;
}

export interface PortfolioSnapshot {
  id: string;
  portfolio_id: string;
  snapshot_date: string;
  snapshot_time: string;
  total_value: number;
  cash_balance: number;
  daily_return?: number;
  daily_return_percent?: number;
  cumulative_return?: number;
  cumulative_return_percent?: number;
  benchmark_value?: number;
  alpha?: number;
  beta?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  volatility?: number;
  win_rate?: number;
  created_at: string;
}

export interface AIInsight {
  id: string;
  portfolio_id: string;
  insight_type: 'RECOMMENDATION' | 'ALERT' | 'ANALYSIS' | 'RISK_WARNING';
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence_score: number;
  actionable: boolean;
  dismissed: boolean;
  expires_at?: string;
  metadata?: any;
  created_at: string;
}

export interface MarketData {
  symbol: string;
  company_name: string;
  sector: string;
  current_price: number;
  previous_close: number;
  daily_change: number;
  daily_change_percent: number;
  volume?: number;
  market_cap?: number;
  pe_ratio?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
  updated_at: string;
}

class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Portfolio operations
  async getPortfolio(portfolioId: string): Promise<Portfolio | null> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();

    if (error) {
      console.error('Error fetching portfolio:', error);
      return null;
    }

    return data;
  }

  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolios:', error);
      return [];
    }

    return data || [];
  }

  // Position operations
  async getPortfolioPositions(portfolioId: string): Promise<Position[]> {
    const { data, error } = await this.supabase
      .from('positions')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .gt('quantity', 0)
      .order('market_value', { ascending: false });

    if (error) {
      console.error('Error fetching positions:', error);
      return [];
    }

    return data || [];
  }

  async updatePosition(positionId: string, updates: Partial<Position>): Promise<Position | null> {
    const { data, error } = await this.supabase
      .from('positions')
      .update(updates)
      .eq('id', positionId)
      .single();

    if (error) {
      console.error('Error updating position:', error);
      return null;
    }

    return data;
  }

  // Trade operations
  async getPortfolioTrades(portfolioId: string, limit: number = 50): Promise<Trade[]> {
    const { data, error } = await this.supabase
      .from('trades')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('executed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trades:', error);
      return [];
    }

    return data || [];
  }

  async createTrade(trade: Omit<Trade, 'id' | 'created_at' | 'total_amount'>): Promise<Trade | null> {
    const { data, error } = await this.supabase
      .from('trades')
      .insert([trade])
      .single();

    if (error) {
      console.error('Error creating trade:', error);
      return null;
    }

    return data;
  }

  // Portfolio snapshots for performance charts
  async getPortfolioSnapshots(
    portfolioId: string, 
    startDate: string, 
    endDate: string
  ): Promise<PortfolioSnapshot[]> {
    const { data, error } = await this.supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .gte('snapshot_date', startDate)
      .lte('snapshot_date', endDate)
      .order('snapshot_date', { ascending: true })
      .order('snapshot_time', { ascending: true });

    if (error) {
      console.error('Error fetching snapshots:', error);
      return [];
    }

    return data || [];
  }

  async createPortfolioSnapshot(snapshot: Omit<PortfolioSnapshot, 'id' | 'created_at'>): Promise<PortfolioSnapshot | null> {
    const { data, error } = await this.supabase
      .from('portfolio_snapshots')
      .insert([snapshot])
      .single();

    if (error) {
      console.error('Error creating snapshot:', error);
      return null;
    }

    return data;
  }

  // AI Insights
  async getPortfolioInsights(portfolioId: string): Promise<AIInsight[]> {
    const { data, error } = await this.supabase
      .from('ai_insights')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('dismissed', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching insights:', error);
      return [];
    }

    return data || [];
  }

  async createInsight(insight: Omit<AIInsight, 'id' | 'created_at'>): Promise<AIInsight | null> {
    const { data, error } = await this.supabase
      .from('ai_insights')
      .insert([insight])
      .single();

    if (error) {
      console.error('Error creating insight:', error);
      return null;
    }

    return data;
  }

  // Market data operations
  async getMarketData(symbols: string[]): Promise<MarketData[]> {
    const { data, error } = await this.supabase
      .from('market_data')
      .select('*')
      .in('symbol', symbols);

    if (error) {
      console.error('Error fetching market data:', error);
      return [];
    }

    return data || [];
  }

  async updateMarketData(marketData: MarketData[]): Promise<boolean> {
    const { error } = await this.supabase
      .from('market_data')
      .upsert(marketData, { onConflict: 'symbol' });

    if (error) {
      console.error('Error updating market data:', error);
      return false;
    }

    return true;
  }

  // Performance analytics using materialized view
  async getPortfolioPerformanceSummary(portfolioId: string) {
    const { data, error } = await this.supabase
      .from('portfolio_performance_summary')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .single();

    if (error) {
      console.error('Error fetching performance summary:', error);
      return null;
    }

    return data;
  }

  // Utility method to refresh materialized view
  async refreshPerformanceView(): Promise<boolean> {
    const { error } = await this.supabase
      .rpc('refresh_materialized_view', { view_name: 'portfolio_performance_summary' });

    if (error) {
      console.error('Error refreshing performance view:', error);
      return false;
    }

    return true;
  }

  // Batch operations for efficiency
  async batchCreateSnapshots(snapshots: Omit<PortfolioSnapshot, 'id' | 'created_at'>[]): Promise<boolean> {
    const { error } = await this.supabase
      .from('portfolio_snapshots')
      .insert(snapshots);

    if (error) {
      console.error('Error batch creating snapshots:', error);
      return false;
    }

    return true;
  }

  async batchUpdatePositions(updates: { id: string; updates: Partial<Position> }[]): Promise<boolean> {
    const promises = updates.map(({ id, updates }) =>
      this.supabase
        .from('positions')
        .update(updates)
        .eq('id', id)
    );

    try {
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error batch updating positions:', error);
      return false;
    }
  }
}

// Singleton instance
export const db = new DatabaseService();

// Cache service for Vercel KV
export class CacheService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.KV_REST_API_URL!;
    this.token = process.env.KV_REST_API_TOKEN!;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.result as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value, ex: ttlSeconds }),
      });

      return response.ok;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/del/${key}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // Utility methods for common cache patterns
  async cacheMarketData(symbol: string, data: MarketData, ttl: number = 30): Promise<boolean> {
    return this.set(`market:${symbol}`, data, ttl);
  }

  async getCachedMarketData(symbol: string): Promise<MarketData | null> {
    return this.get<MarketData>(`market:${symbol}`);
  }

  async cachePortfolioSummary(portfolioId: string, data: any, ttl: number = 300): Promise<boolean> {
    return this.set(`portfolio:${portfolioId}:summary`, data, ttl);
  }

  async getCachedPortfolioSummary(portfolioId: string): Promise<any | null> {
    return this.get(`portfolio:${portfolioId}:summary`);
  }
}

export const cache = new CacheService();
