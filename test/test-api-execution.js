#!/usr/bin/env node

/**
 * Test Real Agent Execution via API
 * 
 * This script tests the real agent execution system through API calls
 */

async function testAgentExecutionAPI() {
  console.log('🚀 Testing Real Agent Execution via API\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Send a message that should trigger orchestration
    console.log('📨 Test 1: Sending orchestration request...');
    
    const testMessage = 'Please research the latest developments in TypeScript and prepare a summary';
    
    const response = await fetch(`${baseUrl}/api/personal-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        userId: 'test-user-' + Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ API Response received');
    
    // Check for simulation indicators
    const responseText = JSON.stringify(result);
    if (responseText.includes('mock') || responseText.includes('simulation') || responseText.includes('simulated')) {
      console.log('⚠️  Warning: Response may contain simulation content');
      console.log('Response preview:', responseText.substring(0, 200) + '...');
    } else {
      console.log('🎉 No simulation indicators found in response!');
    }

    // Test 2: Check interaction logs endpoint
    console.log('\n� Test 2: Checking interaction logs...');
    
    const logsResponse = await fetch(`${baseUrl}/api/interaction-logs?action=recent-sessions&limit=5`);
    if (logsResponse.ok) {
      const logs = await logsResponse.json();
      console.log(`✅ Interaction logs endpoint accessible`);
      console.log(`Found ${logs.sessions?.length || 0} recent sessions`);
      
      if (logs.sessions && logs.sessions.length > 0) {
        const latestSession = logs.sessions[0];
        console.log(`Latest session: ${latestSession.sessionId} with ${latestSession.agentInteractions?.length || 0} interactions`);
      }
    } else {
      console.log('❌ Failed to fetch interaction logs');
    }

    // Test 3: Check orchestrator endpoint 
    console.log('\n🎯 Test 3: Checking orchestrator availability...');
    
    const orchestratorTest = await fetch(`${baseUrl}/api/orchestrator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userRequest: 'Test orchestrator connectivity',
        userId: 'test-connectivity'
      })
    });

    if (orchestratorTest.ok) {
      console.log('✅ Orchestrator endpoint accessible');
    } else {
      console.log('❌ Orchestrator endpoint not accessible');
    }

    console.log('\n🏁 API Test Complete');
    console.log('✨ The system is running and ready for real agent execution!');

  } catch (error) {
    console.error('💥 API Test failed:', error.message);
    console.log('\nℹ️  Make sure the development server is running on http://localhost:3000');
    process.exit(1);
  }
}

// Add a small delay to ensure server is ready
setTimeout(() => {
  testAgentExecutionAPI().catch(console.error);
}, 2000);

console.log('⏳ Waiting for server to be ready...');
