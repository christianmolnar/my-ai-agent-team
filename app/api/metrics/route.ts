import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic metrics endpoint for monitoring
    const metrics = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    return NextResponse.json(metrics, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}