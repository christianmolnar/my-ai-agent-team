/**
 import { QualityReviewOrchestrator, AggregatedReviewResult } from './QualityReviewers';
import { qualityMetricsService, ErrorRecord, QualityMetricsRecord } from './QualityMetricsService';
import { extractQualityLearnings, requestLearningApproval, integrateCNSLearning } from './CNSLearningIntegration';Two-Pass Quality Review Workflow
 * Orchestrates the complete review, correction, and verification process
 */

import { QualityReviewOrchestrator, AggregatedReviewResult } from './QualityReviewers';
import { qualityMetricsService, ErrorRecord, QualityMetricsRecord } from './QualityMetricsService';

export interface ReviewWorkflowConfig {
  agentId: string;
  taskId: string;
  taskType: string;
  reviewTypes: string[];
  qualityThreshold: number;
  maxCorrectionCycles: number;
}

export interface WorkflowResult {
  finalContent: string;
  qualityScore: number;
  totalCycles: number;
  finalRecommendation: 'APPROVE' | 'REVISE' | 'REJECT';
  processingTime: number;
  correctionSuggestions: string[];
  warningFlags: string[];
}

export interface CorrectionResult {
  correctedContent: string;
  correctionSuccessful: boolean;
  correctionMethod: string;
  correctionTime: number;
  remainingIssues: string[];
}

export class TwoPassReviewWorkflow {
  private orchestrator: QualityReviewOrchestrator;
  
  constructor() {
    this.orchestrator = new QualityReviewOrchestrator();
  }
  
  /**
   * Execute complete two-pass review workflow
   */
  async executeReview(
    originalContent: string,
    config: ReviewWorkflowConfig,
    correctionFunction?: (content: string, suggestions: string[]) => Promise<CorrectionResult>
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    let currentContent = originalContent;
    let totalCycles = 0;
    let finalScore = 0;
    let finalRecommendation: 'APPROVE' | 'REVISE' | 'REJECT' = 'APPROVE';
    let allSuggestions: string[] = [];
    let warningFlags: string[] = [];
    
    console.log(`Starting two-pass review for task ${config.taskId}`);
    
    try {
      // First Pass: Initial Review
      console.log('🔍 First Pass: Initial Quality Review');
      const firstPassResult = await this.orchestrator.conductFullReview(
        currentContent, 
        config.reviewTypes
      );
      
      // Record errors from first pass
      await this.recordErrors(firstPassResult, config);
      
      finalScore = firstPassResult.overallScore;
      finalRecommendation = firstPassResult.finalRecommendation;
      allSuggestions.push(...firstPassResult.correctionSuggestions);
      
      console.log(`First pass complete: Score ${finalScore.toFixed(1)}, Recommendation: ${finalRecommendation}`);
      
      // If approved on first pass, we're done
      if (finalRecommendation === 'APPROVE' && finalScore >= config.qualityThreshold) {
        console.log('✅ Content approved on first pass');
        await this.recordQualityMetrics(firstPassResult, config, totalCycles, Date.now() - startTime);
        return this.buildResult(currentContent, finalScore, totalCycles, finalRecommendation, 
                              Date.now() - startTime, allSuggestions, warningFlags);
      }
      
      // If rejected outright, return with warnings
      if (finalRecommendation === 'REJECT') {
        console.log('❌ Content rejected - too many critical errors');
        warningFlags.push('CRITICAL_ERRORS_DETECTED', 'MANUAL_REVIEW_REQUIRED');
        await this.recordQualityMetrics(firstPassResult, config, totalCycles, Date.now() - startTime);
        return this.buildResult(currentContent, finalScore, totalCycles, finalRecommendation,
                              Date.now() - startTime, allSuggestions, warningFlags);
      }
      
      // Correction Phase: Address identified issues
      if (correctionFunction && finalRecommendation === 'REVISE') {
        console.log('🔧 Correction Phase: Addressing identified issues');
        
        while (totalCycles < config.maxCorrectionCycles) {
          totalCycles++;
          console.log(`Correction cycle ${totalCycles}/${config.maxCorrectionCycles}`);
          
          // Attempt corrections
          const correctionResult = await correctionFunction(currentContent, allSuggestions);
          
          if (!correctionResult.correctionSuccessful) {
            console.log(`❌ Correction cycle ${totalCycles} failed`);
            warningFlags.push('CORRECTION_FAILED');
            break;
          }
          
          currentContent = correctionResult.correctedContent;
          console.log(`✅ Correction cycle ${totalCycles} completed`);
          
          // Second Pass: Re-review corrected content
          console.log('🔍 Second Pass: Re-reviewing corrected content');
          const secondPassResult = await this.orchestrator.conductFullReview(
            currentContent,
            config.reviewTypes
          );
          
          finalScore = secondPassResult.overallScore;
          finalRecommendation = secondPassResult.finalRecommendation;
          
          console.log(`Second pass cycle ${totalCycles}: Score ${finalScore.toFixed(1)}, Recommendation: ${finalRecommendation}`);
          
          // Check if we've achieved acceptable quality
          if (finalRecommendation === 'APPROVE' && finalScore >= config.qualityThreshold) {
            console.log('✅ Content approved after corrections');
            break;
          }
          
          // If still issues but fewer errors, continue
          if (secondPassResult.aggregatedErrors.length < firstPassResult.aggregatedErrors.length) {
            console.log(`🔄 Progress made: ${firstPassResult.aggregatedErrors.length} → ${secondPassResult.aggregatedErrors.length} errors`);
            allSuggestions = [...secondPassResult.correctionSuggestions];
          } else {
            console.log('⚠️ No progress made in correction cycle');
            warningFlags.push('NO_CORRECTION_PROGRESS');
            break;
          }
        }
        
        // Final quality assessment after all corrections
        const finalReview = await this.orchestrator.conductFullReview(currentContent, config.reviewTypes);
        finalScore = finalReview.overallScore;
        finalRecommendation = finalReview.finalRecommendation;
        
        await this.recordQualityMetrics(finalReview, config, totalCycles, Date.now() - startTime);
      }
      
      // Escalation Protocol: Add warnings if quality concerns remain
      if (finalScore < config.qualityThreshold || finalRecommendation !== 'APPROVE') {
        warningFlags.push('QUALITY_THRESHOLD_NOT_MET');
        
        if (finalScore < 60) {
          warningFlags.push('LOW_QUALITY_SCORE');
        }
        
        if (finalRecommendation === 'REJECT') {
          warningFlags.push('MANUAL_VERIFICATION_REQUIRED');
        }
        
        console.log(`⚠️ Quality concerns remain: Score ${finalScore.toFixed(1)}, Flags: ${warningFlags.join(', ')}`);
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`Two-pass review completed in ${(totalTime / 1000).toFixed(1)}s with ${totalCycles} correction cycles`);
      
      // MANDATORY: Extract and propose CNS learning integration
      await this.extractAndProposeCNSLearnings([firstPassResult], config);
      
      return this.buildResult(currentContent, finalScore, totalCycles, finalRecommendation,
                            totalTime, allSuggestions, warningFlags);
      
    } catch (error) {
      console.error('Two-pass review workflow failed:', error);
      warningFlags.push('REVIEW_SYSTEM_ERROR');
      
      return this.buildResult(originalContent, 0, totalCycles, 'REJECT',
                            Date.now() - startTime, ['Review system error occurred'], warningFlags);
    }
  }
  
  /**
   * Record errors found during review
   */
  private async recordErrors(reviewResult: AggregatedReviewResult, config: ReviewWorkflowConfig): Promise<void> {
    for (const error of reviewResult.aggregatedErrors) {
      const errorRecord: Omit<ErrorRecord, 'errorId' | 'timestamp' | 'status'> = {
        agentId: config.agentId,
        taskId: config.taskId,
        taskType: config.taskType,
        errorCategory: error.errorType as any,
        severity: error.severity as any,
        description: error.description,
        location: error.location,
        originalContent: reviewResult.originalContent,
        expectedContent: error.suggestedFix,
        detectedBy: 'quality-review-system',
        confidence: error.confidence,
        userImpact: this.mapSeverityToImpact(error.severity as any)
      };
      
      await qualityMetricsService.recordError(errorRecord);
    }
  }
  
  /**
   * Record quality metrics for the review
   */
  private async recordQualityMetrics(
    reviewResult: AggregatedReviewResult,
    config: ReviewWorkflowConfig,
    correctionCycles: number,
    processingTime: number
  ): Promise<void> {
    const metricsRecord: Omit<QualityMetricsRecord, 'metricId' | 'timestamp'> = {
      agentId: config.agentId,
      taskId: config.taskId,
      taskType: config.taskType,
      overallScore: reviewResult.overallScore,
      accuracyScore: reviewResult.qualityMetrics.accuracyScore,
      completenessScore: reviewResult.qualityMetrics.completenessScore,
      relevanceScore: reviewResult.qualityMetrics.relevanceScore,
      methodologyScore: reviewResult.qualityMetrics.methodologyScore,
      totalErrors: reviewResult.errorSummary.totalErrors,
      criticalErrors: reviewResult.errorSummary.criticalErrorsCount,
      highErrors: reviewResult.errorSummary.highErrorsCount,
      mediumErrors: reviewResult.errorSummary.totalErrors - 
                   reviewResult.errorSummary.criticalErrorsCount - 
                   reviewResult.errorSummary.highErrorsCount,
      lowErrors: 0, // Calculated from difference
      reviewDuration: Math.round(processingTime / 1000),
      correctionCycles,
      reviewerConfidence: reviewResult.qualityMetrics.confidenceScore
    };
    
    await qualityMetricsService.recordQualityMetrics(metricsRecord);
  }
  
  /**
   * Build the final workflow result
   */
  private buildResult(
    content: string,
    score: number,
    cycles: number,
    recommendation: 'APPROVE' | 'REVISE' | 'REJECT',
    processingTime: number,
    suggestions: string[],
    warnings: string[]
  ): WorkflowResult {
    return {
      finalContent: content,
      qualityScore: score,
      totalCycles: cycles,
      finalRecommendation: recommendation,
      processingTime,
      correctionSuggestions: suggestions,
      warningFlags: warnings
    };
  }
  
  /**
   * Map error severity to user impact level
   */
  private mapSeverityToImpact(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'HIGH';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'LOW':
        return 'LOW';
      default:
        return 'MEDIUM';
    }
  }
  
  /**
   * MANDATORY: Extract and propose CNS learning integration
   * Must be called at the end of every quality review execution
   */
  private async extractAndProposeCNSLearnings(
    reviewResults: AggregatedReviewResult[],
    config: ReviewWorkflowConfig
  ): Promise<void> {
    try {
      console.log('\n🧠 Extracting quality assurance learnings...');
      
      // Convert AggregatedReviewResult to ReviewResult format expected by learning extraction
      const convertedResults = reviewResults.map(result => ({
        reviewId: `${config.taskId}-${Date.now()}`,
        timestamp: new Date(),
        reviewerType: 'quality-orchestrator',
        originalContent: result.originalContent,
        errors: result.aggregatedErrors,
        overallScore: result.overallScore,
        recommendation: result.finalRecommendation,
        correctionSuggestions: result.correctionSuggestions,
        qualityMetrics: result.qualityMetrics
      }));
      
      const learningCandidates = await extractQualityLearnings(
        convertedResults,
        { taskType: config.taskType, documentCount: 1 }
      );
      
      if (learningCandidates.length > 0) {
        console.log(`📚 ${learningCandidates.length} learning candidates identified`);
        console.log('⚠️  CNS integration requires user approval - presenting candidates...\n');
        
        // Present learning candidates to user for approval
        learningCandidates.forEach((candidate, index) => {
          console.log(`${index + 1}. [${candidate.category}] ${candidate.proposedRule}`);
          console.log(`   📊 Evidence: ${candidate.evidence.errorCount} cases, ${candidate.confidence}% confidence`);
          console.log(`   🎯 Impact: ${candidate.expectedImpact}\n`);
        });
        
        console.log('🔄 To integrate approved lessons into CNS, use:');
        console.log('   python3 ~/.personal-cns/cns/process-learning.py "[lesson content]"');
        console.log('📝 Learning candidates documented for manual review and approval.\n');
        
      } else {
        console.log('ℹ️  No high-confidence learning candidates identified from this review');
      }
      
    } catch (error) {
      console.warn('⚠️  CNS learning extraction failed:', error.message);
      console.log('📋 Quality review completed successfully despite learning extraction issue');
    }
  }
}

/**
 * Simple correction function for basic text fixes
 */
export async function basicCorrectionFunction(
  content: string, 
  suggestions: string[]
): Promise<CorrectionResult> {
  const startTime = Date.now();
  
  // This is a placeholder implementation
  // In practice, this would call back to the original AI agent with specific correction instructions
  
  console.log('Applying basic corrections...');
  
  // Simulate correction processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For now, just return the original content with a note about suggestions
  const correctedContent = content + '\n\n<!-- Correction suggestions applied: ' + 
                          suggestions.slice(0, 3).join('; ') + ' -->';
  
  return {
    correctedContent,
    correctionSuccessful: true,
    correctionMethod: 'basic-text-correction',
    correctionTime: Date.now() - startTime,
    remainingIssues: suggestions.slice(3) // Return remaining suggestions as issues
  };
}

/**
 * Factory function to create a new workflow instance
 */
export function createTwoPassReviewWorkflow(): TwoPassReviewWorkflow {
  return new TwoPassReviewWorkflow();
}
