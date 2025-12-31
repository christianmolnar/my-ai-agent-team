// Quality Review Orchestrator
// Project: Quality Assurance System Implementation  
// Date: December 28, 2025

import { DataAccuracyReviewer } from './DataAccuracyReviewer';
import { LinkValidator } from './LinkValidator';

export interface QualityReviewResult {
  documentId: string;
  timestamp: Date;
  overallScore: number;
  dataAccuracy: any;
  linkValidation: any;
  errors: any[];
  recommendation: 'APPROVE' | 'REVISE' | 'REJECT';
  correctionsSuggested: string[];
  qualityImprovement?: number;
}

export interface CNSLearningCandidate {
  pattern: string;
  evidence: any[];
  frequency: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  proposedRule: string;
  applicableScenarios: string[];
}

export class QualityReviewOrchestrator {
  private dataAccuracyReviewer: DataAccuracyReviewer;
  private linkValidator: LinkValidator;

  constructor() {
    this.dataAccuracyReviewer = new DataAccuracyReviewer();
    this.linkValidator = new LinkValidator();
  }

  /**
   * Execute comprehensive quality review of document
   */
  async executeReview(content: string, documentId: string): Promise<QualityReviewResult> {
    console.log(`🔍 Starting quality review for ${documentId}...`);
    
    // Run parallel reviews
    const [dataAccuracyResult, linkValidationResult] = await Promise.all([
      this.dataAccuracyReviewer.reviewRealEstateAnalysis(content),
      this.linkValidator.validateContent(content)
    ]);

    // Combine results
    const allErrors = [
      ...dataAccuracyResult.errors.map(e => ({...e, reviewer: 'DataAccuracy'})),
      ...linkValidationResult.errors.map(e => ({...e, reviewer: 'LinkValidation'}))
    ];

    // Calculate overall score (weighted average)
    const overallScore = Math.round((dataAccuracyResult.overallScore * 0.6) + (linkValidationResult.overallScore * 0.4));

    // Generate overall recommendation
    const recommendation = this.generateOverallRecommendation(dataAccuracyResult, linkValidationResult);

    // Generate correction suggestions
    const correctionsSuggested = [
      ...dataAccuracyResult.correctionSuggestions,
      ...linkValidationResult.correctionSuggestions
    ];

    const result: QualityReviewResult = {
      documentId,
      timestamp: new Date(),
      overallScore,
      dataAccuracy: dataAccuracyResult,
      linkValidation: linkValidationResult,
      errors: allErrors,
      recommendation,
      correctionsSuggested
    };

    // Display results
    this.displayReviewResults(result);

    return result;
  }

  /**
   * Generate CNS learning candidates from review results
   */
  extractLearningCandidates(reviewResults: QualityReviewResult[]): CNSLearningCandidate[] {
    const learningCandidates: CNSLearningCandidate[] = [];
    
    // Analyze error patterns
    const errorPatterns = this.analyzeErrorPatterns(reviewResults);
    
    errorPatterns.forEach(pattern => {
      learningCandidates.push({
        pattern: pattern.description,
        evidence: pattern.examples,
        frequency: pattern.count,
        impact: pattern.count > 5 ? 'HIGH' : pattern.count > 2 ? 'MEDIUM' : 'LOW',
        proposedRule: pattern.proposedRule,
        applicableScenarios: pattern.scenarios
      });
    });

    return learningCandidates;
  }

  /**
   * Present learning candidates to user for approval
   */
  async presentLearningCandidates(candidates: CNSLearningCandidate[]): Promise<void> {
    if (candidates.length === 0) {
      console.log('🧠 No learning patterns identified in this review cycle.');
      return;
    }

    console.log(`\n🧠 Quality Assurance Learning Candidates Identified:`);
    console.log(`📊 Found ${candidates.length} potential learning pattern(s)\n`);

    candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. **${candidate.proposedRule}**`);
      console.log(`   📋 Pattern: ${candidate.pattern}`);
      console.log(`   📈 Frequency: ${candidate.frequency} occurrences`);
      console.log(`   ⚡ Impact: ${candidate.impact}`);
      console.log(`   🎯 Applicable: ${candidate.applicableScenarios.join(', ')}`);
      console.log('');
    });

    console.log('💡 These patterns could be integrated into CNS for future quality improvement.');
    console.log('🔄 User approval required before CNS integration.');
  }

  private generateOverallRecommendation(dataAccuracy: any, linkValidation: any): 'APPROVE' | 'REVISE' | 'REJECT' {
    // Most restrictive recommendation wins
    if (dataAccuracy.recommendation === 'REJECT' || linkValidation.recommendation === 'REJECT') {
      return 'REJECT';
    }
    if (dataAccuracy.recommendation === 'REVISE' || linkValidation.recommendation === 'REVISE') {
      return 'REVISE';
    }
    return 'APPROVE';
  }

  private displayReviewResults(result: QualityReviewResult): void {
    console.log('\n' + '='.repeat(60));
    console.log(`📋 QUALITY REVIEW RESULTS: ${result.documentId}`);
    console.log('='.repeat(60));
    
    console.log(`🎯 **Overall Score**: ${result.overallScore}/100`);
    console.log(`📊 **Data Accuracy**: ${result.dataAccuracy.overallScore}/100`);
    console.log(`🔗 **Link Validation**: ${result.linkValidation.overallScore}/100`);
    console.log(`⚡ **Recommendation**: ${result.recommendation}`);
    
    if (result.errors.length > 0) {
      console.log(`\n❌ **${result.errors.length} Error(s) Identified:**`);
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. [${error.severity}] ${error.description}`);
        console.log(`      💡 Fix: ${error.suggestedFix}`);
      });
    }
    
    if (result.correctionsSuggested.length > 0) {
      console.log(`\n🔧 **Correction Suggestions:**`);
      result.correctionsSuggested.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }

  private analyzeErrorPatterns(reviewResults: QualityReviewResult[]): any[] {
    const patterns: any[] = [];
    
    // Group errors by type and analyze frequency
    const errorGroups = new Map();
    
    reviewResults.forEach(result => {
      result.errors.forEach(error => {
        const key = `${error.errorType}-${error.reviewer}`;
        if (!errorGroups.has(key)) {
          errorGroups.set(key, []);
        }
        errorGroups.get(key).push({
          error,
          documentId: result.documentId
        });
      });
    });

    // Convert to learning patterns
    errorGroups.forEach((errorList, key) => {
      if (errorList.length >= 2) { // Pattern threshold
        patterns.push({
          description: `${key} errors occurring across multiple documents`,
          examples: errorList,
          count: errorList.length,
          proposedRule: this.generateRuleForPattern(key, errorList),
          scenarios: ['Real estate analysis', 'Investment calculations', 'Property reviews']
        });
      }
    });

    return patterns;
  }

  private generateRuleForPattern(patternKey: string, errorList: any[]): string {
    if (patternKey.includes('INCOMPLETE_URL')) {
      return 'Always verify URLs are complete with specific property IDs and functional links';
    }
    if (patternKey.includes('CALCULATION')) {
      return 'Double-check all financial calculations with explicit formula verification';
    }
    if (patternKey.includes('INCONSISTENCY')) {
      return 'Ensure investment conclusions align with financial calculations throughout document';
    }
    
    return `Implement systematic check for ${patternKey.toLowerCase()} patterns`;
  }
}
