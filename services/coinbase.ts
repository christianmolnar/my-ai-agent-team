import crypto from 'crypto';

// Interface for Coinbase API response
export interface CoinbaseAccount {
  id: string;
  name: string;
  primary: boolean;
  type: string;
  currency: {
    code: string;
    name: string;
  };
  balance: {
    amount: string;
    currency: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CoinbaseTrade {
  id: string;
  type: 'buy' | 'sell';
  status: string;
  amount: {
    amount: string;
    currency: string;
  };
  total: {
    amount: string;
    currency: string;
  };
  created_at: string;
  updated_at: string;
  resource: string;
  resource_path: string;
  payment_method: {
    id: string;
    resource: string;
    resource_path: string;
  };
}

export interface CryptoHolding {
  coin: string;
  balance: number;
  value: number;
  change: string;
}

export interface CryptoTrade {
  date: string;
  coin: string;
  action: 'BUY' | 'SELL';
  amount: number;
  price: number;
}

class CoinbaseService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string = 'https://api.coinbase.com/v2';

  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY || '';
    this.apiSecret = process.env.COINBASE_API_SECRET || '';
    
    if (!this.apiKey || !this.apiSecret) {
      console.warn('Coinbase API credentials not found. Using mock data.');
    }
  }

  private getSignature(timestamp: string, method: string, requestPath: string, body: string = ''): string {
    const message = timestamp + method + requestPath + body;
    const hmac = crypto.createHmac('sha256', this.apiSecret);
    return hmac.update(message).digest('hex');
  }

  private getHeaders(method: string, requestPath: string, body: string = '') {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.getSignature(timestamp, method, requestPath, body);
    
    return {
      'CB-ACCESS-KEY': this.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-VERSION': '2021-01-01',
      'Content-Type': 'application/json'
    };
  }

  async getAccounts(): Promise<CryptoHolding[]> {
    try {
      // Check if API credentials are available
      if (!this.apiKey || !this.apiSecret) {
        return this.getMockAccounts();
      }

      const requestPath = '/accounts';
      const headers = this.getHeaders('GET', requestPath);
      
      const response = await fetch(`${this.baseUrl}${requestPath}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Coinbase API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const accounts = data.data as CoinbaseAccount[];
      
      // Get current exchange rates to calculate values
      const rates = await this.getExchangeRates();
      
      return accounts
        .filter(account => parseFloat(account.balance.amount) > 0)
        .map(account => {
          const coin = account.currency.code;
          const balance = parseFloat(account.balance.amount);
          const rate = rates[coin] || 0;
          const value = balance * rate;
          
          // For demo purposes we're hardcoding change percentages
          // In a real app, you would fetch historical data to calculate this
          const changes: Record<string, string> = {
            'BTC': '+2.3%',
            'ETH': '+1.8%',
            'SOL': '+4.2%',
            'USDC': '0.0%',
            'ADA': '-0.7%',
            'DOGE': '+5.1%',
            'DOT': '+1.4%',
          };
          
          return {
            coin,
            balance,
            value,
            change: changes[coin] || '+0.0%'
          };
        })
        .sort((a, b) => b.value - a.value); // Sort by highest value first
    } catch (error) {
      console.error('Error fetching Coinbase accounts:', error);
      return this.getMockAccounts();
    }
  }
  
  async getTrades(): Promise<CryptoTrade[]> {
    try {
      // Check if API credentials are available
      if (!this.apiKey || !this.apiSecret) {
        return this.getMockTrades();
      }

      // In a real implementation, you would fetch the trades from the Coinbase API
      // This requires iterating through accounts and fetching buy/sell history
      // For now, using mock data for simplicity
      return this.getMockTrades();
    } catch (error) {
      console.error('Error fetching Coinbase trades:', error);
      return this.getMockTrades();
    }
  }

  private async getExchangeRates(): Promise<Record<string, number>> {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD');
      const data = await response.json();
      const rates = data.data.rates;
      
      // Convert rates to USD value (invert them since they're expressed as USD to coin)
      const usdRates: Record<string, number> = {};
      Object.keys(rates).forEach(coin => {
        usdRates[coin] = 1 / parseFloat(rates[coin]);
      });
      
      return usdRates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback exchange rates for major cryptocurrencies
      return {
        'BTC': 33000,
        'ETH': 2700,
        'SOL': 75,
        'ADA': 0.8,
        'USDC': 1,
        'DOGE': 0.12,
        'DOT': 11
      };
    }
  }

  private getMockAccounts(): CryptoHolding[] {
    return [
      { coin: 'BTC', balance: 0.76, value: 25080, change: '+2.8%' },
      { coin: 'ETH', balance: 15.3, value: 41310, change: '+1.5%' },
      { coin: 'SOL', balance: 245, value: 18375, change: '+4.7%' },
      { coin: 'ADA', balance: 5250, value: 4200, change: '-0.5%' },
      { coin: 'DOT', balance: 320, value: 3520, change: '+2.1%' }
    ];
  }

  private getMockTrades(): CryptoTrade[] {
    return [
      { date: '2025-07-15', coin: 'BTC', action: 'BUY', amount: 0.15, price: 32850 },
      { date: '2025-07-14', coin: 'ETH', action: 'SELL', amount: 3.5, price: 2740 },
      { date: '2025-07-12', coin: 'SOL', action: 'BUY', amount: 50, price: 74.2 },
      { date: '2025-07-10', coin: 'ADA', action: 'BUY', amount: 1000, price: 0.79 },
      { date: '2025-07-08', coin: 'DOT', action: 'SELL', amount: 80, price: 11.2 }
    ];
  }
}

export const coinbaseService = new CoinbaseService();
