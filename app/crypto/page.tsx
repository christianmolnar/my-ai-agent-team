"use client";

import { CryptoPortfolio } from '../../components/CryptoPortfolio';

export default function CryptoPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Cryptocurrency Dashboard</h1>
      <p>View your crypto holdings and transaction history from Coinbase.</p>
      
      <CryptoPortfolio />
    </div>
  );
}
