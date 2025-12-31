// Arizona Quality Review Execution Script
// Project: Quality Assurance System Implementation
// Date: December 28, 2025

import * as fs from 'fs';
import * as path from 'path';
import { QualityReviewOrchestrator } from './QualityReviewOrchestrator';

interface QualityMetrics {
  totalDocuments: number;
  totalErrors: number;
  averageScore: number;
  errorsByCategory: Map<string, number>;
  recommendationCounts: Map<string, number>;
}

class ArizonaQualityReviewExecution {
  private orchestrator: QualityReviewOrchestrator;
  private reviewResults: any[] = [];
  private startTime: Date;

  constructor() {
    this.orchestrator = new QualityReviewOrchestrator();
    this.startTime = new Date();
  }

  /**
   * Execute quality review on a single document
   */
  async reviewDocument(filePath: string): Promise<any> {
    try {
      console.log(`\n📄 Processing: ${path.basename(filePath)}`);
      
      // Read document content
      const content = fs.readFileSync(filePath, 'utf-8');
      const documentId = path.basename(filePath, '.md');
      
      // Execute quality review
      const result = await this.orchestrator.executeReview(content, documentId);
      
      // Store result
      this.reviewResults.push(result);
      
      // Generate quality report for this document
      await this.generateDocumentReport(result, filePath);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Execute quality review on all rental documents
   */
  async reviewRentalDocuments(): Promise<void> {
    const rentalDir = 'AI-Agent-Team-Document-Library/implementation-documents/arizona-analysis/phase-2-reviewed/rentals';
    
    console.log('🏠 Starting rental property quality review...');
    console.log(`📁 Directory: ${rentalDir}`);
    
    try {
      const files = fs.readdirSync(rentalDir);
      const rentalAnalyses = files.filter(file => file.startsWith('R') && file.endsWith('.md'));
      
      console.log(`📊 Found ${rentalAnalyses.length} rental analyses to review`);
      
      // Process each rental analysis
      for (const file of rentalAnalyses) {
        const filePath = path.join(rentalDir, file);
        await this.reviewDocument(filePath);
        
        // Add delay to prevent overwhelming output
        await this.delay(1000);
      }
      
      // Generate comprehensive metrics
      await this.generateComprehensiveReport();
      
      // Extract and present learning candidates
      await this.extractAndPresentLearnings();
      
    } catch (error) {
      console.error('❌ Error during rental document review:', error);
      throw error;
    }
  }

  /**
   * Generate quality report for individual document
   */
  private async generateDocumentReport(result: any, originalPath: string): Promise<void> {
    const reportDir = 'AI-Agent-Team-Document-Library/implementation-documents/arizona-analysis/quality-reports';
    const reportPath = path.join(reportDir, `${result.documentId}-quality-report.md`);
    
    const report = this.generateQualityReportMarkdown(result);
    
    fs.writeFileSync(reportPath, report);
    console.log(`📋 Quality report saved: ${reportPath}`);
  }

  /**
   * Generate comprehensive metrics report
   */
  private async generateComprehensiveReport(): Promise<void> {
    const metrics = this.calculateMetrics();
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE QUALITY REVIEW METRICS');
    console.log('='.repeat(80));
    
    console.log(`📄 Total Documents Reviewed: ${metrics.totalDocuments}`);
    console.log(`❌ Total Errors Detected: ${metrics.totalErrors}`);
    console.log(`🎯 Average Quality Score: ${metrics.averageScore.toFixed(1)}/100`);
    
    console.log('\n📋 Errors by Category:');
    metrics.errorsByCategory.forEach((count, category) => {
      console.log(`   ${category}: ${count} errors`);
    });
    
    console.log('\n⚡ Recommendations:');
    metrics.recommendationCounts.forEach((count, recommendation) => {
      console.log(`   ${recommendation}: ${count} documents`);
    });
    
    const duration = (new Date().getTime() - this.startTime.getTime()) / 1000;
    console.log(`\n⏱️ Review Duration: ${duration.toFixed(1)} seconds`);
    console.log(`📈 Average Time per Document: ${(duration / metrics.totalDocuments).toFixed(1)} seconds`);
    
    console.log('\n' + '='.repeat(80));
  }

  /**
   * Extract and present CNS learning candidates
   */
  private async extractAndPresentLearnings(): Promise<void> {
    console.log('\n🧠 Extracting CNS Learning Candidates...');
    
    const learningCandidates = this.orchestrator.extractLearningCandidates(this.reviewResults);
    
    await this.orchestrator.presentLearningCandidates(learningCandidates);
    
    if (learningCandidates.length > 0) {
      console.log('🎯 Ready for user approval and CNS integration.');
    }
  }

  private calculateMetrics(): QualityMetrics {
    const errorsByCategory = new Map<string, number>();
    const recommendationCounts = new Map<string, number>();
    
    let totalErrors = 0;
    let totalScore = 0;
    
    this.reviewResults.forEach(result => {
      totalScore += result.overallScore;
      totalErrors += result.errors.length;
      
      // Count recommendation types
      const rec = result.recommendation;
      recommendationCounts.set(rec, (recommendationCounts.get(rec) || 0) + 1);
      
      // Count error categories
      result.errors.forEach((error: any) => {
        const category = `${error.errorType} (${error.reviewer})`;
        errorsByCategory.set(category, (errorsByCategory.get(category) || 0) + 1);
      });
    });
    
    return {
      totalDocuments: this.reviewResults.length,
      totalErrors,
      averageScore: this.reviewResults.length > 0 ? totalScore / this.reviewResults.length : 0,
      errorsByCategory,
      recommendationCounts
    };
  }

  private generateQualityReportMarkdown(result: any): string {
    return `# Quality Review Report: ${result.documentId}
**Generated:** ${result.timestamp.toISOString()}
**Overall Score:** ${result.overallScore}/100
**Recommendation:** ${result.recommendation}

## Review Results

### Data Accuracy Review
- **Score:** ${result.dataAccuracy.overallScore}/100
- **Errors:** ${result.dataAccuracy.errors.length}

### Link Validation Review  
- **Score:** ${result.linkValidation.overallScore}/100
- **Errors:** ${result.linkValidation.errors.length}

## Errors Detected

${result.errors.map((error: any, index: number) => `
### Error ${index + 1}: ${error.errorType}
- **Severity:** ${error.severity}
- **Reviewer:** ${error.reviewer}
- **Description:** ${error.description}
- **Suggested Fix:** ${error.suggestedFix}
- **Confidence:** ${(error.confidence * 100).toFixed(0)}%
`).join('')}

## Correction Suggestions

${result.correctionsSuggested.map((suggestion: string, index: number) => `${index + 1}. ${suggestion}`).join('\n')}

---
*Generated by Arizona Quality Review System*
`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Execute if run directly
if (require.main === module) {
  const executor = new ArizonaQualityReviewExecution();
  
  // Test with single document first
  const testFile = 'AI-Agent-Team-Document-Library/implementation-documents/arizona-analysis/phase-2-reviewed/rentals/R02-2527-W-Tamarisk-Ave-Phoenix.md';
  
  executor.reviewDocument(testFile)
    .then(() => {
      console.log('✅ Single document test complete. Ready for full rental review.');
    })
    .catch(error => {
      console.error('❌ Test failed:', error);
    });
}

export { ArizonaQualityReviewExecution };
