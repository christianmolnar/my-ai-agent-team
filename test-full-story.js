/**
 * Test 5-Page Story Generation - Direct ResearcherAgent Test
 */

const testDirectStoryGeneration = async () => {
  try {
    console.log('🧪 Testing direct story generation with ResearcherAgent...');
    
    const requestBody = {
      message: "Create a 5-page, 4-chapter fictional story about climate change set in the 2060s. Dystopian tone, general fiction readers, sea level rise and extreme weather impacting society, technology coming to the rescue, focus on global events and solutions. Highlight Seattle, WA and Buenos Aires, Argentina. Include climate adaptation tech, ocean replenishment, no fishing zones. Personal journey of overcoming technical challenges, balanced between social and scientific focus, connect locations via travel, semi-optimistic tone. Generate a full Word document with complete chapters, extensive dialogue, rich character development, and detailed narrative scenes.",
      conversationHistory: []
    };

    console.log('📤 Sending story request to Personal Assistant API...');
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
    
    // Analyze the response
    console.log('\n🔍 Story Length Analysis:');
    console.log('Success:', result.success);
    console.log('Response type:', result.conversationType);
    
    if (result.success && result.response) {
      const responseLength = result.response.length;
      const wordCount = result.response.split(/\s+/).length;
      const estimatedPages = Math.ceil(wordCount / 250); // Rough estimate: 250 words per page
      
      console.log('📊 Content Metrics:');
      console.log('  Character count:', responseLength);
      console.log('  Word count:', wordCount);
      console.log('  Estimated pages:', estimatedPages);
      console.log('  Target was: 5 pages');
      
      // Check if it contains story elements
      const storyElements = {
        chapters: (result.response.match(/chapter/gi) || []).length,
        dialogue: (result.response.match(/"/g) || []).length / 2, // Rough dialogue count
        seattle: result.response.toLowerCase().includes('seattle'),
        buenosAires: result.response.toLowerCase().includes('buenos aires'),
        climateChange: result.response.toLowerCase().includes('climate'),
        technology: result.response.toLowerCase().includes('technology') || result.response.toLowerCase().includes('tech')
      };
      
      console.log('\n📝 Story Elements Found:');
      console.log('  Chapters mentioned:', storyElements.chapters);
      console.log('  Dialogue instances:', Math.floor(storyElements.dialogue));
      console.log('  Seattle mentioned:', storyElements.seattle);
      console.log('  Buenos Aires mentioned:', storyElements.buenosAires);
      console.log('  Climate content:', storyElements.climateChange);
      console.log('  Technology content:', storyElements.technology);
      
      console.log('\n📄 Story Preview (first 1000 chars):');
      console.log(result.response.substring(0, 1000) + '...\n');
      
      // Success criteria
      const meetsLength = estimatedPages >= 4; // At least close to 5 pages
      const hasStoryElements = storyElements.chapters >= 2 && storyElements.dialogue > 5;
      const hasRequiredLocations = storyElements.seattle && storyElements.buenosAires;
      
      console.log('\n✅ Success Criteria:');
      console.log('  Meets length requirement (4+ pages):', meetsLength ? '✅' : '❌');
      console.log('  Has story elements (chapters, dialogue):', hasStoryElements ? '✅' : '❌');
      console.log('  Includes required locations:', hasRequiredLocations ? '✅' : '❌');
      
      if (meetsLength && hasStoryElements && hasRequiredLocations) {
        console.log('\n🎉 SUCCESS: Story meets all requirements!');
      } else {
        console.log('\n⚠️  PARTIAL SUCCESS: Story needs improvement in some areas');
      }
      
    } else {
      console.log('❌ Request failed:', result.error || 'Unknown error');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
};

// Run the test
testDirectStoryGeneration();
