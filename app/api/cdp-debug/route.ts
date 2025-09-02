import { NextRequest, NextResponse } from "next/server";
import { cdpService } from "../../../services/cdpService";

export async function GET(req: NextRequest) {
  try {
    // Collect environment info
    const environmentInfo = {
      CDP_API_KEY_ID: process.env.CDP_API_KEY_ID ? "Present ✓" : "Missing ✗",
      CDP_API_KEY_SECRET: process.env.CDP_API_KEY_SECRET ? "Present ✓" : "Missing ✗",
      CDP_WALLET_SECRET: process.env.CDP_WALLET_SECRET ? "Present ✓" : "Missing ✗",
      CDP_ADDRESS: process.env.CDP_ADDRESS ? 
        `Present (${process.env.CDP_ADDRESS.slice(0, 6)}...${process.env.CDP_ADDRESS.slice(-4)}) ✓` : 
        "Missing ✗",
      ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY ? "Present ✓" : "Using fallback key ⚠️",
    };

    console.log('CDP Debug API: Initializing CDP client...');
    // Initialize the CDP client if not already initialized
    await cdpService.initialize();

    // Test Etherscan API directly
    let etherscanStatus = "Unknown";
    let etherscanMessage = "";
    try {
      const address = process.env.CDP_ADDRESS || "0x07DD83dF6138c1bFF6B3e8A8174282D05022902e";
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY || 'CARRGQYPC95WA12UIS8SSDA1FBRC612DYR';
      const etherscanEndpoint = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=2&sort=desc&apikey=${etherscanApiKey}`;
      
      const response = await fetch(etherscanEndpoint);
      const data = await response.json();
      etherscanStatus = data.status;
      etherscanMessage = data.message || "";
    } catch (error) {
      etherscanStatus = "Error";
      etherscanMessage = error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json({
      environment: environmentInfo,
      cdpInitialized: true,
      etherscan: {
        status: etherscanStatus,
        message: etherscanMessage
      },
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API error in debug endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Debug endpoint error', 
      details: errorMessage,
      success: false
    }, { status: 500 });
  }
}
