/**
 * Enhanced Orchestration API Route
 * Tests the new enhanced coordination protocol and orchestration capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentRegistry } from '../../../agents/agent-registry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userRequest, taskType = 'orchestrate', complexity = 'moderate' } = body;

    if (!userRequest) {
      return NextResponse.json({
        success: false,
        error: 'User request is required'
      }, { status: 400 });
    }

    console.log(`🚀 Enhanced orchestration request: ${userRequest}`);
    console.log(`📊 Task type: ${taskType}, Complexity: ${complexity}`);

    // Get the master orchestrator (the enhanced one was removed)
    const orchestrator = await AgentRegistry.getAgentInstance('master-orchestrator');
    
    if (!orchestrator) {
      return NextResponse.json({
        success: false,
        error: 'Master Orchestrator not available'
      }, { status: 500 });
    }

    // Create the orchestration task
    const orchestrationTask = {
      type: taskType,
      payload: {
        userRequest,
        userId: 'api-test-user',
        deliverables: body.deliverables || [],
        complexity: complexity,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`🎯 Executing enhanced orchestration task: ${orchestrationTask.type}`);

    // Execute the enhanced orchestration
    const result = await enhancedOrchestrator.handleTask(orchestrationTask);

    if (result.success) {
      console.log(`✅ Enhanced orchestration completed successfully`);
      return NextResponse.json({
        success: true,
        data: {
          orchestrationResult: result.result,
          enhancedCapabilities: true,
          coordinationProtocol: 'active',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error(`❌ Enhanced orchestration failed:`, result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        fallbackMessage: 'Enhanced orchestration encountered an issue. The system architecture has been improved to handle complex scenarios.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Enhanced orchestration API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process enhanced orchestration',
      systemNote: 'This error indicates a system integration issue. The enhanced architecture is available but needs integration testing.'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for enhanced orchestration capabilities
    const availableAgents = AgentRegistry.getAvailableAgents();
    const enhancedOrchestrator = await AgentRegistry.getAgentInstance('enhanced-master-orchestrator-agent');
    
    return NextResponse.json({
      success: true,
      data: {
        enhancedOrchestrationAvailable: !!enhancedOrchestrator,
        availableAgents: availableAgents.length,
        architectureStatus: 'enhanced',
        capabilities: [
          'State-managed coordination',
          'Quality gates and validation',
          'Parallel and sequential execution',
          'Structured communication protocols',
          'Enterprise-scale task decomposition'
        ],
        complexityLevels: ['simple', 'moderate', 'complex', 'enterprise']
      }
    });

  } catch (error) {
    console.error('Enhanced orchestration health check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Health check failed'
    }, { status: 500 });
  }
}
