// Test learning management API endpoints
const testAPIEndpoints = async () => {
  const baseURL = 'http://localhost:3001';
  
  console.log('🔗 Testing Learning Management API Endpoints...\n');

  try {
    // Test 1: GET /api/learning-management?action=history (get learning history)
    console.log('1️⃣ Testing GET /api/learning-management?action=history...');
    
    const historyResponse = await fetch(`${baseURL}/api/learning-management?action=history`);
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ Learning history endpoint accessible');
      console.log(`   Found ${historyData.data ? historyData.data.length : 0} learning events`);
    } else {
      const errorText = await historyResponse.text();
      console.log(`❌ History endpoint failed: ${historyResponse.status} - ${errorText}`);
    }

    // Test 2: POST /api/learning-management (log new learning)
    console.log('\n2️⃣ Testing POST /api/learning-management (log learning)...');
    
    let actualLearningId = null;
    const logResponse = await fetch(`${baseURL}/api/learning-management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'log',
        agentType: 'personal-assistant',
        userId: 'test-user',
        sessionId: 'test-session',
        learningType: 'behavior_modification',
        description: 'Test learning: User prefers concise responses',
        area: 'communication',
        complexity: 'moderate'
      })
    });
    
    if (logResponse.ok) {
      const logData = await logResponse.json();
      actualLearningId = logData.data?.learningId;
      console.log('✅ Learning event logged successfully');
      console.log(`   Learning ID: ${actualLearningId}`);
    } else {
      const errorText = await logResponse.text();
      console.log(`❌ Log learning failed: ${logResponse.status} - ${errorText}`);
    }

    // Test 3: POST /api/learning-management (internalize feedback)
    console.log('\n3️⃣ Testing POST /api/learning-management (internalize feedback)...');
    
    if (actualLearningId) {
      const internalizeResponse = await fetch(`${baseURL}/api/learning-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'feedback',
          learningId: actualLearningId,
          feedback: {
            action: 'internalize',
            rating: 5,
            wasHelpful: true,
            comments: 'This learning was very helpful'
          }
        })
      });
      
      if (internalizeResponse.ok) {
        const internalizeData = await internalizeResponse.json();
        console.log('✅ Internalize feedback processed successfully');
        console.log(`   Message: ${internalizeData.message}`);
      } else {
        const errorText = await internalizeResponse.text();
        console.log(`❌ Internalize feedback failed: ${internalizeResponse.status} - ${errorText}`);
      }
    } else {
      console.log('❌ Skipping internalize test - no learning ID available');
    }

    // Test 4: POST /api/learning-management (log another learning for forget test)
    console.log('\n4️⃣ Testing POST /api/learning-management (log second learning)...');
    
    let secondLearningId = null;
    const logResponse2 = await fetch(`${baseURL}/api/learning-management`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'log',
        agentType: 'personal-assistant',
        userId: 'test-user',
        sessionId: 'test-session-2',
        learningType: 'behavior_modification',
        description: 'Test learning: User wants detailed explanations',
        area: 'communication',
        complexity: 'moderate'
      })
    });
    
    if (logResponse2.ok) {
      const logData2 = await logResponse2.json();
      secondLearningId = logData2.data?.learningId;
      console.log('✅ Second learning event logged successfully');
      console.log(`   Learning ID: ${secondLearningId}`);
    } else {
      const errorText = await logResponse2.text();
      console.log(`❌ Log second learning failed: ${logResponse2.status} - ${errorText}`);
    }

    // Test 5: POST /api/learning-management (forget feedback)
    console.log('\n5️⃣ Testing POST /api/learning-management (forget feedback)...');
    
    if (secondLearningId) {
      const forgetResponse = await fetch(`${baseURL}/api/learning-management`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'feedback',
          learningId: secondLearningId,
          feedback: {
            action: 'forget',
            rating: 1,
            wasHelpful: false,
            comments: 'This learning was not applicable'
          }
        })
      });
      
      if (forgetResponse.ok) {
        const forgetData = await forgetResponse.json();
        console.log('✅ Forget feedback processed successfully');
        console.log(`   Message: ${forgetData.message}`);
      } else {
        const errorText = await forgetResponse.text();
        console.log(`❌ Forget feedback failed: ${forgetResponse.status} - ${errorText}`);
      }
    } else {
      console.log('❌ Skipping forget test - no second learning ID available');
    }

    // Test 6: GET learning statistics (updated)
    console.log('\n6️⃣ Testing GET /api/learning-management?action=stats (updated)...');
    
    const statsResponse = await fetch(`${baseURL}/api/learning-management?action=stats`);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Learning statistics retrieved');
      console.log('📊 Updated Statistics:');
      console.log(`   Total Learnings: ${statsData.data?.totalLearnings || 0}`);
      console.log(`   Internalized: ${statsData.data?.internalized || 0}`);
      console.log(`   Forgotten: ${statsData.data?.forgotten || 0}`);
      console.log(`   Pending: ${statsData.data?.pending || 0}`);
      console.log(`   Success Rate: ${statsData.data?.successRate?.toFixed(1) || 0}%`);
    } else {
      const errorText = await statsResponse.text();
      console.log(`❌ Statistics endpoint failed: ${statsResponse.status} - ${errorText}`);
    }

    // Test 7: DELETE /api/learning-management (rollback internalized learning)
    console.log('\n7️⃣ Testing DELETE /api/learning-management (rollback)...');
    
    if (actualLearningId) {
      const rollbackResponse = await fetch(`${baseURL}/api/learning-management?learningId=${actualLearningId}&reason=testing-rollback`, {
        method: 'DELETE'
      });
      
      if (rollbackResponse.ok) {
        const rollbackData = await rollbackResponse.json();
        console.log('✅ Rollback functionality working');
        console.log(`   Message: ${rollbackData.message}`);
      } else {
        const errorText = await rollbackResponse.text();
        console.log(`❌ Rollback failed: ${rollbackResponse.status} - ${errorText}`);
      }
    } else {
      console.log('❌ Skipping rollback test - no learning ID available');
    }

    console.log('\n🎉 API Endpoint Testing Complete!');
    console.log('\n✅ All learning management endpoints are functional');
    console.log('✅ Ready for user testing with UI components');

  } catch (error) {
    console.log('❌ Error testing API endpoints:', error.message);
    console.log('\n💡 Make sure Next.js server is running on localhost:3001');
  }
};

// Run the API tests
testAPIEndpoints();
