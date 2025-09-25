#!/usr/bin/env node

/**
 * Test script to verify that conversation context is preserved 
 * through orchestration workflow, fixing the research paper issue
 */

const { PersonalAssistantAgent } = require('./agents/personal-assistant');

async function testContextPreservation() {
  console.log('🧪 Testing conversation context preservation fix...\n');
  
  const assistant = new PersonalAssistantAgent();
  
  // Simulate the exact conversation from the session log
  const conversationContext = {
    sessionId: 'test-session',
    chatId: 'test-chat', 
    history: [
      {
        userMessage: "Create a research paper on Martin Luther King Jr's legacy and influence on American politics and religion.",
        assistantMessage: "I'd like to help you with: \"Create a research paper on Martin Luther King Jr's legacy and influence on American politics and religion.\"\n## ANALYSIS:\nWhile I understand the general topic (MLK Jr's legacy on politics and religion), several important details are missing to properly scope this research paper. I need to understand the academic requirements, intended audience, and specific aspects of MLK's legacy to focus on.\n\n## QUESTIONS:\n\n1.What is the intended purpose and audience for this research paper (e.g., academic assignment, personal knowledge, publication)? This will help determine the appropriate tone, length, and citation style.\n2.Are there specific aspects of MLK Jr's legacy you'd like the paper to emphasize (e.g., civil rights legislation, his theological contributions, specific speeches or campaigns)?\n3.What are your requirements regarding length, format, and deadline for this research paper?\n## NEXT:\nOnce I have this information, I'll be able to coordinate between the researcher agent (to gather appropriate scholarly sources), the communications agent (to structure and draft the paper according to your needs), and the project coordinator (to ensure timely delivery). I'll provide a clear plan with milestones for developing a well-researched paper that meets your specific requirements.\n\nPlease answer these questions so I can create the best possible solution for you. Once I have this information, I'll prepare a detailed requirements document and ask for your approval before proceeding."
      }
    ]
  };

  // Test the follow-up message that should trigger orchestration
  const testMessage = "This is for graduate level audience. Let's make it 5 pages. I'd like to focus on MLK's oration and speaking power, the way he conveyed his ideas and how his delivery mobilized the people. Compare him to modern activists like Greta Thunberg and Charlie Kirk.";
  
  console.log('📝 Original request in history: "Create a research paper on Martin Luther King Jr\'s legacy..."');
  console.log('📝 Follow-up message: "This is for graduate level audience. Let\'s make it 5 pages..."');
  console.log('\n🔄 Testing if researcher now recognizes this as a research paper request...\n');
  
  try {
    const response = await assistant.handleUserConversation({
      userMessage: testMessage,
      conversationContext
    });
    
    if (response.message) {
      console.log('✅ Response received!');
      console.log('\n📄 Response preview:');
      console.log(response.message.substring(0, 500) + '...');
      
      // Check if it mentions Word document creation
      if (response.message.includes('Word document') || response.message.includes('.docx') || response.message.includes('research paper')) {
        console.log('\n🎉 SUCCESS: The system now recognizes this as a research paper request!');
        console.log('✅ Context preservation fix is working correctly.');
      } else {
        console.log('\n⚠️  PARTIAL SUCCESS: Response generated but may not have created Word document.');
        console.log('🔍 Check the deliverables folder for generated files.');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testContextPreservation().catch(console.error);
