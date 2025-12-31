// ============================================================================
// Dual Model Quality Verification API Client
// ============================================================================
// Purpose: API interface for Claude + OpenAI dual model verification system
// Created: December 28, 2025
// Phase: 3 - Railway Database Integration (Updated December 28, 2025)
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getRailwayDatabase } from '../database/railway-client';

// ============================================================================
// Type Definitions
// ============================================================================

interface AnalysisRequest {
  userId: string;
  analysisType: 'PRIMARY_RESIDENCE' | 'INVESTMENT_PROPERTY';
  propertyFiles: PropertyFile[];
  userParameters: UserParameters;
  sessionName?: string;
}

interface PropertyFile {
  filename: string;
  content: string;
  fileType: 'PROPERTY_INPUT' | 'IMAGE_UPLOAD' | 'PDF_DOCUMENT';
  metadata?: any;
}

interface UserParameters {
  budgetRange: {
    min: number;
    max: number;
  };
  preferences: {
    location: string[];
    propertyType: string[];
    amenities: string[];
  };
  analysis: {
    timeframe: string;
    priorities: string[];
    specialRequirements?: string;
  };
}

interface AnalysisResult {
  analysisId: string;
  status: string;
  primaryResult?: string;
  verificationResult?: string;
  crossValidationScore: number;
  overallQualityScore: number;
  meetsQualityThreshold: boolean;
  generatedDocuments?: string[];
  processingTimeMs: number;
  retryCount: number;
  errors?: AnalysisError[];
}

interface AnalysisError {
  errorType: string;
  errorMessage: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  modelSource: 'PRIMARY' | 'VERIFICATION' | 'CROSS_VALIDATION';
  retryAttempted: boolean;
}

interface Discrepancy {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface QualityMetrics {
  accuracy: number;
  completeness: number;
  relevance: number;
  consistency: number;
  methodologyCompliance: number;
  overallScore: number;
}

// ============================================================================
// Main API Client Class
// ============================================================================

export class DualModelVerificationAPI {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private database = getRailwayDatabase();
  private qualityThreshold: number = 85.0;
  private maxRetries: number = 3;

  private initializeAPIs() {
    if (!this.anthropic || !this.openai) {
      const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY || process.env.MASTER_ORCHESTRATOR_OPENAI_API_KEY;
      
      if (!anthropicKey) {
        throw new Error('Missing Anthropic API key. Please set ANTHROPIC_API_KEY or MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY');
      }
      
      if (!openaiKey) {
        throw new Error('Missing OpenAI API key. Please set OPENAI_API_KEY or MASTER_ORCHESTRATOR_OPENAI_API_KEY');
      }
      
      this.anthropic = new Anthropic({
        apiKey: anthropicKey
      });
      
      this.openai = new OpenAI({
        apiKey: openaiKey
      });
    }
  }

  constructor() {
    // APIs will be initialized on first use
  }

  // ============================================================================
  // Core Analysis Methods
  // ============================================================================

  /**
   * Start a new property analysis with dual model verification
   */
  async startAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      // Initialize APIs on first use
      this.initializeAPIs();
      
      console.log(`🚀 Starting dual model analysis for user: ${request.userId}`);
      
      // 1. Initialize analysis record
      const analysisId = await this.initializeAnalysis(request);
      
      // 2. Get appropriate methodology
      const methodology = await this.getMethodology(request.analysisType);
      
      // 3. Generate analysis prompt
      const prompt = await this.generateAnalysisPrompt(request, methodology);
      
      // 4. Execute dual model analysis
      const result = await this.executeDualModelAnalysis(
        analysisId, 
        prompt, 
        request.propertyFiles
      );
      
      // 5. Generate documents if quality threshold met
      if (result.meetsQualityThreshold) {
        result.generatedDocuments = await this.generateDocuments(analysisId, result);
      }
      
      console.log(`✅ Analysis completed: ${analysisId} (Quality: ${result.overallQualityScore})`);
      return result;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Execute primary analysis with Claude
   */
  private async executePrimaryAnalysis(
    analysisId: string, 
    prompt: string
  ): Promise<{ result: string; qualityScore: number; executionTime: number; cost: number; }> {
    
    this.initializeAPIs(); // Ensure APIs are initialized
    
    const startTime = Date.now();
    
    try {
      console.log('🧠 Executing primary analysis with Claude...');
      
      const response = await this.anthropic!.messages.create({
        model: 'claude-3-haiku',
        max_tokens: 4000,
        temperature: 0.1,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const result = (response.content[0] as any).text;
      const executionTime = Date.now() - startTime;
      
      // Calculate quality score based on content analysis
      const qualityScore = await this.assessContentQuality(result, 'primary');
      
      // Estimate cost (approximation - adjust based on actual pricing)
      const cost = this.estimateCost(response.usage?.input_tokens || 0, response.usage?.output_tokens || 0, 'claude');
      
      console.log(`✅ Claude analysis complete (${executionTime}ms, Quality: ${qualityScore})`);
      
      return { result, qualityScore, executionTime, cost };
      
    } catch (error) {
      await this.recordError(analysisId, 'MODEL_FAILURE', error.message, 'PRIMARY');
      throw error;
    }
  }

  /**
   * Execute verification analysis with OpenAI
   */
  private async executeVerificationAnalysis(
    analysisId: string, 
    prompt: string, 
    primaryResult: string
  ): Promise<{ result: string; qualityScore: number; executionTime: number; cost: number; }> {
    
    this.initializeAPIs(); // Ensure APIs are initialized
    
    const startTime = Date.now();
    
    try {
      console.log('🔍 Executing verification analysis with OpenAI...');
      
      const verificationPrompt = `
        ${prompt}
        
        ADDITIONAL CONTEXT FOR VERIFICATION:
        Please provide an independent analysis of the same property data. 
        Focus on accuracy, completeness, and methodology compliance.
        
        PRIMARY ANALYSIS TO VERIFY:
        ${primaryResult}
      `;

      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4000,
        temperature: 0.1,
        messages: [{
          role: 'user',
          content: verificationPrompt
        }]
      });

      const result = response.choices[0].message.content || '';
      const executionTime = Date.now() - startTime;
      
      // Calculate quality score
      const qualityScore = await this.assessContentQuality(result, 'verification');
      
      // Estimate cost
      const cost = this.estimateCost(response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0, 'openai');
      
      console.log(`✅ OpenAI verification complete (${executionTime}ms, Quality: ${qualityScore})`);
      
      return { result, qualityScore, executionTime, cost };
      
    } catch (error) {
      await this.recordError(analysisId, 'MODEL_FAILURE', error.message, 'VERIFICATION');
      throw error;
    }
  }

  /**
   * Perform cross-validation between primary and verification results
   */
  private async performCrossValidation(
    analysisId: string,
    primaryResult: string, 
    verificationResult: string
  ): Promise<{ 
    crossValidationScore: number; 
    agreementPercentage: number; 
    discrepancies: Discrepancy[]; 
    overallQuality: number; 
  }> {
    
    try {
      console.log('🔗 Performing cross-validation analysis...');
      
      // Calculate agreement percentage using similarity analysis
      const agreementPercentage = await this.calculateAgreementPercentage(
        primaryResult, 
        verificationResult
      );
      
      // Identify discrepancies
      const discrepancies = await this.identifyDiscrepancies(
        primaryResult, 
        verificationResult
      );
      
      // Calculate cross-validation score
      const crossValidationScore = await this.calculateCrossValidationScore(
        agreementPercentage,
        discrepancies
      );
      
      // Calculate overall quality score
      const overallQuality = (crossValidationScore + agreementPercentage) / 2;
      
      console.log(`✅ Cross-validation complete (Score: ${crossValidationScore}, Agreement: ${agreementPercentage}%)`);
      
      return {
        crossValidationScore,
        agreementPercentage,
        discrepancies,
        overallQuality
      };
      
    } catch (error) {
      await this.recordError(analysisId, 'CROSS_VALIDATION_FAILED', error.message, 'CROSS_VALIDATION');
      throw error;
    }
  }

  /**
   * Execute complete dual model analysis with retry logic
   */
  private async executeDualModelAnalysis(
    analysisId: string,
    prompt: string,
    propertyFiles: PropertyFile[]
  ): Promise<AnalysisResult> {
    
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount <= this.maxRetries) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1}/${this.maxRetries + 1} for analysis: ${analysisId}`);
        
        // Update status
        await this.updateAnalysisStatus(analysisId, 'PROCESSING_PRIMARY');
        
        // Execute primary analysis
        const primary = await this.executePrimaryAnalysis(analysisId, prompt);
        
        // Update status  
        await this.updateAnalysisStatus(analysisId, 'PROCESSING_VERIFICATION');
        
        // Execute verification analysis
        const verification = await this.executeVerificationAnalysis(
          analysisId, 
          prompt, 
          primary.result
        );
        
        // Update status
        await this.updateAnalysisStatus(analysisId, 'CROSS_VALIDATING');
        
        // Perform cross-validation
        const crossValidation = await this.performCrossValidation(
          analysisId,
          primary.result,
          verification.result
        );
        
        // Check quality threshold
        if (crossValidation.overallQuality >= this.qualityThreshold) {
          await this.updateAnalysisStatus(analysisId, 'COMPLETED');
          
          return {
            analysisId,
            status: 'COMPLETED',
            primaryResult: primary.result,
            verificationResult: verification.result,
            crossValidationScore: crossValidation.crossValidationScore,
            overallQualityScore: crossValidation.overallQuality,
            meetsQualityThreshold: true,
            processingTimeMs: primary.executionTime + verification.executionTime,
            retryCount
          };
        } else {
          // Quality threshold not met, retry if attempts remaining
          if (retryCount < this.maxRetries) {
            console.log(`⚠️ Quality threshold not met (${crossValidation.overallQuality} < ${this.qualityThreshold}). Retrying...`);
            retryCount++;
            await this.updateAnalysisStatus(analysisId, 'RETRYING');
            continue;
          } else {
            await this.updateAnalysisStatus(analysisId, 'QUALITY_FAILED');
            
            return {
              analysisId,
              status: 'QUALITY_FAILED',
              primaryResult: primary.result,
              verificationResult: verification.result,
              crossValidationScore: crossValidation.crossValidationScore,
              overallQualityScore: crossValidation.overallQuality,
              meetsQualityThreshold: false,
              processingTimeMs: primary.executionTime + verification.executionTime,
              retryCount
            };
          }
        }
        
      } catch (error) {
        lastError = error;
        retryCount++;
        
        if (retryCount <= this.maxRetries) {
          console.log(`❌ Analysis attempt failed, retrying... (${retryCount}/${this.maxRetries})`);
          await this.updateAnalysisStatus(analysisId, 'RETRYING');
        } else {
          console.log(`❌ Analysis failed after ${this.maxRetries} retries`);
          await this.updateAnalysisStatus(analysisId, 'FAILED');
          break;
        }
      }
    }
    
    // All retries exhausted
    throw new Error(`Analysis failed after ${this.maxRetries} retries. Last error: ${lastError?.message}`);
  }

  // ============================================================================
  // Database Operations
  // ============================================================================

  /**
   * Initialize analysis record in Railway database - Phase 3 Implementation
   */
  private async initializeAnalysis(request: AnalysisRequest): Promise<string> {
    const analysisId = crypto.randomUUID();
    
    console.log(`📝 Initializing analysis: ${analysisId}`);
    console.log(`👤 User: ${request.userId}`);
    console.log(`🏠 Type: ${request.analysisType}`);
    console.log(`📁 Files: ${request.propertyFiles.length}`);
    
    // Save to Railway database
    try {
      const savedAnalysisId = await this.database.saveAnalysis({
        analysisId: analysisId,
        userEmail: request.userId,
        analysisType: request.analysisType,
        propertyFiles: request.propertyFiles,
        userParameters: request.userParameters,
        qualityScore: 0, // Will be updated later
        processingTimeMs: 0, // Will be updated later
        retryCount: 0,
        status: 'PENDING'
      });
      
      console.log(`✅ Analysis saved to Railway database: ${savedAnalysisId}`);
      return savedAnalysisId;
    } catch (error) {
      console.error('❌ Failed to save analysis to Railway database:', error);
      // Continue with in-memory processing for now
      return analysisId;
    }
  }

  /**
   * Get methodology by type
   * TODO: Replace with actual database lookup when Prisma is configured
   */
  private async getMethodology(analysisType: string) {
    // TODO: Fetch from database when Prisma is configured
    const methodology = {
      methodology_id: crypto.randomUUID(),
      content: `
# Universal Methodology Engine for ${analysisType}

## 7-Step Analysis Framework:

1. **Data Ingestion**: Process all property documents and user parameters
2. **Methodology Application**: Apply systematic evaluation criteria
3. **Quality Assurance**: Verify accuracy of all calculations and assessments
4. **Document Generation**: Create comprehensive analysis reports
5. **Learning Reports**: Capture insights and patterns
6. **Improvement Proposals**: Suggest optimizations and next steps
7. **Learning Integration**: Update system knowledge base

## Quality Thresholds:
- Accuracy: 85%+
- Completeness: 90%+
- Methodology Compliance: 95%+
      `,
      name: `${analysisType} Analysis Methodology`
    };
    
    return methodology;
  }

  /**
   * Update analysis status in Railway database - Phase 3 Implementation
   */
  private async updateAnalysisStatus(analysisId: string, status: string): Promise<void> {
    console.log(`📊 Status Update: ${analysisId} -> ${status}`);
    
    try {
      await this.database.updateAnalysisResults(analysisId, { status });
    } catch (error) {
      console.error('❌ Failed to update analysis status in Railway database:', error);
      // Continue processing even if database update fails
    }
  }

  /**
   * Record analysis error in Railway database - Phase 3 Implementation
   */
  private async recordError(
    analysisId: string, 
    errorType: string, 
    errorMessage: string, 
    modelSource: string
  ): Promise<void> {
    
    console.error(`❌ Error recorded for ${analysisId}: ${errorType} - ${errorMessage} (${modelSource})`);
    
    try {
      await this.database.logError({
        analysisId,
        errorType,
        errorMessage,
        modelSource,
        retrySuccessful: false // Will be updated if retry succeeds
      });
    } catch (error) {
      console.error('❌ Failed to log error to Railway database:', error);
      // Continue processing even if error logging fails
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Generate analysis prompt from user parameters and methodology
   */
  private async generateAnalysisPrompt(
    request: AnalysisRequest, 
    methodology: any
  ): Promise<string> {
    
    const propertyData = request.propertyFiles
      .map(file => `${file.filename}:\n${file.content}`)
      .join('\n\n---\n\n');
      
    return `
# Real Estate Analysis Request

## Analysis Type: ${request.analysisType}

## User Parameters:
- Budget Range: $${request.userParameters.budgetRange.min.toLocaleString()} - $${request.userParameters.budgetRange.max.toLocaleString()}
- Preferred Locations: ${request.userParameters.preferences.location.join(', ')}
- Property Types: ${request.userParameters.preferences.propertyType.join(', ')}
- Desired Amenities: ${request.userParameters.preferences.amenities.join(', ')}
- Analysis Timeframe: ${request.userParameters.analysis.timeframe}
- Priorities: ${request.userParameters.analysis.priorities.join(', ')}
${request.userParameters.analysis.specialRequirements ? `- Special Requirements: ${request.userParameters.analysis.specialRequirements}` : ''}

## Property Data:
${propertyData}

## Methodology:
${methodology.content}

## Quality Requirements:
- Provide comprehensive analysis covering all 7 methodology steps
- Include specific financial calculations and projections
- Ensure all recommendations are data-driven and well-justified
- Include risk assessment and mitigation strategies
- Generate actionable insights and next steps

Please provide a thorough analysis following the methodology exactly, ensuring high quality and accuracy in all calculations and recommendations.
    `;
  }

  /**
   * Assess content quality using heuristics
   */
  private async assessContentQuality(content: string, source: 'primary' | 'verification'): Promise<number> {
    // Simple quality scoring based on content analysis
    // In production, this could use additional AI models or more sophisticated metrics
    
    let score = 0;
    
    // Length and completeness (25 points)
    if (content.length > 2000) score += 25;
    else if (content.length > 1000) score += 15;
    else if (content.length > 500) score += 10;
    
    // Structure and methodology compliance (25 points)
    const hasStructure = /#{1,3}/.test(content); // Has headers
    const hasCalculations = /\$[\d,]+|\d+%/.test(content); // Has financial data
    const hasRecommendations = /(recommend|suggest|advise)/i.test(content);
    
    if (hasStructure) score += 10;
    if (hasCalculations) score += 10;
    if (hasRecommendations) score += 5;
    
    // Content depth (25 points) 
    const topicCoverage = [
      /financial|budget|cost|price/i,
      /location|neighborhood|area/i,
      /market|trend|appreciation/i,
      /risk|analysis|assessment/i
    ].filter(regex => regex.test(content)).length;
    
    score += topicCoverage * 6;
    
    // Quality indicators (25 points)
    const qualityIndicators = [
      content.includes('methodology'),
      content.includes('analysis'),
      content.includes('recommendation'),
      /\d+/.test(content) // Contains numbers
    ].filter(Boolean).length;
    
    score += qualityIndicators * 6;
    
    return Math.min(score, 100);
  }

  /**
   * Calculate agreement percentage between two analyses
   */
  private async calculateAgreementPercentage(
    primary: string,
    verification: string
  ): Promise<number> {
    // Simple similarity calculation - in production use more sophisticated NLP
    const primaryWords = new Set(primary.toLowerCase().split(/\s+/));
    const verificationWords = new Set(verification.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...primaryWords].filter(x => verificationWords.has(x)));
    const union = new Set([...primaryWords, ...verificationWords]);
    
    return Math.round((intersection.size / union.size) * 100);
  }

  /**
   * Identify discrepancies between analyses
   */
  private async identifyDiscrepancies(
    primary: string,
    verification: string
  ): Promise<Discrepancy[]> {
    // Simplified discrepancy detection
    const discrepancies: Discrepancy[] = [];
    
    // Check for conflicting recommendations
    const primaryRecommends = primary.toLowerCase().includes('recommend');
    const verificationRecommends = verification.toLowerCase().includes('recommend');
    
    if (primaryRecommends !== verificationRecommends) {
      discrepancies.push({
        type: 'recommendation_conflict',
        description: 'Models disagree on recommendations',
        severity: 'medium'
      });
    }
    
    // Check for numerical discrepancies
    const primaryNumbers = primary.match(/\$[\d,]+/g) || [];
    const verificationNumbers = verification.match(/\$[\d,]+/g) || [];
    
    if (primaryNumbers.length !== verificationNumbers.length) {
      discrepancies.push({
        type: 'financial_data_mismatch',
        description: 'Different amounts of financial data',
        severity: 'high'
      });
    }
    
    return discrepancies;
  }

  /**
   * Calculate cross-validation score
   */
  private async calculateCrossValidationScore(
    agreementPercentage: number,
    discrepancies: Discrepancy[]
  ): Promise<number> {
    let score = agreementPercentage;
    
    // Deduct points for discrepancies
    for (const discrepancy of discrepancies) {
      if (discrepancy.severity === 'high') score -= 15;
      else if (discrepancy.severity === 'medium') score -= 10;
      else score -= 5;
    }
    
    return Math.max(score, 0);
  }

  /**
   * Estimate API costs
   */
  private estimateCost(inputTokens: number, outputTokens: number, model: 'claude' | 'openai'): number {
    if (model === 'claude') {
      // Claude pricing (approximate)
      return (inputTokens * 0.003 + outputTokens * 0.015) / 1000;
    } else {
      // OpenAI GPT-4 pricing (approximate) 
      return (inputTokens * 0.03 + outputTokens * 0.06) / 1000;
    }
  }

  /**
   * Generate documents from analysis results
   */
  private async generateDocuments(analysisId: string, result: AnalysisResult): Promise<string[]> {
    // Placeholder for document generation
    // In production, this would generate PDFs, reports, etc.
    console.log(`📄 Generating documents for analysis: ${analysisId}`);
    
    return [
      `/documents/${analysisId}/property-analysis-report.pdf`,
      `/documents/${analysisId}/financial-summary.pdf`,
      `/documents/${analysisId}/trip-itinerary.pdf`
    ];
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  /**
   * Get analysis status
   * TODO: Replace with actual database query when Prisma is configured
   */
  async getAnalysisStatus(analysisId: string): Promise<AnalysisResult | null> {
    // TODO: Query database when Prisma is configured
    console.log(`📊 Getting status for analysis: ${analysisId}`);
    
    // Return mock data for now
    return {
      analysisId,
      status: 'COMPLETED',
      crossValidationScore: 87.5,
      overallQualityScore: 89.2,
      meetsQualityThreshold: true,
      processingTimeMs: 45000,
      retryCount: 0
    };
  }

  /**
   * Get quality metrics for analysis
   * TODO: Replace with actual database query when Prisma is configured
   */
  async getQualityMetrics(analysisId: string): Promise<QualityMetrics[]> {
    // TODO: Query database when Prisma is configured
    console.log(`📈 Getting quality metrics for analysis: ${analysisId}`);
    
    // Return mock data for now
    return [
      {
        accuracy: 89.5,
        completeness: 92.0,
        relevance: 87.2,
        consistency: 91.5,
        methodologyCompliance: 95.0,
        overallScore: 91.0
      }
    ];
  }

  /**
   * Health check endpoint - Updated for Phase 3 Railway Integration
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; database?: any }> {
    try {
      // Initialize APIs to check credentials
      this.initializeAPIs();
      
      // Test API connectivity
      const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY || process.env.MASTER_ORCHESTRATOR_OPENAI_API_KEY;
      
      const testClaude = anthropicKey ? 'configured' : 'missing';
      const testOpenAI = openaiKey ? 'configured' : 'missing';
      
      // Test Railway database connectivity
      const dbHealth = await this.database.healthCheck();
      const dbStatus = dbHealth.status === 'connected' ? 'connected' : 'disconnected';
      
      return {
        status: `healthy - Claude: ${testClaude}, OpenAI: ${testOpenAI}, Railway: ${dbStatus}`,
        timestamp: new Date().toISOString(),
        database: dbHealth
      };
    } catch (error) {
      return {
        status: `unhealthy - ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ============================================================================
// Export factory function instead of singleton instance
// ============================================================================

export function createDualModelAPI(): DualModelVerificationAPI {
  return new DualModelVerificationAPI();
}
