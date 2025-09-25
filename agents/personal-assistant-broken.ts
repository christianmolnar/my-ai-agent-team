import { Agent, AgentTask, AgentTaskResult } from './agent';
import { MasterOrchestratorAgent } from './master-orchestrator';
// import { PersonalAssistantBridge } from './PersonalAssistantBridge'; // TODO: Remove bridge dependency in new architecture
// import { EnhancedGlobalLearningSystem } from './GlobalAgentLearningSystem'; // TODO: Replace with CNS integration
import { ClaudeService } from '../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';
import Anthropic from '@anthropic-ai/sdk';

// Types and interfaces for Personal Assistant
interface PersonalAssistantResponse {
  response: string;
  conversationType: 'direct' | 'orchestrated' | 'error' | 'clarification' | 'confirmation';
  suggestedFollowUps: string[];
  personaInfluence: string[];
  flowState?: FlowState; // NEW: For 4-step flow state tracking
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
  relevantElements?: Array<{category: string; content: string}>;
  appliedElements?: string[];
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
  requirementsSession?: RequirementsSession;
  lastActivity: Date;
  externalSources?: Array<{url: string; content: string; title?: string}>;
  flowState?: FlowState; // NEW: 4-step flow state
}

interface FlowState {
  stage: 'waiting_clarification' | 'waiting_confirmation' | 'executing';
  originalRequest: string;
  enhancedRequest?: string;
  comprehensiveRequest?: string;
  clarifyingQuestions?: string[];
  clarificationHistory: string[];
  interactionCount: number;
}

interface RequirementsSession {
  id: string;
  originalRequest: string;
  currentRequirements: string;
  questionsAsked: string[];
  userResponses: Array<{
    question: string;
    answer: string;
  }>;
  status: 'gathering' | 'planning' | 'approval' | 'executing' | 'completed' | 'ready' | 'approved' | 'cancelled';
  iterationCount: number;
  lastUpdate: Date;
  generatedPlan?: ProjectPlan;
}

interface ProjectPlan {
  id: string;
  title: string;
  description: string;
  deliverables: Array<{
    type: 'document' | 'image' | 'code' | 'research' | 'analysis';
    name: string;
    description: string;
    format?: string;
  }>;
  approach: string;
  estimatedTimeframe: string;
  requiredAgents: string[];
  workflowSteps: string[];
  userApprovalRequired: boolean;
}

interface OrchestratorPromptParams {
  userMessage: string;
  personaContext: PersonaContext;
  intentAnalysis: IntentAnalysis;
}

interface ConversationPromptParams {
  userMessage: string;
  personaContext: PersonaContext;
  conversationHistory?: ConversationTurn[];
}

interface FinalResponseParams {
  assistantResponse?: string;
  userMessage?: string;
  originalRequest?: string;
  orchestratorResults?: any;
  personaContext: PersonaContext;
}

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
  private claudeService: ClaudeService;
  // private personaBridge: PersonalAssistantBridge; // TODO: Remove bridge dependency in new architecture
  private masterOrchestrator: MasterOrchestratorAgent;
  // public learningSystem: EnhancedGlobalLearningSystem; // TODO: Replace with CNS integration
  
  // Conversation state management
  private conversationContexts: Map<string, ConversationContext> = new Map();
  
  // Temporary placeholder learning system (Phase 1.4 will replace with CNS)
  public learningSystem = {
    processUserFeedback: async (feedback: any, context: any) => {
      console.log('📝 Learning system feedback (placeholder):', feedback);
      return { success: true, message: 'Feedback recorded (CNS integration pending)' };
    },
    removeBehavior: async (behavior: string) => {
      console.log('🗑️ Behavior removal (placeholder):', behavior);
      return { success: true, removedBehaviors: [], conflictsDetected: [], filesModified: [] };
    },
    addBehaviorImprovement: async (improvement: any) => {
      console.log('✨ Behavior improvement (placeholder):', improvement);
      return { success: true, addedBehaviors: [], conflictsDetected: [], filesModified: [] };
    },
    teachNewBehavior: async (behavior: string) => {
      console.log('🎓 Teaching new behavior (placeholder):', behavior);
      return { success: true, message: 'New behavior taught (CNS integration pending)', addedBehaviors: [], conflictsDetected: [], filesModified: [] };
    }
  };
  
  // Configuration
  private readonly maxContextTokens = 200000; // Claude Sonnet context window
  private readonly maxResponseTokens = 4096;
  
  // System capabilities - what the AI system can actually do
  private readonly systemCapabilities = {
    fileGeneration: {
      msword: true,  // Available through Communications Agent via Master Orchestrator
      pdf: false,
      excel: false,
      powerpoint: false,
      html: true,
      text: true,
      markdown: true,
      json: true
    },
    communication: {
      email: false,  // System cannot send emails
      sms: false,    // System cannot send SMS
      slack: false,  // System cannot send Slack messages
      discord: false // System cannot send Discord messages
    },
    webAccess: {
      browsing: false,     // Cannot browse the web
      apiCalls: false,     // Cannot make external API calls
      dataFetching: false  // Cannot fetch external data
    },
    storage: {
      localFiles: true,          // Can save to deliverables folder
      cloud: false,              // Cannot save to cloud storage
      databases: false,          // Cannot write to databases
      externalSystems: false     // Cannot write to external systems
    }
  };

  constructor() {
    this.initializeServices();
  }

  private async initializeServices(): Promise<void> {
    // Initialize Claude Sonnet 3.5 service
    this.claudeService = AgentClaudeClientFactory.createPersonalAssistantClient();

    // Initialize persona bridge for private repo data
    // this.personaBridge = new PersonalAssistantBridge(); // TODO: Remove bridge dependency in new architecture
    
    // Initialize learning system
    // this.learningSystem = new EnhancedGlobalLearningSystem('personal-assistant', this.personaBridge); // TODO: Replace with CNS integration

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
            task.payload.intentAnalysis,
            task.payload.conversationContext
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
   * Main conversation handler - NEW 4-STEP FLOW IMPLEMENTATION
   * Step 1: Clarify (max 1 round) → Step 2: Plan → Step 3: Confirm → Step 4: Execute
   * Eliminates endless questioning loops with anti-loop protection
   */
  async handleUserConversation(userMessage: string, conversationContext?: ConversationContext): Promise<PersonalAssistantResponse> {
    try {
      console.log('🤖 Personal Assistant - Handling conversation:');
      console.log('  📝 User Message:', userMessage);
      console.log('  📚 Conversation Context:', conversationContext ? 
        `${conversationContext.history?.length || 0} previous messages` : 'No context');
      
      // Check for URLs in the message and fetch their content
      const urlPattern = /https?:\/\/[^\s]+/g;
      const urls = userMessage.match(urlPattern);
      
      if (urls && urls.length > 0) {
        console.log('🔗 URLs detected, fetching external content...');
        if (!conversationContext) {
          conversationContext = {
            history: [],
            lastActivity: new Date(),
            externalSources: []
          };
        }
        
        if (!conversationContext.externalSources) {
          conversationContext.externalSources = [];
        }
        
        // Fetch content from URLs
        for (const url of urls) {
          try {
            const content = await this.fetchUrlContent(url);
            conversationContext.externalSources.push({
              url,
              content: content.substring(0, 5000), // Limit content to prevent token overflow
              title: this.extractTitleFromContent(content)
            });
            console.log(`✅ Fetched content from: ${url}`);
          } catch (error) {
            console.warn(`⚠️ Failed to fetch content from ${url}:`, error);
          }
        }
      }
      
      // Check if we're in the middle of a requirements gathering session
      if (conversationContext?.requirementsSession) {
        return await this.handleRequirementsIteration(userMessage, conversationContext);
      }
      
      // Step 1: Load persona context from private repository
      const personaContext = await this.getPersonaContext(userMessage);
      
      // Step 2: Analyze user intent and complexity
      const intentAnalysis = await this.analyzeUserIntent(userMessage, conversationContext);
      
      // Step 3: For complex requests, check if user has already provided sufficient details or is frustrated
      if (intentAnalysis.requiresOrchestration) {
        // Check if this is a follow-up message in the same conversation with sufficient context
        const hasContext = conversationContext?.history && conversationContext.history.length > 2;
        
        // Check for frustration or direct commands
        const frustrationIndicators = [
          'don\'t want to answer', 'no more questions', 'just write', 'stop asking',
          'enough questions', 'move on', 'proceed', 'go ahead', 'write the',
          'i don\'t know', 'don\'t know', 'think i\'ve given you enough',
          'given you enough', 'enough information', 'just do it', 'make it',
          'create it', 'write it', 'build it', 'i\'m done', 'write the paper',
          'this is enough information', 'already said'
        ];
        
        const userLower = userMessage.toLowerCase();
        const isFrustrated = frustrationIndicators.some(indicator => userLower.includes(indicator));
        
        // Check for direct commands like "write the paper", "create the document", etc.
        const directCommands = /^(write|create|make|build|generate|research)\s+.*?(paper|document|report|essay|analysis|summary|comprehensive|detailed|story|fiction|narrative|chapter|book|novel|tale)/i;
        const isDirectCommand = directCommands.test(userMessage.trim());
        
        console.log(`[PersonalAssistant] Direct command check: "${userMessage.trim()}" matches pattern: ${isDirectCommand}`);
        
        // Additional check for comprehensive requests that should go straight to orchestration
        const comprehensiveRequests = /\b(comprehensive|detailed|complete|thorough)\s+(summary|analysis|report|document|research|learning)/i;
        const isComprehensiveRequest = comprehensiveRequests.test(userMessage);
        
        // If user is frustrated, has given context, issued direct command, or made comprehensive request, proceed to orchestration
        if (isFrustrated || isDirectCommand || isComprehensiveRequest || (hasContext && conversationContext && conversationContext.history.length > 6)) {
          console.log(`[PersonalAssistant] Proceeding to orchestration - frustrated: ${isFrustrated}, directCommand: ${isDirectCommand}, comprehensive: ${isComprehensiveRequest}, hasContext: ${hasContext}`);
          return await this.handleOrchestratedRequest(userMessage, personaContext, intentAnalysis, conversationContext);
        }
        
        // Otherwise, start enhanced requirements gathering
        console.log('[PersonalAssistant] Starting requirements gathering instead of orchestration');
        return await this.startEnhancedRequirementsGathering(userMessage, personaContext, intentAnalysis, conversationContext);
      } else {
        // Direct conversation response for simple requests
        return await this.generateDirectResponse(userMessage, personaContext, conversationContext);
      }
    } catch (error) {
      console.error('Personal Assistant conversation error:', error);
      return this.generateErrorResponse(error);
    }
  }

  /**
   * Get persona context from private repository through bridge
   * TODO: Replace with CNS integration in new architecture
   */
  private async getPersonaContext(userMessage: string): Promise<PersonaContext> {
    try {
      // TODO: Replace bridge calls with local CNS integration
      /*
      // Get identity data
      const identityResult = await this.personaBridge.handleTask({
        type: 'get-identity-data',
        payload: { requestingAgent: 'personal-assistant', dataType: 'user-identity', userMessage }
      });

      // Get communications style
      const commResult = await this.personaBridge.handleTask({
        type: 'get-communications-style',
        payload: { requestingAgent: 'personal-assistant', dataType: 'communication-preferences', userMessage }
      });

      // Get project context
      const projectResult = await this.personaBridge.handleTask({
        type: 'get-project-context',
        payload: { requestingAgent: 'personal-assistant', dataType: 'current-projects', userMessage }
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
      */
      
      // Temporary fallback - return default context
      return {
        name: 'User',
        role: 'Professional',
        interests: [],
        communicationStyle: 'Professional',
        currentProjects: [],
        preferences: [],
        conversationStyle: 'Professional',
        knowledgeAreas: ['General'],
        currentMood: 'neutral',
        personalDetails: [],
        relevantElements: [],
        appliedElements: []
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
        preferences: [],
        conversationStyle: 'Professional',
        knowledgeAreas: ['General'],
        currentMood: 'neutral',
        personalDetails: [],
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
      const messages: Anthropic.MessageParam[] = [
        { role: 'user', content: analysisPrompt }
      ];

      const systemPrompt = `You are an expert intent analysis system for a Personal Assistant Agent. 
      Analyze user messages to determine complexity and coordination requirements.

      CLASSIFICATION GUIDELINES:
      - LOW COMPLEXITY: Greetings, simple questions, casual conversation, basic information requests
      - MEDIUM COMPLEXITY: Specific knowledge requests, single-task assistance, straightforward help, creative requests with clear requirements
      - HIGH COMPLEXITY: Multi-step projects, research + analysis + report creation, coordinated workflows

      ORCHESTRATION DECISION:
      ALWAYS require orchestration (multiple agents) for:
      - Agent capability queries (what agents, which agents, agent capabilities, team capabilities, etc.)
      - Multi-step projects or workflows requiring coordination
      - Research + analysis + report creation
      - Learning summaries, comprehensive summaries, documentation requests
      - Complex tasks requiring multiple distinct skill sets
      - Vague or unclear project requests
      - File creation requests (Word documents, PDFs, etc.) that require specialized formatting
      - Creative content creation that needs professional formatting and delivery
      - Story creation, fiction writing, narrative generation (any length)
      - Chapter-based content, book creation, creative writing projects
      - Content creation + file generation combinations
      - Any request mentioning "comprehensive", "detailed analysis", "research and compile"
      - Knowledge synthesis across multiple domains
      - Document generation requests with specific page/word count requirements

      DO NOT require orchestration for:
      - Simple greetings ("Are you awake?", "Hello", "How are you?")
      - Basic personal questions about the assistant ("What can you do?", "Who are you?")
      - Single-domain requests that one agent could handle WITHOUT file creation
      - Simple text responses that don't require file generation
      - Basic conversation and information requests

      IMPORTANT: Agent capability questions should ALWAYS use orchestration to get real agent information.

      RESPONSE FORMAT (be precise with your analysis):
      COMPLEXITY: [low|medium|high]
      ORCHESTRATION: [yes|no]  
      AGENTS: [comma-separated list ONLY if orchestration=yes, otherwise leave blank]
      DELIVERABLES: [comma-separated list of expected outputs]
      PRIORITY: [low|medium|high]
      REASONING: [brief explanation of your decision]`;

      const analysis = await this.claudeService.generateResponse(messages, systemPrompt);

      console.log('[PersonalAssistant] Intent Analysis Raw Response:', analysis);
      const parsedAnalysis = this.parseIntentAnalysis(analysis, userMessage);
      console.log('[PersonalAssistant] Parsed Intent Analysis:', JSON.stringify(parsedAnalysis, null, 2));

      return parsedAnalysis;
    } catch (error) {
      console.error('Error analyzing user intent:', error);
      // Fallback to simple analysis
      return {
        complexityLevel: 'simple',
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
   - researcher (for information gathering)
   - communications (for writing/messaging/story creation/document generation)  
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
    intentAnalysis: IntentAnalysis,
    conversationContext?: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    try {
      // Step 1: Construct orchestrator prompt with user request and persona context
      const orchestratorPrompt = this.constructOrchestratorPrompt({
        userMessage,
        personaContext,
        intentAnalysis
      });

      // Step 2: Send to Master Orchestrator for plan creation and execution
      const taskType = this.determineTaskType(userMessage, intentAnalysis);
      console.log(`[PersonalAssistant] Using task type: ${taskType}`);
      
      const masterOrchestrator = new MasterOrchestratorAgent();
      const orchestratorResponse = await masterOrchestrator.handleTask({
        type: taskType,
        payload: {
          userRequest: userMessage, // Fixed: changed from userMessage to userRequest
          userMessage, // Keep both for compatibility
          conversationHistory: conversationContext?.history || [], // Pass full conversation context
          context: {
            intentAnalysis,
            personaContext,
            requestedDeliverables: intentAnalysis.deliverables,
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substr(2, 9)
          }
        }
      });

      // Step 3: Process orchestrator results and craft user-facing response
      if (orchestratorResponse?.success) {
        console.log('📋 Processing orchestrator response for user-facing output');
        console.log('📋 Orchestrator response type:', typeof orchestratorResponse.result);
        
        const finalResponse = await this.craftFinalUserResponse({
          originalRequest: userMessage,
          orchestratorResults: orchestratorResponse.result,
          personaContext: personaContext
        });

        console.log('📋 Final response length:', finalResponse.length, 'chars');
        console.log('📋 Final response preview:', finalResponse.substring(0, 200) + '...');

        return {
          response: finalResponse,
          conversationType: 'orchestrated',
          suggestedFollowUps: [],
          personaInfluence: ['orchestration']
        };
      } else {
        console.error('📋 Orchestrator response failed:', orchestratorResponse);
        return {
          response: "I encountered an issue coordinating with the team. Please try your request again.",
          conversationType: 'error',
          suggestedFollowUps: [],
          personaInfluence: ['error-handling']
        };
      }
    } catch (error) {
      console.error('Error in orchestrated request:', error);
      return this.generateErrorResponse(error);
    }
  }

  /**
   * Determines appropriate task type for Master Orchestrator based on request analysis
   */
  private determineTaskType(userMessage: string, intentAnalysis: any): 'orchestrate' | 'plan' | 'get-agent-capabilities' | 'count-agents' {
    const message = userMessage.toLowerCase();
    
    // Check for simple counting/info queries that don't need orchestration
    if (message.includes('how many agents') || 
        message.includes('count the agents') ||
        message.includes('number of agents') ||
        message.includes('agent count') ||
        (message.includes('agents') && (message.includes('how many') || message.includes('count')))) {
      return 'count-agents';
    }
    
    // Check for agent capability queries
    if (message.includes('what agents') || 
        message.includes('which agents') || 
        message.includes('agent capabilities') || 
        message.includes('what can the team') ||
        message.includes('team capabilities') ||
        message.includes('who can help') ||
        message.includes('available agents') ||
        message.includes('each one of your agents') ||
        message.includes('reach out to each') ||
        message.includes('elevator pitch') ||
        message.includes('compile their responses') ||
        (message.includes('agents') && message.includes('capabilities')) ||
        (message.includes('agents') && message.includes('what') && message.includes('can'))) {
      return 'get-agent-capabilities';
    }
    
    // Check for planning requests (without execution)
    if (message.includes('plan for') || 
        message.includes('create a plan') ||
        message.includes('planning') ||
        message.includes('strategy for') ||
        message.includes('approach to') ||
        (message.includes('how to') && !message.includes('create') && !message.includes('build') && !message.includes('generate'))) {
      return 'plan';
    }
    
    // Default to orchestrate for execution requests
    // This includes complex multi-deliverable requests, content creation, analysis, etc.
    return 'orchestrate';
  }

  /**
   * Generates direct conversational responses using Claude Sonnet 3.5
   */
  private async generateDirectResponse(
    userMessage: string, 
    personaContext: PersonaContext, 
    conversationContext?: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    const conversationPrompt = this.constructConversationPrompt({
      userMessage,
      personaContext,
      conversationHistory: conversationContext?.history || []
    });

    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: conversationPrompt }
    ];

    const systemPrompt = await this.buildPersonaSystemPrompt(personaContext, userMessage);

    try {
      const response = await this.claudeService.generateResponse(
        messages,
        systemPrompt
      );

      // Use the response as-is for now (capability checking can be added later)
      const finalResponse = response;

      return {
        response: finalResponse,
        conversationType: 'direct',
        personaInfluence: personaContext.appliedElements || [],
        suggestedFollowUps: this.generateFollowUpSuggestions(userMessage, finalResponse)
      };
    } catch (error) {
      console.error('Error generating direct response:', error);
      return this.generateErrorResponse(error);
    }
  }

  /**
   * Constructs prompts for Master Orchestrator with user request and persona context
   */
  private constructOrchestratorPrompt(params: OrchestratorPromptParams): string {
    const { userMessage, personaContext, intentAnalysis } = params;

    return `# Master Orchestrator Task Request

## User Request
"${userMessage}"

## Persona Context Integration
${this.formatPersonaContext(personaContext)}

## Intent Analysis
- **Complexity Level**: ${intentAnalysis.complexityLevel}
- **Required Agents**: ${intentAnalysis.requiredAgents.join(', ')}
- **Deliverables**: ${intentAnalysis.deliverables.join(', ')}
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
    const { userMessage, personaContext, conversationHistory } = params;

    // Check if we have external sources to include
    const externalSources = conversationHistory && conversationHistory.length > 0 ? 
      this.getExternalSourcesFromHistory(conversationHistory) : [];

    return `# Personal Assistant Team Coordination

## Your Role
You are the Personal Assistant that coordinates with a team of specialized AI agents. You can orchestrate multi-agent workflows and access team capabilities.

## Team Context
Available specialized agents: researcher, communications, data-scientist, developer, music-coach, image-generator, and others.
Your role: Primary interface and coordination hub for complex tasks.

## Persona Integration
${this.formatPersonaContext(personaContext)}

## Conversation Context
${conversationHistory && conversationHistory.length > 0 ? 
  `**IMPORTANT**: This is a continuing conversation. Previous context:\n${this.formatConversationHistory(conversationHistory)}\n\n**Current user message builds on this context.**` : 
  'Starting new conversation'}

${externalSources.length > 0 ? `## External Sources Referenced
${externalSources.map(source => `### ${source.title || 'External Content'}
**URL**: ${source.url}
**Content**: ${source.content.substring(0, 1000)}...`).join('\n\n')}

**Note**: The user has referenced external content above. Please acknowledge and use this information to inform your response.` : ''}

## User Message
"${userMessage}"

## Response Guidelines
1. **Team Awareness**: Acknowledge your coordination role when relevant
2. **Personalization**: Incorporate relevant persona elements naturally  
3. **Conversational Tone**: Maintain friendly, professional, and helpful tone
4. **Context Awareness**: Reference previous conversation elements when relevant
5. **Collaboration Transparency**: Be open about team coordination when it occurs
6. **Professional Confidence**: Present your team capabilities with confidence
${externalSources.length > 0 ? '7. **External Content**: Reference and use the external sources provided to give more accurate responses' : ''}

Generate a response that demonstrates your role as a team coordinator while providing personalized assistance.`;
  }

  /**
   * Formats persona context for prompt integration
   */
  private formatPersonaContext(personaContext: PersonaContext): string {
    return `**User Profile**:
- Name: ${personaContext.name}
- Role: ${personaContext.role || 'User'}
- Interests: ${personaContext.interests?.join(', ') || 'None specified'}
- Communication Style: ${personaContext.communicationStyle || 'Professional'}
- Current Projects: ${personaContext.currentProjects?.join(', ') || 'None specified'}
- Preferences: ${personaContext.preferences.join(', ') || 'None specified'}

**Relevant Context Elements**:
${personaContext.relevantElements?.map(element => `- ${element.category}: ${element.content}`).join('\n') || 'None available'}`;
  }

  /**
   * Builds system prompt with persona context integration and CNS learnings
   */
  private async buildPersonaSystemPrompt(personaContext: PersonaContext, userMessage?: string): Promise<string> {
    // Load active learnings from private repo CNS via bridge
    let cnsLearnings = '';
    try {
      // TODO: Replace bridge call with local CNS integration
      /*
      const cnsResult = await this.personaBridge.handleTask({
        type: 'get-cns-data',
        payload: {
          requestingAgent: 'personal-assistant',
          dataType: 'learning-data',
          agentType: 'personal-assistant',
          section: 'all',
          userMessage
        }
      });

      if (cnsResult.success && cnsResult.result) {
        const cnsData = cnsResult.result;
        let learningText = '';
        
        if (cnsData.formatting_guidelines) {
          learningText += `## FORMATTING GUIDELINES\n${cnsData.formatting_guidelines}\n\n`;
          console.log('✅ CNS: Loaded formatting guidelines:', cnsData.formatting_guidelines.length, 'characters');
        }
        
        if (cnsData.conversation_patterns) {
          learningText += `## CONVERSATION PATTERNS\n${cnsData.conversation_patterns}\n\n`;
          console.log('✅ CNS: Loaded conversation patterns:', cnsData.conversation_patterns.length, 'characters');
        }
        
        cnsLearnings = learningText || 'CNS learning files not available';
