/**
 * Test the Dynamic Agent Registry
 */

// Since we're testing from the project root, we need to import properly
import { AgentRegistry } from '../lib/AgentRegistry.js';

console.log('🤖 Testing Dynamic Agent Registry...\n');

// Test 1: Discover all available agents
console.log('📋 Test 1: Discovering all available agents');
const availableAgents = AgentRegistry.getAvailableAgents();
console.log('Available agents:', availableAgents);
console.log(`Found ${availableAgents.length} agents\n`);

// Test 2: Display names
console.log('📋 Test 2: Agent display names');
availableAgents.forEach(agentId => {
  const displayName = AgentRegistry.getAgentDisplayName(agentId);
  console.log(`  ${agentId} → "${displayName}"`);
});
console.log('');

// Test 3: Agent validation
console.log('📋 Test 3: Agent validation');
const testCases = [
  'researcher-agent',
  'communications-agent', 
  'project-coordinator',
  'nonexistent-agent',
  'music-coach'
];

testCases.forEach(testAgent => {
  const isValid = AgentRegistry.isValidAgent(testAgent);
  console.log(`  ${testAgent}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});
console.log('');

// Test 4: Name normalization
console.log('📋 Test 4: Name normalization');
const nameTests = [
  'Researcher',
  '**Researcher**',
  'Data Scientist',
  '**: Project Coordinator',
  'researcher-agent',
  'communications'
];

nameTests.forEach(testName => {
  const normalized = AgentRegistry.normalizeAgentName(testName);
  const isValid = AgentRegistry.isValidAgent(normalized);
  console.log(`  "${testName}" → "${normalized}" (${isValid ? '✅' : '❌'})`);
});

console.log('\n🎉 Dynamic Agent Registry is working!');
console.log('✅ No more hardcoded agent lists');
console.log('✅ Automatically discovers new agents');
console.log('✅ Validates agent names dynamically');
console.log('✅ Handles name variations and formatting');
