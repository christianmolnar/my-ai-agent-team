// Quick test script to verify API connectivity
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

async function testAPIs() {
  try {
    console.log('🧪 Testing API connectivity...');
    
    // Test Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY
    });
    
    console.log('🤖 Testing Claude API...');
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 100,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: 'Say hello and confirm you are working.'
      }]
    });
    
    console.log('✅ Claude response:', claudeResponse.content[0].text);
    
    // Test OpenAI
    const openai = new OpenAI({
      apiKey: process.env.MASTER_ORCHESTRATOR_OPENAI_API_KEY
    });
    
    console.log('🤖 Testing OpenAI API...');
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 100,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: 'Say hello and confirm you are working.'
      }]
    });
    
    console.log('✅ OpenAI response:', openaiResponse.choices[0].message.content);
    
    console.log('🎉 Both APIs working correctly!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPIs();
