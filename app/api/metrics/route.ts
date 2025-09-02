import { NextRequest, NextResponse } from 'next/server';
import { register, EnhancedRobotFleetInstrumentation } from '../../../lib/enhanced-robot-fleet-metrics';

export async function GET(request: NextRequest) {
  try {
    // Initialize comprehensive multi-tenant fleet data with all monitoring sections
    EnhancedRobotFleetInstrumentation.initializeEnhancedFleetData();
    
    // Simulate ongoing transaction activity
    EnhancedRobotFleetInstrumentation.simulateTransactionActivity();
    
    // Update infrastructure health metrics
    EnhancedRobotFleetInstrumentation.updateInfrastructureHealth();
    
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return new NextResponse('Error generating metrics', { status: 500 });
  }
}
