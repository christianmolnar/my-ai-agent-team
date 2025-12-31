// ============================================================================
// Dual Model System Health Check API Endpoint
// ============================================================================
// Purpose: Health check for dual model verification system
// Endpoint: GET /api/dual-model/health
// Created: December 28, 2025
// Phase: 1 - Railway Infrastructure Setup
// ============================================================================

import { NextResponse } from 'next/server';
import { createDualModelAPI } from '../../../../lib/api/dual-model-verification';

export async function GET() {
  try {
    console.log('🔍 Performing health check...');
    
    const dualModelAPI = createDualModelAPI();
    const health = await dualModelAPI.healthCheck();
    
    const statusCode = health.status.includes('healthy') ? 200 : 503;
    
    return NextResponse.json({
      success: true,
      health,
      system: 'Dual Model Quality Verification System',
      version: '1.0.0',
      phase: 'Phase 1 - Railway Infrastructure Setup'
    }, { status: statusCode });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        health: {
          status: 'unhealthy - health check failed',
          timestamp: new Date().toISOString()
        },
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}
