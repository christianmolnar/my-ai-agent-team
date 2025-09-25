// Test User Experience Flow
import { MasterOrchestratorAgent } from './agents/master-orchestrator.js';

async function testUserExperience() {
  console.log('🧪 Testing User Experience Flow');
  console.log('================================');
  
  // Simulate a user request
  const userRequest = "Create a simple React component for a user profile card";
  console.log(`\n👤 User Request: "${userRequest}"`);
  
  // Test Master Orchestrator response
  console.log('\n🎯 Master Orchestrator Processing...');
  
  try {
    const orchestrator = new MasterOrchestratorAgent();
    
    // Test task creation - use the correct task type
    const task = {
      type: 'orchestrate',
      payload: {
        userRequest: userRequest,
        complexity: 'simple',
        priority: 'normal'
      }
    };
    
    console.log('📋 Creating execution plan...');
    const result = await orchestrator.handleTask(task);
    
    if (result.success) {
      console.log('✅ Orchestration Result:');
      console.log('-------------------');
      console.log(result.result);
    } else {
      console.log('❌ Orchestration Failed:');
      console.log('Error:', result.error);
      
      // Analyze the error to show user what they need to do
      if (result.error?.includes('No API keys configured')) {
        console.log('\n🔧 Next Steps for User:');
        console.log('1. Edit .env file and add API keys');
        console.log('2. Run: npm run test:config');
        console.log('3. Try your request again');
        console.log('4. See SETUP-API-KEYS.md for detailed instructions');
      }
    }
    
  } catch (error) {
    console.log('❌ System Error:', error.message);
  }
  
  console.log('\n🎯 User Experience Test Complete');
}

testUserExperience().catch(console.error);
