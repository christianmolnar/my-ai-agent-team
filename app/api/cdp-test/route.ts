import { NextRequest, NextResponse } from "next/server";
import { cdpService } from "../../../services/cdpService";
import { CdpClient } from '@coinbase/cdp-sdk';

export async function GET(req: NextRequest) {
  try {
    // Log environment variables (without exposing secrets)
    console.log('API route: CDP credentials available:', 
      !!process.env.CDP_API_KEY_ID && 
      !!process.env.CDP_API_KEY_SECRET && 
      !!process.env.CDP_WALLET_SECRET
    );
    
    // Try to get both holdings and trades
    console.log('API route: Requesting crypto holdings from service');
    const holdings = await cdpService.getCryptoHoldings();
    const trades = await cdpService.getCryptoTrades();
    
    // Check if we got real data
    const hasData = holdings.length > 0;
    
    if (!hasData) {
      console.log('No real crypto data available');
    }
    
    // Return what we got (which might be empty arrays)
    return NextResponse.json({ 
      holdings, 
      trades,
      success: hasData,
      source: 'Real CDP service - no fallbacks',
      message: hasData ? 'Successfully fetched real data' : 'No real data available',
      credentialsAvailable: !!process.env.CDP_API_KEY_ID && !!process.env.CDP_API_KEY_SECRET
    });
    
  } catch (error) {
    console.error('API error fetching Coinbase data with CDP SDK:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to fetch Coinbase data', 
      details: errorMessage,
      success: false,
      // Return empty arrays instead of mock data
      holdings: [],
      trades: [],
      source: 'Error response - no fallbacks',
      message: 'Failed to fetch real data'
    }, { status: 500 });
  }
}
