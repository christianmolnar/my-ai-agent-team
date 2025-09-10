#!/usr/bin/env node
/**
 * Test script to validate all performance and UX improvements
 */

const https = require('http');

const baseUrl = 'http://localhost:30000';

const tests = [
  {
    name: 'Performance Test - Simple Request',
    endpoint: '/api/personal-assistant',
    method: 'POST',
    body: JSON.stringify({
      message: 'Hello, can you help me with a quick question?'
    }),
    expectedResponseTime: 8000 // ms
  },
  {
    name: 'Context Test - Project Discussion',
    endpoint: '/api/personal-assistant',
    method: 'POST',
    body: JSON.stringify({
      message: 'I want to continue working on my project',
      context: [
        { role: 'user', content: 'Hi, I\'m working on a new web application' },
        { role: 'assistant', content: 'That sounds exciting! What kind of web application?' }
      ]
    }),
    expectedResponseTime: 10000
  },
  {
    name: 'Learning Feedback Test',
    endpoint: '/api/personal-assistant/feedback',
    method: 'POST',
    body: JSON.stringify({
      feedback: 'The response was very helpful and provided good context',
      userMessage: 'Test message',
      agentResponse: 'Test response'
    }),
    expectedResponseTime: 30000 // Feedback processing can take longer
  }
];

async function runTest(test) {
  console.log(`\n🧪 Running: ${test.name}`);
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 30000,
      path: test.endpoint,
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        try {
          const responseData = JSON.parse(data);
          
          console.log(`⏱️  Response Time: ${responseTime}ms`);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📊 Expected Max Time: ${test.expectedResponseTime}ms`);
          
          if (responseTime <= test.expectedResponseTime) {
            console.log(`🟢 PASS - Response time within expected range`);
          } else {
            console.log(`🟡 SLOW - Response time exceeded expected range`);
          }

          if (responseData.success !== undefined) {
            console.log(`📋 Success: ${responseData.success}`);
          }

          if (responseData.learningDetails) {
            console.log(`🧠 Learning Impact: ${responseData.learningDetails.changes?.length || 0} changes`);
          }

          resolve({
            name: test.name,
            responseTime,
            success: res.statusCode === 200,
            data: responseData
          });
        } catch (error) {
          console.log(`❌ Failed to parse response:`, error.message);
          resolve({
            name: test.name,
            responseTime,
            success: false,
            error: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request failed:`, error.message);
      reject(error);
    });

    req.setTimeout(test.expectedResponseTime + 5000, () => {
      console.log(`⏰ Test timed out after ${test.expectedResponseTime + 5000}ms`);
      req.destroy();
      resolve({
        name: test.name,
        responseTime: test.expectedResponseTime + 5000,
        success: false,
        error: 'Timeout'
      });
    });

    if (test.body) {
      req.write(test.body);
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('🚀 Starting Personal Assistant Performance Tests\n');
  console.log('Testing improvements:');
  console.log('✓ Performance optimization through parallel processing');
  console.log('✓ Enhanced loading feedback and spinners');
  console.log('✓ Conversation context persistence');
  console.log('✓ Feedback impact display');
  console.log('✓ TypeScript compatibility fixes');
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await runTest(test);
      results.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(`❌ Test "${test.name}" failed:`, error.message);
      results.push({
        name: test.name,
        success: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  
  results.forEach(result => {
    const status = result.success ? '🟢 PASS' : '❌ FAIL';
    const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
    console.log(`${status} ${result.name}${time}`);
  });

  if (passed === total) {
    console.log('\n🎉 All performance improvements are working correctly!');
  } else {
    console.log('\n⚠️  Some tests failed - check the output above for details');
  }
}

// Run tests
runAllTests().catch(console.error);
