// Master Orchestrator Basic Test
import { MasterOrchestratorAgent } from './agents/master-orchestrator.js';

async function testMasterOrchestrator() {
  console.log('🎯 Testing Master Orchestrator (Basic Functions)');
  console.log('===============================================');
  
  try {
    const orchestrator = new MasterOrchestratorAgent();
    console.log('✅ Master Orchestrator instantiated successfully');
    console.log(`   ID: ${orchestrator.id}`);
    console.log(`   Name: ${orchestrator.name}`);
    console.log(`   Abilities: ${orchestrator.abilities.length} capabilities`);
    
    // Test agent counting (doesn't require API calls)
    console.log('\n📋 Testing agent counting...');
    try {
      const countResult = await orchestrator.handleTask({
        type: 'count-agents',
        payload: {}
      });
      
      if (countResult.success) {
        console.log('✅ Agent counting works');
        console.log(`   Result length: ${countResult.result.length} characters`);
        console.log(`   Sample: "${countResult.result.substring(0, 100)}..."`);
      } else {
        console.log(`❌ Agent counting failed: ${countResult.error}`);
      }
    } catch (error) {
      console.log(`❌ Agent counting threw error: ${error.message}`);
    }
    
    // Test plan creation (this might fail due to API keys, but let's see)
    console.log('\n📋 Testing execution plan creation (may fail due to API keys)...');
    try {
      const planResult = await orchestrator.handleTask({
        type: 'plan',
        payload: {
          userRequest: 'Test simple request for planning',
          deliverables: ['simple test output']
        }
      });
      
      if (planResult.success) {
        console.log('✅ Plan creation works');
        console.log(`   Plan has ${planResult.result.agents?.length || 0} agents selected`);
      } else {
        console.log(`❌ Plan creation failed: ${planResult.error}`);
      }
    } catch (error) {
      console.log(`❌ Plan creation threw error: ${error.message}`);
      console.log('   (This is expected if API keys are missing)');
    }
    
  } catch (error) {
    console.error('❌ Master Orchestrator test failed:', error.message);
    throw error;
  }
}

testMasterOrchestrator()
  .then(() => {
    console.log('\n✅ Master Orchestrator Basic Test Complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  });
