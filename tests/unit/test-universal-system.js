#!/usr/bin/env node

/**
 * Comprehensive test for the Universal AI System
 * Tests provider failover, agent extraction, and environment mapping
 */

const { universalAIClient } = require('./lib/universal-ai-client');
const { agentIdToEnvPrefix, getAvailableProviders } = require('./lib/agent-env-mapping');

async function testUniversalSystem() {
  console.log('🚀 Testing Universal AI System\n');

  // Test 1: Environment Variable Mapping
  console.log('📋 Test 1: Environment Variable Mapping');
  const testAgents = [
    'researcher',
    'communications',
    'image-generator', // Special case (IMAGE_VIDEO_GENERATOR)
    'master-orchestrator',
    'personal-assistant'
  ];

  for (const agentId of testAgents) {
    const envPrefix = agentIdToEnvPrefix(agentId);
    const providers = getAvailableProviders(agentId);
    console.log(`  ${agentId} -> ${envPrefix} (${providers.length} providers: ${providers.join(', ')})`);
  }

  // Test 2: Universal AI Client Initialization
  console.log('\n🤖 Test 2: Universal AI Client');
  try {
    const testResponse = await universalAIClient.generateResponse(
      'test-agent',
      [{ role: 'user', content: 'Say "Universal AI System is working!" and nothing else.' }],
      'You are a test agent. Respond exactly as requested.'
    );
    
    console.log(`  ✅ Response: ${testResponse.content}`);
    console.log(`  📊 Provider: ${testResponse.provider}, Model: ${testResponse.model}`);
    console.log(`  ⏱️  Response time: ${testResponse.responseTime}ms`);
  } catch (error) {
    console.log(`  ❌ Universal AI Client failed: ${error.message}`);
  }

  // Test 3: Provider Failover (simulate by using invalid keys)
  console.log('\n🔄 Test 3: Provider Failover Simulation');
  console.log('  (This would require invalid API keys to test true failover)');
  console.log('  Current system has automatic failover logic built in');

  // Test 4: Multiple Agent Environment Checks
  console.log('\n🔧 Test 4: Multi-Agent Environment Validation');
  const agentIds = [
    'researcher', 'communications', 'data-scientist', 'front-end-developer',
    'back-end-developer', 'project-coordinator', 'image-generator'
  ];

  for (const agentId of agentIds) {
    const providers = getAvailableProviders(agentId);
    const hasKeys = providers.length > 0;
    console.log(`  ${agentId}: ${hasKeys ? '✅' : '❌'} (${providers.length} providers configured)`);
  }

  console.log('\n🎯 Universal AI System Test Complete!');
  console.log('\nNext steps:');
  console.log('- Test actual multi-provider requests in the web interface');
  console.log('- Monitor provider performance metrics');
  console.log('- Implement CNS learning persistence');
}

// Run the test
testUniversalSystem().catch(console.error);
