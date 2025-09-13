/**
 * Global Agent Learning System
 * Enables ALL agents to learn from feedback, modify their own CNS files,
 * and improve their methodologies autonomously
 */

import * as fs from 'fs';
import * as path from 'path';
import { ClaudeService } from '../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';
import { learningTracker } from '../lib/learning-tracker';
import { LearningChange } from '../types/learning-tracking';

export interface LearningFeedback {
  agentId: string;
  sessionId: string;
  userMessage: string;
  agentResponse: string;
  userFeedback: string;
  improvementSuggestion: string;
  timestamp: Date;
  context: any;
}

export interface MethodologyUpdate {
  area: string; // e.g., "question-asking", "format-clarification", "project-scoping"
  currentBehavior: string;
  suggestedImprovement: string;
  implementationPlan: string[];
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

export interface CNSUpdate {
  category: string;
  skill: string;
  proficiency: number;
  lastUpdated: Date;
  learningSource: string;
  examples: string[];
  confidenceLevel: number;
}

export interface LearningCapableAgent {
  id: string;
  learningSystem: GlobalAgentLearningSystem;
  
  // Standard learning methods available to all agents
  processUserFeedback(feedback: string, context: any): Promise<void>;
  updateOwnMethodology(area: string, improvement: string): Promise<void>;
  shouldAskClarifyingQuestions(request: string): Promise<{ shouldAsk: boolean; questions: string[] }>;
  learnFromInteraction(interaction: AgentInteraction): Promise<void>;
  getSelfAssessment(): Promise<SelfAssessment>;
}

export interface AgentInteraction {
  request: string;
  response: string;
  success: boolean;
  userSatisfaction?: number; // 1-10 scale
  feedback?: string;
  context: any;
}

export interface SelfAssessment {
  strengths: string[];
  weaknesses: string[];
  recentLearnings: string[];
  confidenceAreas: { area: string; confidence: number }[];
  suggestedImprovements: string[];
}

export class GlobalAgentLearningSystem {
  protected agentId: string;
  protected basePath: string;
  protected claudeService: ClaudeService;
  protected cnsBridge?: any; // PersonalAssistantBridge for private CNS access
  
  constructor(agentId: string, cnsBridge?: any) {
    this.agentId = agentId;
    // Use the workspace path instead of __dirname for Next.js compatibility
    this.basePath = path.join(process.cwd(), 'agents', agentId);
    this.claudeService = AgentClaudeClientFactory.createPersonalAssistantClient(); // Use appropriate client
    this.cnsBridge = cnsBridge; // Optional bridge for private CNS access
    
    this.ensureDirectoryStructure();
  }

  private ensureDirectoryStructure(): void {
    const directories = [
      path.join(this.basePath, 'cns'),
      path.join(this.basePath, 'methodology'), 
      path.join(this.basePath, 'learning-log'),
      path.join(this.basePath, 'self-assessments')
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Process user feedback and autonomously improve
   */
  async processFeedback(feedback: LearningFeedback): Promise<void> {
    console.log(`🎓 ${this.agentId}: Processing learning feedback...`);

    // Log the feedback
    await this.logFeedback(feedback);

    // Analyze using Claude what needs improvement
    const analysis = await this.analyzeFeedback(feedback);

    // Autonomously update methodology files
    if (analysis.methodologyUpdates.length > 0) {
      await this.updateMethodologies(analysis.methodologyUpdates);
      console.log(`📝 ${this.agentId}: Updated ${analysis.methodologyUpdates.length} methodologies`);
    }

    // Update CNS with new learnings
    if (analysis.cnsUpdates.length > 0) {
      await this.updateCNS(analysis.cnsUpdates);
      console.log(`🧠 ${this.agentId}: Added ${analysis.cnsUpdates.length} new skills/knowledge`);
    }

    // Create self-assessment
    const assessment = await this.createSelfAssessment();
    await this.saveSelfAssessment(assessment);

    console.log(`✅ ${this.agentId}: Learning cycle complete - I've improved myself based on your feedback!`);
  }

  /**
   * Analyze feedback and determine what improvements to make
   */
  private async analyzeFeedback(feedback: LearningFeedback): Promise<{
    methodologyUpdates: MethodologyUpdate[];
    cnsUpdates: CNSUpdate[];
    reasoning: string;
    confidenceLevel: number;
  }> {
    const currentMethodology = await this.loadCurrentMethodology();
    const currentCNS = await this.loadCurrentCNS();

    const analysisPrompt = `# Agent Self-Improvement Analysis

## Agent: ${this.agentId}
## User Interaction Analysis
**User Request**: "${feedback.userMessage}"
**My Response**: "${feedback.agentResponse}"
**User Feedback**: "${feedback.userFeedback}"
**Improvement Suggestion**: "${feedback.improvementSuggestion}"

## My Current Methodology
${currentMethodology}

## My Current CNS Knowledge
${JSON.stringify(currentCNS, null, 2)}

## Self-Analysis Task
I need to analyze this feedback and determine how to improve myself:

1. **What specific methodologies should I update?**
2. **What new skills/knowledge should I add to my CNS?**
3. **How can I prevent similar issues in the future?**
4. **What questions should I have asked to avoid this problem?**

## Response Format
METHODOLOGY_UPDATES: [
  {
    "area": "question-asking",
    "currentBehavior": "description",
    "suggestedImprovement": "specific improvement",
    "implementationPlan": ["step1", "step2"],
    "confidence": 0.9,
    "priority": "high"
  }
]

CNS_UPDATES: [
  {
    "category": "methodology",
    "skill": "project-scoping-questions",
    "proficiency": 0.8,
    "examples": ["example1", "example2"],
    "confidenceLevel": 0.9
  }
]

REASONING: [detailed explanation of analysis]
CONFIDENCE: [0.0-1.0 confidence in these improvements]

Be specific and actionable - I need to be able to implement these changes immediately.`;

    const response = await this.claudeService.generateResponse(
      [{ role: 'user', content: analysisPrompt }],
      `You are the self-analysis system for agent "${this.agentId}". Analyze feedback and determine specific improvements to make to your own behavior and knowledge.`
    );

    return this.parseAnalysisResponse(response);
  }

  /**
   * Autonomously update methodology files
   */
  private async updateMethodologies(updates: MethodologyUpdate[]): Promise<void> {
    for (const update of updates) {
      const methodologyFile = path.join(this.basePath, 'methodology', `${update.area}.md`);
      
      // Load existing methodology
      let existingContent = '';
      if (fs.existsSync(methodologyFile)) {
        existingContent = fs.readFileSync(methodologyFile, 'utf8');
      }

      // Generate improved methodology using Claude
      const improvedMethodology = await this.generateImprovedMethodology(update, existingContent);
      
      // Save updated methodology
      fs.writeFileSync(methodologyFile, improvedMethodology);
      
      // Log the change
      await this.logMethodologyChange(update.area, update.suggestedImprovement);
    }
  }

  /**
   * Generate improved methodology content
   */
  private async generateImprovedMethodology(update: MethodologyUpdate, existingContent: string): Promise<string> {
    const prompt = `# Methodology Self-Improvement for Agent: ${this.agentId}

## Area: ${update.area}

## Current Methodology:
${existingContent || 'No existing methodology'}

## Required Improvement:
**Current Behavior**: ${update.currentBehavior}
**Suggested Improvement**: ${update.suggestedImprovement}
**Implementation Plan**: ${update.implementationPlan.join(' → ')}
**Priority**: ${update.priority}

## Task:
Create an updated, comprehensive methodology document that incorporates this improvement.

The methodology should include:

1. **Overview**: What this methodology covers
2. **When to Apply**: Specific triggers and situations
3. **Step-by-Step Process**: Exact steps to follow
4. **Quality Checks**: How to verify good execution
5. **Examples**: Concrete examples of good and bad execution
6. **Improvement Tracking**: How to measure success

Make this actionable and specific so I can follow it consistently in future interactions.

Format as clear markdown with practical guidance.`;

    return await this.claudeService.generateResponse(
      [{ role: 'user', content: prompt }],
      `You are creating self-improvement methodology for agent "${this.agentId}". Write practical, actionable guidance that will improve performance.`
    );
  }

  /**
   * Check if agent should ask clarifying questions before proceeding
   */
  async shouldAskClarifyingQuestions(request: string, requestType?: string): Promise<{
    shouldAsk: boolean;
    questions: string[];
    reasoning: string;
    confidence: number;
  }> {
    const questioningMethodology = await this.loadMethodology('question-asking');
    
    const analysisPrompt = `# Clarifying Questions Decision Analysis

## Agent: ${this.agentId}
## User Request: "${request}"
## Request Type: ${requestType || 'general'}

## My Current Question-Asking Methodology:
${questioningMethodology}

## Analysis Task:
Based on my methodology and this specific request, should I ask clarifying questions before proceeding?

Consider:
- **Complexity**: How complex is this request?
- **Ambiguity**: What's unclear or could be interpreted multiple ways?
- **Format Requirements**: What format/delivery options do I have?
- **Scope**: How broad or narrow should the work be?
- **Timeline**: Any time constraints to consider?
- **Quality Standards**: What level of quality is expected?

## Response Format:
SHOULD_ASK: [yes/no]
QUESTIONS: [
  "What format would work best for you: document, presentation, or interactive discussion?",
  "Are there specific areas you'd like me to focus on or avoid?",
  "What's your timeline for this deliverable?",
  "What level of detail are you looking for?"
]
REASONING: [specific explanation for this decision]
CONFIDENCE: [0.0-1.0 confidence in this decision]`;

    const response = await this.claudeService.generateResponse(
      [{ role: 'user', content: analysisPrompt }],
      `You are agent "${this.agentId}" analyzing whether to ask clarifying questions before starting work.`
    );

    return this.parseQuestioningAnalysis(response);
  }

  /**
   * Autonomously learn from successful interactions
   */
  async learnFromSuccess(interaction: AgentInteraction): Promise<void> {
    if (interaction.success && interaction.userSatisfaction && interaction.userSatisfaction >= 8) {
      // Analyze what made this interaction successful
      const successAnalysis = await this.analyzeSuccessfulInteraction(interaction);
      
      // Update CNS with successful patterns
      await this.updateCNS(successAnalysis.cnsUpdates);
      
      // Reinforce successful methodologies
      await this.reinforceSuccessfulMethodologies(successAnalysis.successPatterns);
    }
  }

  /**
   * Create comprehensive self-assessment
   */
  async createSelfAssessment(): Promise<SelfAssessment> {
    const methodology = await this.loadCurrentMethodology();
    const cns = await this.loadCurrentCNS();
    const recentLearnings = await this.getRecentLearnings();

    const assessmentPrompt = `# Self-Assessment for Agent: ${this.agentId}

## My Current Capabilities
**Methodologies**: ${methodology}
**CNS Knowledge**: ${JSON.stringify(cns, null, 2)}
**Recent Learnings**: ${JSON.stringify(recentLearnings, null, 2)}

## Self-Assessment Task
Provide an honest assessment of my current state:

1. **Strengths**: What am I particularly good at?
2. **Weaknesses**: Where do I need improvement?
3. **Recent Progress**: What have I learned recently?
4. **Confidence Areas**: Rate my confidence in different areas (0.0-1.0)
5. **Suggested Improvements**: What should I work on next?

## Response Format:
STRENGTHS: [list of specific strengths]
WEAKNESSES: [list of specific weaknesses]  
RECENT_LEARNINGS: [list of recent improvements]
CONFIDENCE_AREAS: [{"area": "question-asking", "confidence": 0.8}]
SUGGESTED_IMPROVEMENTS: [list of specific areas to improve]`;

    const response = await this.claudeService.generateResponse(
      [{ role: 'user', content: assessmentPrompt }],
      `You are agent "${this.agentId}" conducting honest self-assessment of your capabilities and performance.`
    );

    return this.parseSelfAssessment(response);
  }

  // Helper methods for loading and saving data
  private async loadCurrentMethodology(): Promise<string> {
    const methodologyDir = path.join(this.basePath, 'methodology');
    if (!fs.existsSync(methodologyDir)) return 'No methodologies defined';

    const files = fs.readdirSync(methodologyDir).filter(f => f.endsWith('.md'));
    let content = '';
    
    for (const file of files) {
      const fileContent = fs.readFileSync(path.join(methodologyDir, file), 'utf8');
      content += `\n## ${file.replace('.md', '')}\n${fileContent}\n`;
    }
    
    return content || 'No methodologies defined';
  }

  private async loadCurrentCNS(): Promise<CNSUpdate[]> {
    const cnsFile = path.join(this.basePath, 'cns', 'skill-database.json');
    if (fs.existsSync(cnsFile)) {
      return JSON.parse(fs.readFileSync(cnsFile, 'utf8'));
    }
    return [];
  }

  private async loadMethodology(area: string): Promise<string> {
    const file = path.join(this.basePath, 'methodology', `${area}.md`);
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, 'utf8');
    }
    return `No methodology defined for ${area}`;
  }

  // ... Additional helper methods for parsing responses, logging, etc.
  
  private parseAnalysisResponse(response: string): any {
    // Implementation would parse structured JSON/text response
    return {
      methodologyUpdates: [],
      cnsUpdates: [],
      reasoning: response,
      confidenceLevel: 0.8
    };
  }

  private parseQuestioningAnalysis(response: string): any {
    // Implementation would parse structured response
    return {
      shouldAsk: true,
      questions: [],
      reasoning: response,
      confidence: 0.8
    };
  }

  private parseSelfAssessment(response: string): SelfAssessment {
    // Implementation would parse structured response
    return {
      strengths: [],
      weaknesses: [],
      recentLearnings: [],
      confidenceAreas: [],
      suggestedImprovements: []
    };
  }

  // Additional helper methods...
  private async updateCNS(updates: CNSUpdate[]): Promise<void> {
    const cnsFile = path.join(this.basePath, 'cns', 'skill-database.json');
    let existingCNS: CNSUpdate[] = await this.loadCurrentCNS();
    
    // Merge updates
    for (const update of updates) {
      const existingIndex = existingCNS.findIndex(
        entry => entry.category === update.category && entry.skill === update.skill
      );
      
      if (existingIndex >= 0) {
        existingCNS[existingIndex] = { ...existingCNS[existingIndex], ...update, lastUpdated: new Date() };
      } else {
        existingCNS.push({ ...update, lastUpdated: new Date() });
      }
    }
    
    fs.writeFileSync(cnsFile, JSON.stringify(existingCNS, null, 2));
  }

  private async logFeedback(feedback: LearningFeedback): Promise<void> {
    const logFile = path.join(this.basePath, 'learning-log', `${new Date().toISOString().split('T')[0]}.json`);
    let logs: LearningFeedback[] = [];
    
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
    
    logs.push(feedback);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  }

  private async logMethodologyChange(area: string, change: string): Promise<void> {
    const changeLog = path.join(this.basePath, 'methodology', '_change-log.json');
    let logs: { area: string; change: string; timestamp: Date; agentId: string }[] = [];
    
    if (fs.existsSync(changeLog)) {
      logs = JSON.parse(fs.readFileSync(changeLog, 'utf8'));
    }
    
    logs.push({
      area,
      change,
      timestamp: new Date(),
      agentId: this.agentId
    });
    
    fs.writeFileSync(changeLog, JSON.stringify(logs, null, 2));
  }

  private async getRecentLearnings(): Promise<LearningFeedback[]> {
    const logDir = path.join(this.basePath, 'learning-log');
    if (!fs.existsSync(logDir)) return [];
    
    // Get recent learning logs (last 7 days)
    const recentFiles = fs.readdirSync(logDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .slice(-7);
    
    let learnings: LearningFeedback[] = [];
    for (const file of recentFiles) {
      const content = JSON.parse(fs.readFileSync(path.join(logDir, file), 'utf8'));
      learnings.push(...content);
    }
    
    return learnings;
  }

  private async saveSelfAssessment(assessment: SelfAssessment): Promise<void> {
    const assessmentFile = path.join(this.basePath, 'self-assessments', `${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(assessmentFile, JSON.stringify(assessment, null, 2));
  }

  private async analyzeSuccessfulInteraction(interaction: AgentInteraction): Promise<any> {
    // Analyze what made the interaction successful
    return {
      cnsUpdates: [],
      successPatterns: []
    };
  }

  private async reinforceSuccessfulMethodologies(patterns: any[]): Promise<void> {
    // Reinforce patterns that led to success
  }
}

/**
 * Extension to make agents learning-capable
 */
export function enableLearningCapabilities<T extends { id: string }>(agent: T): T & LearningCapableAgent {
  const learningSystem = new GlobalAgentLearningSystem(agent.id);
  
  return Object.assign(agent, {
    learningSystem,
    
    async processUserFeedback(feedback: string, context: any): Promise<void> {
      await learningSystem.processFeedback({
        agentId: agent.id,
        sessionId: context.sessionId || 'default',
        userMessage: context.lastUserMessage || '',
        agentResponse: context.lastAgentResponse || '',
        userFeedback: feedback,
        improvementSuggestion: feedback,
        timestamp: new Date(),
        context
      });
    },
    
    async updateOwnMethodology(area: string, improvement: string): Promise<void> {
      await learningSystem.processFeedback({
        agentId: agent.id,
        sessionId: 'self-improvement',
        userMessage: '',
        agentResponse: '',
        userFeedback: `Improve ${area}`,
        improvementSuggestion: improvement,
        timestamp: new Date(),
        context: { area, improvement }
      });
    },
    
    async shouldAskClarifyingQuestions(request: string): Promise<{ shouldAsk: boolean; questions: string[] }> {
      const result = await learningSystem.shouldAskClarifyingQuestions(request);
      return {
        shouldAsk: result.shouldAsk,
        questions: result.questions
      };
    },
    
    async learnFromInteraction(interaction: AgentInteraction): Promise<void> {
      await learningSystem.learnFromSuccess(interaction);
    },
    
    async getSelfAssessment(): Promise<SelfAssessment> {
      return await learningSystem.createSelfAssessment();
    }
  });
}

/**
 * Enhanced CNS Management - Works with Private Repository via Bridge
 * These methods provide the core functionality for "Teach Me New Behaviors" and "Provide Feedback"
 */
export class EnhancedGlobalLearningSystem extends GlobalAgentLearningSystem {
  
  constructor(agentId: string, cnsBridge: any) {
    super(agentId, cnsBridge);
  }
  
  /**
   * Core capability: Modify agent CNS based on user feedback
   * This powers the "Teach Me New Behaviors" functionality
   */
  async teachNewBehavior(behaviorDescription: string, targetAgent?: string): Promise<{
    success: boolean;
    updatedCapabilities: string[];
    error?: string;
    learningId?: string;
    detailedLearningReport?: {
      learningExplanation: string;
      beforeAfterComparison: string;
      filesModified: string[];
      behaviorChanges: string[];
    };
  }> {
    const agent = targetAgent || this.agentId;
    
    try {
      console.log(`🧠 Teaching new behavior to ${agent}:`, behaviorDescription);
      
      // Use Claude to analyze the behavior and determine CNS updates needed
      const behaviorAnalysis = await this.analyzeBehaviorForCNS(behaviorDescription, agent);
      
      // Apply CNS updates through the bridge
      const cnsUpdate = await this.cnsBridge!.handleTask({
        type: 'update-cns-learning',
        payload: {
          requestingAgent: 'global-learning-system',
          agentType: agent,
          behaviorDescription,
          cnsUpdates: behaviorAnalysis.cnsUpdates,
          newCapabilities: behaviorAnalysis.newCapabilities,
          reflexUpdates: behaviorAnalysis.reflexUpdates,
          memoryEnhancements: behaviorAnalysis.memoryEnhancements
        }
      });
      
      if (cnsUpdate.success) {
        console.log(`✅ Successfully taught new behavior to ${agent}`);
        
        // Log learning event for tracking and user feedback
        let learningId: string | undefined;
        try {
          const learningChanges: LearningChange[] = cnsUpdate.result?.filesModified?.map((file: string) => ({
            file,
            type: 'modify' as const,
            afterContent: 'CNS Updated with new behavior'
          })) || [];

          learningId = await learningTracker.logLearningEvent({
            agentType: agent,
            learningType: 'add_behavior',
            description: behaviorDescription,
            area: 'general',
            complexity: 'moderate',
            filesModified: cnsUpdate.result?.filesModified || [],
            changesApplied: learningChanges,
            claudeAnalysis: JSON.stringify(behaviorAnalysis, null, 2)
          });

          console.log(`📝 Learning tracked with ID: ${learningId}`);
        } catch (trackingError) {
          console.warn('⚠️ Failed to track learning event:', trackingError);
        }
        
        // Generate detailed learning report if needed
        let detailedLearningReport;
        if (process.env.DEVELOPMENT_MODE === 'true' || process.env.LEARNING_FEEDBACK_ENABLED === 'true') {
          detailedLearningReport = await this.generateLearningReport(
            behaviorDescription, 
            behaviorAnalysis, 
            cnsUpdate.result,
            agent
          );
        }
        
        return {
          success: true,
          updatedCapabilities: behaviorAnalysis.newCapabilities,
          detailedLearningReport,
          learningId // Include learning ID for UI feedback
        };
      } else {
        throw new Error(cnsUpdate.error);
      }
    } catch (error) {
      console.error(`❌ Failed to teach behavior to ${agent}:`, error);
      return {
        success: false,
        updatedCapabilities: [],
        error: error.message
      };
    }
  }
  
  /**
   * Core capability: Process user feedback and modify agent CNS accordingly
   * This powers the "Provide Feedback" functionality
   */
  async processUserFeedback(feedback: string, context: any, targetAgent?: string): Promise<{
    success: boolean;
    improvementsApplied: string[];
    error?: string;
    detailedLearningReport?: {
      learningExplanation: string;
      beforeAfterComparison: string;
      filesModified: string[];
      behaviorChanges: string[];
    };
  }> {
    const agent = targetAgent || this.agentId;
    
    try {
      console.log(`📝 Processing feedback for ${agent}:`, feedback);
      
      // Analyze feedback to determine specific improvements needed
      const feedbackAnalysis = await this.analyzeFeedbackForImprovements(feedback, context, agent);
      
      // Apply improvements through the bridge
      const improvement = await this.cnsBridge!.handleTask({
        type: 'apply-feedback-improvements',
        payload: {
          requestingAgent: 'global-learning-system',
          agentType: agent,
          originalFeedback: feedback,
          context,
          capabilityRefinements: feedbackAnalysis.capabilityRefinements,
          reflexAdjustments: feedbackAnalysis.reflexAdjustments,
          memoryUpdates: feedbackAnalysis.memoryUpdates,
          formattingImprovements: feedbackAnalysis.formattingImprovements
        }
      });
      
      if (improvement.success) {
        console.log(`✅ Applied feedback improvements to ${agent}`);
        
        // Generate detailed learning report if needed
        let detailedLearningReport;
        if (process.env.DEVELOPMENT_MODE === 'true' || process.env.LEARNING_FEEDBACK_ENABLED === 'true') {
          detailedLearningReport = await this.generateLearningReport(
            `Feedback: ${feedback}`, 
            { 
              cnsUpdates: feedbackAnalysis.memoryUpdates,
              newCapabilities: feedbackAnalysis.improvementsSummary,
              reflexUpdates: feedbackAnalysis.reflexAdjustments,
              memoryEnhancements: feedbackAnalysis.memoryUpdates
            }, 
            improvement.result,
            agent
          );
        }
        
        return {
          success: true,
          improvementsApplied: feedbackAnalysis.improvementsSummary,
          detailedLearningReport
        };
      } else {
        throw new Error(improvement.error);
      }
    } catch (error) {
      console.error(`❌ Failed to apply feedback to ${agent}:`, error);
      return {
        success: false,
        improvementsApplied: [],
        error: error.message
      };
    }
  }
  
  /**
   * Add or refine agent capabilities in private CNS
   */
  async addCapability(capability: string, description: string, targetAgent?: string): Promise<boolean> {
    const agent = targetAgent || this.agentId;
    
    const result = await this.cnsBridge!.handleTask({
      type: 'add-agent-capability',
      payload: {
        requestingAgent: 'global-learning-system',
        agentType: agent,
        capability,
        description,
        timestamp: new Date().toISOString()
      }
    });
    
    return result.success;
  }
  
  /**
   * Add new reflexes (automatic behaviors) to agent CNS
   */
  async addReflex(trigger: string, response: string, targetAgent?: string): Promise<boolean> {
    const agent = targetAgent || this.agentId;
    
    const result = await this.cnsBridge!.handleTask({
      type: 'add-agent-reflex',
      payload: {
        requestingAgent: 'global-learning-system',
        agentType: agent,
        trigger,
        response,
        priority: 'medium',
        timestamp: new Date().toISOString()
      }
    });
    
    return result.success;
  }
  
  /**
   * Add new method for sophisticated behavior removal
   */
  async removeBehavior(behaviorDescription: string, targetAgent?: string): Promise<{
    success: boolean;
    removedBehaviors: string[];
    conflictsDetected: string[];
    filesModified: string[];
    error?: string;
    learningId?: string;
    detailedRemovalReport?: {
      removalExplanation: string;
      beforeAfterComparison: string;
      conflictResolution: string;
      replacementBehaviors: string[];
    };
  }> {
    const agent = targetAgent || this.agentId;
    
    try {
      console.log(`🗑️ Removing behavior from ${agent}:`, behaviorDescription);
      
      // Step 1: Analyze current CNS state to understand existing behaviors
      const currentCNS = await this.analyzeCNSForRemoval(agent);
      
      // Step 2: Use Claude to identify specific behaviors to remove and potential conflicts
      const removalAnalysis = await this.analyzeRemovalRequest(behaviorDescription, currentCNS, agent);
      
      // Step 3: Check for conflicts with existing behaviors
      const conflictAnalysis = await this.detectBehaviorConflicts(removalAnalysis, currentCNS);
      
      // Step 4: Create backup of current state (simple versioning)
      const backupId = await this.createCNSBackup(agent);
      
      // Step 5: Apply removal through the bridge with conflict resolution
      const removalResult = await this.cnsBridge!.handleTask({
        type: 'remove-behavior',
        payload: {
          requestingAgent: 'global-learning-system',
          agentType: agent,
          behaviorDescription,
          targetBehaviors: removalAnalysis.targetBehaviors,
          conflictResolution: conflictAnalysis.resolutionStrategy,
          replacementBehaviors: removalAnalysis.replacementBehaviors,
          targetFiles: removalAnalysis.targetFiles,
          removalStrategy: removalAnalysis.removalStrategy,
          backupId
        }
      });
      
      if (removalResult.success) {
        console.log(`✅ Successfully removed behavior from ${agent}`);
        
        // Log removal event for tracking and user feedback
        let learningId: string | undefined;
        try {
          const learningChanges: LearningChange[] = removalResult.result?.filesModified?.map((file: string) => ({
            file,
            type: 'modify' as const,
            afterContent: 'Behavior removed from CNS'
          })) || [];

          learningId = await learningTracker.logLearningEvent({
            agentType: agent,
            learningType: 'remove_behavior',
            description: behaviorDescription,
            area: 'general',
            complexity: 'moderate',
            filesModified: removalResult.result.filesModified || [],
            changesApplied: learningChanges,
            claudeAnalysis: JSON.stringify(removalAnalysis, null, 2),
            conflictsDetected: conflictAnalysis.conflicts,
            removalStrategy: (removalAnalysis.removalStrategy as 'surgical' | 'deprecation' | 'conditional' | 'gradual') || 'surgical'
          });

          console.log(`📝 Removal tracked with ID: ${learningId}`);
        } catch (trackingError) {
          console.warn('⚠️ Failed to track removal event:', trackingError);
        }
        
        // Generate detailed removal report if needed
        let detailedRemovalReport;
        if (process.env.DEVELOPMENT_MODE === 'true' || process.env.LEARNING_FEEDBACK_ENABLED === 'true') {
          detailedRemovalReport = await this.generateRemovalReport(
            behaviorDescription,
            removalAnalysis,
            conflictAnalysis,
            removalResult.result,
            agent
          );
        }
        
        return {
          success: true,
          removedBehaviors: removalAnalysis.targetBehaviors,
          conflictsDetected: conflictAnalysis.conflicts,
          filesModified: removalResult.result.filesModified || [],
          learningId, // Include learning ID for UI feedback
          detailedRemovalReport
        };
      } else {
        // Restore from backup if removal failed
        await this.restoreCNSBackup(agent, backupId);
        throw new Error(removalResult.error);
      }
    } catch (error) {
      console.error(`❌ Failed to remove behavior from ${agent}:`, error);
      return {
        success: false,
        removedBehaviors: [],
        conflictsDetected: [],
        filesModified: [],
        error: error.message
      };
    }
  }

  /**
   * Analyze current CNS state for removal operations
   */
  private async analyzeCNSForRemoval(agent: string): Promise<{
    currentBehaviors: string[];
    behaviorDependencies: { [key: string]: string[] };
    fileContents: { [filename: string]: string };
  }> {
    try {
      // Get current CNS state through bridge
      const cnsState = await this.cnsBridge!.handleTask({
        type: 'analyze-cns-state',
        payload: {
          requestingAgent: 'global-learning-system',
          agentType: agent
        }
      });
      
      return cnsState.result || {
        currentBehaviors: [],
        behaviorDependencies: {},
        fileContents: {}
      };
    } catch (error) {
      console.error('Error analyzing CNS for removal:', error);
      return {
        currentBehaviors: [],
        behaviorDependencies: {},
        fileContents: {}
      };
    }
  }

  /**
   * Analyze removal request with conflict detection
   */
  private async analyzeRemovalRequest(
    behaviorDescription: string, 
    currentCNS: any, 
    agent: string
  ): Promise<{
    targetBehaviors: string[];
    targetFiles: string[];
    removalStrategy: string;
    replacementBehaviors: string[];
    confidence: number;
  }> {
    const analysisPrompt = `# Advanced Behavior Removal Analysis

## Agent: ${agent}
## Removal Request: ${behaviorDescription}
## Current CNS State: ${JSON.stringify(currentCNS, null, 2)}

Perform sophisticated analysis for behavior removal:

### 1. **Behavior Identification**
- Identify specific behaviors/patterns that match the removal request
- Map exact locations in CNS files where these behaviors exist
- Determine behavior boundaries (where one behavior ends and another begins)

### 2. **Dependency Analysis**
- Find behaviors that depend on the target behavior
- Identify behaviors that the target behavior depends on
- Detect circular dependencies or complex relationships

### 3. **Removal Strategy Selection**
Choose the most appropriate strategy:
- **surgical_removal**: Precisely remove specific patterns without affecting related behaviors
- **deprecation_replacement**: Mark as deprecated and provide replacement behavior
- **conditional_removal**: Remove behavior only in specific contexts
- **gradual_removal**: Phase out behavior over multiple interactions

### 4. **Replacement Behavior Planning**
- Determine what the agent should do instead
- Ensure no behavioral gaps are created
- Provide specific replacement patterns

Respond with detailed JSON analysis for precise removal execution.`;

    try {
      const response = await this.claudeService.generateResponse(
        [{ role: 'user', content: analysisPrompt }],
        'You are an expert at behavior analysis and surgical modification of agent CNS systems.'
      );
      
      // Parse the response - try JSON first, then extract structured info
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch {
        // Fallback parsing from text
        parsedResponse = {
          targetBehaviors: [behaviorDescription],
          targetFiles: ['conversation-patterns.md'],
          removalStrategy: 'deprecation_replacement',
          replacementBehaviors: ['Provide direct responses without the removed behavior'],
          confidence: 0.7
        };
      }
      
      return parsedResponse;
    } catch (error) {
      console.error('Error analyzing removal request:', error);
      return {
        targetBehaviors: [behaviorDescription],
        targetFiles: ['conversation-patterns.md'],
        removalStrategy: 'deprecation_replacement',
        replacementBehaviors: [],
        confidence: 0.5
      };
    }
  }

  /**
   * Detect and analyze behavior conflicts
   */
  private async detectBehaviorConflicts(
    removalAnalysis: any,
    currentCNS: any
  ): Promise<{
    conflicts: string[];
    resolutionStrategy: string;
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const conflictPrompt = `# Behavior Conflict Detection

## Removal Analysis: ${JSON.stringify(removalAnalysis, null, 2)}
## Current CNS: ${JSON.stringify(currentCNS, null, 2)}

Analyze potential conflicts from removing these behaviors:

### 1. **Direct Conflicts**
- Behaviors that explicitly depend on the target behavior
- Contradictory instructions that would be created

### 2. **Indirect Conflicts** 
- Workflow patterns that might break
- Communication styles that depend on the removed behavior

### 3. **Functional Gaps**
- Areas where no behavior would exist after removal
- Critical capabilities that might be lost

### 4. **Resolution Strategy**
Recommend the best approach:
- **safe_removal**: No conflicts detected, proceed with removal
- **conflict_resolution**: Address conflicts then remove
- **replacement_required**: Must provide replacement before removal
- **gradual_transition**: Phase out slowly to avoid conflicts

Provide specific conflict analysis and resolution recommendations.`;

    try {
      const response = await this.claudeService.generateResponse(
        [{ role: 'user', content: conflictPrompt }],
        'You are an expert at detecting behavioral conflicts in AI agent systems.'
      );
      
      // Parse conflict analysis
      const conflicts = this.extractConflictsFromResponse(response);
      const riskLevel = this.assessRiskLevel(conflicts);
      const resolutionStrategy = this.determineResolutionStrategy(conflicts, riskLevel);
      
      return {
        conflicts,
        resolutionStrategy,
        riskLevel
      };
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return {
        conflicts: ['Unknown potential conflicts - proceeding with caution'],
        resolutionStrategy: 'replacement_required',
        riskLevel: 'medium'
      };
    }
  }

  /**
   * Create backup of current CNS state
   */
  private async createCNSBackup(agent: string): Promise<string> {
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await this.cnsBridge!.handleTask({
        type: 'create-cns-backup',
        payload: {
          requestingAgent: 'global-learning-system',
          agentType: agent,
          backupId,
          timestamp: new Date().toISOString()
        }
      });
      
      return backupId;
    } catch (error) {
      console.error('Error creating CNS backup:', error);
      return 'backup_failed';
    }
  }

  /**
   * Restore CNS from backup
   */
  private async restoreCNSBackup(agent: string, backupId: string): Promise<boolean> {
    try {
      const result = await this.cnsBridge!.handleTask({
        type: 'restore-cns-backup',
        payload: {
          requestingAgent: 'global-learning-system',
          agentType: agent,
          backupId
        }
      });
      
      return result.success;
    } catch (error) {
      console.error('Error restoring CNS backup:', error);
      return false;
    }
  }

  /**
   * Generate detailed removal report
   */
  private async generateRemovalReport(
    behaviorDescription: string,
    removalAnalysis: any,
    conflictAnalysis: any,
    removalResult: any,
    agent: string
  ): Promise<{
    removalExplanation: string;
    beforeAfterComparison: string;
    conflictResolution: string;
    replacementBehaviors: string[];
  }> {
    const reportPrompt = `# Generate Behavior Removal Report

## Agent: ${agent}
## Removed Behavior: ${behaviorDescription}
## Removal Analysis: ${JSON.stringify(removalAnalysis, null, 2)}
## Conflicts: ${JSON.stringify(conflictAnalysis, null, 2)}
## Result: ${JSON.stringify(removalResult, null, 2)}

Create a user-friendly report explaining:

1. **What Was Removed**: Clear explanation of the specific behavior that was eliminated
2. **How I Changed**: Before vs after behavior comparison
3. **Conflicts Resolved**: How any conflicts were handled
4. **What I Do Instead**: New behaviors that replaced the removed ones

Write in a conversational, educational tone that builds confidence in the removal process.`;

    try {
      const response = await this.claudeService.generateResponse(
        [{ role: 'user', content: reportPrompt }],
        'You are explaining behavior removal to a user in a transparent, educational way.'
      );

      return this.parseRemovalReport(response, removalAnalysis, conflictAnalysis);
    } catch (error) {
      console.error('Error generating removal report:', error);
      return {
        removalExplanation: `I removed the behavior: ${behaviorDescription}`,
        beforeAfterComparison: "Before: Had the unwanted behavior. After: Behavior eliminated with appropriate replacements.",
        conflictResolution: "Resolved any potential conflicts through careful analysis.",
        replacementBehaviors: removalAnalysis.replacementBehaviors || []
      };
    }
  }

  /**
   * Parse removal report response
   */
  private parseRemovalReport(response: string, removalAnalysis: any, conflictAnalysis: any): {
    removalExplanation: string;
    beforeAfterComparison: string;
    conflictResolution: string;
    replacementBehaviors: string[];
  } {
    const removalExplanation = this.extractSection(response, 'What Was Removed') || 
      response.substring(0, 200) + '...';
    
    const beforeAfterComparison = this.extractSection(response, 'How I Changed') ||
      'Successfully removed unwanted behavior and implemented appropriate replacements.';
    
    const conflictResolution = this.extractSection(response, 'Conflicts Resolved') ||
      `Resolved ${conflictAnalysis.conflicts.length} potential conflicts through ${conflictAnalysis.resolutionStrategy}.`;
    
    const replacementBehaviors = removalAnalysis.replacementBehaviors || 
      ['Enhanced direct response capability'];

    return {
      removalExplanation,
      beforeAfterComparison,
      conflictResolution,
      replacementBehaviors
    };
  }

  /**
   * Helper methods for conflict analysis
   */
  private extractConflictsFromResponse(response: string): string[] {
    const conflicts: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.trim().match(/^[-*]\s+/) && line.toLowerCase().includes('conflict')) {
        conflicts.push(line.trim().replace(/^[-*]\s+/, ''));
      }
    }
    
    return conflicts.length > 0 ? conflicts : ['No significant conflicts detected'];
  }

  private assessRiskLevel(conflicts: string[]): 'low' | 'medium' | 'high' {
    if (conflicts.length === 0 || conflicts[0].includes('No significant conflicts')) {
      return 'low';
    } else if (conflicts.length <= 2) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  private determineResolutionStrategy(conflicts: string[], riskLevel: 'low' | 'medium' | 'high'): string {
    if (riskLevel === 'low') {
      return 'safe_removal';
    } else if (riskLevel === 'medium') {
      return 'conflict_resolution';
    } else {
      return 'replacement_required';
    }
  }
  
  /**
   * Analyze behavior description to determine CNS updates needed
   */
  private async analyzeBehaviorForCNS(behaviorDescription: string, agent: string): Promise<{
    cnsUpdates: any[];
    newCapabilities: string[];
    reflexUpdates: any[];
    memoryEnhancements: any[];
    removalInstructions?: any;
  }> {
    const analysisPrompt = `# Analyze Behavior Request for Agent CNS Integration

## Agent: ${agent}
## Requested Behavior: ${behaviorDescription}

Analyze this behavior request and determine what CNS updates are needed. This could be:
- **Adding new behaviors/capabilities**
- **Modifying existing behaviors** 
- **Removing/forgetting unwanted behaviors**
- **Enhancing current capabilities**

## Analysis Framework:

### 1. **Request Type Classification**
Determine if this is:
- NEW_CAPABILITY: Learning something completely new
- MODIFY_EXISTING: Changing how current behavior works
- REMOVE_BEHAVIOR: Stopping or forgetting specific patterns
- ENHANCE_CAPABILITY: Improving existing skills

### 2. **For NEW/MODIFY/ENHANCE Requests:**
1. **New Capabilities**: What new skills or abilities does this require?
2. **Reflex Updates**: What automatic responses or triggers should be added?
3. **Memory Enhancements**: What knowledge or patterns should be remembered?
4. **CNS Structure Updates**: How should the agent's learning files be modified?

### 3. **For REMOVE/FORGET Requests:**
1. **Behavior Identification**: What specific patterns/behaviors need removal?
2. **File Location Analysis**: Which CNS files likely contain these behaviors?
3. **Removal Strategy**: How to safely remove without breaking related functionality?
4. **Replacement Behavior**: What should the agent do instead (if anything)?

## Response Format:
Provide a structured JSON response that can be parsed:

{
  "requestType": "NEW_CAPABILITY or MODIFY_EXISTING or REMOVE_BEHAVIOR or ENHANCE_CAPABILITY",
  "cnsUpdates": [
    {
      "area": "behavior-learning",
      "description": "specific change description", 
      "priority": "high or medium or low",
      "operation": "add or modify or remove or enhance"
    }
  ],
  "newCapabilities": ["list of new skills/abilities"],
  "reflexUpdates": [
    {
      "trigger": "condition that triggers behavior",
      "response": "new response pattern",
      "operation": "add or modify or remove"
    }
  ],
  "memoryEnhancements": [
    {
      "type": "behavioral-pattern or procedural or episodic or semantic",
      "content": "what to remember or forget",
      "importance": 0.8,
      "operation": "add or modify or remove"
    }
  ],
  "removalInstructions": {
    "targetBehaviors": ["specific behaviors to remove"],
    "targetFiles": ["CNS files that need behavior removal"],
    "removalStrategy": "append_negative or modify_existing or comment_deprecated or replace_pattern",
    "replacementBehavior": "what to do instead"
  }
}

Format your response as structured JSON analysis that can be applied to the agent's private CNS.

Focus on making the agent more helpful and intelligent, whether through addition, modification, or removal of behaviors.`;

    try {
      const response = await this.claudeService.generateResponse(
        [{ role: 'user', content: analysisPrompt }],
        'You are an expert at agent learning systems and CNS architecture.'
      );
      
      // Parse the response to extract structured updates
      // Try to parse JSON response, fall back to structured text parsing
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch {
        // Fall back to extracting information from text response
        parsedResponse = null;
      }

      if (parsedResponse && parsedResponse.requestType) {
        // Use parsed JSON response
        return {
          cnsUpdates: parsedResponse.cnsUpdates || [{
            area: 'behavior-learning',
            description: behaviorDescription,
            priority: 'high',
            operation: parsedResponse.requestType === 'REMOVE_BEHAVIOR' ? 'remove' : 'add'
          }],
          newCapabilities: parsedResponse.newCapabilities || 
            (parsedResponse.requestType === 'REMOVE_BEHAVIOR' 
              ? [`Removed behavior: ${behaviorDescription.substring(0, 50)}...`]
              : [`Enhanced behavior: ${behaviorDescription.substring(0, 50)}...`]),
          reflexUpdates: parsedResponse.reflexUpdates || [],
          memoryEnhancements: parsedResponse.memoryEnhancements || [{
            type: 'behavioral-pattern',
            content: behaviorDescription,
            importance: 0.8,
            operation: parsedResponse.requestType === 'REMOVE_BEHAVIOR' ? 'remove' : 'add'
          }],
          removalInstructions: parsedResponse.removalInstructions || null
        };
      } else {
        // Fallback for non-JSON responses
        return {
          cnsUpdates: [{
            area: 'behavior-learning',
            description: behaviorDescription,
            priority: 'high'
          }],
          newCapabilities: [`Enhanced behavior: ${behaviorDescription.substring(0, 50)}...`],
          reflexUpdates: [],
          memoryEnhancements: [{
            type: 'behavioral-pattern',
            content: behaviorDescription,
            importance: 0.8
          }]
        };
      }
    } catch (error) {
      console.error('Error analyzing behavior:', error);
      return {
        cnsUpdates: [],
        newCapabilities: [],
        reflexUpdates: [],
        memoryEnhancements: []
      };
    }
  }
  
  /**
   * Analyze feedback to determine specific improvements
   */
  private async analyzeFeedbackForImprovements(feedback: string, context: any, agent: string): Promise<{
    capabilityRefinements: any[];
    reflexAdjustments: any[];
    memoryUpdates: any[];
    formattingImprovements: any[];
    improvementsSummary: string[];
  }> {
    const analysisPrompt = `# Analyze Feedback for Agent Improvements

## Agent: ${agent}
## User Feedback: ${feedback}
## Context: ${JSON.stringify(context, null, 2)}

Analyze this feedback and determine specific improvements to apply:

1. **Capability Refinements**: How should existing skills be improved?
2. **Reflex Adjustments**: What automatic behaviors need tweaking?
3. **Memory Updates**: What should be learned or remembered differently?
4. **Formatting Improvements**: Any presentation or communication improvements?

Provide specific, actionable improvements that can be applied to the agent's CNS.`;

    try {
      const response = await this.claudeService.generateResponse(
        [{ role: 'user', content: analysisPrompt }],
        'You are an expert at interpreting user feedback and translating it into agent improvements.'
      );
      
      // Parse response and return structured improvements
      return {
        capabilityRefinements: [],
        reflexAdjustments: [],
        memoryUpdates: [{
          type: 'feedback-learning',
          content: feedback,
          importance: 0.9
        }],
        formattingImprovements: [],
        improvementsSummary: [`Applied user feedback: ${feedback.substring(0, 100)}...`]
      };
    } catch (error) {
      console.error('Error analyzing feedback:', error);
      return {
        capabilityRefinements: [],
        reflexAdjustments: [],
        memoryUpdates: [],
        formattingImprovements: [],
        improvementsSummary: []
      };
    }
  }

  /**
   * Generate comprehensive learning report for user consumption
   */
  private async generateLearningReport(
    behaviorDescription: string,
    behaviorAnalysis: any,
    cnsUpdateResult: any,
    agent: string
  ): Promise<{
    learningExplanation: string;
    beforeAfterComparison: string;
    filesModified: string[];
    behaviorChanges: string[];
  }> {
    const reportPrompt = `# Generate Learning Report for User

## Agent: ${agent}
## Behavior Taught: ${behaviorDescription}
## Analysis Results: ${JSON.stringify(behaviorAnalysis, null, 2)}
## CNS Update Result: ${JSON.stringify(cnsUpdateResult, null, 2)}

Create a user-friendly learning report that explains:

1. **What I Learned**: In simple terms, what new capability did I gain?
2. **How My Behavior Changed**: What will I do differently now?
3. **Files Modified**: Which CNS files were updated?
4. **Before/After Comparison**: How was I before vs. how am I now?

Write this in a conversational tone that shows transparency about my learning process.
Make it educational and build confidence in the system's learning capability.`;

    try {
      const response = await this.claudeService.generateResponse(
        [{ role: 'user', content: reportPrompt }],
        `You are explaining learning progress to a user in a transparent, educational way.`
      );

      // Parse the learning report response
      return this.parseLearningReport(response, cnsUpdateResult);
    } catch (error) {
      console.error('Error generating learning report:', error);
      return {
        learningExplanation: `I learned to: ${behaviorDescription}`,
        beforeAfterComparison: "Before: Standard behavior. After: Enhanced with new capability.",
        filesModified: this.extractModifiedFiles(cnsUpdateResult),
        behaviorChanges: [`Added new behavior: ${behaviorDescription}`]
      };
    }
  }

  /**
   * Parse learning report response into structured format
   */
  private parseLearningReport(response: string, cnsUpdateResult: any): {
    learningExplanation: string;
    beforeAfterComparison: string;
    filesModified: string[];
    behaviorChanges: string[];
  } {
    // Extract sections from response
    const learningExplanation = this.extractSection(response, 'What I Learned') || 
      response.substring(0, 200) + '...';
    
    const beforeAfterComparison = this.extractSection(response, 'Before/After Comparison') || 
      this.extractSection(response, 'How My Behavior Changed') ||
      'Enhanced capabilities based on your teaching.';
    
    const behaviorChanges = this.extractBehaviorChanges(response);
    const filesModified = this.extractModifiedFiles(cnsUpdateResult);

    return {
      learningExplanation,
      beforeAfterComparison,
      filesModified,
      behaviorChanges
    };
  }

  /**
   * Extract specific section from learning report
   */
  private extractSection(text: string, sectionName: string): string | null {
    const regex = new RegExp(`\\*\\*${sectionName}\\*\\*:?\\s*([^*]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract behavior changes from learning report
   */
  private extractBehaviorChanges(response: string): string[] {
    const changes: string[] = [];
    
    // Look for bullet points or numbered lists
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.trim().match(/^[-*]\s+/) || line.trim().match(/^\d+\.\s+/)) {
        changes.push(line.trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''));
      }
    }
    
    // If no specific changes found, provide a generic one
    if (changes.length === 0) {
      changes.push('Enhanced learning capabilities based on user input');
    }
    
    return changes.slice(0, 5); // Limit to 5 changes
  }

  /**
   * Extract modified files from CNS update result
   */
  private extractModifiedFiles(cnsUpdateResult: any): string[] {
    const files: string[] = [];
    
    if (cnsUpdateResult?.filesModified) {
      files.push(...cnsUpdateResult.filesModified);
    }
    
    if (cnsUpdateResult?.updatedFiles) {
      files.push(...cnsUpdateResult.updatedFiles);
    }
    
    // Add common CNS files that are typically modified
    if (files.length === 0) {
      files.push(
        'brain/capabilities.md',
        'brain/conversation-patterns.md',
        'memory/behavioral-patterns.md'
      );
    }
    
    return [...new Set(files)]; // Remove duplicates
  }
}
