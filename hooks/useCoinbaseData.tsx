"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface CryptoHolding {
  coin: string;
  balance: number;
  value: number;
  change: string;
}

interface CryptoTrade {
  date: string;
  coin: string;
  action: string;
  amount: number;
  price: number;
}

export const useCoinbaseData = () => {
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([]);
  const [cryptoTrades, setCryptoTrades] = useState<CryptoTrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try the direct Coinbase API
      let success = false;
      
      try {
        const apiResponse = await fetch('/api/coinbase-api');
        
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          
          if (apiData.success) {
            console.log('Direct Coinbase API data received:', {
              accounts: apiData.accounts?.length || 0,
              transactions: apiData.transactions?.length || 0,
              holdings: apiData.holdings?.length || 0
            });
            
            // Use the holdings from response
            if (apiData.holdings && apiData.holdings.length > 0) {
              setCryptoHoldings(apiData.holdings);
            }
            
            // Convert transaction data to our trades format if available
            if (apiData.transactions && apiData.transactions.length > 0) {
              // Map Coinbase transactions to our trade format
              const formattedTrades = apiData.transactions.slice(0, 20).map((tx: any) => {
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
              });
              
              setCryptoTrades(formattedTrades);
              success = true;
            }
          }
        }
      } catch (directApiError) {
        console.error('Error using direct Coinbase API:', directApiError);
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
          } else {
            throw new Error(data.error || 'Unknown API error');
          }
        } catch (cdpError) {
          console.error('Error fetching from CDP API:', cdpError);
          throw cdpError;
        }
      }
      
      // Update timestamp
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching Coinbase data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      
      // Set empty arrays instead of mock data
      setCryptoHoldings([]);
      setCryptoTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    cryptoHoldings,
    cryptoTrades,
    isLoading,
    lastUpdate,
    error,
    refreshData: fetchData
  };
};
