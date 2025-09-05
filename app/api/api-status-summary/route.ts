import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Call the verification endpoint internally
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:30000'}/api/verify-api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error('Failed to get API verification results');
    }

    const data = await response.json();
    const results = data.results || [];

    // Aggregate status counts
    const statusCounts = results.reduce((acc: any, result: any) => {
      const status = result.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Calculate totals
    const totalKeys = results.length;
    const validKeys = statusCounts.valid || 0;
    const invalidKeys = statusCounts.invalid || 0;
    const rateLimitedKeys = statusCounts.rate_limited || 0;
    const networkErrorKeys = statusCounts.network_error || 0;
    const unknownErrorKeys = statusCounts.unknown_error || 0;
    const notVerifiedKeys = statusCounts.not_verified || 0;

    // Overall system health
    const healthPercentage = totalKeys > 0 ? Math.round((validKeys / totalKeys) * 100) : 0;
    const needsAttention = invalidKeys + networkErrorKeys + unknownErrorKeys;

    return NextResponse.json({
      success: true,
      summary: {
        total: totalKeys,
        valid: validKeys,
        invalid: invalidKeys,
        rate_limited: rateLimitedKeys,
        network_error: networkErrorKeys,
        unknown_error: unknownErrorKeys,
        not_verified: notVerifiedKeys,
        needs_attention: needsAttention,
        health_percentage: healthPercentage,
        status: healthPercentage >= 90 ? 'excellent' : 
                healthPercentage >= 75 ? 'good' : 
                healthPercentage >= 50 ? 'fair' : 'needs_attention'
      },
      breakdown: statusCounts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API status summary error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        summary: null
      },
      { status: 500 }
    );
  }
}
