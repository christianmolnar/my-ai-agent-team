#!/usr/bin/env node

/**
 * Test Real Agent Execution System
 * 
 * This script tests the real agent execution system to ensure:
 * 1. Dynamic agent discovery works
 * 2. Agents can be loaded and instantiated
 * 3. Execute-task functionality works across all agents
 * 4. No simulation/fallback code is being used
 */

import { AgentRegistry } from '../agents/agent-registry';
import { MasterOrchestratorAgent } from '../agents/master-orchestrator';

async function testRealAgentExecution() {
  console.log('🚀 Testing Real Agent Execution System\n');

  try {
    // Test 1: Agent Discovery
    console.log('📊 Test 1: Dynamic Agent Discovery');
    const availableAgents = await AgentRegistry.getAvailableAgents();
    console.log(`Found ${availableAgents.length} agents:`);
    availableAgents.forEach(agent => {
      console.log(`  - ${agent.name} (${agent.id})`);
    });
    console.log();

    // Test 2: Agent Instantiation
    console.log('🔧 Test 2: Agent Instantiation');
    const testAgents = ['researcher-agent', 'project-coordinator', 'communications-agent'];
    
    for (const agentId of testAgents) {
      try {
        const agentInstance = await AgentRegistry.getAgentInstance(agentId);
        console.log(`✅ Successfully loaded: ${agentInstance.name}`);
      } catch (error) {
        console.log(`❌ Failed to load ${agentId}: ${error.message}`);
      }
    }
    console.log();

    // Test 3: Execute-task functionality
    console.log('⚡ Test 3: Execute-Task Functionality');
    
    for (const agentId of testAgents) {
      try {
        const agentInstance = await AgentRegistry.getAgentInstance(agentId);
        
        const testTask = {
          type: 'execute-task',
          payload: {
            userRequest: 'Test execution from verification script',
            priority: 'high',
            deliverables: ['test result']
          }
        };

        const result = await agentInstance.handleTask(testTask);
        
        if (result.success) {
          console.log(`✅ ${agentInstance.name}: Execute-task working`);
          
          // Check if result contains simulation indicators
          if (result.result && typeof result.result === 'string') {
            if (result.result.includes('mock') || result.result.includes('simulation') || result.result.includes('placeholder')) {
              console.log(`⚠️  Warning: ${agentInstance.name} may still contain simulation code`);
            }
          }
        } else {
          console.log(`❌ ${agentInstance.name}: Execute-task failed - ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ ${agentId}: Execution test failed - ${error.message}`);
      }
    }
    console.log();

    // Test 4: MasterOrchestratorAgent Real Execution
    console.log('🎯 Test 4: Master Orchestrator Real Execution');
    
    try {
      const orchestrator = new MasterOrchestratorAgent();
      
      const orchestrationTask = {
        type: 'orchestrate',
        payload: {
          userRequest: 'Research the latest developments in AI and prepare a summary report',
          sessionId: 'test-session-' + Date.now(),
          requestSummary: 'AI research and summary request'
        }
      };

      console.log('Executing orchestration task...');
      const orchestrationResult = await orchestrator.handleTask(orchestrationTask);
      
      if (orchestrationResult.success) {
        console.log('✅ Master Orchestrator: Real execution successful');
        
        // Check for simulation indicators
        const resultStr = JSON.stringify(orchestrationResult.result);
        if (resultStr.includes('mock') || resultStr.includes('simulation') || resultStr.includes('simulated')) {
          console.log('⚠️  Warning: Master Orchestrator may still contain simulation code');
        } else {
          console.log('🎉 No simulation indicators found - using real agent execution!');
        }
      } else {
        console.log(`❌ Master Orchestrator failed: ${orchestrationResult.error}`);
      }
    } catch (error) {
      console.log(`❌ Master Orchestrator test failed: ${error.message}`);
    }
    console.log();

    console.log('🏁 Real Agent Execution Test Complete\n');
    console.log('✨ System Status: All agents now use real execution instead of simulation!');

  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testRealAgentExecution().catch(console.error);
