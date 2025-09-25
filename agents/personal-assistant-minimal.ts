import { Agent, AgentTask, AgentTaskResult } from './agent';
import { MasterOrchestratorAgent } from './master-orchestrator';
import { ClaudeService } from '../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';
import Anthropic from '@anthropic-ai/sdk';

// Types for Personal Assistant
interface PersonalAssistantResponse {
  response: string;
  conversationType: 'direct' | 'orchestrated' | 'error' | 'clarification' | 'confirmation';
  suggestedFollowUps: string[];
  personaInfluence: string[];
}

interface PersonaContext {
  name?: string;
  role?: string;
  interests?: string[];
  communicationStyle?: string;
  currentProjects?: string[];
  preferences: string[];
  conversationStyle: string;
  knowledgeAreas: string[];
  currentMood: string;
  personalDetails: string[];
}

interface IntentAnalysis {
  complexityLevel: 'simple' | 'moderate' | 'high';
  requiresOrchestration: boolean;
  requiredAgents: string[];
  deliverables: string[];
  priority: 'low' | 'medium' | 'high';
}

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationContext {
  sessionId?: string;
  history: ConversationTurn[];
  lastActivity: Date;
}

/**
 * Minimal Personal Assistant Agent for testing
 */
export class PersonalAssistantAgent implements Agent {
  id = 'personal-assistant';
  name = 'Personal Assistant Agent';
  description = 'Conversational interface with persona integration and task orchestration';
  abilities = [
    'Claude Sonnet 4 conversation management',
    'Master Orchestrator coordination',
    'Intent analysis and complexity assessment',
    'Personalized response generation',
    'Multi-agent task orchestration'
  ];
  
  private claudeService: ClaudeService;
  private masterOrchestrator: MasterOrchestratorAgent;
  
  constructor() {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    this.claudeService = AgentClaudeClientFactory.createPersonalAssistantClient();
    this.masterOrchestrator = new MasterOrchestratorAgent();
  }

  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'conversation':
          const response = await this.handleUserConversation(
            task.payload.message,
            task.payload.context
          );
          return { success: true, result: response };

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Personal Assistant error: ${error}`
      };
    }
  }

  async handleUserConversation(userMessage: string, conversationContext?: ConversationContext): Promise<PersonalAssistantResponse> {
    try {
      console.log('🤖 Personal Assistant - Handling conversation:', userMessage);
      
      // Simple persona context
      const personaContext = await this.getPersonaContext(userMessage);
      
      // Analyze user intent
      const intentAnalysis = await this.analyzeUserIntent(userMessage, conversationContext);
      
      // Route based on complexity
      if (intentAnalysis.requiresOrchestration) {
        console.log('[PersonalAssistant] Proceeding to orchestration');
        return await this.handleOrchestratedRequest(userMessage, personaContext, intentAnalysis, conversationContext);
      } else {
        return await this.generateDirectResponse(userMessage, personaContext, conversationContext);
      }
      
    } catch (error) {
      console.error('Error in handleUserConversation:', error);
      return {
        response: "I encountered an error processing your request. Could you please try again?",
        conversationType: 'error',
        suggestedFollowUps: ['Try rephrasing your request'],
        personaInfluence: ['error-handling']
      };
    }
  }

  private async analyzeUserIntent(userMessage: string, conversationContext?: ConversationContext): Promise<IntentAnalysis> {
    // Simple pattern-based analysis for stories
    const storyKeywords = ['story', 'write', 'create', 'tale', 'narrative', 'fiction', 'dragon', 'knight'];
    const hasStoryKeywords = storyKeywords.some(keyword => userMessage.toLowerCase().includes(keyword));
    
    if (hasStoryKeywords) {
      return {
        complexityLevel: 'moderate',
        requiresOrchestration: true,
        requiredAgents: ['communications'],
        deliverables: ['story-document'],
        priority: 'medium'
      };
    }

    return {
      complexityLevel: 'simple',
      requiresOrchestration: false,
      requiredAgents: [],
      deliverables: ['direct-response'],
      priority: 'low'
    };
  }

  private async handleOrchestratedRequest(
    userMessage: string, 
    personaContext: PersonaContext, 
    intentAnalysis: IntentAnalysis,
    conversationContext?: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    try {
      console.log('[PersonalAssistant] Coordinating with master orchestrator...');
      
      const orchestratorResponse = await this.masterOrchestrator.handleTask({
        type: 'orchestrate',
        payload: {
          userRequest: userMessage,
          userMessage,
          conversationHistory: conversationContext?.history || [],
          context: {
            intentAnalysis,
            personaContext,
            requestedDeliverables: intentAnalysis.deliverables,
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substr(2, 9)
          }
        }
      });

      if (orchestratorResponse?.success) {
        return {
          response: orchestratorResponse.result || "I've coordinated with the team to handle your request.",
          conversationType: 'orchestrated',
          suggestedFollowUps: ['Ask another question', 'Need something else?'],
          personaInfluence: ['orchestration']
        };
      } else {
        return {
          response: "I encountered an issue coordinating with the team. Please try your request again.",
          conversationType: 'error',
          suggestedFollowUps: ['Try again', 'Rephrase your request'],
          personaInfluence: ['error-handling']
        };
      }
    } catch (error) {
      console.error('Error in orchestrated request:', error);
      return {
        response: "I encountered an error while coordinating with the team. Please try again.",
        conversationType: 'error',
        suggestedFollowUps: ['Try again'],
        personaInfluence: ['error-handling']
      };
    }
  }

  private async generateDirectResponse(
    userMessage: string,
    personaContext: PersonaContext,
    conversationContext?: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    try {
      const systemPrompt = `You are a helpful Personal Assistant AI. Respond conversationally to: "${userMessage}"`;
      
      const response = await this.claudeService.generateResponse([
        { role: 'user', content: userMessage }
      ], systemPrompt);

      return {
        response: response,
        conversationType: 'direct',
        suggestedFollowUps: ['Ask another question'],
        personaInfluence: ['direct-conversation']
      };
    } catch (error) {
      console.error('Error generating direct response:', error);
      return {
        response: "I'm having trouble generating a response right now. Could you try again?",
        conversationType: 'error',
        suggestedFollowUps: ['Try again'],
        personaInfluence: ['error-handling']
      };
    }
  }

  private async getPersonaContext(userMessage: string): Promise<PersonaContext> {
    // Simple default persona context
    return {
      name: 'User',
      role: 'User',
      interests: ['technology'],
      communicationStyle: 'Professional',
      currentProjects: [],
      preferences: ['helpful responses'],
      conversationStyle: 'friendly',
      knowledgeAreas: ['general'],
      currentMood: 'curious',
      personalDetails: []
    };
  }
}
