import { NextRequest, NextResponse } from 'next/server';
import testLogging from '../../../lib/test-logging-nextjs';

export async function GET(req: NextRequest) {
  try {
    const result = await testLogging();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Test logging API error:', error);
    return NextResponse.json(
      { error: 'Failed to test logging', details: error.message }, 
      { status: 500 }
    );
  }
}
