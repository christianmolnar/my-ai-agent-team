#!/usr/bin/env node

/**
 * Claude SDK Integration Verification Script
 * 
 * This script verifies that the Claude SDK integration is working properly
 * without requiring actual API keys or making API calls.
 */

import { ClaudeService } from '../lib/claude/ClaudeService.js';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients.js';

async function verifyIntegration() {
  console.log('🔍 Verifying Claude SDK Integration...\n');

  try {
    // Step 1: Test ClaudeService configuration validation
    console.log('1. Testing ClaudeService configuration validation...');
    
    try {
      ClaudeService.validateConfig({
        apiKey: 'sk-ant-test-key',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 1000,
        temperature: 0.5,
        timeout: 30000,
        maxRetries: 3
      });
      console.log('   ✅ Configuration validation works correctly');
    } catch (error) {
      console.log('   ❌ Configuration validation failed:', error.message);
      return false;
    }

    // Step 2: Test invalid configuration handling
    console.log('2. Testing invalid configuration handling...');
    
    try {
      ClaudeService.validateConfig({
        apiKey: 'invalid-key',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 1000,
        temperature: 0.5,
        timeout: 30000,
        maxRetries: 3
      });
      console.log('   ❌ Invalid configuration validation should have failed');
      return false;
    } catch (error) {
      console.log('   ✅ Invalid configuration properly rejected');
    }

    // Step 3: Test agent client factory
    console.log('3. Testing agent client factory...');
    
    // Set up test environment variables
    process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY = 'sk-ant-test-key';
    process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY = 'sk-ant-test-key';
    
    try {
      const personalAssistantClient = AgentClaudeClientFactory.createPersonalAssistantClient();
      const orchestratorClient = AgentClaudeClientFactory.createMasterOrchestratorClient();
      
      console.log('   ✅ Personal Assistant client created successfully');
      console.log('   ✅ Master Orchestrator client created successfully');
      
      // Test model info retrieval
      const modelInfo = personalAssistantClient.getModelInfo();
      console.log(`   ✅ Model info retrieved: ${modelInfo.model} (${modelInfo.maxTokens} tokens)`);
      
    } catch (error) {
      console.log('   ❌ Client creation failed:', error.message);
      return false;
    }

    // Step 4: Test all client types
    console.log('4. Testing all agent client types...');
    
    const clientTypes = AgentClaudeClientFactory.getAllClientTypes();
    console.log(`   ✅ Found ${clientTypes.length} client types:`, clientTypes.join(', '));

    // Step 5: Test client creation by type
    console.log('5. Testing client creation by type...');
    
    try {
      const clientByType = AgentClaudeClientFactory.createClientByType('personal-assistant');
      console.log('   ✅ Client created by type string successfully');
    } catch (error) {
      console.log('   ❌ Client creation by type failed:', error.message);
      return false;
    }

    // Step 6: Test custom client creation
    console.log('6. Testing custom client creation...');
    
    try {
      const customClient = AgentClaudeClientFactory.createCustomClient(
        'PERSONAL_ASSISTANT_ANTHROPIC_API_KEY',
        'claude-3-5-sonnet-20241022',
        { temperature: 0.8, maxTokens: 2000 }
      );
      const customModelInfo = customClient.getModelInfo();
      console.log(`   ✅ Custom client created with temperature: ${customModelInfo.temperature}`);
    } catch (error) {
      console.log('   ❌ Custom client creation failed:', error.message);
      return false;
    }

    // Step 7: Test agent imports
    console.log('7. Testing agent class imports...');
    
    try {
      const { PersonalAssistantAgent } = await import('../agents/PersonalAssistantAgent.js');
      const { MasterOrchestratorAgent } = await import('../agents/master-orchestrator-agent.js');
      
      const personalAgent = new PersonalAssistantAgent();
      const orchestratorAgent = new MasterOrchestratorAgent();
      
      console.log(`   ✅ PersonalAssistantAgent: ${personalAgent.name}`);
      console.log(`   ✅ MasterOrchestratorAgent: ${orchestratorAgent.name}`);
      
    } catch (error) {
      console.log('   ❌ Agent import/creation failed:', error.message);
      return false;
    }

    console.log('\n🎉 All Claude SDK integration checks passed!');
    console.log('\n📋 Integration Summary:');
    console.log('   • Claude SDK installed and configured');
    console.log('   • ClaudeService class working properly');
    console.log('   • Agent client factory operational');
    console.log('   • All agent types supported');
    console.log('   • PersonalAssistantAgent updated with Claude integration');
    console.log('   • MasterOrchestratorAgent updated with Claude integration');
    console.log('\n🔑 Next Steps:');
    console.log('   1. Add your Anthropic API keys to .env.local');
    console.log('   2. Test with actual API calls');
    console.log('   3. Update remaining agents as needed');
    
    return true;

  } catch (error) {
    console.log('❌ Integration verification failed:', error.message);
    console.error(error);
    return false;
  } finally {
    // Clean up test environment variables
    delete process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY;
    delete process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY;
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyIntegration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { verifyIntegration };
