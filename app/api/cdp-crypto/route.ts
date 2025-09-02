import { NextRequest, NextResponse } from "next/server";
import { cdpService } from "../../../services/cdpService";

export async function GET(req: NextRequest) {
  try {
    console.log('CDP Crypto API: Initializing CDP client...');
    // Initialize the CDP client if not already initialized
    await cdpService.initialize();
    
    console.log('CDP Crypto API: Fetching crypto holdings...');
    // Get crypto holdings using CDP SDK
    const holdings = await cdpService.getCryptoHoldings();
    
    console.log('CDP Crypto API: Fetching recent trades...');
    // Get recent trades
    const trades = await cdpService.getCryptoTrades();
    
    console.log('CDP Crypto API: Successfully fetched data', { 
      holdingsCount: holdings.length,
      tradesCount: trades.length
    });
    
    return NextResponse.json({ 
      holdings, 
      trades,
      success: true
    });
    
  } catch (error) {
    console.error('API error fetching Coinbase data with CDP SDK:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Failed to fetch Coinbase data', 
      details: errorMessage,
      success: false,
      holdings: [],
      trades: []
    }, { status: 500 });
  }
}
