#!/usr/bin/env node

// Test script to verify Word document generation for MLK research paper
const { ResearcherAgent } = require('./agents/researcher.ts');

async function testWordGeneration() {
  console.log('🧪 Testing Word document generation...');
  
  const researcher = new ResearcherAgent();
  
  // Use the exact same request from the session log
  const userRequest = "This is for graduate level audience. Let's make it 5 pages. I'd like to focus on MLK's oration and speaking power, the way he conveyed his ideas and how his delivery mobilized the people.  Compare him to modern activists like Greta Thunberg and Charlie Kirk, who was assassinated yesterday.  https://apnews.com/article/charlie-kirk-shooter-search-utah-governor-21ba12bbf01579fd2fbcdbe1da03dae5";
  
  try {
    // Test if this is now recognized as a research paper request
    console.log('📋 Testing pattern recognition...');
    const isResearchPaper = researcher.isResearchPaperRequest(userRequest);
    console.log(`✅ Research paper request detected: ${isResearchPaper}`);
    
    if (isResearchPaper) {
      console.log('📄 Generating research paper with Word document...');
      const result = await researcher.processTask({
        id: 'test-word-gen',
        type: 'research',
        priority: 'high',
        description: userRequest,
        userRequest: userRequest,
        requestId: 'test-123'
      });
      
      console.log('✅ Result:', result.output.substring(0, 500) + '...');
    } else {
      console.log('❌ Request not recognized as research paper request');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWordGeneration().catch(console.error);
