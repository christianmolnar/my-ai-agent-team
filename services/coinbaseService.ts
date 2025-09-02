import crypto from 'crypto';

// Coinbase API v3 service
export interface CoinbaseAccount {
  id: string;
  name: string;
  currency: string;
  balance: {
    amount: string;
    currency: string;
  };
  type: string;
  primary: boolean;
  active: boolean;
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
  price: {
    amount: string;
    currency: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CoinbasePrice {
  base: string;
  currency: string;
  amount: string;
}

class CoinbaseService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string = 'https://api.coinbase.com/v2';

  constructor() {
    // Load from environment variables - Use CDP keys which are properly formatted for Coinbase
    this.apiKey = process.env.CDP_API_KEY_ID || '';
    this.apiSecret = process.env.CDP_API_KEY_SECRET || '';

    // Check if keys are available
    if (!this.apiKey || !this.apiSecret) {
      console.warn('Coinbase API keys not found in environment variables (CDP_API_KEY_ID and CDP_API_KEY_SECRET)');
    }
  }

  // Generate signature for API authentication
  private generateSignature(requestPath: string, method: string, timestamp: string, body?: string): string {
    const message = timestamp + method.toUpperCase() + requestPath + (body || '');
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  // Helper method to make authenticated requests
  private async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const requestPath = `/v2${endpoint}`;
    const bodyString = body ? JSON.stringify(body) : '';
    
    const signature = this.generateSignature(requestPath, method, timestamp, bodyString);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'CB-ACCESS-KEY': this.apiKey,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-VERSION': '2021-10-05',
        'Content-Type': 'application/json'
      },
      body: bodyString.length > 0 ? bodyString : undefined
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Coinbase API Error (${response.status}): ${errorText}`);
    }
    
    return response.json();
  }

  // Get all accounts (crypto holdings)
  async getAccounts(): Promise<{ data: CoinbaseAccount[] }> {
    try {
      return await this.makeRequest<{ data: CoinbaseAccount[] }>('/accounts');
    } catch (error) {
      console.error('Error fetching Coinbase accounts:', error);
      throw error;
    }
  }

  // Get recent transactions/trades
  async getTransactions(accountId: string): Promise<{ data: CoinbaseTrade[] }> {
    try {
      return await this.makeRequest<{ data: CoinbaseTrade[] }>(`/accounts/${accountId}/transactions`);
    } catch (error) {
      console.error(`Error fetching transactions for account ${accountId}:`, error);
      throw error;
    }
  }

  // Get current price for a currency pair
  async getPrice(baseCurrency: string, targetCurrency: string = 'USD'): Promise<{ data: CoinbasePrice }> {
    try {
      return await this.makeRequest<{ data: CoinbasePrice }>(`/prices/${baseCurrency}-${targetCurrency}/spot`);
    } catch (error) {
      console.error(`Error fetching price for ${baseCurrency}-${targetCurrency}:`, error);
      throw error;
    }
  }

  // Get all recent trades across all accounts
  async getAllTransactions(): Promise<CoinbaseTrade[]> {
    try {
      const accounts = await this.getAccounts();
      const allTransactions: CoinbaseTrade[] = [];
      
      for (const account of accounts.data) {
        // Only get transactions for accounts with balances
        if (parseFloat(account.balance.amount) > 0) {
          const transactions = await this.getTransactions(account.id);
          allTransactions.push(...transactions.data);
        }
      }
      
      // Sort by date, newest first
      return allTransactions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const coinbaseService = new CoinbaseService();
