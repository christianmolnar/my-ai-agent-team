#!/usr/bin/env node

/**
 * Test Claude Fabrication Prevention via API
 * 
 * This script tests the fixes to prevent Claude from fabricating agent coordination
 */

async function testFabricationPrevention() {
  console.log('🧪 Testing Claude Fabrication Prevention via API');
  console.log('=' .repeat(60));

  try {
    // Test case: Request that should trigger intelligent task type selection
    const testRequest = "What agents are available on the team?";
    
    console.log('🔍 Test Request:', testRequest);
    console.log('\n📋 Expected Behavior:');
    console.log('- Should use "get-agent-capabilities" task type');
    console.log('- Should NOT fabricate agent responses');
    console.log('- Should report only actual agent execution');
    
    console.log('\n🚀 Executing test via API...\n');
    
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3001/api/personal-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testRequest,
        userId: 'test-user'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    const executionTime = Date.now() - startTime;
    
    console.log('✅ Response received in', executionTime, 'ms');
    console.log('\n📄 Response Analysis:');
    console.log('- Success:', result.success);
    console.log('- Conversation Type:', result.data?.conversationType);
    console.log('- Involved Agents:', result.data?.involvedAgents?.length || 0);
    console.log('- Execution Time:', result.data?.executionTime);
    
    console.log('\n💬 Final Response Preview:');
    const preview = result.data?.response?.substring(0, 300) + '...';
    console.log(preview);
    
    // Analysis: Check for fabrication indicators
    console.log('\n🕵️ Fabrication Analysis:');
    const fullResponse = result.data?.response || '';
    
    // Check if response claims coordination with specific agents
    const agentMentions = [
      'communications agent', 'performance expert', 'availability expert',
      'research agent', 'product manager', 'security expert'
    ];
    
    let suspiciousClaims = [];
    agentMentions.forEach(agent => {
      if (fullResponse.toLowerCase().includes(agent) && 
          (fullResponse.toLowerCase().includes('coordinated with') ||
          fullResponse.toLowerCase().includes('working with') ||
          fullResponse.toLowerCase().includes('collaborated with'))) {
        suspiciousClaims.push(agent);
      }
    });
    
    if (suspiciousClaims.length > 0) {
      console.log('⚠️  Potential fabrication detected:');
      suspiciousClaims.forEach(claim => console.log(`  - Claims about: ${claim}`));
    } else {
      console.log('✅ No obvious fabrication detected');
    }
    
    // Check actual vs claimed execution
    const actualAgents = result.data?.involvedAgents || [];
    console.log('\n📊 Execution Verification:');
    console.log('- Agents that actually executed:', actualAgents.length);
    console.log('- Agent list:', actualAgents);
    
    return {
      success: result.success,
      executionTime,
      actualAgents: actualAgents.length,
      suspiciousClaims: suspiciousClaims.length,
      conversationType: result.data?.conversationType,
      fullResponse
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test complex multi-deliverable scenario
async function testComplexDeliverableScenario() {
  console.log('\n\n🧪 Testing Complex Multi-Deliverable Scenario via API');
  console.log('=' .repeat(60));

  try {
    // User's complex scenario: Word doc, PowerPoint, Excel
    const complexRequest = "I need 3 documents: a Word research paper on AI trends, a PowerPoint presentation summarizing the key points, and an Excel spreadsheet with market data analysis.";
    
    console.log('🔍 Complex Test Request:', complexRequest);
    console.log('\n📋 Key Questions:');
    console.log('- Can the team actually deliver all 3 documents?');
    console.log('- Or will Claude fabricate deliverables?');
    console.log('- Which agents actually execute vs claimed execution?');
    
    console.log('\n🚀 Executing complex test via API...\n');
    
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3001/api/personal-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: complexRequest,
        userId: 'test-user'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    const executionTime = Date.now() - startTime;
    
    console.log('✅ Complex response received in', executionTime, 'ms');
    console.log('\n📄 Complex Response Analysis:');
    console.log('- Success:', result.success);
    console.log('- Conversation Type:', result.data?.conversationType);
    console.log('- Involved Agents:', result.data?.involvedAgents?.length || 0);
    console.log('- Claimed Deliverables:', result.data?.deliverables?.length || 0);
    
    const fullResponse = result.data?.response || '';
    
    // Check for specific deliverable claims
    const deliverableClaims = {
      wordDoc: fullResponse.toLowerCase().includes('word') && fullResponse.toLowerCase().includes('research paper'),
      powerpoint: fullResponse.toLowerCase().includes('powerpoint') || fullResponse.toLowerCase().includes('presentation'),
      excel: fullResponse.toLowerCase().includes('excel') || fullResponse.toLowerCase().includes('spreadsheet')
    };
    
    console.log('\n📊 Deliverable Claims Analysis:');
    Object.entries(deliverableClaims).forEach(([type, claimed]) => {
      console.log(`- ${type}: ${claimed ? '✅ Claimed' : '❌ Not claimed'}`);
    });
    
    // Check actual execution vs claims
    const actualAgents = result.data?.involvedAgents || [];
    console.log('\n🔍 Execution Reality Check:');
    console.log('- Agents that actually executed:', actualAgents);
    console.log('- Total execution count:', actualAgents.length);
    
    if (actualAgents.length < 3 && Object.values(deliverableClaims).some(claimed => claimed)) {
      console.log('⚠️  FABRICATION DETECTED: Claims about deliverables but insufficient agent execution');
    }
    
    return {
      success: result.success,
      executionTime,
      actualAgents: actualAgents.length,
      deliverableClaims,
      conversationType: result.data?.conversationType,
      fullResponse
    };
    
  } catch (error) {
    console.error('❌ Complex test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function runFabricationTests() {
  console.log('🚀 Starting Fabrication Prevention Test Suite');
  console.log('='.repeat(60));
  
  // First, check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3001/api/api-status-summary');
    if (!healthCheck.ok) {
      throw new Error('Server not responding');
    }
    console.log('✅ Server is running and responsive\n');
  } catch (error) {
    console.error('❌ Server is not running or not responsive');
    console.error('Please start the development server with: npm run dev');
    process.exit(1);
  }
  
  const test1 = await testFabricationPrevention();
  const test2 = await testComplexDeliverableScenario();
  
  console.log('\n\n📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log('Basic Agent Query Test:');
  console.log(`  - Success: ${test1.success}`);
  console.log(`  - Execution Time: ${test1.executionTime}ms`);
  console.log(`  - Actual Agents: ${test1.actualAgents}`);
  console.log(`  - Suspicious Claims: ${test1.suspiciousClaims}`);
  console.log(`  - Conversation Type: ${test1.conversationType}`);
  
  console.log('\nComplex Deliverable Test:');
  console.log(`  - Success: ${test2.success}`);
  console.log(`  - Execution Time: ${test2.executionTime}ms`);
  console.log(`  - Actual Agents: ${test2.actualAgents}`);
  console.log(`  - Conversation Type: ${test2.conversationType}`);
  
  const overallSuccess = test1.success && test2.success && 
                        test1.suspiciousClaims === 0;
  
  console.log(`\n🎯 Overall Assessment: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!overallSuccess) {
    console.log('\n🔧 Issues to Address:');
    if (test1.suspiciousClaims > 0) console.log('- Claude fabrication still occurring');
    if (!test1.success || !test2.success) console.log('- Basic execution failures');
  }
  
  // Log some response content for manual inspection
  if (test1.fullResponse) {
    console.log('\n📝 Sample Response Content (First 500 chars):');
    console.log(test1.fullResponse.substring(0, 500) + '...');
  }
}

if (require.main === module) {
  runFabricationTests().catch(console.error);
}

module.exports = { testFabricationPrevention, testComplexDeliverableScenario, runFabricationTests };
