import { supabase } from './supabase'
import type { 
  Portfolio, 
  Position, 
  Trade, 
  PortfolioHistory, 
  AIInsight, 
  PerformanceMetrics 
} from './supabase'

export class DatabaseService {
  // Portfolio operations
  async getPortfolio(userId: string): Promise<Portfolio | null> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  }

  async updatePortfolio(userId: string, updates: Partial<Portfolio>): Promise<Portfolio> {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Position operations
  async getPositions(userId: string, status?: 'OPEN' | 'CLOSED'): Promise<Position[]> {
    let query = supabase
      .from('positions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async createPosition(position: Omit<Position, 'id' | 'created_at' | 'updated_at'>): Promise<Position> {
    const { data, error } = await supabase
      .from('positions')
      .insert(position)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updatePosition(positionId: string, updates: Partial<Position>): Promise<Position> {
    const { data, error } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', positionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Trade operations
  async getTrades(userId: string, limit: number = 50): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  }

  async createTrade(trade: Omit<Trade, 'id' | 'created_at'>): Promise<Trade> {
    const { data, error } = await supabase
      .from('trades')
      .insert(trade)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Portfolio history operations
  async getPortfolioHistory(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<PortfolioHistory[]> {
    const { data, error } = await supabase
      .from('portfolio_history')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  async createPortfolioHistory(
    history: Omit<PortfolioHistory, 'id' | 'created_at'>
  ): Promise<PortfolioHistory> {
    const { data, error } = await supabase
      .from('portfolio_history')
      .insert(history)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // AI insights operations
  async getAIInsights(userId: string, limit: number = 20): Promise<AIInsight[]> {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  }

  async createAIInsight(insight: Omit<AIInsight, 'id' | 'created_at'>): Promise<AIInsight> {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert(insight)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Performance metrics operations
  async getPerformanceMetrics(
    userId: string, 
    period: string
  ): Promise<PerformanceMetrics | null> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('period', period)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async createPerformanceMetrics(
    metrics: Omit<PerformanceMetrics, 'id' | 'created_at'>
  ): Promise<PerformanceMetrics> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert(metrics)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Real-time subscriptions
  subscribeToPortfolioChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('portfolio_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToTradeChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('trade_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  subscribeToAIInsights(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('ai_insights')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_insights',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

export const db = new DatabaseService()
