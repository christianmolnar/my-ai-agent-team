// ============================================================================
// Dual Model Real Estate Analysis API Endpoint
// ============================================================================
// Purpose: Start new property analysis with dual model verification
// Endpoint: POST /api/dual-model/analysis
// Created: December 28, 2025
// Phase: 1 - Railway Infrastructure Setup
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createDualModelAPI } from '../../../../lib/api/dual-model-verification';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting dual model analysis...');
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    if (!body.analysisType || !['PRIMARY_RESIDENCE', 'INVESTMENT_PROPERTY'].includes(body.analysisType)) {
      return NextResponse.json(
        { error: 'analysisType must be PRIMARY_RESIDENCE or INVESTMENT_PROPERTY' },
        { status: 400 }
      );
    }
    
    if (!body.propertyFiles || !Array.isArray(body.propertyFiles) || body.propertyFiles.length === 0) {
      return NextResponse.json(
        { error: 'propertyFiles array is required and must not be empty' },
        { status: 400 }
      );
    }
    
    if (!body.userParameters) {
      return NextResponse.json(
        { error: 'userParameters is required' },
        { status: 400 }
      );
    }
    
    // Start analysis
    const dualModelAPI = createDualModelAPI();
    const result = await dualModelAPI.startAnalysis({
      userId: body.userId,
      analysisType: body.analysisType,
      propertyFiles: body.propertyFiles,
      userParameters: body.userParameters,
      sessionName: body.sessionName || `Analysis ${new Date().toISOString()}`
    });
    
    console.log(`✅ Analysis started successfully: ${result.analysisId}`);
    
    return NextResponse.json({
      success: true,
      analysisId: result.analysisId,
      status: result.status,
      qualityScore: result.overallQualityScore,
      meetsThreshold: result.meetsQualityThreshold,
      processingTimeMs: result.processingTimeMs,
      retryCount: result.retryCount,
      message: 'Analysis started successfully'
    });
    
  } catch (error) {
    console.error('❌ Analysis startup failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Analysis failed to start',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get analysis ID from query parameters
    const url = new URL(request.url);
    const analysisId = url.searchParams.get('analysisId');
    
    if (!analysisId) {
      return NextResponse.json(
        { error: 'analysisId query parameter is required' },
        { status: 400 }
      );
    }
    
    // Get analysis status
    const dualModelAPI = createDualModelAPI();
    const status = await dualModelAPI.getAnalysisStatus(analysisId);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analysis: status
    });
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get analysis status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
