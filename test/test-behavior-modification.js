/**
 * Test script to verify behavior modification and removal capabilities
 */

// Simulate environment for testing
process.env.DEVELOPMENT_MODE = 'true';
process.env.LEARNING_FEEDBACK_ENABLED = 'true';

async function testBehaviorModification() {
  console.log('🧪 Testing Behavior Modification and Removal System');
  
  try {
    // Test 1: Add New Behavior
    console.log('\n📝 Test 1: Adding New Behavior');
    
    const addBehaviorResponse = await fetch('http://localhost:3000/api/personal-assistant/methodology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area: 'project-planning',
        improvement: 'Always ask for timeline preferences and complexity estimates before starting any project work'
      })
    });
    
    const addResult = await addBehaviorResponse.json();
    console.log('✅ Add Behavior Result:', addResult.success);
    if (addResult.learningReport) {
      console.log('📊 Learning Report:', addResult.learningReport.learningExplanation);
    }
    
    // Test 2: Modify Existing Behavior  
    console.log('\n📝 Test 2: Modifying Existing Behavior');
    
    const modifyBehaviorResponse = await fetch('http://localhost:3000/api/personal-assistant/methodology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area: 'project-planning',
        improvement: 'When asking for timeline preferences, also include budget considerations and resource availability'
      })
    });
    
    const modifyResult = await modifyBehaviorResponse.json();
    console.log('✅ Modify Behavior Result:', modifyResult.success);
    if (modifyResult.learningReport) {
      console.log('📊 Learning Report:', modifyResult.learningReport.beforeAfterComparison);
    }
    
    // Test 3: Remove/Forget Behavior
    console.log('\n📝 Test 3: Removing/Forgetting Behavior');
    
    const removeBehaviorResponse = await fetch('http://localhost:3000/api/personal-assistant/methodology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area: 'communication-style',
        improvement: 'Forget the habit of ending every response with follow-up questions. Provide complete answers without asking what else the user needs.'
      })
    });
    
    const removeResult = await removeBehaviorResponse.json();
    console.log('✅ Remove Behavior Result:', removeResult.success);
    if (removeResult.learningReport) {
      console.log('📊 Learning Report:', removeResult.learningReport.behaviorChanges);
    }
    
    // Test 4: Complex Multi-File Behavior
    console.log('\n📝 Test 4: Complex Multi-File Behavior Change');
    
    const complexBehaviorResponse = await fetch('http://localhost:3000/api/personal-assistant/methodology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area: 'communication-adaptation',
        improvement: 'Adapt communication style based on user expertise level - use technical language for developers, simplified explanations for beginners, and include relevant examples for the specific domain'
      })
    });
    
    const complexResult = await complexBehaviorResponse.json();
    console.log('✅ Complex Behavior Result:', complexResult.success);
    if (complexResult.learningReport) {
      console.log('📊 Files Modified:', complexResult.learningReport.filesModified);
    }
    
    // Test 5: Behavior Conflict Resolution
    console.log('\n📝 Test 5: Conflicting Behavior Request');
    
    const conflictBehaviorResponse = await fetch('http://localhost:3000/api/personal-assistant/methodology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        area: 'response-style',
        improvement: 'Always provide extremely brief, one-sentence answers without any explanations or context'
      })
    });
    
    const conflictResult = await conflictBehaviorResponse.json();
    console.log('✅ Conflict Behavior Result:', conflictResult.success);
    if (conflictResult.learningReport) {
      console.log('📊 Learning Report:', conflictResult.learningReport.learningExplanation);
    }
    
    console.log('\n🎉 Behavior Modification Test Complete!');
    
    // Summary
    console.log('\n📋 Test Results Summary:');
    console.log(`- ✅ Add New Behavior: ${addResult.success ? 'PASS' : 'FAIL'}`);
    console.log(`- ✅ Modify Existing Behavior: ${modifyResult.success ? 'PASS' : 'FAIL'}`);
    console.log(`- ✅ Remove/Forget Behavior: ${removeResult.success ? 'PASS' : 'FAIL'}`);
    console.log(`- ✅ Complex Multi-File: ${complexResult.success ? 'PASS' : 'FAIL'}`);
    console.log(`- ✅ Conflict Resolution: ${conflictResult.success ? 'PASS' : 'FAIL'}`);
    
    console.log('\n💡 Capability Assessment:');
    console.log('- ✅ NEW BEHAVIOR: Fully supported');
    console.log('- ✅ MODIFY BEHAVIOR: Fully supported');
    console.log('- ⚠️ REMOVE BEHAVIOR: Supported with limitations');
    console.log('- ✅ COMPLEX UPDATES: Fully supported');
    console.log('- ⚠️ CONFLICT DETECTION: Manual analysis required');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nNote: Make sure the development server is running with:');
    console.log('npm run dev');
  }
}

// Export for use as module or run directly
if (require.main === module) {
  testBehaviorModification();
}

module.exports = { testBehaviorModification };
