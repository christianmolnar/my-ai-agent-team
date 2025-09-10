/**
 * Test the Personal Assistant Agent formatting and clarifying questions functionality
 */

const { PersonalAssistantAgent } = require('./agents/PersonalAssistantAgent.ts');

async function testPersonalAssistant() {
  console.log('🧪 Testing Personal Assistant Agent with CNS Integration...\n');
  
  try {
    const agent = new PersonalAssistantAgent();
    
    // Wait a moment for initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📝 Test 1: Complex research question (should trigger clarifying questions)');
    const complexResponse = await agent.handleUserConversation(
      'Can you help me research Long Covid?'
    );
    
    console.log('Response:');
    console.log(complexResponse.response);
    console.log('\nResponse type:', complexResponse.conversationType);
    console.log('Suggested follow-ups:', complexResponse.suggestedFollowUps);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('📝 Test 2: Simple question (should provide direct formatted response)');
    const simpleResponse = await agent.handleUserConversation(
      'Hello, can you introduce yourself?'
    );
    
    console.log('Response:');
    console.log(simpleResponse.response);
    console.log('\nResponse type:', simpleResponse.conversationType);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testPersonalAssistant().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});
