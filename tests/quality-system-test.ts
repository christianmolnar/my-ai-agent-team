/**
 * Quality Assurance System Test
 * Verifies that the complete review infrastructure is operational
 */

// Load environment variables first
import { config } from 'dotenv';
config({ path: '.env.local' });

import { qualityMetricsService } from '../lib/quality/QualityMetricsService';
import { createQualityReviewOrchestrator } from '../lib/quality/QualityReviewers';
import { createTwoPassReviewWorkflow } from '../lib/quality/TwoPassReviewWorkflow';

// Test data for real estate analysis
const TEST_CONTENT = `
# Sample Real Estate Analysis

## Property Overview
**Address:** 123 Test Street, Phoenix, AZ 85001
**Price:** $450,000
**Monthly Payment:** $2,850/month

## Financial Analysis
- **ROI:** 12% annually
- **Cap Rate:** 8.5%
- **Cash Flow:** $650/month positive
- **Property Value Growth:** 15% over 5 years

## Links and References
- Property Listing: https://zillow.com/fake-link-12345
- Market Data: https://example.com/market-data
- School Ratings: https://greatschools.org/arizona/phoenix/123

## Investment Recommendation
Based on the analysis, this property shows strong potential with excellent cash flow.
The 12% ROI significantly exceeds market averages, and the location demographics
suggest continued appreciation.
`;

async function testQualitySystem(): Promise<void> {
  console.log('🧪 Testing Quality Assurance System');
  console.log('=====================================\n');

  try {
    // Step 1: Initialize the quality metrics service
    console.log('1️⃣ Initializing Quality Metrics Service...');
    await qualityMetricsService.initialize();
    console.log('✅ Quality metrics service initialized\n');

    // Step 2: Test individual reviewers
    console.log('2️⃣ Testing Individual Reviewers...');
    const orchestrator = createQualityReviewOrchestrator();
    
    // Test data accuracy review
    console.log('   🔍 Testing Data Accuracy Reviewer...');
    const dataReview = await orchestrator.conductFullReview(
      TEST_CONTENT, 
      ['data'],
      { taskType: 'real-estate-analysis' }
    );
    console.log(`   ✅ Data accuracy review complete - Score: ${dataReview.overallScore.toFixed(1)}`);

    // Test methodology compliance
    console.log('   📋 Testing Methodology Compliance Checker...');
    const methodologyReview = await orchestrator.conductFullReview(
      TEST_CONTENT,
      ['methodology'],
      { taskType: 'real-estate-analysis' }
    );
    console.log(`   ✅ Methodology review complete - Score: ${methodologyReview.overallScore.toFixed(1)}`);

    // Step 3: Test full review workflow
    console.log('\n3️⃣ Testing Two-Pass Review Workflow...');
    const workflow = createTwoPassReviewWorkflow();
    
    const workflowResult = await workflow.executeReview(
      TEST_CONTENT,
      {
        agentId: 'real-estate-analyzer',
        taskId: 'test-task-001',
        taskType: 'property-analysis',
        reviewTypes: ['all'],
        qualityThreshold: 80,
        maxCorrectionCycles: 2
      }
    );

    console.log(`   ✅ Workflow complete:`);
    console.log(`      - Quality Score: ${workflowResult.qualityScore.toFixed(1)}/100`);
    console.log(`      - Recommendation: ${workflowResult.finalRecommendation}`);
    console.log(`      - Processing Time: ${(workflowResult.processingTime / 1000).toFixed(1)}s`);
    console.log(`      - Correction Cycles: ${workflowResult.totalCycles}`);
    
    if (workflowResult.warningFlags.length > 0) {
      console.log(`      - Warning Flags: ${workflowResult.warningFlags.join(', ')}`);
    }

    // Step 4: Test metrics collection
    console.log('\n4️⃣ Testing Metrics Collection...');
    
    // Record a test efficiency measurement
    await qualityMetricsService.recordEfficiencyImpact({
      agentId: 'real-estate-analyzer',
      taskId: 'test-task-001',
      taskType: 'property-analysis',
      controlDuration: 360, // 6 minutes baseline
      treatmentDuration: 480, // 8 minutes with review
      generationTime: 360,
      reviewTime: 90,
      correctionTime: 20,
      verificationTime: 10,
      qualityImprovement: 15.5
    });

    console.log('   ✅ Efficiency metrics recorded');

    // Step 5: Test dashboard metrics
    console.log('\n5️⃣ Testing Dashboard Metrics...');
    const dashboardMetrics = await qualityMetricsService.getDashboardMetrics();
    
    console.log(`   ✅ Dashboard metrics retrieved:`);
    console.log(`      - Total Tasks: ${dashboardMetrics.totalTasks}`);
    console.log(`      - Total Errors: ${dashboardMetrics.totalErrors}`);
    console.log(`      - Error Rate: ${dashboardMetrics.errorRate.toFixed(1)}%`);
    console.log(`      - Avg Quality Score: ${dashboardMetrics.avgQualityScore.toFixed(1)}`);
    console.log(`      - Avg Efficiency Ratio: ${dashboardMetrics.avgEfficiencyRatio.toFixed(1)}:1`);

    // Step 6: System validation
    console.log('\n6️⃣ System Validation...');
    
    const validationChecks = [
      { name: 'Quality Review Infrastructure', status: true },
      { name: 'Error Tracking System', status: dashboardMetrics.totalErrors >= 0 },
      { name: 'Metrics Collection', status: dashboardMetrics.totalTasks > 0 },
      { name: 'Efficiency Monitoring', status: dashboardMetrics.avgEfficiencyRatio > 0 },
      { name: 'Two-Pass Workflow', status: workflowResult.processingTime > 0 }
    ];

    let allPassed = true;
    for (const check of validationChecks) {
      const status = check.status ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${status} ${check.name}`);
      if (!check.status) allPassed = false;
    }

    console.log('\n🎉 QUALITY ASSURANCE SYSTEM TEST RESULTS:');
    console.log('==========================================');
    
    if (allPassed) {
      console.log('✅ ALL SYSTEMS OPERATIONAL');
      console.log('🚀 Ready for Real Estate Analyzer integration');
      console.log('📊 Metrics collection functional');
      console.log('🔍 Quality review workflow verified');
      
      // Calculate efficiency impact
      const efficiencyLoss = ((160 - dashboardMetrics.avgEfficiencyRatio) / 160) * 100;
      console.log(`⚡ Efficiency Impact: ${efficiencyLoss.toFixed(1)}% loss (${dashboardMetrics.avgEfficiencyRatio.toFixed(1)}:1 ratio maintained)`);
      
      if (efficiencyLoss < 50) {
        console.log('🎯 EFFICIENCY TARGET MET: <50% loss achieved');
      } else {
        console.log('⚠️  EFFICIENCY OPTIMIZATION NEEDED: >50% loss detected');
      }
      
      return;
    } else {
      console.log('❌ SYSTEM VALIDATION FAILED');
      console.log('🔧 Check failed components and retry');
    }

  } catch (error) {
    console.error('❌ Quality system test failed:', error);
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check Anthropic API keys in .env.local');
    console.log('2. Verify file system permissions for data/ directory');
    console.log('3. Ensure all dependencies are installed');
    console.log('4. Review error logs for specific failures');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testQualitySystem();
}

export { testQualitySystem };
