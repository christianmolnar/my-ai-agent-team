import crypto from 'crypto';

// API Key details from environment variables
// COINBASE_API_KEY=218d7e0b-caf9-437f-adaa-44952cfafe7e
// COINBASE_API_SECRET should be set in .env.local

export interface CoinbaseTransaction {
  id: string;
  type: string;
  status: string;
  amount: {
    amount: string;
    currency: string;
  };
  native_amount: {
    amount: string;
    currency: string;
  };
  description: string;
  created_at: string;
  updated_at: string;
  resource: string;
  resource_path: string;
  details: {
    title: string;
    subtitle: string;
    payment_method_name?: string;
  };
}

export interface CoinbaseAccount {
  id: string;
  name: string;
  primary: boolean;
  type: string;
  currency: {
    code: string;
    name: string;
    color: string;
    exponent: number;
    type: string;
    address_regex: string;
    asset_id: string;
    slug: string;
  };
  balance: {
    amount: string;
    currency: string;
  };
  created_at: string;
  updated_at: string;
  resource: string;
  resource_path: string;
  allow_deposits: boolean;
  allow_withdrawals: boolean;
}

class CoinbaseApiService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.coinbase.com/v2';

  constructor() {
    this.apiKey = process.env.COINBASE_API_KEY || '';
    this.apiSecret = process.env.COINBASE_API_SECRET || '';
    
    // Basic validation and diagnostic logging
    console.log('Coinbase API Service initialized');
    console.log('- API Key configured:', this.apiKey ? `Yes (${this.apiKey.substring(0, 5)}...${this.apiKey.substring(this.apiKey.length - 4)})` : 'No');
    console.log('- API Secret configured:', this.apiSecret ? `Yes (${this.apiSecret.length} characters)` : 'No');
    
    if (!this.apiKey || this.apiKey === 'YOUR_COINBASE_API_KEY_HERE') {
      console.error('Invalid or missing Coinbase API Key. Please check your environment variables.');
    }
    
    if (!this.apiSecret || this.apiSecret === 'YOUR_API_SECRET_HERE') {
      console.error('Invalid or missing Coinbase API Secret. Please check your environment variables.');
    }
  }

  private generateAuthHeaders(method: string, requestPath: string, body: string = ''): Record<string, string> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Missing Coinbase API credentials. Please set COINBASE_API_KEY and COINBASE_API_SECRET in your environment variables.');
    }
    
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = timestamp + method + requestPath + body;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
    
    return {
      'CB-ACCESS-KEY': this.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-VERSION': '2021-02-11',
    };
  }

  private async makeRequest(method: string, endpoint: string, body: any = null): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const bodyString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      ...this.generateAuthHeaders(method, endpoint, bodyString)
    };

    try {
      console.log(`Making ${method} request to ${url}`);
      const response = await fetch(url, {
        method,
        headers,
        body: bodyString || undefined,
      });

      if (!response.ok) {
        // Clone the response before trying to read its body
        const responseClone = response.clone();
        
        // Try to parse the error response as JSON, but handle text responses too
        let errorMessage;
        try {
          const error = await response.json();
          console.error(`Coinbase API Error: ${response.status}`, error);
          errorMessage = JSON.stringify(error);
        } catch (e) {
          // If response is not JSON, get it as text from the cloned response
          const textError = await responseClone.text();
          console.error(`Coinbase API Error: ${response.status}`, textError);
          errorMessage = textError;
        }
        throw new Error(`Coinbase API Error: ${response.status} ${errorMessage}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making Coinbase API request:', error);
      throw error;
    }
  }

  // Get all accounts (cryptocurrency wallets)
  async getAccounts(): Promise<CoinbaseAccount[]> {
    try {
      // Check if we have valid API credentials before attempting the call
      if (!this.apiKey || !this.apiSecret) {
        console.log('Missing Coinbase API credentials. Please set COINBASE_API_KEY and COINBASE_API_SECRET in your environment variables.');
        return [];
      }
      
      const response = await this.makeRequest('GET', '/accounts');
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        console.error('Coinbase API authentication failed. Please check your API key and secret.');
      } else {
        console.error('Error getting Coinbase accounts:', error);
      }
      return [];
    }
  }

  // Get transactions for a specific account
  async getAccountTransactions(accountId: string): Promise<CoinbaseTransaction[]> {
    try {
      const response = await this.makeRequest('GET', `/accounts/${accountId}/transactions`);
      return response.data;
    } catch (error) {
      console.error(`Error getting transactions for account ${accountId}:`, error);
      return [];
    }
  }

  // Get all transactions across all accounts
  async getAllTransactions(): Promise<CoinbaseTransaction[]> {
    try {
      const accounts = await this.getAccounts();
      const transactions: CoinbaseTransaction[] = [];
      
      // For each account, get its transactions
      for (const account of accounts) {
        console.log(`Getting transactions for account: ${account.name} (${account.currency.code})`);
        const accountTransactions = await this.getAccountTransactions(account.id);
        transactions.push(...accountTransactions);
      }
      
      return transactions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error getting all Coinbase transactions:', error);
      return [];
    }
  }
}

export const coinbaseApiService = new CoinbaseApiService();
export default coinbaseApiService;
