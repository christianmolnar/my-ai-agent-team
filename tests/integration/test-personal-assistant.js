/**
 * Quick test for Personal Assistant natural conversation capability
 */

import { PersonalAssistantAgent } from '../../agents/personal-assistant';

async function testPersonalAssistantConversation() {
  console.log('🤖 Testing Personal Assistant Natural Conversation');
  console.log('=====================================\n');

  const assistant = new PersonalAssistantAgent();
  
  // Test natural conversations
  const testMessages = [
    "Are you awake, Personal Assistant?",
    "What can you do for me today?",
    "Tell me about your capabilities",
    "Can you help me with a simple question?",
    "How are you different from a regular chatbot?"
  ];

  for (const message of testMessages) {
    console.log(`\n👤 User: "${message}"`);
    console.log('🤔 Thinking...');
    
    try {
      const response = await assistant.handleUserConversation(message);
      
      console.log(`🤖 Personal Assistant [${response.conversationType}]:`);
      console.log(response.response);
      console.log(`   ⚡ Response generated successfully`);
      
      if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
        console.log(`   💡 Follow-up suggestions:`);
        response.suggestedFollowUps.forEach(followUp => {
          console.log(`      - ${followUp}`);
        });
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(60));
  }
  
  console.log('\n✅ Personal Assistant Conversation Test Complete');
}

// Run the test
testPersonalAssistantConversation().catch(console.error);
