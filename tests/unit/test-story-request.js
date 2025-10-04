/**
 * Test Story Request - Debug the orchestration flow issue
 */

const testStoryRequest = async () => {
  try {
    console.log('🧪 Testing climate fiction story request after fix...');
    
    const requestBody = {
      message: "Create a 5 page, 4 chapter, fictional story about climate change, set in the 2060's with dystopian tone, general fiction readers, sea level rise and extreme weather, impacting society, and technology coming to the rescue, focus on global events and solutions, generate a word document, with maps and images.",
      conversationHistory: []
    };

    console.log('📤 Sending story request to API...');
    const response = await fetch('http://localhost:3001/api/personal-assistant', {
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
    
    // Check the key fields
    console.log('\n🔍 Analyzing response...');
    console.log('Response type:', result.conversationType);
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('Response length:', result.response?.length || 0, 'characters');
      console.log('Involved agents:', result.involvedAgents || 'None');
      console.log('Deliverables:', result.deliverables || 'None');
      
      // Check if it's actually generating fiction
      if (result.response) {
        const response_lower = result.response.toLowerCase();
        console.log('\n📝 Content Analysis:');
        console.log('Contains "chapter":', response_lower.includes('chapter'));
        console.log('Contains "story":', response_lower.includes('story'));
        console.log('Contains "fiction":', response_lower.includes('fiction'));
        console.log('Contains "climate":', response_lower.includes('climate'));
        console.log('Contains "2060":', response_lower.includes('2060'));
        
        console.log('\n📄 Response Preview (first 500 chars):');
        console.log(result.response.substring(0, 500) + '...');
      }
      
      console.log('\n✅ Test completed successfully');
      
    } else {
      console.log('❌ Request failed:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
};

// Run the test
testStoryRequest();
