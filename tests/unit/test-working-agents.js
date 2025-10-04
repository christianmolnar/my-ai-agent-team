// Test Working Agent Capabilities (No API required)
import { AgentRegistry } from './agents/agent-registry.js';

async function testWorkingAgentCapabilities() {
  console.log('🔧 Testing Working Agent Capabilities (No API Required)');
  console.log('=====================================================');
  
  // Test agents that work without API calls
  const workingAgents = [
    'data-scientist', 
    'front-end-developer', 
    'back-end-developer', 
    'full-stack-developer',
    'reviewer'
  ];
  
  for (const agentId of workingAgents) {
    try {
      console.log(`\n📋 Testing ${agentId}...`);
      
      const agent = await AgentRegistry.getAgentInstance(agentId);
      if (!agent) {
        console.log(`❌ ${agentId}: Could not instantiate`);
        continue;
      }
      
      console.log(`✅ ${agentId}: Instantiated successfully`);
      console.log(`   Name: ${agent.name}`);
      console.log(`   Abilities: ${agent.abilities?.length || 0} total`);
      
      if (agent.abilities && agent.abilities.length > 0) {
        console.log(`   Key abilities:`);
        agent.abilities.slice(0, 3).forEach((ability, i) => {
          console.log(`     ${i + 1}. ${ability}`);
        });
      }
      
      // Test basic task handling (non-LLM tasks)
      if (agentId === 'reviewer') {
        try {
          // Test CNS integration check
          console.log(`   Testing CNS integration...`);
          const testResult = await agent.handleTask({
            type: 'cns-check', 
            payload: { test: true }
          });
          console.log(`   CNS test: ${testResult.success ? '✅' : '❌'}`);
        } catch (error) {
          console.log(`   CNS test: ❌ (${error.message.substring(0, 50)}...)`);
        }
      }
      
    } catch (error) {
      console.log(`❌ ${agentId}: Error - ${error.message}`);
    }
  }
  
  console.log('\n🎯 Working Agent Capabilities Test Complete');
}

testWorkingAgentCapabilities()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  });
