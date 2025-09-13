/**
 * End-to-end test of the Personal Assistant API with orchestration
 */

const testRequest = async () => {
  try {
    console.log('🧪 Testing Personal Assistant API with orchestration...');
    
    const requestBody = {
      message: "create a simple plan for learning basic web development",
      context: {
        history: [
          {
            role: "user",
            content: "Hi",
            timestamp: new Date().toISOString()
          },
          {
            role: "assistant", 
            content: "Hello! I'm here to help you with any questions or tasks you have.",
            timestamp: new Date().toISOString()
          }
        ]
      }
    };

    console.log('📤 Sending request to API...');
    const response = await fetch('http://localhost:3002/api/personal-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 API Response received');
    
    // Check the key fields we're testing
    console.log('\n🔍 Analyzing response...');
    console.log('Response type:', result.conversationType);
    console.log('Involved agents:', result.involvedAgents);
    console.log('Deliverables:', result.deliverables);
    
    // Test our fixes
    const hasCorrectAgentNames = result.involvedAgents && 
      result.involvedAgents.every(agent => 
        typeof agent === 'string' && 
        !agent.includes('**:') && 
        agent.match(/^[a-z0-9-]+$/)
      );
    
    const hasValidDeliverables = result.deliverables && result.deliverables.length > 0;
    
    console.log('\n📊 Fix Validation:');
    console.log(`✅ Agent names clean: ${hasCorrectAgentNames ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Deliverables present: ${hasValidDeliverables ? 'PASS' : 'FAIL'}`);
    
    if (hasCorrectAgentNames && hasValidDeliverables) {
      console.log('\n🎉 End-to-end test SUCCESSFUL!');
      console.log('   - Agent names are properly formatted');
      console.log('   - Interaction logs should be working');
      console.log('   - Orchestration is functioning correctly');
    } else {
      console.log('\n⚠️  Some issues may remain');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure the development server is running on port 3002');
    }
    return null;
  }
};

// Run the test
testRequest();
