import { NextRequest, NextResponse } from "next/server";

/**
 * This is a diagnostic endpoint to help debug Coinbase API authentication issues
 */
export async function GET(req: NextRequest) {
  try {
    // Extract API credentials for debugging (don't log the full secret)
    const apiKey = process.env.COINBASE_API_KEY || 'not-set';
    const apiSecret = process.env.COINBASE_API_SECRET || 'not-set';
    
    // Check if credentials are set
    const hasCredentials = !!(apiKey && apiSecret && apiKey !== 'not-set' && apiSecret !== 'not-set');
    
    // Check if the key format looks like a UUID (typical for CDP)
    const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiKey);
    
    // Check if the key might be a standard Coinbase API key (typically longer)
    const mightBeStandardApiKey = apiKey.length > 40;
    
    // Check if we're likely using CDP keys for REST API (common mistake)
    const isCdpKeyUsedForRestApi = isUuidFormat && 
      apiKey === process.env.CDP_API_KEY_ID &&
      apiSecret === process.env.CDP_API_KEY_SECRET;
    
    // Diagnose the API secret format
    const secretLength = apiSecret.length;
    const hasBase64Chars = /^[A-Za-z0-9+/=]+$/.test(apiSecret);
    
    // Create the diagnostic result
    const diagnostics = {
      hasCredentials,
      keyFormat: {
        length: apiKey.length,
        prefix: apiKey.substring(0, 5),
        suffix: apiKey.substring(apiKey.length - 4),
        isUuidFormat,
        mightBeStandardApiKey,
        isCdpKeyUsedForRestApi,
        recommendCreateNewKey: isUuidFormat || apiKey === 'YOUR_COINBASE_REST_API_KEY' || apiKey === 'not-set',
      },
      secretFormat: {
        length: secretLength,
        hasBase64Chars,
        containsPlus: apiSecret.includes('+'),
        containsSlash: apiSecret.includes('/'),
        containsEquals: apiSecret.includes('='),
      },
      environmentVariables: {
        hasApiKey: !!process.env.COINBASE_API_KEY,
        hasApiSecret: !!process.env.COINBASE_API_SECRET,
        hasCdpApiKeyId: !!process.env.CDP_API_KEY_ID,
        hasCdpApiKeySecret: !!process.env.CDP_API_KEY_SECRET,
        hasCdpWalletSecret: !!process.env.CDP_WALLET_SECRET,
      }
    };
    
    return NextResponse.json({ 
      success: true,
      message: "API credentials diagnostic completed",
      diagnostics
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      success: false, 
      message: "Failed to complete API credentials diagnostic",
      error: errorMessage
    }, { status: 500 });
  }
}
