import { NextRequest, NextResponse } from "next/server";
import coinbaseApiService from "../../../services/coinbaseApiService";
import { coinbaseOfficialService } from "../../../services/coinbaseOfficialService";
import { cdpService } from "../../../services/cdpService";

export async function GET(req: NextRequest) {
  try {
    console.log('Coinbase API: Fetching accounts and transactions...');
    
    // First try using the official Coinbase SDK if credentials are available
    if (process.env.COINBASE_API_KEY && process.env.COINBASE_API_SECRET) {
      try {
        // Get accounts (wallets) and holdings using official SDK
        const holdings = await coinbaseOfficialService.getCryptoHoldings();
        console.log(`Retrieved ${holdings.length} crypto holdings from Coinbase Official SDK`);
        
        // Get all transactions
        const transactions = await coinbaseOfficialService.getAllTransactions();
        console.log(`Retrieved ${transactions.length} transactions from Coinbase Official SDK`);
        
        return NextResponse.json({ 
          holdings,
          transactions,
          success: true
        });
      } catch (officialError) {
        console.error('Error using official Coinbase SDK:', officialError);
        console.log('Falling back to direct API service...');
        
        try {
          // Get accounts (wallets)
          const accounts = await coinbaseApiService.getAccounts();
          console.log(`Retrieved ${accounts.length} accounts from Coinbase API`);
          
          // Get all transactions
          const transactions = await coinbaseApiService.getAllTransactions();
          console.log(`Retrieved ${transactions.length} transactions from Coinbase API`);
          
          // Get real-time crypto data using CDP (we know this works)
          const holdings = await cdpService.getCryptoHoldings();
          
          return NextResponse.json({ 
            accounts,
            transactions,
            holdings,
            success: true
          });
        } catch (directApiError) {
          console.error('Error using direct Coinbase API:', directApiError);
          console.log('Falling back to CDP service...');
        }
      }
    }
    
    // If direct API failed or credentials not available, use our CDP service
    const holdings = await cdpService.getCryptoHoldings();
    const trades = await cdpService.getCryptoTrades();
    
    return NextResponse.json({ 
      holdings,
      trades,
      success: true
    });
  } catch (error) {
    console.error('API error fetching Coinbase data:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
