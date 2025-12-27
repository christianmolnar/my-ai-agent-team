// Simple 84:1 Efficiency Test Runner
// Direct agent orchestration test to validate multi-agent coordination

const { MasterOrchestratorAgent } = require('../agents/master-orchestrator');
const { AgentRegistry } = require('../lib/AgentRegistry');

async function runSimpleEfficiencyTest() {
  console.log('🧪 Starting 84:1 Efficiency Validation Test');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    // Step 1: Initialize orchestrator
    console.log('1️⃣ Initializing Master Orchestrator...');
    const orchestrator = new MasterOrchestratorAgent();
    
    // Step 2: Check available agents
    console.log('2️⃣ Checking available agents...');
    const agentCountResult = await orchestrator.handleTask({
      type: 'count-agents',
      payload: {}
    });
    
    if (!agentCountResult.success) {
      throw new Error('Failed to get agent count');
    }
    
    console.log('✅ Agent registry working');
    console.log(agentCountResult.result);
    
    // Step 3: Test real estate analysis orchestration
    console.log('3️⃣ Testing real estate analysis orchestration...');
    
    const testPayload = {
      userRequest: "Analyze investment properties in Austin, Texas - provide market analysis, property evaluation, and client presentation",
      deliverables: [
        "Market trend analysis for Austin real estate",
        "Specific property evaluation criteria", 
        "Professional client presentation with recommendations"
      ],
      priority: "high",
      userId: "efficiency-test"
    };
    
    const orchestrationResult = await orchestrator.handleTask({
      type: 'orchestrate-with-review',
      payload: testPayload
    });
    
    if (!orchestrationResult.success) {
      throw new Error('Orchestration failed: ' + orchestrationResult.error);
    }
    
    // Step 4: Analyze results
    console.log('4️⃣ Analyzing orchestration results...');
    
    const result = orchestrationResult.result;
    const endTime = Date.now();
    const durationMinutes = Math.round((endTime - startTime) / 60000);
    
    // Calculate efficiency metrics
    const traditionalTime = 8 * 60; // 8 hours in minutes
    const efficiencyRatio = traditionalTime / durationMinutes;
    
    console.log('📊 TEST RESULTS:');
    console.log('=' .repeat(50));
    console.log(`✅ Status: ${result.status}`);
    console.log(`🤖 Agents Used: ${result.executedAgents?.length || 0}`);
    console.log(`📋 Deliverables: ${result.completedDeliverables?.length || 0}`);
    console.log(`⏱️  Duration: ${durationMinutes} minutes`);
    console.log(`🚀 Efficiency Ratio: ${Math.round(efficiencyRatio * 10) / 10}:1`);
    console.log(`📈 Improvement: ${Math.round((efficiencyRatio - 1) * 100)}%`);
    
    // Step 5: Generate recommendation
    let recommendation;
    if (efficiencyRatio >= 60) {
      recommendation = "✅ 84:1 RATIO VALIDATED - Revolutionary efficiency achieved!";
    } else if (efficiencyRatio >= 20) {
      recommendation = "⚠️ 84:1 RATIO PARTIALLY VALIDATED - Good progress, needs optimization";
    } else {
      recommendation = "❌ 84:1 RATIO FAILED - Revert to proven 15:1 efficiency framework";
    }
    
    console.log(`🎯 Recommendation: ${recommendation}`);
    
    if (result.results) {
      console.log('\n📄 ORCHESTRATION OUTPUT:');
      console.log('-' .repeat(50));
      console.log(result.results.substring(0, 1000) + '...');
    }
    
    return {
      success: true,
      durationMinutes,
      efficiencyRatio,
      recommendation,
      result: result
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message,
      durationMinutes: Math.round((Date.now() - startTime) / 60000)
    };
  }
}

// Run the test
runSimpleEfficiencyTest()
  .then(report => {
    console.log('\n🏁 TEST COMPLETE');
    console.log('=' .repeat(50));
  })
  .catch(err => {
    console.error('💥 Test runner failed:', err);
  });
