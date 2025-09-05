import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { MasterOrchestratorAgent } from './MasterOrchestratorAgent';
import { PersonalAssistantBridge } from './PersonalAssistantBridge';

/**
 * Personal Assistant Agent - Tier 0 User Interface Layer
 * 
 * Handles direct user conversation using Claude Sonnet 4, integrates with
 * private repository persona data, and coordinates with Master Orchestrator
 * for complex task delegation and response orchestration.
 */
export class PersonalAssistantAgent implements Agent {
  id = 'personal-assistant';
  name = 'Personal Assistant Agent';
  description = 'Conversational interface with persona integration and task orchestration';
  abilities = [
    'Claude Sonnet 4 conversation management',
    'Private repository persona integration',
    'Master Orchestrator coordination',
    'Intent analysis and complexity assessment',
    'Personalized response generation',
    'Multi-agent task orchestration'
  ];
  
  // External API clients
  private claudeSonnetClient: any; // Claude Sonnet 4 API client
  private personaBridge: PersonalAssistantBridge;
  private masterOrchestrator: MasterOrchestratorAgent;
  
  // Configuration
  private readonly claudeModel = 'claude-3-sonnet-20240229';
  private readonly maxContextTokens = 200000; // Claude Sonnet context window
  private readonly maxResponseTokens = 4096;

  constructor() {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    // Initialize Claude Sonnet 4 API client
    this.claudeSonnetClient = await this.createClaudeClient({
      apiKey: process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY || '',
      model: this.claudeModel,
      maxTokens: this.maxResponseTokens
    });

    // Initialize persona bridge for private repo data
    this.personaBridge = new PersonalAssistantBridge();

    // Initialize Master Orchestrator connection
    this.masterOrchestrator = new MasterOrchestratorAgent();
  }

  /**
   * Agent interface implementation - handles various task types
   */
  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'conversation':
          const response = await this.handleUserConversation(
            task.payload.message,
            task.payload.context
          );
          return { success: true, result: response };

        case 'analyze-intent':
          const analysis = await this.analyzeUserIntent(
            task.payload.message,
            task.payload.context
          );
          return { success: true, result: analysis };

        case 'orchestrate-request':
          const orchestratedResponse = await this.handleOrchestratedRequest(
            task.payload.message,
            task.payload.personaContext,
            task.payload.intentAnalysis
          );
          return { success: true, result: orchestratedResponse };

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

  /**
   * Main conversation handler - processes user input and generates personalized responses
   * Integrates persona data and determines if orchestration is needed
   */
  async handleUserConversation(userMessage: string, conversationContext?: ConversationContext): Promise<PersonalAssistantResponse> {
    try {
      // Step 1: Load persona context from private repository
      const personaContext = await this.getPersonaContext(userMessage);
      
      // Step 2: Analyze user intent and complexity
      const intentAnalysis = await this.analyzeUserIntent(userMessage, conversationContext);
      
      // Step 3: Determine response strategy
      if (intentAnalysis.requiresOrchestration) {
        // Complex request requiring multiple agents
        return await this.handleOrchestratedRequest(userMessage, personaContext, intentAnalysis);
      } else {
        // Direct conversation response
        return await this.generateDirectResponse(userMessage, personaContext, conversationContext);
      }
    } catch (error) {
      console.error('Personal Assistant conversation error:', error);
      return this.generateErrorResponse(error);
    }
  }

  /**
   * Get persona context from private repository through bridge
   */
  private async getPersonaContext(userMessage: string): Promise<PersonaContext> {
    try {
      // Get identity data
      const identityResult = await this.personaBridge.handleTask({
        type: 'get-identity-data',
        payload: { requestingAgent: 'personal-assistant', userMessage }
      });

      // Get communications style
      const commResult = await this.personaBridge.handleTask({
        type: 'get-communications-style',
        payload: { requestingAgent: 'personal-assistant' }
      });

      // Get project context
      const projectResult = await this.personaBridge.handleTask({
        type: 'get-project-context',
        payload: { requestingAgent: 'personal-assistant' }
      });

      // Construct persona context from bridge responses
      const identity = identityResult.success ? identityResult.result : {};
      const communications = commResult.success ? commResult.result : {};
      const project = projectResult.success ? projectResult.result : {};

      return {
        name: identity.name || 'User',
        role: identity.role || 'Professional',
        interests: identity.expertise || [],
        communicationStyle: communications.email_style?.tone || 'Professional',
        currentProjects: project.active_projects || [],
        preferences: identity.communication_preferences || {},
        relevantElements: [
          { category: 'identity', content: JSON.stringify(identity), relevance: 1.0 },
          { category: 'communications', content: JSON.stringify(communications), relevance: 0.8 },
          { category: 'projects', content: JSON.stringify(project), relevance: 0.9 }
        ],
        appliedElements: ['identity-integration', 'communication-style', 'project-context']
      };
    } catch (error) {
      console.error('Error getting persona context:', error);
      // Return default persona context
      return {
        name: 'User',
        role: 'Professional',
        interests: [],
        communicationStyle: 'Professional',
        currentProjects: [],
        preferences: {},
        relevantElements: [],
        appliedElements: []
      };
    }
  }

  /**
   * Analyzes user intent to determine if Master Orchestrator involvement is needed
   */
  private async analyzeUserIntent(userMessage: string, context?: ConversationContext): Promise<IntentAnalysis> {
    const analysisPrompt = this.constructIntentAnalysisPrompt(userMessage, context);
    
    try {
      const analysis = await this.claudeSonnetClient.messages.create({
        messages: [{ role: 'user', content: analysisPrompt }],
        max_tokens: 1000,
        model: this.claudeModel
      });

      return this.parseIntentAnalysis(analysis.content[0].text);
    } catch (error) {
      console.error('Error analyzing user intent:', error);
      // Fallback to simple analysis
      return {
        complexityLevel: 'low',
        requiresOrchestration: false,
        requiredAgents: [],
        deliverables: ['direct-response'],
        priority: 'medium'
      };
    }
  }

  /**
   * Constructs intent analysis prompt for Claude Sonnet
   */
  private constructIntentAnalysisPrompt(userMessage: string, context?: ConversationContext): string {
    return `# User Intent Analysis

## User Message
"${userMessage}"

${context ? `## Conversation Context\n${this.formatConversationHistory(context.history)}` : ''}

## Analysis Task
Analyze the user's message to determine:

1. **Complexity Level**: Low (simple question/conversation) | Medium (requires research/analysis) | High (requires multiple agents/complex coordination)

2. **Orchestration Required**: Does this require coordination between multiple agents?

3. **Required Agents**: Which agents would be needed? Options:
   - researcher-agent (for information gathering)
   - communications-agent (for writing/messaging)  
   - project-coordinator (for planning/organization)
   - data-scientist (for analysis/insights)
   - full-stack-developer (for technical implementation)

4. **Deliverables**: What specific outputs are expected?

5. **Priority**: Low | Medium | High

## Response Format
Provide analysis in this format:
COMPLEXITY: [level]
ORCHESTRATION: [yes/no]
AGENTS: [comma-separated list]
DELIVERABLES: [comma-separated list]
PRIORITY: [level]
REASONING: [brief explanation]`;
  }

  /**
   * Handles complex requests requiring orchestration across multiple agents
   */
  private async handleOrchestratedRequest(
    userMessage: string, 
    personaContext: PersonaContext, 
    intentAnalysis: IntentAnalysis
  ): Promise<PersonalAssistantResponse> {
    
    try {
      // Step 1: Construct orchestrator prompt with user request and persona context
      const orchestratorPrompt = this.constructOrchestratorPrompt({
        userMessage,
        personaContext,
        intentAnalysis,
        requestedDeliverables: intentAnalysis.deliverables
      });

      // Step 2: Send to Master Orchestrator for plan creation and execution
      // For now, we'll simulate orchestrator response since MasterOrchestratorAgent is empty
      const orchestratorResponse = await this.simulateOrchestratorResponse({
        prompt: orchestratorPrompt,
        requiredAgents: intentAnalysis.requiredAgents,
        deliverables: intentAnalysis.deliverables,
        priority: intentAnalysis.priority
      });

      // Step 3: Process orchestrator results and craft user-facing response
      const finalResponse = await this.craftFinalUserResponse({
        originalRequest: userMessage,
        orchestratorResults: orchestratorResponse,
        personaContext: personaContext
      });

      return {
        response: finalResponse,
        conversationType: 'orchestrated',
        involvedAgents: orchestratorResponse.executedAgents || intentAnalysis.requiredAgents,
        deliverables: orchestratorResponse.completedDeliverables || intentAnalysis.deliverables,
        executionTime: orchestratorResponse.totalExecutionTime || 5000
      };
    } catch (error) {
      console.error('Error in orchestrated request:', error);
      return this.generateErrorResponse(error);
    }
  }

  /**
   * Simulate orchestrator response until MasterOrchestratorAgent is implemented
   */
  private async simulateOrchestratorResponse(params: any): Promise<any> {
    // This is a temporary simulation - replace when MasterOrchestratorAgent is ready
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
    
    return {
      executedAgents: params.requiredAgents,
      completedDeliverables: params.deliverables,
      totalExecutionTime: 3500,
      results: {
        status: 'completed',
        summary: 'Orchestration completed successfully with simulated agent coordination',
        agentOutputs: params.requiredAgents.map((agent: string) => ({
          agent,
          status: 'completed',
          output: `Simulated output from ${agent}`
        }))
      }
    };
  }

  /**
   * Generates direct conversational responses using Claude Sonnet 4
   */
  private async generateDirectResponse(
    userMessage: string, 
    personaContext: PersonaContext, 
    conversationContext?: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    const conversationPrompt = this.constructConversationPrompt({
      userMessage,
      personaContext,
      conversationHistory: conversationContext?.history || [],
      currentContext: conversationContext?.currentContext
    });

    const response = await this.claudeSonnetClient.messages.create({
      messages: [{ role: 'user', content: conversationPrompt }],
      max_tokens: this.maxResponseTokens,
      temperature: 0.7 // Slightly creative for natural conversation
    });

    return {
      response: response.content[0].text,
      conversationType: 'direct',
      personaInfluence: personaContext.appliedElements,
      suggestedFollowUps: this.generateFollowUpSuggestions(userMessage, response.content[0].text)
    };
  }

  /**
   * Constructs prompts for Master Orchestrator with user request and persona context
   */
  private constructOrchestratorPrompt(params: OrchestratorPromptParams): string {
    const { userMessage, personaContext, intentAnalysis, requestedDeliverables } = params;

    return `# Master Orchestrator Task Request

## User Request
"${userMessage}"

## Persona Context Integration
${this.formatPersonaContext(personaContext)}

## Intent Analysis
- **Complexity Level**: ${intentAnalysis.complexityLevel}
- **Required Agents**: ${intentAnalysis.requiredAgents.join(', ')}
- **Deliverables**: ${requestedDeliverables.join(', ')}
- **Priority**: ${intentAnalysis.priority}

## Orchestration Requirements
1. **Task Breakdown**: Decompose the user request into agent-specific tasks
2. **Agent Coordination**: Coordinate execution across identified agents
3. **Quality Assurance**: Ensure deliverables meet user expectations
4. **Response Integration**: Compile results into cohesive user response

## Success Criteria
- All requested deliverables completed successfully
- Response aligns with user's persona and communication style
- Integration between agent outputs is seamless
- User receives actionable, personalized results

Please process this request and return structured results for user response compilation.`;
  }

  /**
   * Constructs conversation prompts with persona integration
   */
  private constructConversationPrompt(params: ConversationPromptParams): string {
    const { userMessage, personaContext, conversationHistory, currentContext } = params;

    return `# Personal Assistant Conversation

## Persona Integration
${this.formatPersonaContext(personaContext)}

## Conversation Context
${conversationHistory.length > 0 ? this.formatConversationHistory(conversationHistory) : 'Starting new conversation'}

${currentContext ? `## Current Context\n${currentContext}` : ''}

## User Message
"${userMessage}"

## Response Guidelines
1. **Personalization**: Incorporate relevant persona elements naturally
2. **Conversational Tone**: Maintain friendly, professional, and helpful tone
3. **Context Awareness**: Reference previous conversation elements when relevant
4. **Actionable Content**: Provide specific, useful guidance where applicable
5. **Follow-up Readiness**: Prepare for potential follow-up questions

Generate a personalized, conversational response that demonstrates understanding of both the user's message and their personal context.`;
  }

  /**
   * Formats persona context for prompt integration
   */
  private formatPersonaContext(personaContext: PersonaContext): string {
    return `**User Profile**:
- Name: ${personaContext.name}
- Role: ${personaContext.role}
- Interests: ${personaContext.interests.join(', ')}
- Communication Style: ${personaContext.communicationStyle}
- Current Projects: ${personaContext.currentProjects.join(', ')}
- Preferences: ${Object.entries(personaContext.preferences).map(([key, value]) => `${key}: ${value}`).join(', ')}

**Relevant Context Elements**:
${personaContext.relevantElements.map(element => `- ${element.category}: ${element.content}`).join('\n')}`;
  }

  /**
   * Parses intent analysis response from Claude Sonnet 4
   */
  private parseIntentAnalysis(analysisText: string): IntentAnalysis {
    // Implementation would parse structured response from Claude
    // For now, using placeholder logic
    const requiresOrchestration = analysisText.includes('complex') || 
                                analysisText.includes('multiple') || 
                                analysisText.includes('coordinate');
    
    return {
      complexityLevel: requiresOrchestration ? 'high' : 'low',
      requiresOrchestration,
      requiredAgents: this.extractRequiredAgents(analysisText),
      deliverables: this.extractDeliverables(analysisText),
      priority: this.extractPriority(analysisText)
    };
  }

  /**
   * External API integration for Claude Sonnet
   */
  private async createClaudeClient(config: ClaudeConfig): Promise<any> {
    console.log('Initializing Claude client with model:', config.model);
    
    // Return mock client for development until @anthropic-ai/sdk is installed
    return {
      messages: {
        create: async (params: any) => {
          // Simulate API response structure
          const mockResponse = this.generateMockClaudeResponse(params);
          return {
            content: [{ text: mockResponse }]
          };
        }
      }
    };
  }

  /**
   * Generate mock Claude responses for development
   */
  private generateMockClaudeResponse(params: any): string {
    const userMessage = params.messages?.[0]?.content || 'No message';
    
    if (userMessage.includes('Intent Analysis')) {
      return `COMPLEXITY: medium
ORCHESTRATION: yes
AGENTS: researcher-agent, communications-agent
DELIVERABLES: analysis, recommendations
PRIORITY: medium
REASONING: This appears to be a complex request that would benefit from multi-agent coordination.`;
    }
    
    return `Thank you for your message. I understand you're asking about: "${userMessage.substring(0, 100)}..."

Based on the context you've provided, I can help you with this. Here's my response:

This is a mock response from the Claude Sonnet integration. In production, this would be powered by Claude Sonnet 4 with full conversational capabilities, persona integration, and sophisticated reasoning.

Would you like me to elaborate on any specific aspect of this topic?`;
  }

  /**
   * Generates follow-up suggestions based on conversation flow
   */
  private generateFollowUpSuggestions(userMessage: string, response: string): string[] {
    // Implementation would analyze conversation to suggest relevant follow-ups
    return [
      "Would you like me to elaborate on any specific point?",
      "Is there anything else I can help you with regarding this topic?",
      "Should I create a plan or take any actions based on our discussion?"
    ];
  }

  /**
   * Crafts final user-facing response from orchestrator results
   */
  private async craftFinalUserResponse(params: FinalResponseParams): Promise<string> {
    const { originalRequest, orchestratorResults, personaContext } = params;

    const responsePrompt = `# Final Response Compilation

## Original User Request
"${originalRequest}"

## Orchestrator Execution Results
${JSON.stringify(orchestratorResults, null, 2)}

## Persona Context for Response Style
${this.formatPersonaContext(personaContext)}

## Response Compilation Task
Create a comprehensive, personalized response that:
1. Directly addresses the original user request
2. Integrates all completed deliverables seamlessly
3. Maintains the user's preferred communication style
4. Provides clear next steps or follow-up options
5. Acknowledges the collaborative effort of multiple agents without being technical

The response should feel like a natural conversation while delivering all requested outcomes.`;

    const finalResponse = await this.claudeSonnetClient.messages.create({
      messages: [{ role: 'user', content: responsePrompt }],
      max_tokens: this.maxResponseTokens,
      temperature: 0.5 // Balanced creativity for natural yet focused response
    });

    return finalResponse.content[0].text;
  }

  /**
   * Error response generation for graceful failure handling
   */
  private generateErrorResponse(error: any): PersonalAssistantResponse {
    return {
      response: "I apologize, but I encountered an issue while processing your request. Let me try a different approach or please feel free to rephrase your question.",
      conversationType: 'error',
      error: error.message,
      suggestedFollowUps: [
        "Could you please rephrase your question?",
        "Would you like to try a different approach?",
        "Is there a specific part of your request I should focus on?"
      ]
    };
  }

  // Helper methods for intent analysis parsing
  private extractRequiredAgents(analysisText: string): string[] {
    // Implementation would extract agent requirements from analysis
    return ['researcher', 'communications']; // Placeholder
  }

  private extractDeliverables(analysisText: string): string[] {
    // Implementation would extract deliverable requirements
    return ['analysis', 'recommendations']; // Placeholder
  }

  private extractPriority(analysisText: string): 'low' | 'medium' | 'high' {
    // Implementation would determine priority from analysis
    return 'medium'; // Placeholder
  }

  private formatConversationHistory(history: ConversationMessage[]): string {
    return history.map(msg => `**${msg.role}**: ${msg.content}`).join('\n\n');
  }
}

// Type definitions for Personal Assistant Agent
interface ConversationContext {
  history: ConversationMessage[];
  currentContext?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PersonaContext {
  name: string;
  role: string;
  interests: string[];
  communicationStyle: string;
  currentProjects: string[];
  preferences: Record<string, string>;
  relevantElements: PersonaElement[];
  appliedElements: string[];
}

interface PersonaElement {
  category: string;
  content: string;
  relevance: number;
}

interface IntentAnalysis {
  complexityLevel: 'low' | 'medium' | 'high';
  requiresOrchestration: boolean;
  requiredAgents: string[];
  deliverables: string[];
  priority: 'low' | 'medium' | 'high';
}

interface PersonalAssistantResponse {
  response: string;
  conversationType: 'direct' | 'orchestrated' | 'error';
  involvedAgents?: string[];
  deliverables?: string[];
  executionTime?: number;
  personaInfluence?: string[];
  suggestedFollowUps?: string[];
  error?: string;
}

interface OrchestratorPromptParams {
  userMessage: string;
  personaContext: PersonaContext;
  intentAnalysis: IntentAnalysis;
  requestedDeliverables: string[];
}

interface ConversationPromptParams {
  userMessage: string;
  personaContext: PersonaContext;
  conversationHistory: ConversationMessage[];
  currentContext?: string;
}

interface FinalResponseParams {
  originalRequest: string;
  orchestratorResults: any;
  personaContext: PersonaContext;
}

interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export type { PersonaContext, PersonalAssistantResponse };
