/**
 * Simple test to verify logging integration works in the Next.js environment
 */

// Test the integration by importing and using the interaction logger directly
import { interactionLogger } from '../lib/interaction-logger';

export default async function testLogging() {
  console.log('🧪 Testing logging integration in Next.js environment...\n');

  try {
    // Test 1: Start a chat session
    console.log('📝 Test 1: Starting chat session...');
    const sessionId = await interactionLogger.startChatSession(
      'test-user-nextjs',
      'Test request for logging integration in Next.js',
      'Testing the integration between logging systems in web environment'
    );
    console.log(`✅ Started session: ${sessionId}`);

    // Test 2: Log an agent interaction
    console.log('\n📝 Test 2: Logging agent interaction...');
    const interactionId = await interactionLogger.logAgentInteraction(
      sessionId,
      'communications-agent',
      'Communications Agent',
      'Test task assignment for logging integration in Next.js',
      'Test input for the agent in web environment',
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
      'Test output from the agent - successful completion in Next.js',
      true,
      1250
    );
    console.log('✅ Completed interaction');

    // Test 4: Complete the session
    console.log('\n📝 Test 4: Completing chat session...');
    await interactionLogger.completeChatSession(
      sessionId,
      'Test session completed successfully with integrated logging in Next.js',
      []
    );
    console.log('✅ Completed chat session');

    return {
      success: true,
      sessionId,
      message: 'Logging integration test completed successfully!'
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
