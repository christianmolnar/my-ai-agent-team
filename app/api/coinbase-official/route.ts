import { NextRequest, NextResponse } from "next/server";
import { coinbaseOfficialService } from "../../../services/coinbaseOfficialService";
import { cdpService } from "../../../services/cdpService";

export async function GET(req: NextRequest) {
  console.log('Coinbase API Route: Processing request...');
  
  try {
    // Step 1: First try using the official Coinbase SDK
    console.log('Attempting to use official Coinbase SDK...');
    
    if (process.env.COINBASE_API_KEY && process.env.COINBASE_API_SECRET) {
      try {
        // Test the connection first
        const connectionWorking = await coinbaseOfficialService.testConnection();
        
        if (connectionWorking) {
          console.log('Coinbase SDK connection verified, fetching data...');
          
          // Get holdings and trades in parallel
          const [holdings, trades] = await Promise.all([
            coinbaseOfficialService.getCryptoHoldings(),
            coinbaseOfficialService.getCryptoTrades()
          ]);
          
          console.log(`Successfully retrieved data via official Coinbase SDK:
            - ${holdings.length} holdings
            - ${trades.length} trades`);
          
          return NextResponse.json({ 
            holdings,
            transactions: trades,
            source: "official-sdk",
            success: true
          });
        } else {
          console.log('Coinbase SDK connection failed, falling back to CDP service...');
        }
      } catch (officialSdkError) {
        console.error('Error using official Coinbase SDK:', officialSdkError);
      }
    } else {
      console.log('Coinbase API credentials not configured, skipping official SDK');
    }
    
    // Step 2: Fall back to using CDP service
    console.log('Using CDP service for crypto data...');
    
    try {
      // Initialize the CDP client if not already initialized
      await cdpService.initialize();
      
      // Get crypto data using CDP
      const holdings = await cdpService.getCryptoHoldings();
      const trades = await cdpService.getCryptoTrades();
      
      console.log(`Successfully retrieved data via CDP service:
        - ${holdings.length} holdings
        - ${trades.length} trades`);
      
      return NextResponse.json({ 
        holdings,
        transactions: trades,
        source: "cdp-service",
        success: true
      });
    } catch (cdpError) {
      console.error('Error using CDP service:', cdpError);
      throw cdpError;
    }
  } catch (error) {
    console.error('API error fetching crypto data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Failed to fetch crypto data', 
      details: errorMessage,
      success: false,
      holdings: [],
      transactions: []
    }, { status: 500 });
  }
}
