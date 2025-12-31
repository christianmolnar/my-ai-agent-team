import { ClaudeService } from '../claude/ClaudeService';
import { AgentClaudeClientFactory } from '../claude/AgentClaudeClients';

/**
 * Quality Assurance Reviewer Infrastructure
 * Specialized Claude-powered reviewers for AI-generated content quality control
 */

export interface ReviewResult {
  reviewId: string;
  timestamp: Date;
  reviewerType: string;
  originalContent: string;
  errors: ErrorItem[];
  overallScore: number;
  recommendation: 'APPROVE' | 'REVISE' | 'REJECT';
  correctionSuggestions: string[];
  qualityMetrics: QualityMetrics;
}

export interface ErrorItem {
  errorType: 'CALCULATION' | 'LINK' | 'METHODOLOGY' | 'HALLUCINATION' | 'DATA';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  description: string;
  suggestedFix: string;
  confidence: number;
}

export interface QualityMetrics {
  accuracyScore: number;
  completenessScore: number;
  relevanceScore: number;
  methodologyScore: number;
  confidenceScore: number;
}

/**
 * Base Reviewer Agent Class
 */
abstract class BaseReviewer {
  protected claudeService: ClaudeService;
  protected reviewerType: string;
  
  constructor(claudeService: ClaudeService, reviewerType: string) {
    this.claudeService = claudeService;
    this.reviewerType = reviewerType;
  }
  
  abstract getSystemPrompt(): string;
  
  async review(content: string, context?: any): Promise<ReviewResult> {
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const messages = [
        {
          role: 'user' as const,
          content: `Please review the following content for quality issues:\n\n${content}`
        }
      ];
      
      const response = await this.claudeService.generateResponse(
        messages,
        this.getSystemPrompt()
      );
      
      return this.parseReviewResponse(reviewId, content, response);
    } catch (error) {
      console.error(`${this.reviewerType} review failed:`, error);
      throw new Error(`Review failed: ${error}`);
    }
  }
  
  private parseReviewResponse(reviewId: string, content: string, response: string): ReviewResult {
    // Parse the structured response from Claude
    // This is a simplified implementation - in production would use more sophisticated parsing
    
    const errors: ErrorItem[] = [];
    let overallScore = 85; // Default score
    let recommendation: 'APPROVE' | 'REVISE' | 'REJECT' = 'APPROVE';
    
    // Basic parsing logic (to be enhanced based on actual Claude responses)
    if (response.toLowerCase().includes('error') || response.toLowerCase().includes('incorrect')) {
      errors.push({
        errorType: 'DATA',
        severity: 'MEDIUM',
        location: 'General',
        description: 'Quality issues detected',
        suggestedFix: 'Review and correct identified issues',
        confidence: 0.8
      });
      overallScore = 70;
      recommendation = 'REVISE';
    }
    
    if (response.toLowerCase().includes('critical') || response.toLowerCase().includes('major')) {
      recommendation = 'REJECT';
      overallScore = 50;
    }
    
    return {
      reviewId,
      timestamp: new Date(),
      reviewerType: this.reviewerType,
      originalContent: content,
      errors,
      overallScore,
      recommendation,
      correctionSuggestions: this.extractSuggestions(response),
      qualityMetrics: {
        accuracyScore: overallScore,
        completenessScore: overallScore,
        relevanceScore: overallScore,
        methodologyScore: overallScore,
        confidenceScore: 0.85
      }
    };
  }
  
  private extractSuggestions(response: string): string[] {
    // Extract specific correction suggestions from Claude's response
    const suggestions: string[] = [];
    
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('suggest') || 
          line.toLowerCase().includes('recommend') ||
          line.toLowerCase().includes('should')) {
        suggestions.push(line.trim());
      }
    }
    
    return suggestions.length > 0 ? suggestions : ['Review content for accuracy and completeness'];
  }
}

/**
 * Data Accuracy Reviewer
 * Validates factual claims, numbers, and calculations
 */
export class DataAccuracyReviewer extends BaseReviewer {
  constructor() {
    const claudeService = AgentClaudeClientFactory.createDataScientistClient();
    super(claudeService, 'DataAccuracy');
  }
  
  getSystemPrompt(): string {
    return `You are a Data Accuracy Reviewer for AI-generated content. Your job is to meticulously verify:

1. **Mathematical Calculations**: Check all numbers, formulas, percentages, and arithmetic
2. **Data Source Verification**: Validate that claims are supported by evidence
3. **Factual Claims**: Verify statements against known facts
4. **Unit Conversions**: Check currency, measurements, and unit calculations
5. **Statistical Analysis**: Validate statistical claims and interpretations

For each piece of content, provide:
- Specific errors found with exact locations
- Severity assessment (CRITICAL/HIGH/MEDIUM/LOW)
- Suggested corrections
- Overall accuracy score (0-100)
- Recommendation: APPROVE/REVISE/REJECT

Focus particularly on:
- Real estate financial calculations (ROI, cash flow, cap rates)
- Property valuation and market data
- Investment projections and assumptions
- Rental income calculations

Be thorough but concise. Flag any unsupported claims or calculation errors.`;
  }
}

/**
 * Link & Reference Validator
 * Verifies URLs, citations, and external references
 */
export class LinkReferenceValidator extends BaseReviewer {
  constructor() {
    const claudeService = AgentClaudeClientFactory.createResearcherClient();
    super(claudeService, 'LinkValidator');
  }
  
  getSystemPrompt(): string {
    return `You are a Link & Reference Validator for AI-generated content. Your job is to verify:

1. **URL Accessibility**: Check if links work and lead to relevant content
2. **Content Relevance**: Verify links support the claims made
3. **Reference Formatting**: Ensure proper citation format
4. **Source Credibility**: Assess the reliability of referenced sources
5. **Link Quality**: Check for broken, redirected, or inappropriate links

For each piece of content, provide:
- List of all URLs and references found
- Verification status for each link
- Content relevance assessment
- Source credibility evaluation
- Overall reference quality score (0-100)
- Recommendation: APPROVE/REVISE/REJECT

Pay special attention to:
- Real estate listing links (Zillow, MLS, etc.)
- Market data sources
- Government and official data references
- Financial information sources

Flag any broken links, irrelevant references, or questionable sources.`;
  }
}

/**
 * Methodology Compliance Checker
 * Ensures adherence to specified processes and requirements
 */
export class MethodologyComplianceChecker extends BaseReviewer {
  constructor() {
    // Use Researcher client instead of QA Engineer for methodology compliance
    const claudeService = AgentClaudeClientFactory.createResearcherClient();
    super(claudeService, 'MethodologyChecker');
  }
  
  getSystemPrompt(): string {
    return `You are a Methodology Compliance Checker for AI-generated content. Your job is to verify:

1. **Step-by-Step Process**: Ensure required methodology steps were followed
2. **Requirement Fulfillment**: Check all specified criteria are addressed
3. **Completeness**: Verify no required sections are missing
4. **Format Compliance**: Ensure proper structure and formatting
5. **Quality Standards**: Validate output meets specified standards

For each piece of content, provide:
- Checklist of methodology requirements met/missed
- Completeness assessment
- Format compliance evaluation
- Missing elements identification
- Overall methodology score (0-100)
- Recommendation: APPROVE/REVISE/REJECT

For real estate analysis, verify:
- Property details completeness
- Financial analysis sections
- Market comparison methodology
- Risk assessment inclusion
- Investment projection format
- Conclusion and recommendation structure

Flag any missing required sections or methodology deviations.`;
  }
}

/**
 * Hallucination Detector
 * Identifies generated vs. factual information
 */
export class HallucinationDetector extends BaseReviewer {
  constructor() {
    const claudeService = AgentClaudeClientFactory.createResearcherClient();
    super(claudeService, 'HallucinationDetector');
  }
  
  getSystemPrompt(): string {
    return `You are a Hallucination Detector for AI-generated content. Your job is to identify:

1. **Unsupported Claims**: Statements without evidence or sources
2. **Fabricated Data**: Numbers or facts that appear generated rather than sourced
3. **Plausibility Assessment**: Claims that seem unrealistic or impossible
4. **Source Attribution**: Verify claims are properly attributed to sources
5. **Confidence Assessment**: Evaluate certainty levels of statements

For each piece of content, provide:
- List of unsupported or suspicious claims
- Plausibility assessment for key statements
- Source attribution verification
- Fabrication risk scoring for data points
- Overall reliability score (0-100)
- Recommendation: APPROVE/REVISE/REJECT

Red flags to watch for:
- Specific numbers without sources (prices, percentages, dates)
- Overly precise data that seems generated
- Claims about future performance without disclaimers
- Property details that seem too convenient
- Market data without attribution
- Unrealistic investment projections

Flag anything that appears to be AI-generated rather than fact-based.`;
  }
}

/**
 * Quality Review Orchestrator
 * Coordinates multiple reviewers and aggregates results
 */
export class QualityReviewOrchestrator {
  private dataAccuracyReviewer: DataAccuracyReviewer;
  private linkValidator: LinkReferenceValidator;
  private methodologyChecker: MethodologyComplianceChecker;
  private hallucinationDetector: HallucinationDetector;
  
  constructor() {
    this.dataAccuracyReviewer = new DataAccuracyReviewer();
    this.linkValidator = new LinkReferenceValidator();
    this.methodologyChecker = new MethodologyComplianceChecker();
    this.hallucinationDetector = new HallucinationDetector();
  }
  
  async conductFullReview(
    content: string, 
    reviewTypes: string[] = ['all'],
    context?: any
  ): Promise<AggregatedReviewResult> {
    const reviews: ReviewResult[] = [];
    
    try {
      // Run reviews in parallel for efficiency
      const reviewPromises: Promise<ReviewResult>[] = [];
      
      if (reviewTypes.includes('all') || reviewTypes.includes('data')) {
        reviewPromises.push(this.dataAccuracyReviewer.review(content, context));
      }
      
      if (reviewTypes.includes('all') || reviewTypes.includes('links')) {
        reviewPromises.push(this.linkValidator.review(content, context));
      }
      
      if (reviewTypes.includes('all') || reviewTypes.includes('methodology')) {
        reviewPromises.push(this.methodologyChecker.review(content, context));
      }
      
      if (reviewTypes.includes('all') || reviewTypes.includes('hallucination')) {
        reviewPromises.push(this.hallucinationDetector.review(content, context));
      }
      
      const reviewResults = await Promise.all(reviewPromises);
      reviews.push(...reviewResults);
      
      return this.aggregateResults(reviews, content);
    } catch (error) {
      console.error('Quality review failed:', error);
      throw new Error(`Quality review orchestration failed: ${error}`);
    }
  }
  
  private aggregateResults(reviews: ReviewResult[], originalContent: string): AggregatedReviewResult {
    const allErrors: ErrorItem[] = [];
    const suggestions: string[] = [];
    let totalScore = 0;
    let criticalErrors = 0;
    
    // Aggregate all review results
    for (const review of reviews) {
      allErrors.push(...review.errors);
      suggestions.push(...review.correctionSuggestions);
      totalScore += review.overallScore;
      
      criticalErrors += review.errors.filter(e => e.severity === 'CRITICAL').length;
    }
    
    const averageScore = reviews.length > 0 ? totalScore / reviews.length : 0;
    
    // Determine final recommendation
    let finalRecommendation: 'APPROVE' | 'REVISE' | 'REJECT' = 'APPROVE';
    if (criticalErrors > 0 || averageScore < 50) {
      finalRecommendation = 'REJECT';
    } else if (allErrors.length > 0 || averageScore < 80) {
      finalRecommendation = 'REVISE';
    }
    
    return {
      aggregatedReviewId: `agg_${Date.now()}`,
      timestamp: new Date(),
      originalContent,
      individualReviews: reviews,
      aggregatedErrors: allErrors,
      overallScore: averageScore,
      finalRecommendation,
      correctionSuggestions: [...new Set(suggestions)], // Remove duplicates
      qualityMetrics: this.calculateAggregatedMetrics(reviews),
      errorSummary: this.summarizeErrors(allErrors)
    };
  }
  
  private calculateAggregatedMetrics(reviews: ReviewResult[]): QualityMetrics {
    if (reviews.length === 0) {
      return {
        accuracyScore: 0,
        completenessScore: 0,
        relevanceScore: 0,
        methodologyScore: 0,
        confidenceScore: 0
      };
    }
    
    const totals = reviews.reduce((acc, review) => ({
      accuracyScore: acc.accuracyScore + review.qualityMetrics.accuracyScore,
      completenessScore: acc.completenessScore + review.qualityMetrics.completenessScore,
      relevanceScore: acc.relevanceScore + review.qualityMetrics.relevanceScore,
      methodologyScore: acc.methodologyScore + review.qualityMetrics.methodologyScore,
      confidenceScore: acc.confidenceScore + review.qualityMetrics.confidenceScore
    }), { accuracyScore: 0, completenessScore: 0, relevanceScore: 0, methodologyScore: 0, confidenceScore: 0 });
    
    return {
      accuracyScore: totals.accuracyScore / reviews.length,
      completenessScore: totals.completenessScore / reviews.length,
      relevanceScore: totals.relevanceScore / reviews.length,
      methodologyScore: totals.methodologyScore / reviews.length,
      confidenceScore: totals.confidenceScore / reviews.length
    };
  }
  
  private summarizeErrors(errors: ErrorItem[]): ErrorSummary {
    const byType = errors.reduce((acc, error) => {
      acc[error.errorType] = (acc[error.errorType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalErrors: errors.length,
      errorsByType: byType,
      errorsBySeverity: bySeverity,
      criticalErrorsCount: bySeverity.CRITICAL || 0,
      highErrorsCount: bySeverity.HIGH || 0
    };
  }
}

export interface AggregatedReviewResult {
  aggregatedReviewId: string;
  timestamp: Date;
  originalContent: string;
  individualReviews: ReviewResult[];
  aggregatedErrors: ErrorItem[];
  overallScore: number;
  finalRecommendation: 'APPROVE' | 'REVISE' | 'REJECT';
  correctionSuggestions: string[];
  qualityMetrics: QualityMetrics;
  errorSummary: ErrorSummary;
}

export interface ErrorSummary {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  criticalErrorsCount: number;
  highErrorsCount: number;
}

// Factory function for easy instantiation
export function createQualityReviewOrchestrator(): QualityReviewOrchestrator {
  return new QualityReviewOrchestrator();
}
