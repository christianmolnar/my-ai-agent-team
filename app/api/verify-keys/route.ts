import { NextResponse } from 'next/server';
import { verifyAllApiKeys } from '../../../lib/api-verification';

export async function GET() {
  try {
    const results = await verifyAllApiKeys();
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        configured: results.filter(r => r.configured).length,
        total: results.length,
        ready: results.filter(r => ['OpenAI', 'Google Fact Check', 'SerpAPI'].includes(r.service)).every(r => r.configured)
      }
    });
  } catch (error) {
    console.error('Error verifying API keys:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to verify API keys',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
