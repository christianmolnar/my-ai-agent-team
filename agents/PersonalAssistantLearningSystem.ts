/**
 * Self-Learning and CNS Management System for Personal Assistant
 * Enables the PA to learn from feedback and modify its own behavior
 */

import * as fs from 'fs';
import * as path from 'path';
import { ClaudeService } from '../lib/claude/ClaudeService';

export interface LearningFeedback {
  sessionId: string;
  userMessage: string;
  assistantResponse: string;
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
}

export interface CNSEntry {
  category: string;
  skill: string;
  proficiency: number;
  lastUpdated: Date;
  learningSource: string;
  examples: string[];
}

export class PersonalAssistantLearningSystem {
  private cnsPath: string;
  private methodologyPath: string;
  private learningLogPath: string;
  private claudeService: ClaudeService;

  constructor(claudeService: ClaudeService) {
    this.claudeService = claudeService;
    this.cnsPath = path.join(__dirname, 'personal-assistant/cns');
    this.methodologyPath = path.join(__dirname, 'personal-assistant/methodology');
    this.learningLogPath = path.join(__dirname, 'personal-assistant/learning-log');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.cnsPath, this.methodologyPath, this.learningLogPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Process user feedback and learn from it
   */
  async processFeedback(feedback: LearningFeedback): Promise<void> {
    // Log the feedback
    await this.logFeedback(feedback);

    // Analyze the feedback using Claude
    const analysis = await this.analyzeFeedback(feedback);

    // If the analysis suggests methodology improvements
    if (analysis.requiresMethodologyUpdate) {
      await this.updateMethodology(analysis.methodologyUpdates);
    }

    // Update CNS with new learnings
    await this.updateCNS(analysis.cnsUpdates);

    console.log(`✅ Learning processed: ${analysis.methodologyUpdates.length} methodology updates, ${analysis.cnsUpdates.length} CNS updates`);
  }

  /**
   * Analyze feedback using Claude to understand what needs improvement
   */
  private async analyzeFeedback(feedback: LearningFeedback): Promise<{
    requiresMethodologyUpdate: boolean;
    methodologyUpdates: MethodologyUpdate[];
    cnsUpdates: CNSEntry[];
    reasoning: string;
  }> {
    const analysisPrompt = `# Personal Assistant Learning Analysis

## User Interaction
**User Request**: "${feedback.userMessage}"
**Assistant Response**: "${feedback.assistantResponse}"
**User Feedback**: "${feedback.userFeedback}"
**Improvement Suggestion**: "${feedback.improvementSuggestion}"

## Current Methodology
${await this.loadCurrentMethodology()}

## Analysis Task
Analyze this feedback and determine:

1. **Does this require methodology updates?** (areas like question-asking, format clarification, project scoping)
2. **What specific improvements should be made?**
3. **What new skills or knowledge should be added to CNS?**
4. **How confident are you in these recommendations?**

## Response Format
Respond with structured analysis:

METHODOLOGY_UPDATE_NEEDED: [yes/no]
METHODOLOGY_UPDATES: [list specific areas needing improvement]
CNS_UPDATES: [list new skills/knowledge to add]
CONFIDENCE: [0.0-1.0]
REASONING: [explanation of analysis]

Be specific about what behavior should change and how.`;

    const response = await this.claudeService.generateResponse(
      [{ role: 'user', content: analysisPrompt }],
      `You are a learning analysis system for a Personal Assistant AI. Your job is to analyze user feedback and determine what behavioral improvements should be made.`
    );

    return this.parseAnalysisResponse(response);
  }

  /**
   * Update methodology files based on learning
   */
  private async updateMethodology(updates: MethodologyUpdate[]): Promise<void> {
    for (const update of updates) {
      const methodologyFile = path.join(this.methodologyPath, `${update.area}.md`);
      
      let existingContent = '';
      if (fs.existsSync(methodologyFile)) {
        existingContent = fs.readFileSync(methodologyFile, 'utf8');
      }

      const updatedContent = await this.generateUpdatedMethodology(
        update.area,
        existingContent,
        update
      );

      fs.writeFileSync(methodologyFile, updatedContent);
      console.log(`📝 Updated methodology: ${update.area}`);
    }
  }

  /**
   * Generate updated methodology content using Claude
   */
  private async generateUpdatedMethodology(
    area: string,
    existingContent: string,
    update: MethodologyUpdate
  ): Promise<string> {
    const prompt = `# Methodology Update for Personal Assistant

## Area: ${area}

## Current Content:
${existingContent || 'No existing content'}

## Required Improvement:
**Current Behavior**: ${update.currentBehavior}
**Suggested Improvement**: ${update.suggestedImprovement}
**Implementation Plan**: ${update.implementationPlan.join(', ')}

## Task:
Update or create a comprehensive methodology document for "${area}" that incorporates the suggested improvement.

Include:
1. **Overview** of the methodology
2. **Step-by-step process** for this area
3. **Best practices** and guidelines
4. **Examples** of good implementation
5. **Common mistakes** to avoid

Make this actionable and specific so the Personal Assistant can follow it consistently.`;

    return await this.claudeService.generateResponse(
      [{ role: 'user', content: prompt }],
      `You are creating methodology documentation for a Personal Assistant AI. Write clear, actionable guidance that will improve the assistant's performance.`
    );
  }

  /**
   * Load current methodology for reference
   */
  private async loadCurrentMethodology(): Promise<string> {
    const methodologyFiles = fs.readdirSync(this.methodologyPath).filter(f => f.endsWith('.md'));
    let methodology = '';

    for (const file of methodologyFiles) {
      const content = fs.readFileSync(path.join(this.methodologyPath, file), 'utf8');
      methodology += `\n## ${file.replace('.md', '')}\n${content}\n`;
    }

    return methodology || 'No existing methodology documented.';
  }

  /**
   * Update CNS with new skills/knowledge
   */
  private async updateCNS(updates: CNSEntry[]): Promise<void> {
    const cnsFile = path.join(this.cnsPath, 'skill-database.json');
    
    let existingCNS: CNSEntry[] = [];
    if (fs.existsSync(cnsFile)) {
      existingCNS = JSON.parse(fs.readFileSync(cnsFile, 'utf8'));
    }

    // Merge updates with existing CNS
    for (const update of updates) {
      const existingIndex = existingCNS.findIndex(
        entry => entry.category === update.category && entry.skill === update.skill
      );

      if (existingIndex >= 0) {
        // Update existing entry
        existingCNS[existingIndex] = { ...existingCNS[existingIndex], ...update };
      } else {
        // Add new entry
        existingCNS.push(update);
      }
    }

    fs.writeFileSync(cnsFile, JSON.stringify(existingCNS, null, 2));
    console.log(`🧠 Updated CNS with ${updates.length} entries`);
  }

  /**
   * Log feedback for future analysis
   */
  private async logFeedback(feedback: LearningFeedback): Promise<void> {
    const logFile = path.join(this.learningLogPath, `${new Date().toISOString().split('T')[0]}.json`);
    
    let existingLogs: LearningFeedback[] = [];
    if (fs.existsSync(logFile)) {
      existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }

    existingLogs.push(feedback);
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
  }

  /**
   * Parse Claude's analysis response
   */
  private parseAnalysisResponse(response: string): {
    requiresMethodologyUpdate: boolean;
    methodologyUpdates: MethodologyUpdate[];
    cnsUpdates: CNSEntry[];
    reasoning: string;
  } {
    const requiresUpdate = response.includes('METHODOLOGY_UPDATE_NEEDED: yes');
    
    // This would be implemented to parse the structured response
    // For now, returning a simple structure
    return {
      requiresMethodologyUpdate: requiresUpdate,
      methodologyUpdates: [], // Would parse from response
      cnsUpdates: [], // Would parse from response
      reasoning: response
    };
  }

  /**
   * Get current methodology for a specific area
   */
  async getMethodology(area: string): Promise<string> {
    const methodologyFile = path.join(this.methodologyPath, `${area}.md`);
    
    if (fs.existsSync(methodologyFile)) {
      return fs.readFileSync(methodologyFile, 'utf8');
    }
    
    return `No methodology defined for ${area}`;
  }

  /**
   * Check if the PA should ask clarifying questions for a request type
   */
  async shouldAskClarifyingQuestions(requestType: string, userMessage: string): Promise<{
    shouldAsk: boolean;
    questions: string[];
    reasoning: string;
  }> {
    const methodology = await this.getMethodology('question-asking');
    
    const prompt = `# Clarifying Questions Analysis

## Request Type: ${requestType}
## User Message: "${userMessage}"
## Current Question-Asking Methodology:
${methodology}

## Analysis Task:
Based on the user's request and current methodology, determine:
1. Should clarifying questions be asked before proceeding?
2. What specific questions would be most helpful?
3. What's the reasoning?

Consider:
- Complexity of the request
- Ambiguity in requirements
- Format/delivery preferences needed
- Scope clarification needed

## Response Format:
SHOULD_ASK: [yes/no]
QUESTIONS: [list of 2-4 specific questions]
REASONING: [brief explanation]`;

    const response = await this.claudeService.generateResponse(
      [{ role: 'user', content: prompt }],
      `You analyze whether a Personal Assistant should ask clarifying questions before starting work.`
    );

    // Parse response and return structured data
    return this.parseQuestionAnalysis(response);
  }

  private parseQuestionAnalysis(response: string): {
    shouldAsk: boolean;
    questions: string[];
    reasoning: string;
  } {
    const shouldAsk = response.includes('SHOULD_ASK: yes');
    
    // Extract questions (simplified parsing)
    const questionsMatch = response.match(/QUESTIONS: (.*?)(?=REASONING:|$)/s);
    const questions = questionsMatch ? 
      questionsMatch[1].split('\n').filter(q => q.trim().length > 0).map(q => q.trim()) : [];

    const reasoningMatch = response.match(/REASONING: (.*)/s);
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'No reasoning provided';

    return {
      shouldAsk,
      questions: questions.slice(0, 4), // Limit to 4 questions
      reasoning
    };
  }
}
