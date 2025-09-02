import React from 'react';
import { useCoinbaseData } from '../../hooks/useCoinbaseData';
import styles from './styles.module.css';

export const CryptoPortfolio: React.FC = () => {
  const {
    cryptoHoldings,
    cryptoTrades,
    isLoading,
    lastUpdate,
    error,
    refreshData
  } = useCoinbaseData();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading crypto data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error loading crypto data</h3>
        <p>{error}</p>
        <button onClick={refreshData}>Try Again</button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={styles.cryptoContainer}>
      <div className={styles.header}>
        <h2>Crypto Portfolio</h2>
        <div className={styles.refreshSection}>
          <button onClick={refreshData} className={styles.refreshButton}>
            Refresh
          </button>
          <span className={styles.lastUpdate}>
            Last updated: {formatDateTime(lastUpdate)}
          </span>
        </div>
      </div>

      {/* Holdings Section */}
      <div className={styles.holdingsSection}>
        <h3>Current Holdings</h3>
        {cryptoHoldings.length === 0 ? (
          <p>No crypto holdings found.</p>
        ) : (
          <table className={styles.cryptoTable}>
            <thead>
              <tr>
                <th>Coin</th>
                <th>Balance</th>
                <th>Value</th>
                <th>24h Change</th>
              </tr>
            </thead>
            <tbody>
              {cryptoHoldings.map((holding, index) => (
                <tr key={index}>
                  <td>{holding.coin}</td>
                  <td>{holding.balance}</td>
                  <td>{formatCurrency(holding.value)}</td>
                  <td className={holding.change.startsWith('+') ? styles.positive : styles.negative}>
                    {holding.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Trades Section */}
      <div className={styles.tradesSection}>
        <h3>Recent Transactions</h3>
        {cryptoTrades.length === 0 ? (
          <p>No transaction history available.</p>
        ) : (
          <table className={styles.cryptoTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Coin</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {cryptoTrades.map((trade, index) => (
                <tr key={index}>
                  <td>{trade.date}</td>
                  <td>{trade.coin}</td>
                  <td className={trade.action === 'BUY' ? styles.buyAction : styles.sellAction}>
                    {trade.action}
                  </td>
                  <td>{trade.amount}</td>
                  <td>{formatCurrency(trade.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
