// CNS Learning Integration for Quality Assurance System
// MANDATORY: Every quality review execution must include learning extraction and user approval

import { ReviewResult } from './QualityReviewers';

interface LearningCandidate {
  id: string;
  category: 'ERROR_PREVENTION' | 'QUALITY_OPTIMIZATION' | 'PROCESS_REFINEMENT' | 'EFFICIENCY_PRESERVATION';
  pattern: string;
  proposedRule: string;
  evidence: {
    errorCount: number;
    documents: string[];
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    examples: string[];
  };
  applicableScenarios: string[];
  expectedImpact: string;
  confidence: number; // 0-100
}

interface LearningApprovalRequest {
  sessionId: string;
  timestamp: Date;
  totalCandidates: number;
  candidates: LearningCandidate[];
  context: {
    reviewType: string;
    documentsProcessed: number;
    errorsFound: number;
    qualityImprovement: number;
  };
}

interface LearningApprovalResponse {
  approved: LearningCandidate[];
  rejected: { candidate: LearningCandidate; reason: string }[];
  modified: { original: LearningCandidate; modified: LearningCandidate }[];
  userFeedback: string;
}

/**
 * MANDATORY: Extract learning candidates from quality review results
 * Must be called at the end of every quality assurance execution
 */
export async function extractQualityLearnings(
  reviewResults: ReviewResult[],
  context: { taskType: string; documentCount: number },
  correctionResults?: ReviewResult[]
): Promise<LearningCandidate[]> {
  
  const learnings: LearningCandidate[] = [];
  
  // 1. ERROR PREVENTION PATTERNS
  const errorPatterns = analyzeErrorPatterns(reviewResults);
  errorPatterns.forEach(pattern => {
    if (pattern.frequency >= 2) { // Recurring patterns only
      learnings.push({
        id: `error-prevention-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: 'ERROR_PREVENTION',
        pattern: pattern.description,
        proposedRule: `Always validate: ${pattern.preventionRule}`,
        evidence: {
          errorCount: pattern.frequency,
          documents: pattern.affectedDocuments,
          severity: pattern.severity,
          examples: pattern.examples
        },
        applicableScenarios: pattern.applicableContexts,
        expectedImpact: `Prevent ${pattern.frequency} similar errors in future ${context.taskType} tasks`,
        confidence: calculateConfidence(pattern.frequency, pattern.consistency)
      });
    }
  });
  
  // 2. QUALITY OPTIMIZATION DISCOVERIES
  const qualityImprovements = analyzeQualityImprovements(reviewResults, correctionResults);
  qualityImprovements.forEach(improvement => {
    learnings.push({
      id: `quality-opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'QUALITY_OPTIMIZATION',
      pattern: improvement.description,
      proposedRule: improvement.optimizationRule,
      evidence: {
        errorCount: improvement.improvementCount,
        documents: improvement.affectedDocuments,
        severity: 'MEDIUM',
        examples: improvement.examples
      },
      applicableScenarios: improvement.applicableContexts,
      expectedImpact: `Increase quality score by ~${improvement.averageImprovement} points`,
      confidence: improvement.confidence
    });
  });
  
  // 3. PROCESS REFINEMENTS
  const processImprovements = analyzeProcessEfficiency(reviewResults);
  processImprovements.forEach(refinement => {
    learnings.push({
      id: `process-ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'PROCESS_REFINEMENT',
      pattern: refinement.description,
      proposedRule: refinement.refinementRule,
      evidence: {
        errorCount: refinement.inefficiencyCount,
        documents: refinement.affectedDocuments,
        severity: 'LOW',
        examples: refinement.examples
      },
      applicableScenarios: refinement.applicableContexts,
      expectedImpact: `Improve process efficiency by ${refinement.timeReduction}%`,
      confidence: refinement.confidence
    });
  });
  
  // 4. EFFICIENCY PRESERVATION INSIGHTS
  const efficiencyInsights = analyzeEfficiencyPreservation(reviewResults, context);
  efficiencyInsights.forEach(insight => {
    learnings.push({
      id: `efficiency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category: 'EFFICIENCY_PRESERVATION',
      pattern: insight.description,
      proposedRule: insight.optimizationRule,
      evidence: {
        errorCount: 0, // Not error-based
        documents: insight.relevantDocuments,
        severity: 'MEDIUM',
        examples: insight.examples
      },
      applicableScenarios: insight.applicableContexts,
      expectedImpact: `Maintain quality while reducing processing time by ${insight.timeReduction}%`,
      confidence: insight.confidence
    });
  });
  
  return learnings.filter(l => l.confidence >= 70); // Only high-confidence learnings
}

/**
 * MANDATORY: Present learning candidates to user and handle approval workflow
 * Must require explicit user approval before any CNS integration
 */
export async function requestLearningApproval(
  candidates: LearningCandidate[],
  context: { taskType: string; documentCount: number }
): Promise<LearningApprovalResponse> {
  
  if (candidates.length === 0) {
    console.log("ℹ️  No learning candidates identified from this quality review session.");
    return { approved: [], rejected: [], modified: [], userFeedback: "" };
  }
  
  console.log(`\n🧠 QUALITY ASSURANCE LEARNING CANDIDATES`);
  console.log(`=====================================`);
  console.log(`Context: ${context.taskType} analysis (${context.documentCount} documents)`);
  console.log(`Learning candidates identified: ${candidates.length}`);
  console.log(`\nProposed lessons for CNS integration:\n`);
  
  candidates.forEach((candidate, index) => {
    console.log(`${index + 1}. [${candidate.category}] ${candidate.proposedRule}`);
    console.log(`   Evidence: ${candidate.evidence.errorCount} cases across ${candidate.evidence.documents.length} documents`);
    console.log(`   Impact: ${candidate.expectedImpact}`);
    console.log(`   Confidence: ${candidate.confidence}%`);
    console.log(`   Example: ${candidate.evidence.examples[0] || 'N/A'}`);
    console.log(``);
  });
  
  console.log(`\n❗ USER APPROVAL REQUIRED FOR CNS INTEGRATION`);
  console.log(`Please review each learning candidate and specify:`);
  console.log(`- APPROVE: Add to CNS as-is`);
  console.log(`- REJECT: Do not add to CNS`);
  console.log(`- MODIFY: Suggest changes before CNS integration`);
  console.log(`\nOnly approved lessons will be integrated into your CNS.`);
  
  // This would be replaced with actual user interface in production
  // For now, we return a placeholder that requires manual implementation
  throw new Error(`
🚨 MANUAL USER APPROVAL REQUIRED
    
Learning candidates have been presented above.
Please manually review and approve which lessons should be integrated into CNS.
    
To integrate approved lessons, use:
python3 ~/.personal-cns/cns/process-learning.py "[lesson content]"
    
This approval workflow must be implemented in the user interface.
  `);
}

/**
 * MANDATORY: Execute CNS integration for approved lessons
 * Only called after explicit user approval
 */
export async function integrateCNSLearning(
  approvedLessons: LearningCandidate[]
): Promise<{ successful: number; failed: number; details: string[] }> {
  
  const results = {
    successful: 0,
    failed: 0,
    details: []
  };
  
  for (const lesson of approvedLessons) {
    try {
      const learningContent = formatLessonForCNS(lesson);
      
      // Execute CNS integration using the established process
      const { exec } = require('child_process');
      const command = `python3 ~/.personal-cns/cns/process-learning.py "${learningContent}"`;
      
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve(stdout);
          }
        });
      });
      
      results.successful++;
      results.details.push(`✅ Integrated: ${lesson.proposedRule}`);
      
    } catch (error) {
      results.failed++;
      results.details.push(`❌ Failed: ${lesson.proposedRule} - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Format learning candidate for CNS integration
 */
function formatLessonForCNS(lesson: LearningCandidate): string {
  return `[${lesson.category}] ${lesson.proposedRule}. Evidence: ${lesson.evidence.errorCount} cases across ${lesson.evidence.documents.length} documents. Impact: ${lesson.expectedImpact}. Context: ${lesson.applicableScenarios.join(', ')}.`;
}

/**
 * Helper functions for learning extraction
 */
function analyzeErrorPatterns(reviewResults: ReviewResult[]) {
  // Implementation: Analyze recurring error patterns
  // This is a stub - full implementation would analyze actual error patterns
  return reviewResults.reduce((patterns: any[], result) => {
    result.errors.forEach(error => {
      const existingPattern = patterns.find(p => p.errorType === error.errorType);
      if (existingPattern) {
        existingPattern.frequency++;
        existingPattern.examples.push(error.description);
        existingPattern.affectedDocuments.push(`document-${result.reviewId}`);
      } else {
        patterns.push({
          description: `Recurring ${error.errorType} error pattern`,
          preventionRule: `Check for ${error.errorType} errors before finalizing`,
          frequency: 1,
          consistency: 85,
          severity: error.severity,
          examples: [error.description],
          affectedDocuments: [`document-${result.reviewId}`],
          applicableContexts: ['real estate analysis', 'financial calculations']
        });
      }
    });
    return patterns;
  }, []);
}

function analyzeQualityImprovements(reviewResults: ReviewResult[], correctionResults?: ReviewResult[]) {
  // Implementation: Identify quality optimization opportunities
  // This is a stub - full implementation would compare before/after quality scores
  const improvements: any[] = [];
  
  if (correctionResults) {
    reviewResults.forEach((initial, index) => {
      const corrected = correctionResults[index];
      if (corrected && corrected.overallScore > initial.overallScore) {
        improvements.push({
          description: `Quality improvement through ${initial.reviewerType} review`,
          optimizationRule: `Always apply ${initial.reviewerType} validation for similar content`,
          improvementCount: corrected.overallScore - initial.overallScore,
          affectedDocuments: [`document-${initial.reviewId}`],
          examples: [`Score improved from ${initial.overallScore} to ${corrected.overallScore}`],
          applicableContexts: ['document review', 'quality assurance'],
          averageImprovement: corrected.overallScore - initial.overallScore,
          confidence: 80
        });
      }
    });
  }
  
  return improvements;
}

function analyzeProcessEfficiency(reviewResults: ReviewResult[]) {
  // Implementation: Find process refinement opportunities
  // This is a stub - full implementation would analyze processing patterns
  const refinements: any[] = [];
  
  if (reviewResults.length > 5) {
    refinements.push({
      description: 'Large batch processing efficiency opportunity',
      refinementRule: 'Use parallel processing for batches of 5+ documents',
      inefficiencyCount: Math.floor(reviewResults.length / 5),
      affectedDocuments: reviewResults.map(r => `document-${r.reviewId}`),
      examples: ['Sequential processing of multiple documents'],
      applicableContexts: ['batch document processing', 'quality reviews'],
      timeReduction: 30,
      confidence: 75
    });
  }
  
  return refinements;
}

function analyzeEfficiencyPreservation(reviewResults: ReviewResult[], context: any) {
  // Implementation: Identify efficiency preservation insights
  // This is a stub - full implementation would analyze efficiency metrics
  const insights: any[] = [];
  
  const avgProcessingTime = reviewResults.length * 2; // Assume 2 min per doc
  if (avgProcessingTime > 10) {
    insights.push({
      description: 'Parallel review processing opportunity identified',
      optimizationRule: 'Enable parallel reviewer processing for multiple document analysis',
      relevantDocuments: reviewResults.map(r => `document-${r.reviewId}`),
      examples: [`Current processing time: ${avgProcessingTime} minutes`],
      applicableContexts: ['multi-document analysis', 'quality reviews'],
      timeReduction: 40,
      confidence: 85
    });
  }
  
  return insights;
}

function calculateConfidence(frequency: number, consistency: number): number {
  // Implementation: Calculate confidence score for learning
  return Math.min(95, frequency * 20 + consistency * 30);
}

export type {
  LearningCandidate,
  LearningApprovalRequest,
  LearningApprovalResponse
};
