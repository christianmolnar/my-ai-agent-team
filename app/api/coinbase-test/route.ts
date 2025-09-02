import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';

/**
 * Simple Coinbase API test endpoint that makes a basic authenticated request
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.COINBASE_API_KEY || '';
    const apiSecret = process.env.COINBASE_API_SECRET || '';
    
    // Check if credentials are set
    if (!apiKey || !apiSecret || apiKey === 'YOUR_COINBASE_REST_API_KEY' || apiSecret === 'YOUR_COINBASE_REST_API_SECRET') {
      return NextResponse.json({ 
        success: false,
        error: 'API credentials not properly configured',
        details: 'Please set up your Coinbase REST API credentials in .env.local'
      }, { status: 400 });
    }

    // Create a timestamp for the request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Set up the request path
    const method = 'GET';
    const requestPath = '/v2/user';
    const body = '';
    
    // Generate the signature
    const message = timestamp + method + requestPath + body;
    const hmac = crypto.createHmac('sha256', apiSecret);
    const signature = hmac.update(message).digest('hex');
    
    // Set up the headers
    const headers = {
      'CB-ACCESS-KEY': apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-VERSION': '2021-01-01',
      'Content-Type': 'application/json'
    };
    
    // Make the request to the Coinbase API
    console.log('Testing Coinbase API connection with user endpoint...');
    const response = await fetch('https://api.coinbase.com/v2/user', {
      method: 'GET',
      headers
    });
    
    // Get the response body
    let responseBody;
    let responseText;
    
    try {
      responseText = await response.text();
      responseBody = JSON.parse(responseText);
    } catch (e) {
      responseBody = { error: 'Failed to parse response as JSON', text: responseText };
    }
    
    // Check if the request was successful
    if (response.ok) {
      return NextResponse.json({ 
        success: true,
        message: 'Successfully connected to Coinbase API',
        userData: {
          name: responseBody?.data?.name || 'Unknown',
          user_id: responseBody?.data?.id || 'Unknown'
        }
      });
    } else {
      return NextResponse.json({ 
        success: false,
        statusCode: response.status,
        statusText: response.statusText,
        error: 'Failed to connect to Coinbase API',
        details: responseBody,
        recommendations: response.status === 401 ? [
          'Your API key or secret may be incorrect',
          'The API key may not have the necessary permissions',
          'Your account may require additional verification',
          'For 401 errors, you need to create a new API key in your Coinbase account settings'
        ] : [
          'Check the response details for more information'
        ]
      }, { status: 500 });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      success: false,
      error: 'Error testing Coinbase API connection',
      details: errorMessage
    }, { status: 500 });
  }
}
