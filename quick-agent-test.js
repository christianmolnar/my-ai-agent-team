// Quick Agent ID Test
import { AgentRegistry } from './lib/AgentRegistry.js';

async function testAgentIds() {
  console.log('🔍 Testing Actual Agent IDs');
  console.log('============================');
  
  // Test the specific problematic agents
  const testAgents = [
    'image-generator',
    'image-video-generator', 
    'project-coordinator'
  ];
  
  for (const agentId of testAgents) {
    try {
      const agent = await AgentRegistry.getAgentInstance(agentId);
      if (agent) {
        console.log(`✅ ${agentId}: SUCCESS - ${agent.name} (actual ID: ${agent.id})`);
      } else {
        console.log(`❌ ${agentId}: FAILED - Agent not found`);
      }
    } catch (error) {
      console.log(`❌ ${agentId}: ERROR - ${error.message}`);
    }
  }
}

testAgentIds().catch(console.error);
