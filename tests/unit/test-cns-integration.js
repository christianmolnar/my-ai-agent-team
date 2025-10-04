// CNS Integration Test - No API Keys Required
import { CNSManager } from './lib/cns/CNSManager.js';

async function testCNSIntegration() {
  console.log('🧠 Testing CNS Integration Across Agent Team');
  console.log('==============================================');

  const testAgents = ['reviewer', 'security-expert', 'communications-agent', 'researcher-agent'];
  
  for (const agentName of testAgents) {
    try {
      console.log(`\n📋 Testing ${agentName} CNS...`);
      
      const cnsManager = new CNSManager(agentName);
      const learnings = await cnsManager.getActiveLearnings();
      
      console.log(`✅ ${agentName}: Loaded ${learnings.length} characters of CNS data`);
      
      // Check what components are loaded
      const hasBrain = learnings.includes('## BRAIN:');
      const hasMemory = learnings.includes('## PROCEDURAL:');
      const hasIntegration = learnings.includes('## INTEGRATION:');
      const hasReflexes = learnings.includes('## REFLEXES:');
      
      console.log(`   - Brain: ${hasBrain ? '✅' : '❌'}`);
      console.log(`   - Memory: ${hasMemory ? '✅' : '❌'}`);
      console.log(`   - Integration: ${hasIntegration ? '✅' : '❌'}`);
      console.log(`   - Reflexes: ${hasReflexes ? '✅' : '❌'}`);
      
      if (learnings.length > 0) {
        console.log(`   - Sample content: "${learnings.substring(0, 100)}..."`);
      }
      
    } catch (error) {
      console.error(`❌ ${agentName}: CNS loading failed - ${error.message}`);
    }
  }
  
  console.log('\n🎯 CNS Integration Test Complete');
}

testCNSIntegration()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  });
