// Debug Image Generator Agent Issue
console.log('🔍 Debugging Image Generator Agent Issue');
console.log('=====================================');

import { AgentRegistry } from './lib/AgentRegistry.js';
import { ImageGeneratorAgent } from './agents/image-generator.js';

async function debugImageAgent() {
  console.log('\n1. Testing direct import:');
  const directAgent = new ImageGeneratorAgent();
  console.log(`   Direct agent ID: ${directAgent.id}`);
  console.log(`   Direct agent name: ${directAgent.name}`);

  console.log('\n2. Testing registry discovery:');
  const availableAgents = AgentRegistry.getAvailableAgents();
  console.log(`   Available agents: ${availableAgents.length}`);

  const imageAgents = availableAgents.filter(id => id.includes('image'));
  console.log(`   Image-related agents: ${imageAgents.join(', ')}`);

  console.log('\n3. Testing agent instantiation:');
  for (const agentId of imageAgents) {
    try {
      const agent = await AgentRegistry.getAgentInstance(agentId);
      if (agent) {
        console.log(`   ✅ ${agentId}: ${agent.name} (actual ID: ${agent.id})`);
      } else {
        console.log(`   ❌ ${agentId}: Failed to instantiate`);
      }
    } catch (error) {
      console.log(`   ❌ ${agentId}: Error - ${error.message}`);
    }
  }

  console.log('\n4. Testing specific lookups:');
  const testIds = ['image-generator', 'image-video-generator'];
  for (const testId of testIds) {
    try {
      console.log(`   Testing: ${testId}`);
      const agent = await AgentRegistry.getAgentInstance(testId);
      if (agent) {
        console.log(`   ✅ ${testId}: Found ${agent.name} (ID: ${agent.id})`);
      } else {
        console.log(`   ❌ ${testId}: Not found`);
      }
    } catch (error) {
      console.log(`   ❌ ${testId}: Error - ${error.message}`);
    }
  }

  console.log('\n🎯 Debug Complete');
}

debugImageAgent().catch(console.error);
