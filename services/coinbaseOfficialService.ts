import { Client, Account, Transaction } from 'coinbase';

// Export interfaces for other components to use
export interface CoinbaseAccount {
  id: string;
  name: string;
  balance: {
    amount: string;
    currency: string;
  };
  type: string;
  primary: boolean;
  currency: {
    code: string;
    name: string;
  };
}

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
}

// Interface for our crypto holding format
export interface CryptoHolding {
  coin: string;
  balance: number;
  value: number;
  change: string;
}

// Interface for our trade format
export interface CryptoTrade {
  date: string;
  coin: string;
  action: string;
  amount: number;
  price: number;
}

class CoinbaseOfficialService {
  private client: any;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the Coinbase client with credentials from environment variables
   */
  initialize() {
    try {
      const apiKey = process.env.COINBASE_API_KEY;
      const apiSecret = process.env.COINBASE_API_SECRET;

      // Debug info about environment variables (without revealing secrets)
      console.log('Coinbase Official SDK Environment Variable Check:');
      console.log('- COINBASE_API_KEY:', apiKey ? `Present (${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}) ✓` : 'Missing ✗');
      console.log('- COINBASE_API_SECRET:', apiSecret ? 'Present (Secret) ✓' : 'Missing ✗');

      if (!apiKey || !apiSecret) {
        console.error('Coinbase API credentials are missing. Check your .env.local file.');
        return;
      }

      console.log('Initializing Coinbase Official SDK with credentials');
      
      // Create a new Coinbase client with the user's credentials
      // Note: The official Coinbase SDK requires specific formatting
      this.client = new Client({ 
        apiKey, 
        apiSecret,
        strictSSL: true, // Ensure secure connection
        caFile: undefined, // Use default CA file
        timeout: 30000 // Increase timeout to 30s
      });
      
      this.isInitialized = true;
      console.log('Coinbase client initialized successfully');
      
      // Only test connection in development/runtime, not during build
      if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
        setTimeout(() => {
          this.testConnection().catch(err => 
            console.error('Failed to verify Coinbase connection:', err)
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to initialize Coinbase client:', error);
      this.client = null;
      this.isInitialized = false;
    }
  }
  
  /**
   * Test connection to Coinbase API
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) {
      console.error('Coinbase client not initialized');
      return false;
    }
    
    try {
      // The simplest API call we can make is to get the current user
      return new Promise((resolve) => {
        console.log('Testing Coinbase API connection...');
        this.client.getCurrentUser((err: Error, user: any) => {
          if (err) {
            console.error('Coinbase API connection test failed:', err.message);
            resolve(false);
          } else {
            console.log('Coinbase API connection verified successfully!', 
              user ? `Connected as: ${user.name || user.email || 'Unknown user'}` : 'No user data returned');
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Error testing Coinbase connection:', error);
      return false;
    }
  }

  /**
   * Get all accounts (cryptocurrency wallets)
   */
  async getAccounts(): Promise<CoinbaseAccount[]> {
    try {
      if (!this.isInitialized || !this.client) {
        console.error('Coinbase client not initialized');
        await this.initialize();
        if (!this.isInitialized || !this.client) {
          console.error('Failed to initialize Coinbase client, cannot get accounts');
          return [];
        }
      }

      console.log('Requesting accounts from Coinbase API...');
      
      return new Promise((resolve, reject) => {
        this.client.getAccounts({}, (err: Error, accounts: any) => {
          if (err) {
            console.error('Error getting accounts from Coinbase API:', err);
            
            // Log additional debug info
            if (err.message && err.message.includes('401')) {
              console.error('Authentication error (401): Please check your API key and secret.');
              console.error('Make sure your Coinbase API key has the "read" permission for accounts.');
              console.error('Try regenerating your API key in the Coinbase developer dashboard.');
            } else if (err.message && err.message.includes('timeout')) {
              console.error('Request timed out: Coinbase API might be experiencing high latency.');
            }
            
            reject(err);
            return;
          }
          
          if (!accounts || !Array.isArray(accounts)) {
            console.error('Unexpected response format from Coinbase API:', accounts);
            reject(new Error('Invalid response format from Coinbase API'));
            return;
          }
          
          console.log(`Retrieved ${accounts.length} accounts from Coinbase API`);
          
          // Log each account for debugging (without sensitive information)
          if (accounts.length > 0) {
            console.log('Account summary:');
            accounts.forEach((account: any) => {
              console.log(`- ${account.name || 'Unnamed'} (${account.balance?.currency || 'Unknown currency'}): ${account.balance?.amount || '0'}`);
            });
          }
          
          resolve(accounts);
        });
      });
    } catch (error) {
      console.error('Unexpected error getting Coinbase accounts:', error);
      return [];
    }
  }

  /**
   * Get transactions for a specific account
   */
  async getAccountTransactions(accountId: string): Promise<CoinbaseTransaction[]> {
    try {
      if (!this.isInitialized || !this.client) {
        console.error('Coinbase client not initialized');
        return [];
      }

      return new Promise((resolve, reject) => {
        this.client.getAccount(accountId, (err: Error, account: any) => {
          if (err) {
            console.error(`Error getting account ${accountId}:`, err);
            reject(err);
            return;
          }

          account.getTransactions({}, (err: Error, txs: any) => {
            if (err) {
              console.error(`Error getting transactions for account ${accountId}:`, err);
              reject(err);
              return;
            }
            
            console.log(`Retrieved ${txs.length} transactions for account ${account.name}`);
            resolve(txs);
          });
        });
      });
    } catch (error) {
      console.error(`Error getting transactions for account ${accountId}:`, error);
      return [];
    }
  }

  /**
   * Get all transactions across all accounts
   */
  async getAllTransactions(): Promise<CoinbaseTransaction[]> {
    try {
      const accounts = await this.getAccounts();
      const transactions: CoinbaseTransaction[] = [];
      
      // For each account, get its transactions
      for (const account of accounts) {
        if (parseFloat(account.balance.amount) > 0) {
          console.log(`Getting transactions for account: ${account.name} (${account.balance.currency})`);
          const accountTransactions = await this.getAccountTransactions(account.id);
          transactions.push(...accountTransactions);
        }
      }
      
      // Sort transactions by date (newest first)
      return transactions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error getting all Coinbase transactions:', error);
      return [];
    }
  }

  /**
   * Convert Coinbase accounts to our CryptoHolding format
   */
  async getCryptoHoldings(): Promise<CryptoHolding[]> {
    try {
      const accounts = await this.getAccounts();
      const holdings: CryptoHolding[] = [];
      
      // Process each account into a holding
      for (const account of accounts) {
        // Skip zero balance accounts
        if (parseFloat(account.balance.amount) <= 0) continue;
        
        // Create a holding for each non-zero balance
        holdings.push({
          coin: account.balance.currency,
          balance: parseFloat(account.balance.amount),
          value: 0, // We'll need to fetch current prices separately
          change: '0%' // We'll need to fetch price change data separately
        });
      }
      
      // If we have access to the spot price API, fetch current USD values
      try {
        for (const holding of holdings) {
          await this.updateHoldingPrice(holding);
        }
      } catch (priceError) {
        console.error('Error updating holding prices:', priceError);
      }
      
      return holdings;
    } catch (error) {
      console.error('Error getting crypto holdings:', error);
      return [];
    }
  }
  
  /**
   * Update a holding with current price information
   */
  private async updateHoldingPrice(holding: CryptoHolding): Promise<void> {
    if (!this.client || !this.isInitialized) return;
    
    return new Promise((resolve, reject) => {
      // Skip fiat currencies
      if (['USD', 'EUR', 'GBP'].includes(holding.coin)) {
        holding.value = holding.balance; // Value is the same as balance for fiat
        holding.change = '0%';
        resolve();
        return;
      }
      
      this.client.getSpotPrice({ 
        currencyPair: `${holding.coin}-USD` 
      }, (err: Error, price: any) => {
        if (err) {
          console.error(`Error getting price for ${holding.coin}:`, err);
          resolve(); // Continue without price info
          return;
        }
        
        try {
          const currentPrice = parseFloat(price.data.amount);
          holding.value = holding.balance * currentPrice;
          
          // Try to get change percentage
          this.client.getSpotPrice({ 
            currencyPair: `${holding.coin}-USD`,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 24 hours ago
          }, (err: Error, yesterdayPrice: any) => {
            if (err) {
              holding.change = '0%';
            } else {
              const yesterdayValue = parseFloat(yesterdayPrice.data.amount);
              const changePercent = ((currentPrice - yesterdayValue) / yesterdayValue) * 100;
              holding.change = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
            }
            resolve();
          });
        } catch (e) {
          console.error(`Error processing price for ${holding.coin}:`, e);
          resolve();
        }
      });
    });
  }

  /**
   * Convert Coinbase transactions to our CryptoTrade format
   */
  async getCryptoTrades(): Promise<CryptoTrade[]> {
    try {
      const transactions = await this.getAllTransactions();
      const trades: CryptoTrade[] = [];
      
      // Process each transaction into a trade if applicable
      for (const tx of transactions) {
        // Only include buy/sell transactions
        if (tx.type === 'buy' || tx.type === 'sell') {
          try {
            const date = new Date(tx.created_at).toISOString().split('T')[0];
            const coin = tx.amount.currency;
            const amountValue = parseFloat(tx.amount.amount);
            
            // Calculate price per unit if possible
            let price = 0;
            if (tx.native_amount && tx.native_amount.amount) {
              const nativeValue = parseFloat(tx.native_amount.amount);
              price = Math.abs(nativeValue / amountValue);
            }
            
            trades.push({
              date,
              coin,
              action: tx.type.toUpperCase(),
              amount: Math.abs(amountValue),
              price
            });
          } catch (e) {
            console.error('Error processing transaction:', e);
          }
        }
      }
      
      return trades;
    } catch (error) {
      console.error('Error getting crypto trades:', error);
      return [];
    }
  }
}

// Export a singleton instance
export const coinbaseOfficialService = new CoinbaseOfficialService();
export default coinbaseOfficialService;
