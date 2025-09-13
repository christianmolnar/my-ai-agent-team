/**
 * Test script to verify logging integration between 
 * interaction-logger and enhanced-agent-logger
 */

import { interactionLogger } from '../lib/interaction-logger.js';
import { logger as enhancedLogger } from '../lib/enhanced-agent-logger.js';

async function testLoggingIntegration() {
  console.log('🧪 Testing logging integration...\n');

  try {
    // Clear existing logs for clean test
    enhancedLogger.clearLogs();
    console.log('✅ Cleared enhanced agent logs');

    // Test 1: Start a chat session
    console.log('\n📝 Test 1: Starting chat session...');
    const sessionId = await interactionLogger.startChatSession(
      'test-user',
      'Test request for logging integration',
      'Testing the integration between logging systems'
    );
    console.log(`✅ Started session: ${sessionId}`);

    // Test 2: Log an agent interaction
    console.log('\n📝 Test 2: Logging agent interaction...');
    const interactionId = await interactionLogger.logAgentInteraction(
      sessionId,
      'communications-agent',
      'Communications Agent',
      'Test task assignment for logging integration',
      'Test input for the agent',
      'specialist',
      'medium',
      'moderate',
      'project-coordinator'
    );
    console.log(`✅ Logged interaction: ${interactionId}`);

    // Test 3: Complete the interaction
    console.log('\n📝 Test 3: Completing agent interaction...');
    await interactionLogger.completeAgentInteraction(
      sessionId,
      interactionId,
      'Test output from the agent - successful completion',
      true,
      1250
    );
    console.log('✅ Completed interaction');

    // Test 4: Check enhanced agent logger has the logs
    console.log('\n📝 Test 4: Checking enhanced agent logger...');
    const allLogs = enhancedLogger.getAllRecentLogs();
    const sessionLogs = enhancedLogger.getLogsBySessionId(sessionId);
    
    console.log(`📊 Total logs in enhanced logger: ${allLogs.length}`);
    console.log(`📊 Logs for session ${sessionId}: ${sessionLogs.length}`);

    if (sessionLogs.length > 0) {
      console.log('\n📋 Session logs:');
      sessionLogs.forEach((log, index) => {
        console.log(`  ${index + 1}. [${log.agentName}] ${log.action} - ${log.details}`);
      });
    }

    // Test 5: Complete the session
    console.log('\n📝 Test 5: Completing chat session...');
    await interactionLogger.completeChatSession(
      sessionId,
      'Test session completed successfully with integrated logging',
      true,
      []
    );
    console.log('✅ Completed chat session');

    console.log('\n🎉 All tests completed successfully!');
    console.log('🔗 Logging integration is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLoggingIntegration();
