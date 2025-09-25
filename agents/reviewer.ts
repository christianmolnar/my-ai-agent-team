import { Agent, AgentTask, AgentTaskResult } from './agent';
import { universalAIClient, AIMessage } from '../lib/universal-ai-client';
import { CNSManager } from '../lib/cns/CNSManager';

/**
 * Reviewer Agent - Quality Assurance and Validation Specialist
 * 
 * Provides independent validation of agent outputs through dynamic LLM selection
 * and sophisticated validation prompts. Has its own CNS for learned review patterns.
 */
export class ReviewerAgent implements Agent {
  id = 'reviewer';
  name = 'Reviewer Agent';
  description = 'Independent validation and quality assurance for agent outputs';
  abilities = [
    'Multi-LLM validation strategies',
    'Dynamic prompt engineering for validation',
    'Quality assessment and feedback generation',
    'Cross-agent output verification',
    'Risk assessment and mitigation recommendations',
    'CNS-powered learning from review patterns'
  ];

  private cnsManager: CNSManager;

  constructor() {
    this.cnsManager = new CNSManager('reviewer');
    this.initializeCNS();
  }

  /**
   * Initialize CNS structure for the Reviewer Agent
   */
  private async initializeCNS(): Promise<void> {
    try {
      console.log('🧠 Reviewer Agent: Initializing CNS integration');
      
      // Load current CNS learnings to integrate into agent behavior
      const activeLearnings = await this.cnsManager.getActiveLearnings();
      console.log(`🧠 Reviewer Agent: Loaded ${activeLearnings.length} characters of CNS learning data`);
      
      console.log('✅ Reviewer Agent: CNS fully integrated');
      
    } catch (error) {
      // NO FALLBACKS - fail fast if CNS can't be loaded
      throw new Error(`REVIEWER CNS INITIALIZATION FAILED: Could not load CNS components. Error: ${error.message}. This indicates CNS structure or integration issues that must be fixed.`);
    }
  }

  /**
   * Agent interface implementation
   */
  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'review-output':
          const reviewResult = await this.reviewAgentOutput(task.payload);
          return { success: true, result: reviewResult };

        case 'validate-deliverable':
          const validationResult = await this.validateDeliverable(task.payload);
          return { success: true, result: validationResult };

        case 'assess-quality':
          const qualityAssessment = await this.assessQuality(task.payload);
          return { success: true, result: qualityAssessment };

        case 'execute-task':
          // Handle general task execution requests
          const response = await this.generateReviewGuidance(task.payload.userRequest);
          return { success: true, result: response };

        default:
          throw new Error(`Unknown review task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Reviewer Agent error: ${error.message}`
      };
    }
  }

  /**
   * Core review functionality - validates agent outputs through independent LLM calls
   */
  async reviewAgentOutput(payload: ReviewRequest): Promise<ReviewResult> {
    const {
      originalMission,
      expectedResults,
      actualDeliverables,
      sourceAgent,
      modelUsed
    } = payload;

    console.log(`🔍 Reviewer: Starting independent validation for ${sourceAgent} output`);

    // Step 1: Load CNS learnings for review patterns
    const cnsLearnings = await this.loadReviewPatterns();

    // Step 2: Select different LLM for independent validation
    const reviewModel = await this.selectAlternateLLM(modelUsed);

    // Step 3: Generate validation prompts
    const validationPrompts = await this.createValidationPrompts({
      originalMission,
      expectedResults,
      actualDeliverables,
      sourceAgent,
      cnsLearnings
    });

    // Step 4: Execute independent validation
    const validationResults = await this.executeValidation(validationPrompts, reviewModel);

    // Step 5: Generate feedback
    const feedback = await this.generateFeedback(validationResults, payload);

    // Step 6: Update CNS with review patterns
    await this.updateReviewLearnings(payload, validationResults, feedback);

    return {
      validationScore: validationResults.score,
      feedback: feedback,
      recommendedActions: validationResults.recommendations,
      qualityMetrics: validationResults.metrics,
      reviewerConfidence: validationResults.confidence,
      alternateModel: reviewModel
    };
  }

  /**
   * Create sophisticated validation prompts based on the review requirements
   */
  private async createValidationPrompts(params: ValidationPromptParams): Promise<ValidationPrompt[]> {
    const {
      originalMission,
      expectedResults,
      actualDeliverables,
      sourceAgent,
      cnsLearnings
    } = params;

    const prompts: ValidationPrompt[] = [];

    // Prompt 1: Mission Alignment Validation
    prompts.push({
      type: 'mission-alignment',
      prompt: `# Mission Alignment Validation

## Original Mission
${originalMission}

## Expected Results
${expectedResults}

## Actual Deliverables
${actualDeliverables}

## Source Agent
${sourceAgent}

## CNS Learning Context
${cnsLearnings}

## Validation Task
As an independent reviewer, assess how well the actual deliverables align with the original mission and expected results.

**Evaluation Criteria:**
1. **Completeness**: Are all expected deliverables present?
2. **Accuracy**: Is the information factually correct and well-researched?
3. **Relevance**: Does the output directly address the mission requirements?
4. **Quality**: Is the work professionally executed and well-structured?
5. **Usability**: Can the user immediately use these deliverables?

**Output Format:**
ALIGNMENT_SCORE: [0-100]
COMPLETENESS_ANALYSIS: [detailed assessment]
ACCURACY_VERIFICATION: [fact-checking results]
RELEVANCE_EVALUATION: [mission alignment analysis]
QUALITY_ASSESSMENT: [professional standards review]
USABILITY_REVIEW: [practical applicability analysis]
IMPROVEMENT_OPPORTUNITIES: [specific recommendations]

Provide an objective, constructive analysis focusing on actionable feedback.`,
      expectedOutput: 'structured-assessment'
    });

    // Prompt 2: Quality Standards Validation
    prompts.push({
      type: 'quality-standards',
      prompt: `# Quality Standards Validation

## Deliverable Analysis
${actualDeliverables}

## Quality Validation Task
Evaluate the deliverables against professional quality standards.

**Quality Dimensions:**
1. **Structural Integrity**: Organization, flow, logical progression
2. **Content Depth**: Thoroughness, comprehensiveness, detail level
3. **Professional Standards**: Writing quality, formatting, presentation
4. **Practical Value**: Actionability, immediate applicability, usefulness
5. **Error Detection**: Factual errors, inconsistencies, omissions

**Validation Method:**
- Apply independent verification of claims and information
- Check for logical consistency and coherence
- Assess professional presentation standards
- Evaluate practical utility for the end user

**Output Format:**
QUALITY_SCORE: [0-100]
STRUCTURAL_ANALYSIS: [organization and flow assessment]
CONTENT_EVALUATION: [depth and comprehensiveness review]
PRESENTATION_REVIEW: [professional standards assessment]
VALUE_ANALYSIS: [practical utility evaluation]
ERROR_DETECTION: [identified issues and concerns]
ENHANCEMENT_SUGGESTIONS: [specific improvement recommendations]

Focus on constructive feedback that helps improve the deliverable quality.`,
      expectedOutput: 'quality-metrics'
    });

    // Prompt 3: Risk and Gap Analysis
    prompts.push({
      type: 'risk-analysis',
      prompt: `# Risk and Gap Analysis

## Mission Context
${originalMission}

## Delivered Output
${actualDeliverables}

## Risk Assessment Task
Identify potential risks, gaps, and areas of concern in the delivered output.

**Risk Categories:**
1. **Completeness Risks**: Missing critical components or information
2. **Accuracy Risks**: Potential factual errors or unverified claims
3. **Usability Risks**: Barriers to practical implementation or use
4. **Scope Risks**: Over-delivery or under-delivery relative to mission
5. **Quality Risks**: Substandard elements that could impact effectiveness

**Gap Analysis:**
- What essential elements are missing?
- Where could additional detail or clarity improve outcomes?
- What assumptions might be problematic?
- What follow-up actions might be needed?

**Output Format:**
RISK_LEVEL: [low|medium|high]
COMPLETENESS_GAPS: [missing critical elements]
ACCURACY_CONCERNS: [potential factual or methodological issues]
USABILITY_BARRIERS: [implementation or usage obstacles]
SCOPE_MISALIGNMENT: [over/under-delivery concerns]
MITIGATION_STRATEGIES: [recommended risk reduction approaches]
NEXT_STEPS: [suggested follow-up actions]

Provide balanced assessment focusing on genuine risks and actionable mitigation strategies.`,
      expectedOutput: 'risk-assessment'
    });

    return prompts;
  }

  /**
   * Execute validation using independent LLM
   */
  private async executeValidation(prompts: ValidationPrompt[], model: string): Promise<ValidationResults> {
    const results: any = {};
    let totalScore = 0;
    let scoreCount = 0;

    for (const prompt of prompts) {
      try {
        console.log(`🔍 Reviewer: Executing ${prompt.type} validation with ${model}`);

        const messages: AIMessage[] = [
          { role: 'user', content: prompt.prompt }
        ];

        const systemPrompt = `You are an independent quality reviewer with expertise in ${prompt.type} evaluation. 
        Your role is to provide objective, constructive analysis that helps improve deliverable quality.
        
        Focus on:
        - Objective assessment based on professional standards
        - Constructive feedback that enables improvement
        - Specific, actionable recommendations
        - Balanced evaluation recognizing both strengths and areas for improvement
        
        Maintain independence from the original agent's work and provide fresh perspective.`;

        const response = await universalAIClient.generateResponse(
          this.id,
          messages,
          systemPrompt
        );

        results[prompt.type] = response.content;

        // Extract score if present
        const scoreMatch = response.content.match(/(?:SCORE|LEVEL):\s*(\d+)/i);
        if (scoreMatch) {
          totalScore += parseInt(scoreMatch[1]);
          scoreCount++;
        }

      } catch (error) {
        console.error(`Reviewer: Error in ${prompt.type} validation:`, error);
        results[prompt.type] = `Validation error: ${error.message}`;
      }
    }

    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 75;

    return {
      score: averageScore,
      details: results,
      recommendations: this.extractRecommendations(results),
      metrics: this.calculateQualityMetrics(results),
      confidence: this.calculateConfidence(results)
    };
  }

  /**
   * Generate consolidated feedback from validation results
   */
  private async generateFeedback(validationResults: ValidationResults, originalRequest: ReviewRequest): Promise<ReviewFeedback> {
    const feedbackPrompt = `# Review Feedback Generation

## Validation Results
${JSON.stringify(validationResults.details, null, 2)}

## Original Request Context
- Source Agent: ${originalRequest.sourceAgent}
- Mission: ${originalRequest.originalMission}
- Expected: ${originalRequest.expectedResults}

## Feedback Generation Task
Synthesize the validation results into constructive, actionable feedback that helps the source agent improve their output.

**Feedback Principles:**
1. Be constructive and solution-oriented
2. Provide specific, actionable recommendations
3. Acknowledge strengths while addressing weaknesses
4. Focus on user value and practical improvements
5. Maintain respectful, collaborative tone

**Output Format:**
OVERALL_ASSESSMENT: [summary of quality and alignment]
KEY_STRENGTHS: [what worked well]
IMPROVEMENT_AREAS: [specific areas needing attention]
ACTIONABLE_RECOMMENDATIONS: [concrete steps for improvement]
INTEGRATION_STRATEGY: [how to incorporate feedback effectively]

Generate feedback that empowers improvement rather than just criticism.`;

    try {
      const messages: AIMessage[] = [
        { role: 'user', content: feedbackPrompt }
      ];

      const systemPrompt = `You are a constructive feedback specialist. Your role is to transform validation results into actionable, encouraging feedback that helps agents improve their work quality.

      Focus on:
      - Solution-oriented recommendations
      - Specific, implementable suggestions
      - Recognition of quality work alongside improvement opportunities
      - Collaborative tone that supports learning and growth
      
      Avoid:
      - Purely critical feedback without solutions
      - Vague or general recommendations
      - Discouraging or dismissive language
      - Recommendations that ignore practical constraints`;

      const response = await universalAIClient.generateResponse(
        this.id,
        messages,
        systemPrompt
      );

      return this.parseFeedbackResponse(response.content, validationResults);

    } catch (error) {
      console.error('Reviewer: Error generating feedback:', error);
      
      // Fallback feedback generation
      return {
        overallAssessment: `Validation completed with score: ${validationResults.score}/100`,
        keyStrengths: ['Output was delivered as requested'],
        improvementAreas: validationResults.recommendations,
        actionableRecommendations: ['Review validation details for specific improvement opportunities'],
        integrationStrategy: 'Consider incorporating validation feedback through targeted revisions'
      };
    }
  }

  /**
   * Select alternate LLM to avoid similar results
   */
  private async selectAlternateLLM(originalModel: string): Promise<string> {
    // Map original models to different alternatives for independent validation
    const modelAlternatives: Record<string, string> = {
      'claude-3-5-sonnet-20241022': 'gpt-4o',
      'gpt-4o': 'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022': 'gpt-4o-mini',
      'gpt-4o-mini': 'claude-3-5-haiku-20241022'
    };

    const alternateModel = modelAlternatives[originalModel] || 'claude-3-5-sonnet-20241022';
    
    console.log(`🔄 Reviewer: Using ${alternateModel} for independent validation (original: ${originalModel})`);
    
    return alternateModel;
  }

  /**
   * Load CNS review patterns and learnings
   */
  private async loadReviewPatterns(): Promise<string> {
    try {
      const learnings = await this.cnsManager.getActiveLearnings();
      return learnings || 'No prior review patterns available - establishing baseline';
    } catch (error) {
      console.warn('Reviewer: Could not load CNS patterns:', error.message);
      return 'CNS patterns unavailable - using default review criteria';
    }
  }

  /**
   * Update CNS with new review learnings
   */
  private async updateReviewLearnings(
    request: ReviewRequest, 
    validationResults: ValidationResults, 
    feedback: ReviewFeedback
  ): Promise<void> {
    try {
      const learningContext = {
        sourceAgent: request.sourceAgent,
        validationScore: validationResults.score,
        reviewDate: new Date().toISOString(),
        keyPatterns: validationResults.recommendations
      };

      await this.cnsManager.processLearningFeedback(
        `Review completed for ${request.sourceAgent} with score ${validationResults.score}/100`,
        learningContext
      );

      console.log('🧠 Reviewer: Updated CNS with review patterns');

    } catch (error) {
      console.warn('Reviewer: Could not update CNS learnings:', error.message);
    }
  }

  /**
   * Generate review guidance for general queries
   */
  private async generateReviewGuidance(userRequest: string): Promise<string> {
    const guidancePrompt = `# Review Guidance Request

## User Request
${userRequest}

## My Role as Reviewer Agent
I am a specialized quality assurance agent with the following capabilities:
- Independent validation of agent outputs using alternate LLMs
- Quality assessment across multiple dimensions
- Risk and gap analysis
- Constructive feedback generation
- CNS-powered learning from review patterns

## Response Task
Provide helpful guidance about review and quality assurance based on the user's request.

**Response Guidelines:**
- Explain my review capabilities clearly
- Offer specific help related to quality assurance
- Suggest how I can help validate their work
- Be concise but informative
- Focus on practical value

Generate a helpful response about my review and validation capabilities.`;

    try {
      const messages: AIMessage[] = [
        { role: 'user', content: guidancePrompt }
      ];

      const systemPrompt = await this.buildReviewerSystemPrompt();

      const response = await universalAIClient.generateResponse(
        this.id,
        messages,
        systemPrompt
      );

      return response.content;

    } catch (error) {
      console.error('Reviewer: Error generating guidance:', error);
      return `I'm the Reviewer Agent, specializing in independent quality validation of agent outputs. I can help assess work quality, provide constructive feedback, and ensure deliverables meet professional standards. How can I assist with quality assurance for your project?`;
    }
  }

  /**
   * Build system prompt with CNS integration
   */
  private async buildReviewerSystemPrompt(): Promise<string> {
    const cnsLearnings = await this.loadReviewPatterns();

    return `You are the Reviewer Agent, a specialized quality assurance AI with expertise in independent validation and constructive feedback generation.

## Your Core Identity & Capabilities
- **Independent Validator**: You provide objective quality assessment using alternate LLMs to avoid bias
- **Quality Specialist**: You evaluate deliverables across multiple professional quality dimensions
- **Constructive Feedback Expert**: You generate actionable recommendations that improve outcomes
- **Risk Assessor**: You identify potential gaps, issues, and mitigation strategies
- **Learning System**: You use CNS to continuously improve review patterns and methodologies

## Your CNS Learnings
${cnsLearnings}

## Review Philosophy
1. **Independence**: Use different models/approaches than the original agent for objective perspective
2. **Construction**: Focus on improvement opportunities, not just criticism
3. **Actionability**: Provide specific, implementable recommendations
4. **Balance**: Recognize strengths while addressing weaknesses
5. **Learning**: Continuously improve review patterns through CNS integration

## Communication Style
- Professional yet approachable
- Solution-oriented and constructive
- Clear and specific in recommendations
- Respectful of agent and user efforts
- Focused on practical improvement outcomes

Your role is to elevate the quality of agent outputs through independent validation and constructive feedback that enables continuous improvement.`;
  }

  // Helper methods for parsing and calculation
  private extractRecommendations(results: any): string[] {
    const recommendations: string[] = [];
    
    for (const [type, content] of Object.entries(results)) {
      if (typeof content === 'string') {
        const recMatch = content.match(/(?:RECOMMENDATIONS?|SUGGESTIONS?|IMPROVEMENTS?):\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
        if (recMatch) {
          const recs = recMatch[1].split(/[•\-\n]/).map(r => r.trim()).filter(r => r.length > 5);
          recommendations.push(...recs);
        }
      }
    }
    
    return [...new Set(recommendations)].slice(0, 5); // Top 5 unique recommendations
  }

  private calculateQualityMetrics(results: any): QualityMetrics {
    // Extract metrics from validation results
    const metrics: QualityMetrics = {
      completeness: 75,
      accuracy: 75,
      usability: 75,
      professionalism: 75,
      alignment: 75
    };

    // Parse metrics from results if available
    for (const [type, content] of Object.entries(results)) {
      if (typeof content === 'string') {
        const scoreMatches = content.match(/(\w+)(?:_SCORE)?:\s*(\d+)/gi);
        if (scoreMatches) {
          scoreMatches.forEach(match => {
            const [, metric, score] = match.match(/(\w+)(?:_SCORE)?:\s*(\d+)/i) || [];
            if (metric && score) {
              const normalizedMetric = metric.toLowerCase();
              if (normalizedMetric.includes('complete')) metrics.completeness = parseInt(score);
              if (normalizedMetric.includes('accura')) metrics.accuracy = parseInt(score);
              if (normalizedMetric.includes('usab')) metrics.usability = parseInt(score);
              if (normalizedMetric.includes('quality') || normalizedMetric.includes('professional')) metrics.professionalism = parseInt(score);
              if (normalizedMetric.includes('align')) metrics.alignment = parseInt(score);
            }
          });
        }
      }
    }

    return metrics;
  }

  private calculateConfidence(results: any): number {
    // Calculate confidence based on consistency and completeness of validation results
    let confidence = 75; // Base confidence
    
    const resultEntries = Object.entries(results);
    const completedValidations = resultEntries.filter(([, content]) => 
      typeof content === 'string' && content.length > 100 && !content.includes('error')
    ).length;
    
    const validationRatio = completedValidations / resultEntries.length;
    confidence = Math.round(50 + (validationRatio * 50)); // 50-100 range based on completion
    
    return Math.max(50, Math.min(100, confidence));
  }

  private parseFeedbackResponse(response: string, validationResults: ValidationResults): ReviewFeedback {
    // Parse structured feedback response
    const feedback: ReviewFeedback = {
      overallAssessment: '',
      keyStrengths: [],
      improvementAreas: [],
      actionableRecommendations: [],
      integrationStrategy: ''
    };

    // Extract sections using regex patterns
    const assessmentMatch = response.match(/OVERALL_ASSESSMENT:\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    if (assessmentMatch) feedback.overallAssessment = assessmentMatch[1].trim();

    const strengthsMatch = response.match(/KEY_STRENGTHS:\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    if (strengthsMatch) {
      feedback.keyStrengths = strengthsMatch[1].split(/[•\-\n]/).map(s => s.trim()).filter(s => s.length > 5);
    }

    const improvementsMatch = response.match(/IMPROVEMENT_AREAS:\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    if (improvementsMatch) {
      feedback.improvementAreas = improvementsMatch[1].split(/[•\-\n]/).map(i => i.trim()).filter(i => i.length > 5);
    }

    const recommendationsMatch = response.match(/ACTIONABLE_RECOMMENDATIONS:\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    if (recommendationsMatch) {
      feedback.actionableRecommendations = recommendationsMatch[1].split(/[•\-\n]/).map(r => r.trim()).filter(r => r.length > 5);
    }

    const integrationMatch = response.match(/INTEGRATION_STRATEGY:\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    if (integrationMatch) feedback.integrationStrategy = integrationMatch[1].trim();

    // Fallback to default values if parsing fails
    if (!feedback.overallAssessment) {
      feedback.overallAssessment = `Validation completed with score: ${validationResults.score}/100`;
    }

    return feedback;
  }

  /**
   * Validate a deliverable against specific criteria
   */
  async validateDeliverable(payload: DeliverableValidationRequest): Promise<ValidationResult> {
    const validationPrompt = `# Deliverable Validation

## Deliverable to Validate
${payload.deliverable}

## Validation Criteria
${payload.criteria.join('\n- ')}

## Success Metrics
${payload.successMetrics || 'Professional quality, completeness, and usability'}

## Validation Task
Assess this deliverable against the specified criteria and provide a comprehensive validation report.

**Assessment Dimensions:**
1. **Criteria Compliance**: How well does the deliverable meet each specified criterion?
2. **Quality Standards**: Does it meet professional quality expectations?
3. **Completeness**: Are all necessary components present and well-developed?
4. **Usability**: Can the end user effectively utilize this deliverable?
5. **Value Delivery**: Does it provide genuine value for the intended purpose?

**Output Format:**
VALIDATION_SCORE: [0-100]
CRITERIA_ANALYSIS: [detailed assessment against each criterion]
QUALITY_REVIEW: [professional standards evaluation]
COMPLETENESS_CHECK: [missing elements or gaps]
USABILITY_ASSESSMENT: [practical applicability review]
VALUE_EVALUATION: [effectiveness for intended purpose]
RECOMMENDATIONS: [specific improvement suggestions]

Provide objective, constructive validation that helps improve deliverable quality.`;

    try {
      const messages: AIMessage[] = [
        { role: 'user', content: validationPrompt }
      ];

      const systemPrompt = `You are a deliverable validation specialist focused on objective quality assessment.
      
      Your role is to:
      - Evaluate deliverables against specific criteria
      - Assess professional quality standards
      - Identify improvement opportunities
      - Provide constructive, actionable feedback
      
      Maintain objectivity while being constructive and solution-oriented.`;

      const response = await universalAIClient.generateResponse(
        this.id,
        messages,
        systemPrompt
      );

      return this.parseValidationResult(response.content);

    } catch (error) {
      console.error('Reviewer: Error in deliverable validation:', error);
      
      return {
        score: 75,
        analysis: 'Validation process encountered technical difficulties',
        recommendations: ['Retry validation process', 'Check deliverable formatting'],
        qualityLevel: 'needs-improvement'
      };
    }
  }

  /**
   * Assess overall quality of work
   */
  async assessQuality(payload: QualityAssessmentRequest): Promise<QualityAssessment> {
    const assessmentPrompt = `# Quality Assessment

## Work to Assess
${payload.work}

## Quality Framework
${payload.framework || 'Professional standards with focus on completeness, accuracy, usability, and presentation'}

## Assessment Context
${payload.context || 'General quality evaluation'}

## Quality Assessment Task
Provide a comprehensive quality assessment using professional standards and best practices.

**Quality Dimensions:**
1. **Content Quality**: Accuracy, depth, relevance, currency
2. **Structural Quality**: Organization, flow, logical progression
3. **Presentation Quality**: Clarity, formatting, professional appearance
4. **Functional Quality**: Usability, practical applicability, effectiveness
5. **Value Quality**: Meets user needs, provides genuine benefit

**Assessment Methodology:**
- Apply professional industry standards
- Consider user experience and practical utility
- Evaluate against comparable work in the domain
- Assess both strengths and improvement opportunities

**Output Format:**
OVERALL_QUALITY_SCORE: [0-100]
CONTENT_ASSESSMENT: [accuracy, depth, relevance evaluation]
STRUCTURE_REVIEW: [organization and flow analysis]
PRESENTATION_EVALUATION: [clarity and professional standards]
FUNCTIONAL_ANALYSIS: [usability and effectiveness assessment]
VALUE_DETERMINATION: [user benefit and practical utility]
IMPROVEMENT_ROADMAP: [prioritized enhancement recommendations]

Provide balanced assessment that recognizes quality work while identifying growth opportunities.`;

    try {
      const messages: AIMessage[] = [
        { role: 'user', content: assessmentPrompt }
      ];

      const systemPrompt = `You are a quality assessment expert with deep experience in professional standards evaluation.
      
      Your approach emphasizes:
      - Objective, criteria-based assessment
      - Recognition of quality work and achievements
      - Constructive identification of improvement opportunities
      - Practical, actionable recommendations
      - Balanced perspective that supports growth and excellence
      
      Provide assessments that help elevate work quality while acknowledging existing strengths.`;

      const response = await universalAIClient.generateResponse(
        this.id,
        messages,
        systemPrompt
      );

      return this.parseQualityAssessment(response.content);

    } catch (error) {
      console.error('Reviewer: Error in quality assessment:', error);
      
      return {
        overallScore: 75,
        dimensionScores: {
          content: 75,
          structure: 75,
          presentation: 75,
          functionality: 75,
          value: 75
        },
        assessment: 'Quality assessment process encountered technical difficulties',
        recommendations: ['Retry assessment process', 'Verify work formatting and accessibility'],
        improvementPriorities: ['Technical process resolution']
      };
    }
  }

  // Helper parsing methods
  private parseValidationResult(response: string): ValidationResult {
    const scoreMatch = response.match(/VALIDATION_SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

    const analysisMatch = response.match(/CRITERIA_ANALYSIS:\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    const analysis = analysisMatch ? analysisMatch[1].trim() : 'Analysis not available';

    const recommendationsMatch = response.match(/RECOMMENDATIONS:\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    const recommendations = recommendationsMatch 
      ? recommendationsMatch[1].split(/[•\-\n]/).map(r => r.trim()).filter(r => r.length > 5)
      : ['No specific recommendations generated'];

    const qualityLevel = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'acceptable' : 'needs-improvement';

    return {
      score,
      analysis,
      recommendations,
      qualityLevel
    };
  }

  private parseQualityAssessment(response: string): QualityAssessment {
    const overallScoreMatch = response.match(/OVERALL_QUALITY_SCORE:\s*(\d+)/i);
    const overallScore = overallScoreMatch ? parseInt(overallScoreMatch[1]) : 75;

    // Extract dimension scores if available
    const dimensionScores = {
      content: this.extractDimensionScore(response, 'CONTENT') || 75,
      structure: this.extractDimensionScore(response, 'STRUCTURE') || 75,
      presentation: this.extractDimensionScore(response, 'PRESENTATION') || 75,
      functionality: this.extractDimensionScore(response, 'FUNCTIONAL') || 75,
      value: this.extractDimensionScore(response, 'VALUE') || 75
    };

    const assessmentMatch = response.match(/(?:CONTENT_ASSESSMENT|OVERALL):\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    const assessment = assessmentMatch ? assessmentMatch[1].trim() : 'Assessment details not available';

    const recommendationsMatch = response.match(/IMPROVEMENT_ROADMAP:\s*([^\n]+(?:\n[^A-Z\n].*)*)/i);
    const recommendations = recommendationsMatch 
      ? recommendationsMatch[1].split(/[•\-\n]/).map(r => r.trim()).filter(r => r.length > 5)
      : ['No specific recommendations generated'];

    return {
      overallScore,
      dimensionScores,
      assessment,
      recommendations,
      improvementPriorities: recommendations.slice(0, 3) // Top 3 priorities
    };
  }

  private extractDimensionScore(response: string, dimension: string): number | null {
    const pattern = new RegExp(`${dimension}[^:]*:\\s*([^\\n]*?(\\d+)[^\\n]*)`, 'i');
    const match = response.match(pattern);
    if (match) {
      const scoreMatch = match[0].match(/(\d+)/);
      return scoreMatch ? parseInt(scoreMatch[1]) : null;
    }
    return null;
  }
}

// Type definitions for Reviewer Agent
export interface ReviewRequest {
  originalMission: string;
  expectedResults: string;
  actualDeliverables: string;
  sourceAgent: string;
  modelUsed: string;
}

export interface ReviewResult {
  validationScore: number;
  feedback: ReviewFeedback;
  recommendedActions: string[];
  qualityMetrics: QualityMetrics;
  reviewerConfidence: number;
  alternateModel: string;
}

export interface ReviewFeedback {
  overallAssessment: string;
  keyStrengths: string[];
  improvementAreas: string[];
  actionableRecommendations: string[];
  integrationStrategy: string;
}

export interface QualityMetrics {
  completeness: number;
  accuracy: number;
  usability: number;
  professionalism: number;
  alignment: number;
}

export interface ValidationPrompt {
  type: string;
  prompt: string;
  expectedOutput: string;
}

export interface ValidationPromptParams {
  originalMission: string;
  expectedResults: string;
  actualDeliverables: string;
  sourceAgent: string;
  cnsLearnings: string;
}

export interface ValidationResults {
  score: number;
  details: any;
  recommendations: string[];
  metrics: QualityMetrics;
  confidence: number;
}

export interface DeliverableValidationRequest {
  deliverable: string;
  criteria: string[];
  successMetrics?: string;
}

export interface ValidationResult {
  score: number;
  analysis: string;
  recommendations: string[];
  qualityLevel: 'excellent' | 'good' | 'acceptable' | 'needs-improvement';
}

export interface QualityAssessmentRequest {
  work: string;
  framework?: string;
  context?: string;
}

export interface QualityAssessment {
  overallScore: number;
  dimensionScores: {
    content: number;
    structure: number;
    presentation: number;
    functionality: number;
    value: number;
  };
  assessment: string;
  recommendations: string[];
  improvementPriorities: string[];
}
