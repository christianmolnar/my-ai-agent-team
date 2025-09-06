/**
 * Global Agent Learning System
 * Enables ALL agents to learn from feedback, modify their own CNS files,
 * and improve their methodologies autonomously
 */

import * as fs from 'fs';
import * as path from 'path';
import { ClaudeService } from '../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';

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
  private agentId: string;
  private basePath: string;
  private claudeService: ClaudeService;
  
  constructor(agentId: string) {
    this.agentId = agentId;
    // Use the workspace path instead of __dirname for Next.js compatibility
    this.basePath = path.join(process.cwd(), 'agents', agentId);
    this.claudeService = AgentClaudeClientFactory.createPersonalAssistantClient(); // Use appropriate client
    
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
