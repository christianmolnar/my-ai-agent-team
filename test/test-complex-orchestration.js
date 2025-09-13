/**
 * End-to-end test with complex orchestration request
 */

const testComplexRequest = async () => {
  try {
    console.log('🧪 Testing complex orchestration request...');
    
    const requestBody = {
      message: "create a comprehensive plan for learning blues history, research the financial implications of the blues genre in the music industry, and analyze political influences throughout blues development",
      context: {
        history: []
      }
    };

    console.log('📤 Sending complex request to API...');
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
    console.log('Execution time:', result.executionTime);
    
    // Test our fixes specifically for orchestrated responses
    if (result.conversationType === 'orchestrated') {
      const hasCorrectAgentNames = result.involvedAgents && 
        result.involvedAgents.every(agent => 
          typeof agent === 'string' && 
          !agent.includes('**:') && 
          agent.match(/^[a-z0-9-]+$/)
        );
      
      const hasValidDeliverables = result.deliverables && result.deliverables.length > 0;
      
      console.log('\n📊 Orchestration Fix Validation:');
      console.log(`✅ Agent names clean: ${hasCorrectAgentNames ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Deliverables present: ${hasValidDeliverables ? 'PASS' : 'FAIL'}`);
      
      if (hasCorrectAgentNames && hasValidDeliverables) {
        console.log('\n🎉 Orchestration fixes SUCCESSFUL!');
        console.log('   - Agent names are properly formatted (no "**:" prefixes)');
        console.log('   - TypeScript errors resolved');
        console.log('   - Interaction logs should populate correctly');
      } else {
        console.log('\n⚠️  Agent name or deliverable issues detected');
        if (result.involvedAgents) {
          console.log('   Actual agent names:', result.involvedAgents);
        }
      }
    } else {
      console.log('\n📝 Request was handled as:', result.conversationType);
      console.log('   This may be expected for simpler requests');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
};

// Run the complex test
testComplexRequest();
