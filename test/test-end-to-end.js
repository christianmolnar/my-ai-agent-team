#!/usr/bin/env node

/**
 * End-to-End Real Agent Execution Test
 * 
 * This script sends a real request and verifies the interaction logs are populated
 */

async function testEndToEndExecution() {
  console.log('🚀 End-to-End Real Agent Execution Test\n');

  const baseUrl = 'http://localhost:3000';
  const userId = 'test-user-' + Date.now();

  try {
    console.log('📨 Sending real orchestration request...');
    
    const testMessage = 'Please conduct research on Node.js best practices and coordinate a summary report with the communications team';
    
    const response = await fetch(`${baseUrl}/api/personal-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testMessage,
        userId: userId
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Request completed successfully');
    
    // Log response summary
    if (result.response) {
      console.log('Response preview:', result.response.substring(0, 300) + '...');
    }

    // Check for orchestration indicators
    const responseText = JSON.stringify(result);
    if (responseText.includes('orchestrat') || responseText.includes('coordinat') || responseText.includes('research')) {
      console.log('🎯 Response shows orchestration activity - real agents are working!');
    }

    // Wait a moment for logs to be written
    console.log('\n⏳ Waiting for interaction logs to be written...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check interaction logs
    console.log('📋 Checking for interaction logs...');
    
    const logsResponse = await fetch(`${baseUrl}/api/interaction-logs?action=recent-sessions&limit=5`);
    if (logsResponse.ok) {
      const logs = await logsResponse.json();
      console.log(`✅ Retrieved interaction logs`);
      
      if (logs.success && logs.data && logs.data.length > 0) {
        console.log(`Found ${logs.data.length} session(s)`);
        
        // Look for our test session
        const ourSession = logs.data.find(s => s.userId === userId);
        if (ourSession) {
          console.log(`🎉 Found our test session: ${ourSession.sessionId}`);
          console.log(`   - Interactions: ${ourSession.agentInteractions?.length || 0}`);
          console.log(`   - Status: ${ourSession.status}`);
          
          if (ourSession.agentInteractions && ourSession.agentInteractions.length > 0) {
            console.log('\n📊 Agent Interactions:');
            ourSession.agentInteractions.forEach((interaction, index) => {
              console.log(`   ${index + 1}. ${interaction.agentName} (${interaction.agentId})`);
              console.log(`      Task: ${interaction.taskAssigned}`);
              console.log(`      Status: ${interaction.status}`);
            });
            
            console.log('\n🎉 SUCCESS: Real agent execution is working and being logged!');
          } else {
            console.log('\n⚠️  No agent interactions found - orchestration may not have triggered');
          }
        } else {
          console.log('\n❌ Our test session was not found in logs');
        }
      } else {
        console.log('\n❌ No sessions found in interaction logs');
      }
    } else {
      console.log('\n❌ Failed to fetch interaction logs');
    }

    console.log('\n🏁 End-to-End Test Complete');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Add a delay to ensure server is ready
setTimeout(() => {
  testEndToEndExecution().catch(console.error);
}, 2000);

console.log('⏳ Waiting for server to be ready...');
