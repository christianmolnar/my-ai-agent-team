// Agent Registry Validation Test
import { AgentRegistry } from './agents/agent-registry.js';

async function testAgentRegistry() {
  console.log('🤖 Testing Agent Registry System');
  console.log('===============================');
  
  try {
    // Test registry loading
    console.log('📋 Loading agent registry...');
    const availableAgents = await AgentRegistry.getAvailableAgents();
    console.log(`✅ Registry loaded: ${availableAgents.length} agents defined`);
    
    // Test agent instantiation
    let successfulInstantiations = 0;
    let failedInstantiations = 0;
    
    console.log('\n📋 Testing agent instantiation...');
    
    for (const agent of availableAgents) {
      try {
        console.log(`   Testing ${agent.id}...`);
        const instance = await AgentRegistry.getAgentInstance(agent.id);
        
        if (instance) {
          console.log(`   ✅ ${agent.id}: Successfully instantiated`);
          console.log(`      - Name: ${instance.name}`);
          console.log(`      - Abilities: ${instance.abilities?.length || 0} capabilities`);
          successfulInstantiations++;
        } else {
          console.log(`   ❌ ${agent.id}: Returned null instance`);
          failedInstantiations++;
        }
      } catch (error) {
        console.log(`   ❌ ${agent.id}: Failed to instantiate - ${error.message}`);
        failedInstantiations++;
      }
    }
    
    console.log(`\n📊 Results:`);
    console.log(`   ✅ Successful: ${successfulInstantiations}`);
    console.log(`   ❌ Failed: ${failedInstantiations}`);
    console.log(`   📈 Success Rate: ${Math.round((successfulInstantiations / availableAgents.length) * 100)}%`);
    
    // Test specific problematic agents
    console.log('\n📋 Testing specific known issues...');
    
    const problematicAgents = ['image-generator', 'project-coordinator'];
    
    for (const agentId of problematicAgents) {
      try {
        console.log(`   Testing problematic agent: ${agentId}...`);
        const instance = await AgentRegistry.getAgentInstance(agentId);
        console.log(`   ✅ ${agentId}: Actually works fine`);
      } catch (error) {
        console.log(`   ❌ ${agentId}: Confirmed issue - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Registry test failed:', error.message);
    throw error;
  }
}

testAgentRegistry()
  .then(() => {
    console.log('\n✅ Agent Registry Test Complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  });
