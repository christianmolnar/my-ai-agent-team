#!/usr/bin/env node

/**
 * Test script to verify story detection and generation in CommunicationsAgent
 */

const fs = require('fs');
const path = require('path');

async function testStoryDetection() {
  console.log('🧪 Testing Story Detection in CommunicationsAgent...\n');

  try {
    // Import the CommunicationsAgent
    const { CommunicationsAgent } = await import('./agents/communications.ts');
    
    const agent = new CommunicationsAgent();
    
    // Test if story requests are properly detected
    const storyRequest = "Create a 5 page, 4 chapter, fictional story about climate change, set in the 2060's";
    
    console.log(`📝 Testing request: "${storyRequest}"`);
    console.log('🔍 Checking if this triggers document generation...\n');
    
    // Execute the communication task
    const result = await agent.execute('communicate', { 
      userRequest: storyRequest,
      context: 'Testing story generation' 
    });
    
    console.log('✅ Result received:');
    console.log('📄 Length:', result.length, 'characters');
    console.log('📊 Word estimate:', Math.round(result.length / 5), 'words');
    console.log('📖 Page estimate:', Math.round(result.length / 1250), 'pages (assuming 250 words/page)');
    
    // Check if it contains actual story content vs communication strategy
    const hasActualContent = result.includes('Chapter') || result.includes('story') || result.length > 2000;
    const isStrategy = result.includes('COMMUNICATION APPROACH') || result.includes('COMMUNICATION ACTIVITIES');
    
    console.log('\n🔍 Content Analysis:');
    console.log('📚 Contains chapter/story content:', hasActualContent);
    console.log('📋 Is communication strategy:', isStrategy);
    
    if (hasActualContent && !isStrategy) {
      console.log('🎉 SUCCESS: Story generation is working!');
    } else if (isStrategy) {
      console.log('⚠️  ISSUE: Still generating communication strategy instead of story');
    } else {
      console.log('❓ UNCLEAR: Result doesn\'t clearly match expected patterns');
    }
    
    // Save result for inspection
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(__dirname, `test-story-output-${timestamp}.txt`);
    fs.writeFileSync(outputFile, result);
    console.log(`💾 Full result saved to: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testStoryDetection();
