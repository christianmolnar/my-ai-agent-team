// Test Reviewer Agent Integration - NO FALLBACKS VERSION
import { MasterOrchestratorAgent } from './agents/master-orchestrator.js';
import { AgentRegistry } from './agents/agent-registry.js';

async function testReviewerAgentIntegration() {
  console.log('🧪 Testing Reviewer Agent Integration (NO FALLBACKS VERSION)');
  console.log('===============================================================');

  try {
    // Test 1: Verify reviewer agent can be loaded
    console.log('\n📋 Test 1: Loading Reviewer Agent...');
    const reviewerAgent = await AgentRegistry.getAgentInstance('reviewer');
    
    if (!reviewerAgent) {
      throw new Error('REVIEWER AGENT LOAD FAILED: Agent registry could not instantiate reviewer agent');
    }
    
    console.log('✅ Reviewer agent loaded successfully');
    console.log(`   Agent ID: ${reviewerAgent.id}`);
    console.log(`   Agent Name: ${reviewerAgent.name}`);
    console.log(`   Abilities: ${reviewerAgent.abilities.length} capabilities`);

    // Test 2: Verify CNS integration
    console.log('\n📋 Test 2: Testing CNS Integration...');
    const elevatorPitchTask = {
      type: 'execute-task',
      payload: {
        userRequest: 'Provide a brief one-sentence elevator pitch of your primary capabilities and specializations'
      }
    };

    const elevatorPitchResult = await reviewerAgent.handleTask(elevatorPitchTask);
    
    if (!elevatorPitchResult.success) {
      throw new Error(`REVIEWER AGENT TASK FAILED: ${elevatorPitchResult.error}`);
    }
    
    console.log('✅ CNS integration working');
    console.log(`   Elevator pitch: "${elevatorPitchResult.result}"`);

    // Test 3: Test Master Orchestrator's ability to get agent capabilities
    console.log('\n📋 Test 3: Testing Master Orchestrator Agent Discovery...');
    const orchestrator = new MasterOrchestratorAgent();
    
    const capabilitiesTask = {
      type: 'get-agent-capabilities',
      payload: {}
    };

    const capabilitiesResult = await orchestrator.handleTask(capabilitiesTask);
    
    if (!capabilitiesResult.success) {
      throw new Error(`MASTER ORCHESTRATOR CAPABILITIES FAILED: ${capabilitiesResult.error}`);
    }
    
    console.log('✅ Master Orchestrator successfully queried agent capabilities');
    console.log(`   Result length: ${capabilitiesResult.result.length} characters`);
    
    // Check if reviewer is mentioned in capabilities
    if (capabilitiesResult.result.includes('Reviewer Agent') || capabilitiesResult.result.includes('reviewer')) {
      console.log('✅ Reviewer Agent properly included in capabilities response');
    } else {
      throw new Error('REVIEWER AGENT MISSING: Not found in capabilities response');
    }

    console.log('\n🎉 ALL TESTS PASSED - NO FALLBACKS VERSION WORKING');
    console.log('The system successfully fails fast when there are real problems');
    console.log('and works correctly when everything is properly implemented.');

  } catch (error) {
    console.error('\n❌ TEST FAILED (This is the intended behavior for broken systems):');
    console.error(`   Error: ${error.message}`);
    console.error('\nThis error indicates a real problem that needs to be fixed,');
    console.error('rather than being masked by fallback behavior.');
    throw error;
  }
}

// Run the test
testReviewerAgentIntegration()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  });
