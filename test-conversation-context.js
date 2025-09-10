#!/usr/bin/env node

/**
 * Test script to verify conversation context fix
 * This simulates the exact scenario: Van Gogh document request -> plan response -> "great plan, let's do it"
 */

console.log('🧪 Testing Conversation Context Fix\n');
console.log('=================================\n');

async function testConversationContext() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('📝 Step 1: Initial request for Van Gogh document...');
  
  // Step 1: Initial request (simulating user's Van Gogh request)
  const conversationHistory = [
    { role: 'assistant', content: 'Hello! I\'m your Personal Assistant. I can help coordinate projects across your entire AI agent team. What would you like to work on today?' }
  ];
  
  const response1 = await fetch(`${baseUrl}/api/personal-assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: 'Could you put together a word document with some background on Vincent Van Gogh, and use the image generation capabilities to insert a van gogh style painting picture?',
      conversationHistory: conversationHistory
    })
  });
  
  const data1 = await response1.json();
  console.log('✅ Response 1 received:', data1.success ? 'SUCCESS' : 'FAILED');
  console.log('📋 Response preview:', data1.response?.substring(0, 200) + '...\n');
  
  // Update conversation history with the response
  conversationHistory.push({ 
    role: 'user', 
    content: 'Could you put together a word document with some background on Vincent Van Gogh, and use the image generation capabilities to insert a van gogh style painting picture?' 
  });
  conversationHistory.push({ 
    role: 'assistant', 
    content: data1.response 
  });
  
  console.log('📝 Step 2: Follow-up - "This is a great plan. Let\'s do it!"...');
  
  // Step 2: Follow-up (simulating user's approval)
  const response2 = await fetch(`${baseUrl}/api/personal-assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: 'This is a great plan. Let\'s do it!',
      conversationHistory: conversationHistory
    })
  });
  
  const data2 = await response2.json();
  console.log('✅ Response 2 received:', data2.success ? 'SUCCESS' : 'FAILED');
  console.log('📋 Response preview:', data2.response?.substring(0, 300) + '...\n');
  
  // Analyze the results
  console.log('🔍 ANALYSIS:');
  
  const lostContext = data2.response?.includes('lacks prior context') || 
                     data2.response?.includes('don\'t have access to the plan') ||
                     data2.response?.includes('Which specific plan');
  
  if (lostContext) {
    console.log('❌ CONTEXT STILL LOST: The assistant doesn\'t remember the previous conversation');
    console.log('🔧 Additional debugging needed...');
    
    console.log('\n📊 Conversation History Sent:');
    console.log(`   - Total messages: ${conversationHistory.length}`);
    console.log(`   - Last user message: "${conversationHistory[conversationHistory.length-2]?.content?.substring(0, 50)}..."`);
    console.log(`   - Last assistant message: "${conversationHistory[conversationHistory.length-1]?.content?.substring(0, 50)}..."`);
    
  } else {
    console.log('✅ CONTEXT PRESERVED: The assistant remembers the previous conversation!');
    console.log('🎉 Fix successful - conversation continuity working!');
  }
  
  return !lostContext;
}

async function runTest() {
  console.log('🚀 Starting Conversation Context Test...\n');
  
  try {
    const success = await testConversationContext();
    
    console.log('\n' + '='.repeat(50));
    console.log(success ? '🎉 TEST PASSED: Context fix working!' : '❌ TEST FAILED: Context still lost');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
    console.log('\n🔍 Possible issues:');
    console.log('   - Development server not running on localhost:3002');
    console.log('   - API endpoint not responding');
    console.log('   - Network connectivity issue');
  }
}

runTest();
