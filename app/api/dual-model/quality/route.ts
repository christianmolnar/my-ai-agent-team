// ============================================================================
// Quality Metrics API Endpoint
// ============================================================================
// Purpose: Get quality metrics for specific analysis
// Endpoint: GET /api/dual-model/quality?analysisId=xxx
// Created: December 28, 2025
// Phase: 1 - Railway Infrastructure Setup
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createDualModelAPI } from '../../../../lib/api/dual-model-verification';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting quality metrics...');
    
    // Get analysis ID from query parameters
    const url = new URL(request.url);
    const analysisId = url.searchParams.get('analysisId');
    
    if (!analysisId) {
      return NextResponse.json(
        { error: 'analysisId query parameter is required' },
        { status: 400 }
      );
    }
    
    // Get quality metrics
    const dualModelAPI = createDualModelAPI();
    const metrics = await dualModelAPI.getQualityMetrics(analysisId);
    
    return NextResponse.json({
      success: true,
      analysisId,
      metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Quality metrics request failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get quality metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
