/**
 * Self-Learning and CNS Management System for Personal Assistant
 * Enables the PA to learn from feedback and modify its own behavior
 * Uses CNS bridge to access private repository for learned behaviors
 */

import { ClaudeService } from '../lib/claude/ClaudeService';
import { PersonalAssistantBridge } from './PersonalAssistantBridge';

export interface LearningFeedback {
  sessionId: string;
  userMessage: string;
  assistantResponse: string;
  userFeedback: string;
  improvementSuggestion: string;
  timestamp: Date;
  context: any;
}

export interface ClarifyingQuestionCheck {
  shouldAsk: boolean;
  questions: string[];
  reasoning: string;
}

export interface CNSData {
  formatting_guidelines?: string;
  conversation_patterns?: string;
}

export class PersonalAssistantLearningSystem {
  private claudeService: ClaudeService;
  private cnsBridge: PersonalAssistantBridge;

  constructor(claudeService: ClaudeService) {
    this.claudeService = claudeService;
    this.cnsBridge = new PersonalAssistantBridge();
  }

  /**
   * Check if we should ask clarifying questions based on CNS conversation patterns
   */
  async shouldAskClarifyingQuestions(requestType: string, userMessage: string): Promise<ClarifyingQuestionCheck> {
    try {
      // Get conversation patterns from CNS
      const cnsResult = await this.cnsBridge.handleTask({
        type: 'get-cns-data',
        payload: {
          requestingAgent: 'personal-assistant',
          dataType: 'conversation-patterns',
          agentType: 'personal-assistant-agent',
          section: 'conversation_patterns'
        }
      });

      if (!cnsResult.success || !cnsResult.result?.conversation_patterns) {
        console.log('❌ CNS: No conversation patterns available for clarifying questions');
        return { shouldAsk: false, questions: [], reasoning: 'CNS patterns not available' };
      }

      const conversationPatterns = cnsResult.result.conversation_patterns;
      
      // Use Claude to analyze if clarifying questions are needed
      const analysisPrompt = `Based on the conversation patterns below, determine if clarifying questions should be asked for this user message.

CONVERSATION PATTERNS:
${conversationPatterns}

USER MESSAGE: "${userMessage}"
REQUEST TYPE: ${requestType}

Instructions:
1. Check if this message matches patterns that require clarifying questions
2. If yes, generate 2-3 specific clarifying questions based on the patterns
3. Format response as JSON with: {"shouldAsk": boolean, "questions": string[], "reasoning": string}

Focus on patterns like:
- Complex research requests (medical, technical, multi-faceted)
- Broad scope without specific focus  
- Multi-agent coordination needs
- High-stakes topics requiring precision`;

      const response = await this.claudeService.generateResponse(
        [{ role: 'user', content: analysisPrompt }],
        'You are an expert at analyzing conversation patterns and determining when clarifying questions are needed. Always respond with valid JSON.'
      );

      try {
        const analysis = JSON.parse(response);
        console.log('✅ CNS: Clarifying questions analysis:', analysis.shouldAsk ? 'YES' : 'NO');
        return analysis;
      } catch (parseError) {
        console.error('Error parsing clarifying questions analysis:', parseError);
        
        // Fallback logic based on keywords
        const needsClarification = this.analyzeNeedsClarification(userMessage);
        return {
          shouldAsk: needsClarification,
          questions: needsClarification ? this.generateFallbackQuestions(userMessage) : [],
          reasoning: 'Fallback analysis due to parsing error'
        };
      }

    } catch (error) {
      console.error('Error checking clarifying questions:', error);
      return { shouldAsk: false, questions: [], reasoning: 'Error accessing CNS data' };
    }
  }

  /**
   * Get CNS data for formatting and conversation patterns
   */
  async getCNSData(): Promise<CNSData> {
    try {
      const cnsResult = await this.cnsBridge.handleTask({
        type: 'get-cns-data',
        payload: {
          requestingAgent: 'personal-assistant',
          dataType: 'formatting-guidelines',
          agentType: 'personal-assistant-agent',
          section: 'all'
        }
      });

      if (cnsResult.success && cnsResult.result) {
        return cnsResult.result;
      } else {
        console.log('❌ CNS: Failed to get CNS data:', cnsResult.error);
        return {};
      }
    } catch (error) {
      console.error('Error getting CNS data:', error);
      return {};
    }
  }

  /**
   * Process user feedback and learn from it (placeholder for future implementation)
   */
  async processFeedback(feedback: LearningFeedback): Promise<void> {
    console.log('Learning from feedback:', feedback.userFeedback);
    // Future: Update CNS files based on feedback
  }

  /**
   * Fallback method to analyze if message needs clarification
   */
  private analyzeNeedsClarification(userMessage: string): boolean {
    const message = userMessage.toLowerCase();
    
    // Complex research patterns
    const researchPatterns = ['research', 'study', 'analyze', 'investigate', 'examine'];
    const complexTopics = ['covid', 'medical', 'health', 'technical', 'scientific'];
    const broadScopes = ['everything about', 'all information', 'comprehensive', 'complete overview'];
    
    const hasResearchPattern = researchPatterns.some(pattern => message.includes(pattern));
    const hasComplexTopic = complexTopics.some(topic => message.includes(topic));
    const hasBroadScope = broadScopes.some(scope => message.includes(scope));
    
    return hasResearchPattern || hasComplexTopic || hasBroadScope;
  }

  /**
   * Generate fallback clarifying questions
   */
  private generateFallbackQuestions(userMessage: string): string[] {
    return [
      "**Research Focus**: Which specific aspects are most important to you?",
      "**Information Purpose**: How do you plan to use this research?",
      "**Detail Level**: Do you need a summary or comprehensive analysis?"
    ];
  }
}
