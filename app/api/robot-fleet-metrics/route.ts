// Robot Fleet Metrics API Endpoint
// File: app/api/robot-fleet-metrics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { register, RobotFleetInstrumentation } from '../../../lib/robot-fleet-metrics';

export async function GET(request: NextRequest) {
  try {
    // Initialize realistic fleet data on first call
    RobotFleetInstrumentation.initializeFleetData();
    
    // Add some transaction simulation
    simulateRobotActivity();
    
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating robot fleet metrics:', error);
    return new NextResponse('Error generating robot fleet metrics', { status: 500 });
  }
}

function simulateRobotActivity() {
  const robotTypes = ['image_generator', 'vinyl_researcher', 'communications', 'memorias_ai', 'fact_checker', 'finsight_ai'];
  
  robotTypes.forEach(robotType => {
    // Simulate recent transactions
    const transactionCount = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < transactionCount; i++) {
      const success = Math.random() > 0.05; // 95% success rate
      const duration = Math.random() * 30 + 5; // 5-35 seconds
      const complexity = ['simple', 'medium', 'complex'][Math.floor(Math.random() * 3)];
      
      RobotFleetInstrumentation.recordTransaction(robotType, success, duration, complexity);
    }
  });

  // Update fleet status with slight variations
  setTimeout(() => {
    RobotFleetInstrumentation.initializeFleetData();
  }, 1000);
}
