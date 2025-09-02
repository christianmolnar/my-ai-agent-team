"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./f-insight-ai.module.css";

// Mock data interfaces (these will eventually come from the agent)
interface PortfolioSummary {
  totalValue: number;
  cashBalance: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
  winRate: number;
  activePositions: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  avgHoldingPeriod: number;
  riskScore: number;
}

// Crypto interfaces
interface CryptoHolding {
  coin: string;
  balance: number;
  value: number;
  change: string;
}

interface CryptoTrade {
  date: string;
  coin: string;
  action: 'BUY' | 'SELL';
  amount: number;
  price: number;
}

interface TradingPosition {
  symbol: string;
  companyName: string;
  sector: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  entryDate: Date;
  status: 'OPEN' | 'CLOSED';
  pnl: number;
  pnlPercent: number;
  decisionScore: number;
  stopLoss: number;
  takeProfit: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  aiRationale: string[];
  technicalSignals: string[];
  fundamentalFactors: string[];
}

interface Trade {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  aiConfidence: number;
  outcome?: 'WIN' | 'LOSS' | 'PENDING';
  pnl?: number;
}

interface PortfolioHistory {
  date: string;
  value: number;
  dailyReturn: number;
}

interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  bestDay: number;
  worstDay: number;
}

type TimePeriod = 'Day' | 'Week' | 'Month' | 'Year' | '3 Year' | '5 Year';

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  positions: number;
}

export default function FInsightAIPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<TradingPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioHistory[]>([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('Month');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [sectorAllocation, setSectorAllocation] = useState<SectorAllocation[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  // Crypto tab state
  const [activeTab, setActiveTab] = useState<'portfolio' | 'crypto'>('portfolio');
  const [cryptoAgentActive, setCryptoAgentActive] = useState<boolean>(false);
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([]);
  const [cryptoTrades, setCryptoTrades] = useState<CryptoTrade[]>([]);
  const [isCryptoLoading, setIsCryptoLoading] = useState(true);

  // Enhanced mock data with comprehensive trading scenarios
  const mockPortfolio: PortfolioSummary = {
    totalValue: 139850,
    cashBalance: 15850,
    totalPnL: 39850,
    totalPnLPercent: 39.85,
    dayPnL: 1800,
    dayPnLPercent: 1.45,
    winRate: 62,
    activePositions: 8,
    sharpeRatio: 2.1,
    maxDrawdown: -12.5,
    totalTrades: 48,
    avgHoldingPeriod: 14,
    riskScore: 7.2
  };

  const mockPositions: TradingPosition[] = [
    {
      symbol: 'AAPL',
      companyName: 'Apple Inc.',
      sector: 'Technology',
      quantity: 75,
      entryPrice: 175.50,
      currentPrice: 184.25,
      entryDate: new Date('2025-06-15'),
      status: 'OPEN',
      pnl: 656.25,
      pnlPercent: 4.99,
      decisionScore: 91,
      stopLoss: 158.95,
      takeProfit: 219.38,
      riskLevel: 'LOW',
      aiRationale: [
        'Strong earnings growth momentum (+12% QoQ)',
        'iPhone 16 cycle showing robust demand',
        'Services revenue expanding at 15% annually',
        'Share buyback program providing price support'
      ],
      technicalSignals: ['RSI oversold reversal', 'Golden cross formation', 'Volume breakout'],
      fundamentalFactors: ['P/E ratio attractive at 28.5x', 'Cash position of $165B', 'Dividend yield 0.5%']
    },
    {
      symbol: 'MSFT',
      companyName: 'Microsoft Corporation',
      sector: 'Technology',
      quantity: 45,
      entryPrice: 420.75,
      currentPrice: 441.20,
      entryDate: new Date('2025-06-12'),
      status: 'OPEN',
      pnl: 920.25,
      pnlPercent: 4.86,
      decisionScore: 94,
      stopLoss: 380.48,
      takeProfit: 525.94,
      riskLevel: 'LOW',
      aiRationale: [
        'Azure growth accelerating with AI workloads',
        'Copilot adoption exceeding expectations',
        'Enterprise cloud migration ongoing trend',
        'Strong balance sheet and cash generation'
      ],
      technicalSignals: ['Breakout above resistance', 'MACD bullish crossover', 'Strong relative strength'],
      fundamentalFactors: ['Revenue growth 13% YoY', 'Operating margin expansion', 'Cloud market leadership']
    },
    {
      symbol: 'NVDA',
      companyName: 'NVIDIA Corporation',
      sector: 'Technology',
      quantity: 35,
      entryPrice: 118.75,
      currentPrice: 127.60,
      entryDate: new Date('2025-06-10'),
      status: 'OPEN',
      pnl: 309.75,
      pnlPercent: 7.46,
      decisionScore: 96,
      stopLoss: 101.44,
      takeProfit: 148.50,
      riskLevel: 'MEDIUM',
      aiRationale: [
        'Data center demand surging with AI boom',
        'New GPU architecture showing superior performance',
        'Partnership announcements with major cloud providers',
        'Guidance raise indicates strong pipeline'
      ],
      technicalSignals: ['Cup and handle pattern', 'Volume surge on breakout', 'All moving averages bullish'],
      fundamentalFactors: ['Revenue growth 200%+ YoY', 'Gross margins expanding', 'Market dominance in AI chips']
    },
    {
      symbol: 'TSLA',
      companyName: 'Tesla, Inc.',
      sector: 'Consumer Discretionary',
      quantity: 60,
      entryPrice: 245.30,
      currentPrice: 238.85,
      entryDate: new Date('2025-06-20'),
      status: 'OPEN',
      pnl: -387.00,
      pnlPercent: -2.63,
      decisionScore: 74,
      stopLoss: 220.77,
      takeProfit: 294.36,
      riskLevel: 'HIGH',
      aiRationale: [
        'Cybertruck production ramping faster than expected',
        'FSD (Full Self-Driving) showing improvement',
        'Energy storage business growing rapidly',
        'China sales recovery trend'
      ],
      technicalSignals: ['Oversold bounce attempt', 'Support at 200-day MA', 'Divergence in momentum'],
      fundamentalFactors: ['Delivery growth slowing', 'Margin pressure from competition', 'Regulatory headwinds']
    },
    {
      symbol: 'GOOGL',
      companyName: 'Alphabet Inc.',
      sector: 'Technology',
      quantity: 50,
      entryPrice: 142.80,
      currentPrice: 149.35,
      entryDate: new Date('2025-06-08'),
      status: 'OPEN',
      pnl: 327.50,
      pnlPercent: 4.59,
      decisionScore: 87,
      stopLoss: 128.52,
      takeProfit: 178.50,
      riskLevel: 'LOW',
      aiRationale: [
        'Search ad revenue stabilizing after YoY decline',
        'Cloud division showing strong growth momentum',
        'AI integration across products accelerating',
        'YouTube Shorts monetization improving'
      ],
      technicalSignals: ['Ascending triangle breakout', 'Institutional accumulation', 'Momentum building'],
      fundamentalFactors: ['P/E ratio attractive at 24x', 'Strong free cash flow', 'Share buyback program']
    },
    {
      symbol: 'AMZN',
      companyName: 'Amazon.com, Inc.',
      sector: 'Consumer Discretionary',
      quantity: 40,
      entryPrice: 156.90,
      currentPrice: 162.45,
      entryDate: new Date('2025-06-18'),
      status: 'OPEN',
      pnl: 222.00,
      pnlPercent: 3.54,
      decisionScore: 89,
      stopLoss: 141.21,
      takeProfit: 196.13,
      riskLevel: 'MEDIUM',
      aiRationale: [
        'AWS growth reaccelerating with enterprise adoption',
        'Prime membership showing strong retention',
        'Advertising business gaining market share',
        'Cost optimization efforts showing results'
      ],
      technicalSignals: ['Bull flag pattern completion', 'Volume confirmation', 'Above key moving averages'],
      fundamentalFactors: ['Operating margin improvement', 'Free cash flow positive', 'Market leadership in cloud']
    },
    {
      symbol: 'META',
      companyName: 'Meta Platforms, Inc.',
      sector: 'Technology',
      quantity: 25,
      entryPrice: 518.25,
      currentPrice: 507.60,
      entryDate: new Date('2025-06-22'),
      status: 'OPEN',
      pnl: -266.25,
      pnlPercent: -2.06,
      decisionScore: 68,
      stopLoss: 466.43,
      takeProfit: 647.81,
      riskLevel: 'MEDIUM',
      aiRationale: [
        'Reality Labs losses narrowing with VR adoption',
        'Instagram Reels competing effectively with TikTok',
        'AI-driven ad targeting improving ROI',
        'WhatsApp Business monetization expanding'
      ],
      technicalSignals: ['Failed breakout, now consolidating', 'Support at 50-day MA', 'Mixed momentum signals'],
      fundamentalFactors: ['User growth stabilizing', 'ARPU increasing globally', 'Regulatory overhang']
    },
    {
      symbol: 'BRK.B',
      companyName: 'Berkshire Hathaway Inc.',
      sector: 'Financial Services',
      quantity: 80,
      entryPrice: 445.20,
      currentPrice: 452.80,
      entryDate: new Date('2025-06-05'),
      status: 'OPEN',
      pnl: 608.00,
      pnlPercent: 1.71,
      decisionScore: 82,
      stopLoss: 400.68,
      takeProfit: 534.24,
      riskLevel: 'LOW',
      aiRationale: [
        'Insurance underwriting showing strong profitability',
        'Massive cash pile ($167B) ready for deployment',
        'Energy investments benefiting from transition',
        'Apple position providing steady dividends'
      ],
      technicalSignals: ['Steady uptrend intact', 'Low volatility accumulation', 'Relative strength to market'],
      fundamentalFactors: ['Book value growth consistent', 'Operating earnings strong', 'Defensive characteristics']
    },
    {
      symbol: 'JPM',
      companyName: 'JPMorgan Chase & Co.',
      sector: 'Financial Services',
      quantity: 55,
      entryPrice: 198.45,
      currentPrice: 205.30,
      entryDate: new Date('2025-06-14'),
      status: 'OPEN',
      pnl: 376.75,
      pnlPercent: 3.45,
      decisionScore: 85,
      stopLoss: 178.61,
      takeProfit: 238.14,
      riskLevel: 'MEDIUM',
      aiRationale: [
        'Net interest income benefiting from rate environment',
        'Credit quality metrics remain healthy',
        'Investment banking fees recovering',
        'Expense discipline maintaining margins'
      ],
      technicalSignals: ['Breakout from consolidation', 'Banking sector rotation', 'Volume expansion'],
      fundamentalFactors: ['ROE above 15%', 'Strong capital ratios', 'Dividend yield 2.8%']
    },
    {
      symbol: 'UNH',
      companyName: 'UnitedHealth Group Inc.',
      sector: 'Healthcare',
      quantity: 30,
      entryPrice: 524.75,
      currentPrice: 539.20,
      entryDate: new Date('2025-06-11'),
      status: 'OPEN',
      pnl: 433.50,
      pnlPercent: 2.75,
      decisionScore: 79,
      stopLoss: 472.28,
      takeProfit: 629.70,
      riskLevel: 'LOW',
      aiRationale: [
        'Medicare Advantage enrollment growing steadily',
        'Optum services expanding market share',
        'Predictable cash flows from recurring revenue',
        'Aging demographics driving demand'
      ],
      technicalSignals: ['Steady uptrend channel', 'Healthcare sector strength', 'Consistent momentum'],
      fundamentalFactors: ['Earnings growth 12% annually', 'Strong competitive moats', 'Dividend aristocrat']
    }
  ];

  // Mock recent trades
  const mockTrades: Trade[] = [
    {
      id: 'T001',
      symbol: 'NVDA',
      action: 'BUY',
      quantity: 35,
      price: 118.75,
      timestamp: new Date('2025-06-10T09:30:00'),
      aiConfidence: 96,
      outcome: 'WIN',
      pnl: 309.75
    },
    {
      id: 'T002',
      symbol: 'AMD',
      action: 'SELL',
      quantity: 50,
      price: 142.30,
      timestamp: new Date('2025-06-09T14:45:00'),
      aiConfidence: 88,
      outcome: 'WIN',
      pnl: 1250.00
    },
    {
      id: 'T003',
      symbol: 'TSLA',
      action: 'BUY',
      quantity: 60,
      price: 245.30,
      timestamp: new Date('2025-06-20T10:15:00'),
      aiConfidence: 74,
      outcome: 'PENDING'
    },
    {
      id: 'T004',
      symbol: 'COIN',
      action: 'SELL',
      quantity: 25,
      price: 198.50,
      timestamp: new Date('2025-06-19T11:20:00'),
      aiConfidence: 69,
      outcome: 'LOSS',
      pnl: -425.00
    }
  ];

  // Mock portfolio history for charts - Extended for different time periods
  const mockPortfolioHistory: Record<TimePeriod, PortfolioHistory[]> = {
    'Day': [
      { date: '2025-06-27 09:30', value: 138800, dailyReturn: 0 },
      { date: '2025-06-27 10:00', value: 138920, dailyReturn: 0.09 },
      { date: '2025-06-27 10:30', value: 139050, dailyReturn: 0.18 },
      { date: '2025-06-27 11:00', value: 138980, dailyReturn: 0.13 },
      { date: '2025-06-27 11:30', value: 139120, dailyReturn: 0.23 },
      { date: '2025-06-27 12:00', value: 139250, dailyReturn: 0.32 },
      { date: '2025-06-27 12:30', value: 139180, dailyReturn: 0.27 },
      { date: '2025-06-27 13:00', value: 139320, dailyReturn: 0.37 },
      { date: '2025-06-27 13:30', value: 139450, dailyReturn: 0.47 },
      { date: '2025-06-27 14:00', value: 139380, dailyReturn: 0.42 },
      { date: '2025-06-27 14:30', value: 139520, dailyReturn: 0.52 },
      { date: '2025-06-27 15:00', value: 139680, dailyReturn: 0.63 },
      { date: '2025-06-27 15:30', value: 139750, dailyReturn: 0.68 },
      { date: '2025-06-27 16:00', value: 139850, dailyReturn: 0.76 }
    ],
    'Week': [
      { date: '2025-06-21', value: 135200, dailyReturn: 0 },
      { date: '2025-06-22', value: 136850, dailyReturn: 1.22 },
      { date: '2025-06-23', value: 137200, dailyReturn: 1.48 },
      { date: '2025-06-24', value: 138800, dailyReturn: 2.66 },
      { date: '2025-06-25', value: 139100, dailyReturn: 2.88 },
      { date: '2025-06-26', value: 139600, dailyReturn: 3.25 },
      { date: '2025-06-27', value: 139850, dailyReturn: 3.44 }
    ],
    'Month': [
      { date: '2025-05-28', value: 100000, dailyReturn: 0 },
      { date: '2025-05-29', value: 101180, dailyReturn: 1.18 },
      { date: '2025-05-30', value: 100950, dailyReturn: 0.95 },
      { date: '2025-06-02', value: 102340, dailyReturn: 2.34 },
      { date: '2025-06-03', value: 103180, dailyReturn: 3.18 },
      { date: '2025-06-04', value: 102890, dailyReturn: 2.89 },
      { date: '2025-06-05', value: 104520, dailyReturn: 4.52 },
      { date: '2025-06-06', value: 105780, dailyReturn: 5.78 },
      { date: '2025-06-09', value: 107120, dailyReturn: 7.12 },
      { date: '2025-06-10', value: 106840, dailyReturn: 6.84 },
      { date: '2025-06-11', value: 108950, dailyReturn: 8.95 },
      { date: '2025-06-12', value: 110230, dailyReturn: 10.23 },
      { date: '2025-06-13', value: 112450, dailyReturn: 12.45 },
      { date: '2025-06-16', value: 114120, dailyReturn: 14.12 },
      { date: '2025-06-17', value: 116780, dailyReturn: 16.78 },
      { date: '2025-06-18', value: 118950, dailyReturn: 18.95 },
      { date: '2025-06-19', value: 121340, dailyReturn: 21.34 },
      { date: '2025-06-20', value: 123780, dailyReturn: 23.78 },
      { date: '2025-06-23', value: 126450, dailyReturn: 26.45 },
      { date: '2025-06-24', value: 129120, dailyReturn: 29.12 },
      { date: '2025-06-25', value: 132890, dailyReturn: 32.89 },
      { date: '2025-06-26', value: 136450, dailyReturn: 36.45 },
      { date: '2025-06-27', value: 139850, dailyReturn: 39.85 }
    ],
    'Year': [
      { date: '2024-06-27', value: 75000, dailyReturn: 0 },
      { date: '2024-07-27', value: 78200, dailyReturn: 4.27 },
      { date: '2024-08-27', value: 79800, dailyReturn: 6.40 },
      { date: '2024-09-27', value: 82600, dailyReturn: 10.13 },
      { date: '2024-10-27', value: 85200, dailyReturn: 13.60 },
      { date: '2024-11-27', value: 88100, dailyReturn: 17.47 },
      { date: '2024-12-27', value: 92200, dailyReturn: 22.93 },
      { date: '2025-01-27', value: 96500, dailyReturn: 28.67 },
      { date: '2025-02-27', value: 101200, dailyReturn: 34.93 },
      { date: '2025-03-27', value: 107800, dailyReturn: 43.73 },
      { date: '2025-04-27', value: 115200, dailyReturn: 53.60 },
      { date: '2025-05-27', value: 125500, dailyReturn: 67.33 },
      { date: '2025-06-27', value: 139850, dailyReturn: 86.47 }
    ],
    '3 Year': [
      { date: '2022-06-27', value: 45000, dailyReturn: 0 },
      { date: '2022-12-27', value: 48500, dailyReturn: 7.78 },
      { date: '2023-06-27', value: 58200, dailyReturn: 29.33 },
      { date: '2023-12-27', value: 68800, dailyReturn: 52.89 },
      { date: '2024-06-27', value: 75000, dailyReturn: 66.67 },
      { date: '2024-12-27', value: 92200, dailyReturn: 104.89 },
      { date: '2025-06-27', value: 139850, dailyReturn: 210.78 }
    ],
    '5 Year': [
      { date: '2020-06-27', value: 25000, dailyReturn: 0 },
      { date: '2021-06-27', value: 32500, dailyReturn: 30.00 },
      { date: '2022-06-27', value: 45000, dailyReturn: 80.00 },
      { date: '2023-06-27', value: 58200, dailyReturn: 132.80 },
      { date: '2024-06-27', value: 75000, dailyReturn: 200.00 },
      { date: '2025-06-27', value: 139850, dailyReturn: 459.40 }
    ]
  };

  // Performance metrics based on selected time period
  const mockPerformanceMetrics: Record<TimePeriod, PerformanceMetrics> = {
    'Day': {
      totalReturn: 0.76,
      annualizedReturn: 198.52,
      volatility: 12.5,
      sharpeRatio: 2.8,
      maxDrawdown: -0.15,
      winRate: 78.6,
      bestDay: 0.76,
      worstDay: -0.15
    },
    'Week': {
      totalReturn: 3.44,
      annualizedReturn: 186.28,
      volatility: 15.2,
      sharpeRatio: 2.1,
      maxDrawdown: -0.8,
      winRate: 71.4,
      bestDay: 1.8,
      worstDay: -0.8
    },
    'Month': {
      totalReturn: 39.85,
      annualizedReturn: 184.22,
      volatility: 18.7,
      sharpeRatio: 1.9,
      maxDrawdown: -2.1,
      winRate: 68.2,
      bestDay: 3.2,
      worstDay: -1.8
    },
    'Year': {
      totalReturn: 86.47,
      annualizedReturn: 86.47,
      volatility: 22.3,
      sharpeRatio: 1.6,
      maxDrawdown: -8.5,
      winRate: 64.1,
      bestDay: 5.8,
      worstDay: -4.2
    },
    '3 Year': {
      totalReturn: 210.78,
      annualizedReturn: 45.8,
      volatility: 28.9,
      sharpeRatio: 1.2,
      maxDrawdown: -15.2,
      winRate: 59.8,
      bestDay: 8.9,
      worstDay: -7.1
    },
    '5 Year': {
      totalReturn: 459.40,
      annualizedReturn: 41.2,
      volatility: 31.5,
      sharpeRatio: 1.1,
      maxDrawdown: -22.8,
      winRate: 56.3,
      bestDay: 12.4,
      worstDay: -9.8
    }
  };

  // Mock sector allocation - matches portfolio summary (cash balance: $18,750)
  const mockSectorAllocation: SectorAllocation[] = [
    { sector: 'Technology', value: 82500, percentage: 56.0, positions: 6 },
    { sector: 'Financial Services', value: 23500, percentage: 16.0, positions: 2 },
    { sector: 'Consumer Discretionary', value: 22250, percentage: 15.1, positions: 2 },
    { sector: 'Healthcare', value: 16175, percentage: 11.0, positions: 1 },
    { sector: 'Cash', value: 18750, percentage: 12.7, positions: 0 } // Corrected: 18750 = 12.7% of 147,250
  ];

  // Mock AI insights and recommendations
  const mockAiInsights: string[] = [
    "🎯 Portfolio on track for 20% monthly target (currently 18.2%)",
    "⚠️ Technology sector concentration at 56% - consider diversification",
    "📈 NVDA showing strong momentum - potential for additional allocation",
    "🔄 TSLA position underperforming - reviewing exit strategy",
    "💰 $18.7k cash available for new opportunities",
    "📊 Risk score at 6.2/10 - well within acceptable range",
    "🎪 Earnings season approaching - monitoring UNH and JPM closely",
    "⏰ Next trade cycle in 15 minutes"
  ];

  // Handle time period selection change
  const handleTimePeriodChange = (period: TimePeriod) => {
    setSelectedTimePeriod(period);
    setPortfolioHistory(mockPortfolioHistory[period]);
    setPerformanceMetrics(mockPerformanceMetrics[period]);
  };

  // Add effect to load crypto data when tab changes
  useEffect(() => {
    if (activeTab === 'crypto') {
      fetchCoinbaseData();
    }
  }, [activeTab]);

  useEffect(() => {
    // Set dark theme
    document.body.style.background = 
      "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)";
    document.body.style.color = "#f1f5f9";
    document.body.style.fontFamily = "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";

    // Simulate loading with realistic delay
    setTimeout(() => {
      setPortfolio(mockPortfolio);
      setPositions(mockPositions);
      setTrades(mockTrades);
      setPortfolioHistory(mockPortfolioHistory['Month']); // Default to Month view
      setPerformanceMetrics(mockPerformanceMetrics['Month']);
      setSectorAllocation(mockSectorAllocation);
      setAiInsights(mockAiInsights);
      setIsLoading(false);
    }, 1200);

    // Auto-refresh simulation
    const refreshInterval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate small price movements
      if (!isLoading) {
        setPositions(prev => prev.map(pos => ({
          ...pos,
          currentPrice: pos.currentPrice + (Math.random() - 0.5) * 0.50,
          pnl: (pos.currentPrice + (Math.random() - 0.5) * 0.50 - pos.entryPrice) * pos.quantity,
          pnlPercent: ((pos.currentPrice + (Math.random() - 0.5) * 0.50 - pos.entryPrice) / pos.entryPrice) * 100
        })));
      }
    }, 30000); // Update every 30 seconds

    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
      document.body.style.fontFamily = "";
      clearInterval(refreshInterval);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getColorClass = (value: number) => {
    if (value > 0) return styles.positive;
    if (value < 0) return styles.negative;
    return styles.neutral;
  };

  // Coinbase API integration using official SDK
  const fetchCoinbaseData = async () => {
    try {
      setIsCryptoLoading(true);
      
      // Try our new official Coinbase SDK endpoint first
      let success = false;
      
      try {
        console.log('Fetching data from official Coinbase SDK endpoint...');
        const apiResponse = await fetch('/api/coinbase-official');
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          
          if (apiData.success) {
            console.log(`Official Coinbase SDK data received (source: ${apiData.source}):`, {
              transactions: apiData.transactions?.length || 0,
              holdings: apiData.holdings?.length || 0
            });
            
            // Set the holdings data if available
            if (apiData.holdings && apiData.holdings.length > 0) {
              setCryptoHoldings(apiData.holdings);
              
              // Debug holdings data
              console.log('Crypto holdings:', apiData.holdings.map((h: any) => 
                `${h.coin}: ${h.balance} (${h.value ? '$' + h.value.toFixed(2) : 'unknown value'})`
              ).join(', '));
            }
            
            // Set transaction data if available
            if (apiData.transactions && apiData.transactions.length > 0) {
              // If the transactions are already in the right format, use them directly
              // Otherwise, format them to match our expected trade format
              const formattedTrades = Array.isArray(apiData.transactions) ? 
                apiData.transactions.slice(0, 20).map((tx: any) => {
                  // Check if this is already in our format or needs conversion
                  if (tx.action && tx.coin && tx.date && tx.amount !== undefined) {
                    // Already in our format, just ensure action is uppercase
                    return {
                      ...tx,
                      action: tx.action.toUpperCase()
                    };
                  } else {
                    // Convert from Coinbase transaction format
                    const date = new Date(tx.created_at).toISOString().split('T')[0];
                    const coin = tx.amount.currency;
                    const amountValue = parseFloat(tx.amount.amount);
                    const action = amountValue >= 0 ? 'BUY' : 'SELL';
                    
                    return {
                      date,
                      coin,
                      action,
                      amount: Math.abs(amountValue),
                      price: tx.native_amount ? Math.abs(parseFloat(tx.native_amount.amount)) / Math.abs(amountValue) : 0
                    };
                  }
                }) : [];
              
              setCryptoTrades(formattedTrades);
              success = true;
              
              // Debug transaction data
              console.log('Crypto trades:', formattedTrades.slice(0, 3).map((t: any) => 
                `${t.date}: ${t.action} ${t.amount} ${t.coin} at $${t.price}`
              ).join(', ') + (formattedTrades.length > 3 ? '...' : ''));
            }
          } else {
            console.error('API returned error:', apiData.error, apiData.details);
          }
        } else {
          console.error('API returned status:', apiResponse.status);
        }
      } catch (apiError) {
        console.error('Error using Coinbase API:', apiError);
      }
      
      // If direct API didn't succeed, fall back to the CDP API endpoint
      if (!success) {
        console.log('Falling back to CDP API for crypto data');
        
        try {
          const response = await fetch('/api/cdp-crypto');
          
          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Log the results for debugging
            console.log('CDP Crypto data received:', {
              holdings: data.holdings,
              trades: data.trades
            });
            
            setCryptoHoldings(data.holdings);
            
            // Convert trade actions to uppercase to match the UI's expected format
            const formattedTrades = data.trades.map((trade: any) => ({
              ...trade,
              action: trade.action.toUpperCase()
            }));
            
            setCryptoTrades(formattedTrades);
            success = true;
            
            // Update timestamp
            setLastUpdate(new Date());
            console.log('Successfully loaded crypto data from CDP');
          } else {
            throw new Error(data.error || 'Unknown API error');
          }
        } catch (cdpError) {
          console.error('Error fetching from CDP API:', cdpError);
        }
      }
      
      setIsCryptoLoading(false);
    } catch (error) {
      console.error('Error fetching Coinbase data:', error);
      setIsCryptoLoading(false);
      
      // Set empty arrays instead of mock data
      setCryptoHoldings([]);
      setCryptoTrades([]);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading f.insight.AI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <span className={styles.icon}>📈</span>
            f.insight.AI
          </h1>
          <p className={styles.subtitle}>
            Autonomous Trading Agent • Paper Trading Mode
          </p>
        </div>
        
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot}></div>
          <span>AI Active</span>
          <span className={styles.lastUpdate}>
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </header>
      
      {/* Tab Navigation below header */}
      <nav className={styles.tabNav}>
        <button
          className={activeTab === 'portfolio' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActiveTab('portfolio')}
        >
          Main
        </button>
        <button
          className={activeTab === 'crypto' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setActiveTab('crypto')}
        >
          Crypto
        </button>
      </nav>

      {/* Conditionally render content based on active tab */}
      {activeTab === 'portfolio' && portfolio && (
        <>
          {/* Portfolio Summary KPIs */}
          <section className={styles.portfolioSummary} aria-label="Portfolio Summary">
            <div className={styles.kpiGrid} role="grid" aria-label="Key Performance Indicators">
              <div className={styles.kpiCard} role="gridcell" aria-label="Total Portfolio Value">
                <h3>Total Portfolio Value</h3>
                <div className={styles.kpiValue} aria-live="polite">
                  {formatCurrency(portfolio.totalValue)}
                </div>
                <div className={`${styles.kpiChange} ${getColorClass(portfolio.dayPnL)}`} aria-label={`Daily change: ${formatCurrency(portfolio.dayPnL)}`}>
                  {formatCurrency(portfolio.dayPnL)} ({formatPercent(portfolio.dayPnLPercent)}) today
                </div>
              </div>

            <div className={styles.kpiCard} role="gridcell" aria-label="Total Profit and Loss">
              <h3>Total P&L</h3>
              <div className={`${styles.kpiValue} ${getColorClass(portfolio.totalPnL)}`} aria-live="polite">
                {formatCurrency(portfolio.totalPnL)}
              </div>
              <div className={`${styles.kpiChange} ${getColorClass(portfolio.totalPnL)}`}>
                {formatPercent(portfolio.totalPnLPercent)} total return
              </div>
            </div>

            <div className={styles.kpiCard} role="gridcell" aria-label="Trading Win Rate">
              <h3>Win Rate</h3>
              <div className={styles.kpiValue} aria-live="polite">
                {portfolio.winRate.toFixed(1)}%
              </div>
              <div className={styles.kpiChange}>
                {portfolio.totalTrades} total trades
              </div>
            </div>

            <div className={styles.kpiCard} role="gridcell" aria-label="Sharpe Ratio and Maximum Drawdown">
              <h3>Sharpe Ratio</h3>
              <div className={styles.kpiValue} aria-live="polite">
                {portfolio.sharpeRatio.toFixed(2)}
              </div>
              <div className={styles.kpiChange}>
                Max DD: {portfolio.maxDrawdown.toFixed(1)}%
              </div>
            </div>

            <div className={styles.kpiCard} role="gridcell" aria-label="Active Trading Positions">
              <h3>Active Positions</h3>
              <div className={styles.kpiValue} aria-live="polite">
                {portfolio.activePositions}
              </div>
              <div className={styles.kpiChange}>
                Avg hold: {portfolio.avgHoldingPeriod.toFixed(1)} days
              </div>
            </div>

            <div className={styles.kpiCard} role="gridcell" aria-label="Portfolio Risk Score">
              <h3>Risk Score</h3>
              <div className={styles.kpiValue} aria-live="polite">
                {portfolio.riskScore.toFixed(1)}/10
              </div>
              <div className={styles.kpiChange}>
                Cash: {formatCurrency(portfolio.cashBalance)}
              </div>
            </div>
          </div>
        </section>

      {/* Enhanced Charts Section with Time Period Selection */}
      <section className={styles.chartsSection}>
        <div className={styles.performanceContainer}>
          <div className={styles.performanceHeader}>
            <h3>Portfolio Performance</h3>
            <div className={styles.timePeriodSelector}>
              {(['Day', 'Week', 'Month', 'Year', '3 Year', '5 Year'] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  className={`${styles.timePeriodButton} ${selectedTimePeriod === period ? styles.active : ''}`}
                  onClick={() => handleTimePeriodChange(period)}
                  aria-pressed={selectedTimePeriod === period}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Overview Cards */}
          {performanceMetrics && (
            <div className={styles.performanceMetrics}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📈</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricLabel}>Total Return</span>
                  <span className={`${styles.metricValue} ${performanceMetrics.totalReturn >= 0 ? styles.positive : styles.negative}`}>
                    {performanceMetrics.totalReturn >= 0 ? '+' : ''}{performanceMetrics.totalReturn.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🎯</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricLabel}>Annualized Return</span>
                  <span className={`${styles.metricValue} ${performanceMetrics.annualizedReturn >= 0 ? styles.positive : styles.negative}`}>
                    {performanceMetrics.annualizedReturn >= 0 ? '+' : ''}{performanceMetrics.annualizedReturn.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>�</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricLabel}>Sharpe Ratio</span>
                  <span className={styles.metricValue}>
                    {performanceMetrics.sharpeRatio.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🎲</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricLabel}>Volatility</span>
                  <span className={styles.metricValue}>
                    {performanceMetrics.volatility.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📉</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricLabel}>Max Drawdown</span>
                  <span className={`${styles.metricValue} ${styles.negative}`}>
                    {performanceMetrics.maxDrawdown.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>🏆</div>
                <div className={styles.metricContent}>
                  <span className={styles.metricLabel}>Win Rate</span>
                  <span className={styles.metricValue}>
                    {performanceMetrics.winRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Chart Visualization */}
          <div className={styles.chartContainer}>
            <div className={styles.performanceChart}>
              <div className={styles.chartHeader}>
                <span className={styles.chartTitle}>Portfolio Value Over Time</span>
                <span className={styles.currentValue}>
                  Current: ${(portfolio?.totalValue || 0).toLocaleString()}
                </span>
              </div>
              
              {/* Enhanced chart with grid and better visualization */}
              <div className={styles.chartArea}>
                <div className={styles.chartGrid}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={styles.gridLine} style={{ top: `${i * 25}%` }}></div>
                  ))}
                </div>
                
                {/* Line Chart Implementation */}
                <svg 
                  className={styles.chartSvg}
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                  style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 2 }}
                >
                  {/* Chart Line */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.4"
                    points={portfolioHistory.map((point, index) => {
                      const maxValue = Math.max(...portfolioHistory.map(p => p.value));
                      const minValue = Math.min(...portfolioHistory.map(p => p.value));
                      const range = maxValue - minValue;
                      const yPosition = range > 0 ? 85 - (((point.value - minValue) / range) * 70) : 50;
                      const xPosition = 10 + (index / (portfolioHistory.length - 1)) * 80;
                      return `${xPosition},${yPosition}`;
                    }).join(' ')}
                  />
                  
                  {/* Invisible hover points for tooltips */}
                  {portfolioHistory.map((point, index) => {
                    const maxValue = Math.max(...portfolioHistory.map(p => p.value));
                    const minValue = Math.min(...portfolioHistory.map(p => p.value));
                    const range = maxValue - minValue;
                    const yPosition = range > 0 ? 85 - (((point.value - minValue) / range) * 70) : 50;
                    const xPosition = 10 + (index / (portfolioHistory.length - 1)) * 80;
                    
                    return (
                      <circle
                        key={index}
                        cx={xPosition}
                        cy={yPosition}
                        r="3"
                        fill="transparent"
                        stroke="transparent"
                        className={styles.chartHoverPoint}
                      >
                        <title>{`${point.date}: $${point.value.toLocaleString()} (${point.dailyReturn >= 0 ? '+' : ''}${point.dailyReturn.toFixed(2)}%)`}</title>
                      </circle>
                    );
                  })}
                </svg>
                
                {/* Y-Axis Labels */}
                <div className={styles.yAxisLabels}>
                  <span className={styles.yAxisLabel} style={{ top: '10%' }}>
                    ${Math.max(...portfolioHistory.map(p => p.value)).toLocaleString()}
                  </span>
                  <span className={styles.yAxisLabel} style={{ top: '30%' }}>
                    ${Math.round((Math.max(...portfolioHistory.map(p => p.value)) * 0.75 + Math.min(...portfolioHistory.map(p => p.value)) * 0.25)).toLocaleString()}
                  </span>
                  <span className={styles.yAxisLabel} style={{ top: '50%' }}>
                    ${Math.round((Math.max(...portfolioHistory.map(p => p.value)) + Math.min(...portfolioHistory.map(p => p.value))) / 2).toLocaleString()}
                  </span>
                  <span className={styles.yAxisLabel} style={{ top: '70%' }}>
                    ${Math.round((Math.max(...portfolioHistory.map(p => p.value)) * 0.25 + Math.min(...portfolioHistory.map(p => p.value)) * 0.75)).toLocaleString()}
                  </span>
                  <span className={styles.yAxisLabel} style={{ top: '90%' }}>
                    ${Math.min(...portfolioHistory.map(p => p.value)).toLocaleString()}
                  </span>
                </div>
                
                {/* X-Axis Labels */}
                <div className={styles.xAxisLabels}>
                  <span className={styles.xAxisLabel} style={{ left: '10%' }}>
                    {new Date(portfolioHistory[0]?.date).toLocaleDateString('en-US', 
                      selectedTimePeriod === 'Day' 
                        ? { month: 'short', day: 'numeric', hour: 'numeric' }
                        : selectedTimePeriod === 'Week' || selectedTimePeriod === 'Month'
                        ? { month: 'short', day: 'numeric' }
                        : { month: 'short', year: 'numeric' }
                    )}
                  </span>
                  <span className={styles.xAxisLabel} style={{ left: '30%' }}>
                    {portfolioHistory[Math.floor(portfolioHistory.length * 0.25)] && 
                      new Date(portfolioHistory[Math.floor(portfolioHistory.length * 0.25)].date).toLocaleDateString('en-US', 
                        selectedTimePeriod === 'Day' 
                          ? { month: 'short', day: 'numeric', hour: 'numeric' }
                          : selectedTimePeriod === 'Week' || selectedTimePeriod === 'Month'
                          ? { month: 'short', day: 'numeric' }
                          : { month: 'short', year: 'numeric' }
                      )
                    }
                  </span>
                  <span className={styles.xAxisLabel} style={{ left: '50%' }}>
                    {portfolioHistory[Math.floor(portfolioHistory.length * 0.5)] && 
                      new Date(portfolioHistory[Math.floor(portfolioHistory.length * 0.5)].date).toLocaleDateString('en-US', 
                        selectedTimePeriod === 'Day' 
                          ? { month: 'short', day: 'numeric', hour: 'numeric' }
                          : selectedTimePeriod === 'Week' || selectedTimePeriod === 'Month'
                          ? { month: 'short', day: 'numeric' }
                          : { month: 'short', year: 'numeric' }
                      )
                    }
                  </span>
                  <span className={styles.xAxisLabel} style={{ left: '70%' }}>
                    {portfolioHistory[Math.floor(portfolioHistory.length * 0.75)] && 
                      new Date(portfolioHistory[Math.floor(portfolioHistory.length * 0.75)].date).toLocaleDateString('en-US', 
                        selectedTimePeriod === 'Day' 
                          ? { month: 'short', day: 'numeric', hour: 'numeric' }
                          : selectedTimePeriod === 'Week' || selectedTimePeriod === 'Month'
                          ? { month: 'short', day: 'numeric' }
                          : { month: 'short', year: 'numeric' }
                      )
                    }
                  </span>
                  <span className={styles.xAxisLabel} style={{ left: '90%' }}>
                    {new Date(portfolioHistory[portfolioHistory.length - 1]?.date).toLocaleDateString('en-US', 
                      selectedTimePeriod === 'Day' 
                        ? { month: 'short', day: 'numeric', hour: 'numeric' }
                        : selectedTimePeriod === 'Week' || selectedTimePeriod === 'Month'
                        ? { month: 'short', day: 'numeric' }
                        : { month: 'short', year: 'numeric' }
                    )}
                  </span>
                </div>
              </div>
              
              {/* Chart Statistics */}
              {performanceMetrics && (
                <div className={styles.chartStats}>
                  <span>📈 Best Day: +{performanceMetrics.bestDay.toFixed(2)}%</span>
                  <span>📉 Worst Day: {performanceMetrics.worstDay.toFixed(2)}%</span>
                  <span>🎯 Target: {selectedTimePeriod === 'Month' ? '20%/month' : 
                    selectedTimePeriod === 'Year' ? '100%/year' : 
                    selectedTimePeriod === 'Day' ? '0.5%/day' : 
                    selectedTimePeriod === 'Week' ? '3%/week' : 
                    selectedTimePeriod === '3 Year' ? '50%/year' : '40%/year'}</span>
                  <span>⚡ Current: {performanceMetrics.totalReturn >= 0 ? '+' : ''}{performanceMetrics.totalReturn.toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.chartContainer}>
          <h3>Portfolio Allocation</h3>
          <div className={styles.sectorAllocation}>
            {sectorAllocation.map((sector, index) => (
              <div key={sector.sector} className={styles.sectorItem}>
                <div className={styles.sectorHeader}>
                  <div className={styles.sectorInfo}>
                    <div className={styles.sectorIcon}>
                      {sector.sector === 'Technology' && '💻'}
                      {sector.sector === 'Financial Services' && '🏦'}
                      {sector.sector === 'Consumer Discretionary' && '🛍️'}
                      {sector.sector === 'Healthcare' && '⚕️'}
                      {sector.sector === 'Cash' && '💰'}
                    </div>
                    <div className={styles.sectorDetails}>
                      <span className={styles.sectorName}>{sector.sector}</span>
                      <span className={styles.sectorMeta}>
                        {sector.positions > 0 ? `${sector.positions} position${sector.positions !== 1 ? 's' : ''}` : 'Available'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.sectorValue}>
                    <span className={styles.sectorAmount}>{formatCurrency(sector.value)}</span>
                    <span className={styles.sectorPercent}>{sector.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className={styles.sectorBar}>
                  <div 
                    className={styles.sectorFill} 
                    style={{ 
                      width: `${Math.max(sector.percentage, 2)}%`,
                      backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                      ][index % 5]
                    }}
                    aria-label={`${sector.sector} allocation: ${sector.percentage.toFixed(1)}%`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section className={styles.insightsSection}>
        <div className={styles.sectionHeader}>
          <h2>🧠 AI Insights & Recommendations</h2>
          <span className={styles.insightsBadge}>Real-time Analysis</span>
        </div>
        
        <div className={styles.insightsGrid}>
          {aiInsights.map((insight, index) => (
            <div key={index} className={styles.insightCard}>
              <span className={styles.insightText}>{insight}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Trades Activity */}
      <section className={styles.tradesSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Trading Activity</h2>
          <div className={styles.tradeStats}>
            <span className={styles.statItem}>
              Last 4 trades
            </span>
            <span className={styles.statDivider}>•</span>
            <span className={styles.statItem}>
              Win rate: {((trades.filter(t => t.outcome === 'WIN').length / trades.filter(t => t.outcome !== 'PENDING').length) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className={styles.tradesGrid}>
          {trades.map(trade => (
            <div 
              key={trade.id} 
              className={`${styles.tradeCard} ${styles[trade.outcome?.toLowerCase() || 'pending']}`}
              role="button"
              tabIndex={0}
              aria-label={`Trade ${trade.symbol} ${trade.action} ${trade.quantity} shares`}
            >
              <div className={styles.tradeSingleRow}>
                {/* 1. Stock Symbol with BUY/SELL */}
                <div className={styles.tradeSymbolColumn}>
                  <span className={styles.tradeSymbol}>{trade.symbol}</span>
                  <span className={styles.tradeAction}>
                    {trade.action === 'BUY' ? '📈' : '📉'} {trade.action}
                  </span>
                </div>
                
                {/* 2. Shares @ Price */}
                <div className={styles.tradeSharesColumn}>
                  <span className={styles.tradeQuantity}>{trade.quantity} shares</span>
                  <span className={styles.tradePrice}>@ ${trade.price.toFixed(2)}</span>
                </div>
                
                {/* 3. Date with Time */}
                <div className={styles.tradeDateColumn}>
                  <span className={styles.tradeDate}>{trade.timestamp.toLocaleDateString()}</span>
                  <span className={styles.tradeTime}>
                    {trade.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                {/* 4. AI Confidence - taking up more space */}
                <div className={styles.tradeAiColumn}>
                  <span className={styles.aiLabel}>AI: {trade.aiConfidence}%</span>
                  <div className={styles.confidenceBarFull}>
                    <div 
                      className={styles.confidenceFill} 
                      style={{ width: `${trade.aiConfidence}%` }}
                      aria-label={`AI confidence: ${trade.aiConfidence}%`}
                    ></div>
                  </div>
                </div>
                
                {/* 5. P&L Value */}
                <div className={styles.tradePnlColumn}>
                  {trade.outcome !== 'PENDING' && trade.pnl ? (
                    <>
                      <span className={styles.pnlLabel}>P&L</span>
                      <span className={`${styles.tradePnl} ${getColorClass(trade.pnl)}`}>
                        {formatCurrency(trade.pnl)}
                      </span>
                    </>
                  ) : (
                    <span className={styles.pendingPnl}>—</span>
                  )}
                </div>
                
                {/* 6. WIN/PENDING/LOSS */}
                <div className={styles.tradeOutcomeColumn}>
                  {trade.outcome === 'WIN' && <span className={styles.winBadge}>✅ WIN</span>}
                  {trade.outcome === 'LOSS' && <span className={styles.lossBadge}>❌ LOSS</span>}
                  {trade.outcome === 'PENDING' && <span className={styles.pendingBadge}>⏳ PENDING</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trading Positions Table */}
      <section className={styles.tradingSection} aria-label="Active Trading Positions">
        <div className={styles.sectionHeader}>
          <h2>Active Positions</h2>
          <button 
            className={styles.refreshButton}
            aria-label="Refresh positions data"
            onClick={() => setLastUpdate(new Date())}
          >
            🔄 Refresh
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.positionsTable} role="table" aria-label="Active trading positions">
            <thead>
              <tr role="row">
                <th scope="col">Symbol</th>
                <th scope="col">Quantity</th>
                <th scope="col">Entry Price</th>
                <th scope="col">Current Price</th>
                <th scope="col">P&L</th>
                <th scope="col">P&L %</th>
                <th scope="col">AI Score</th>
                <th scope="col">Entry Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => (
                <tr 
                  key={position.symbol} 
                  className={styles.positionRow}
                  role="row"
                  tabIndex={0}
                  onClick={() => setSelectedPosition(position)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedPosition(position);
                    }
                  }}
                  aria-label={`Position ${position.symbol}: ${position.quantity} shares, ${formatPercent(position.pnlPercent)} profit/loss`}
                >
                  <td className={styles.symbolCell}>
                    <strong>{position.symbol}</strong>
                  </td>
                  <td>{position.quantity}</td>
                  <td>${position.entryPrice.toFixed(2)}</td>
                  <td>${position.currentPrice.toFixed(2)}</td>
                  <td className={getColorClass(position.pnl)}>
                    {formatCurrency(position.pnl)}
                  </td>
                  <td className={getColorClass(position.pnlPercent)}>
                    {formatPercent(position.pnlPercent)}
                  </td>
                  <td>
                    <div className={styles.scoreContainer}>
                      <div 
                        className={styles.scoreBar} 
                        style={{ width: `${position.decisionScore}%` }}
                        aria-label={`AI score: ${position.decisionScore} out of 100`}
                      ></div>
                      <span>{position.decisionScore}</span>
                    </div>
                  </td>
                  <td>{position.entryDate.toLocaleDateString()}</td>
                  <td>
                    <button 
                      className={styles.actionButton}
                      aria-label={`Analyze ${position.symbol} position`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPosition(position);
                      }}
                    >
                      📊 Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Position Details Modal */}
      {selectedPosition && (
        <div 
          className={styles.modal} 
          onClick={() => setSelectedPosition(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 id="modal-title">Position Details: {selectedPosition.symbol}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedPosition(null)}
                aria-label="Close position details"
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody} id="modal-description">
              <div className={styles.detailGrid} role="list" aria-label="Position details">
                <div className={styles.detailItem} role="listitem">
                  <label>Company:</label>
                  <span>{selectedPosition.companyName}</span>
                </div>
                <div className={styles.detailItem} role="listitem">
                  <label>Sector:</label>
                  <span>{selectedPosition.sector}</span>
                </div>
                <div className={styles.detailItem} role="listitem">
                  <label>Quantity:</label>
                  <span>{selectedPosition.quantity} shares</span>
                </div>
                <div className={styles.detailItem} role="listitem">
                  <label>Entry Price:</label>
                  <span>${selectedPosition.entryPrice.toFixed(2)}</span>
                </div>
                <div className={styles.detailItem} role="listitem">
                  <label>Current Price:</label>
                  <span>${selectedPosition.currentPrice.toFixed(2)}</span>
                </div>
                <div className={styles.detailItem} role="listitem">
                  <label>Total P&L:</label>
                  <span className={getColorClass(selectedPosition.pnl)}>
                    {formatCurrency(selectedPosition.pnl)} ({formatPercent(selectedPosition.pnlPercent)})
                  </span>
                </div>
                <div className={styles.detailItem} role="listitem">
                  <label>AI Decision Score:</label>
                  <span>{selectedPosition.decisionScore}/100</span>
                </div>
                <div className={styles.detailItem} role="listitem">
                  <label>Entry Date:</label>
                  <span>{selectedPosition.entryDate.toLocaleDateString()}</span>
                </div>
              </div>

              <div className={styles.analysisSection}>
                <h4>🤖 AI Trade Analysis</h4>
                <div className={styles.analysisContent}>
                  <div className={styles.analysisCategory}>
                    <h5>AI Rationale</h5>
                    <ul>
                      {selectedPosition.aiRationale.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.analysisCategory}>
                    <h5>Technical Signals</h5>
                    <ul>
                      {selectedPosition.technicalSignals.map((signal, idx) => (
                        <li key={idx}>{signal}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.analysisCategory}>
                    <h5>Fundamental Factors</h5>
                    <ul>
                      {selectedPosition.fundamentalFactors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.riskManagement}>
                    <h5>Risk Management</h5>
                    <div className={styles.riskGrid}>
                      <div className={styles.riskItem}>
                        <label>Stop Loss:</label>
                        <span className={styles.negative}>${selectedPosition.stopLoss.toFixed(2)}</span>
                      </div>
                      <div className={styles.riskItem}>
                        <label>Take Profit:</label>
                        <span className={styles.positive}>${selectedPosition.takeProfit.toFixed(2)}</span>
                      </div>
                      <div className={styles.riskItem}>
                        <label>Risk Level:</label>
                        <span className={styles[selectedPosition.riskLevel.toLowerCase()]}>
                          {selectedPosition.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button 
                  className={styles.sellButton}
                  aria-label={`Sell ${selectedPosition.symbol} position`}
                >
                  📉 Sell Position
                </button>
                <button 
                  className={styles.analyzeButton}
                  aria-label={`Get full analysis for ${selectedPosition.symbol}`}
                >
                  📊 Full Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

          {/* Footer for Portfolio tab */}
          <footer className={styles.footer}>
            <Link href="/" className={styles.backButton}>
              ← Back to Mission Control
            </Link>
            
            <div className={styles.footerInfo}>
              <span>Paper Trading Mode • No Real Money at Risk</span>
              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </footer>
        </>
      )}

      {/* Crypto Tab Content */}
      {activeTab === 'crypto' && (
        <div className={styles.cryptoSection}>
          <h2>Crypto Holdings</h2>
          {cryptoHoldings.length === 0 && !isCryptoLoading && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <p><strong>No Coinbase data available.</strong> This could be due to API authentication issues.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <Link href="/coinbase-diagnostic" style={{ color: '#4CAF50', textDecoration: 'underline' }}>
                  Run Coinbase API Diagnostics
                </Link>
                <span style={{ color: '#999' }}>|</span>
                <Link href="/coinbase-setup" style={{ color: '#4CAF50', textDecoration: 'underline' }}>
                  View Setup Instructions
                </Link>
              </div>
            </div>
          )}
          <table className={styles.positionsTable}>
            <thead>
              <tr>
                <th>Coin</th><th>Balance</th><th>Value</th><th>% Change</th>
              </tr>
            </thead>
            <tbody>
              {isCryptoLoading ? (
                <tr>
                  <td colSpan={4} style={{textAlign: 'center'}}>Loading crypto data...</td>
                </tr>
              ) : cryptoHoldings.length > 0 ? cryptoHoldings.map(h => (
                <tr key={h.coin}>
                  <td>{h.coin}</td><td>{h.balance}</td><td>${h.value}</td><td>{h.change}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{textAlign: 'center'}}>No real Coinbase data available</td>
                </tr>
              )}
            </tbody>
          </table>
          <h3>Trade History</h3>
          <table className={styles.positionsTable}>
            <thead>
              <tr>
                <th>Date</th><th>Coin</th><th>Action</th><th>Amount</th><th>Price</th>
              </tr>
            </thead>
            <tbody>
              {isCryptoLoading ? (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center'}}>Loading trade data...</td>
                </tr>
              ) : cryptoTrades.length > 0 ? cryptoTrades.map((t, i) => (
                <tr key={i}>
                  <td>{t.date}</td><td>{t.coin}</td><td>{t.action}</td><td>{t.amount}</td><td>${t.price}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center'}}>No real Coinbase trades available</td>
                </tr>
              )}
            </tbody>
          </table>
          <h3>Agent Status</h3>
          <div>
            <span>Status: {cryptoAgentActive ? 'Active' : 'Inactive'}</span>
            <button
              className={styles.actionButton}
              onClick={() => setCryptoAgentActive(a => !a)}
              style={{ marginLeft: 16 }}
            >{cryptoAgentActive ? 'Pause Agent' : 'Activate Agent'}</button>
          </div>
          <div style={{ marginTop: 24 }}>
            <span>Agent log and decision feed will appear here.</span>
          </div>
          
          {/* Footer for Crypto tab */}
          <footer className={styles.footer}>
            <Link href="/" className={styles.backButton}>
              ← Back to Mission Control
            </Link>
            
            <div className={styles.footerInfo}>
              <span>Paper Trading Mode • No Real Money at Risk</span>
              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
