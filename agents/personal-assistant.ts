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
  conversationType: 'direct' | 'orchestrated' | 'error';
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
   * Main conversation handler - processes user input and generates personalized responses
   * Integrates persona data and determines if orchestration is needed
   */
  async handleUserConversation(userMessage: string, conversationContext?: ConversationContext): Promise<PersonalAssistantResponse> {
    try {
      console.log('🤖 Personal Assistant - Handling conversation:');
      console.log('  📝 User Message:', userMessage);
      console.log('  📚 Conversation Context:', conversationContext ? 
        `${conversationContext.history.length} previous messages` : 'No context');
      
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
        const directCommands = /^(write|create|make|build|generate|research)\s+(the\s+)?(paper|document|report|essay|analysis|summary|comprehensive|detailed)/i;
        const isDirectCommand = directCommands.test(userMessage.trim());
        
        // Additional check for comprehensive requests that should go straight to orchestration
        const comprehensiveRequests = /\b(comprehensive|detailed|complete|thorough)\s+(summary|analysis|report|document|research|learning)/i;
        const isComprehensiveRequest = comprehensiveRequests.test(userMessage);
        
        // If user is frustrated, has given context, issued direct command, or made comprehensive request, proceed to orchestration
        if (isFrustrated || isDirectCommand || isComprehensiveRequest || (hasContext && conversationContext && conversationContext.history.length > 6)) {
          console.log('[PersonalAssistant] User ready to proceed - going directly to orchestration');
          return await this.handleOrchestratedRequest(userMessage, personaContext, intentAnalysis, conversationContext);
        }
        
        // Otherwise, start enhanced requirements gathering
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
      - Content creation + file generation combinations
      - Any request mentioning "comprehensive", "detailed analysis", "research and compile"
      - Knowledge synthesis across multiple domains

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
   - communications (for writing/messaging)  
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

      // Check and correct any capability claims
      const capabilityAwareResponse = await this.generateCapabilityAwareResponse(
        userMessage, 
        personaContext, 
        response
      );

      return {
        response: capabilityAwareResponse,
        conversationType: 'direct',
        personaInfluence: personaContext.appliedElements || [],
        suggestedFollowUps: this.generateFollowUpSuggestions(userMessage, capabilityAwareResponse)
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
        console.log('✅ CNS: Total learning data length:', cnsLearnings.length, 'characters');
      } else {
        console.log('❌ CNS: Bridge call failed:', cnsResult.error || 'No result');
      }
      */
      
      // Temporary fallback - no CNS learning data
      cnsLearnings = 'CNS learning files not available - bridge functionality removed for new architecture';
    } catch (error) {
      console.warn('CNS: Bridge access failed:', error.message);
      cnsLearnings = 'CNS learning files not available - bridge error';
    }
    
    return `You are the Personal Assistant AI that coordinates a team of 20+ specialized AI agents.

YOUR ROLE & IDENTITY:
- You are the primary interface between the user and their AI agent team
- You coordinate with specialized agents (researchers, developers, analysts, etc.) to handle complex requests
- You have direct access to team capabilities and can orchestrate multi-agent workflows
- You ARE part of a team - embrace this collaborative identity

TEAM AWARENESS:
- When you coordinate with other agents, acknowledge this openly
- Reference team capabilities naturally: "Let me check with our research team" or "I'll coordinate with our specialists"
- Be proud of your orchestration abilities - it's your core strength
- Never deny your team-based nature or pretend to be a standalone AI

PERSONALITY & APPROACH:
- Be friendly, professional, and genuinely helpful
- Adapt your communication style to match the user's preferences  
- Show understanding of their background and current context
- Be transparent about when you're coordinating with team members
- Celebrate the collaborative advantage your team provides

USER CONTEXT:
${this.formatPersonaContext(personaContext)}

COMMUNICATION GUIDELINES:
- Match the user's preferred communication style: ${personaContext.communicationStyle}
- Reference their expertise and interests when relevant
- Consider their current projects and ongoing work
- Provide responses that are actionable and relevant to their role as ${personaContext.role}

LEARNED BEHAVIORS AND FORMATTING GUIDELINES:
${cnsLearnings}

🚨🚨🚨 CRITICAL FORMATTING ENFORCEMENT 🚨🚨🚨
THE USER HAS COMPLAINED MULTIPLE TIMES ABOUT UNFORMATTED RESPONSES.
YOU MUST FORMAT EVERY RESPONSE PROPERLY OR IT WILL BE REJECTED.

MANDATORY RULES - NO EXCEPTIONS:
• NEVER write sentences longer than 20 words
• ALWAYS use bullet points (•) for lists
• ALWAYS add blank lines between sections
• ALWAYS break long text into short paragraphs
• ALWAYS use **bold** for emphasis

❌ FORBIDDEN: "I understand this is about your son's ongoing health situation. Let me coordinate with our team to provide helpful information while being mindful of the sensitivity of this topic. **Initial Response**: I'm concerned about your son's three-year struggle with symptoms. To help provide the most relevant information: 1. **Clarifying Questions**: • Which specific symptoms has your son been experiencing? • Have you received any medical evaluations or diagnoses? • Are you looking for research-based information, specialist resources, or support options?"

✅ REQUIRED FORMAT:
I understand this is about your son's ongoing health situation.

Let me coordinate with our team to provide helpful information.

**Initial Questions:**
• Which specific symptoms has your son been experiencing?
• Have you received any medical evaluations or diagnoses? 
• Are you looking for research-based information or support options?

EVERY response must be broken into short, readable segments like this.

Your goal is to provide personalized assistance with PERFECT formatting that the user can easily read.`;
  }

  /**
   * Parses intent analysis response from Claude Sonnet 4
   */
  private parseIntentAnalysis(analysisText: string, originalMessage?: string): IntentAnalysis {
    try {
      // First check if this is an agent capability query regardless of Claude's analysis
      const userLower = (originalMessage || '').toLowerCase();
      const capabilityPatterns = [
        'what agents', 'which agents', 'agent capabilities', 'what can the team',
        'team capabilities', 'who can help', 'available agents', 'what agents can',
        'each one of your agents', 'reach out to each', 'elevator pitch',
        'compile their responses', 'agents and compile', 'one sentence',
        'capabilities of', 'capabilities?', 'what can each'
      ];
      
      const isCapabilityQuery = capabilityPatterns.some(pattern => userLower.includes(pattern));
      
      if (isCapabilityQuery) {
        console.log('[PersonalAssistant] Detected capability query - forcing orchestration');
        return {
          complexityLevel: 'moderate',
          requiresOrchestration: true,
          requiredAgents: ['master-orchestrator'],
          deliverables: ['agent-capabilities-list'],
          priority: 'medium'
        };
      }

      // Parse structured response from Claude analysis
      const complexityMatch = analysisText.match(/COMPLEXITY:\s*(\w+)/i);
      const orchestrationMatch = analysisText.match(/ORCHESTRATION:\s*(\w+)/i);
      const agentsMatch = analysisText.match(/AGENTS:\s*([^\n]+)/i);
      const deliverablesMatch = analysisText.match(/DELIVERABLES:\s*([^\n]+)/i);
      const priorityMatch = analysisText.match(/PRIORITY:\s*(\w+)/i);

      const complexity = complexityMatch ? complexityMatch[1].toLowerCase() : 'low';
      const requiresOrchestration = orchestrationMatch ? 
        orchestrationMatch[1].toLowerCase() === 'yes' : false;
      
      const agents = agentsMatch ? 
        agentsMatch[1].split(',').map(a => a.trim()).filter(a => a.length > 0) : [];
      
      const deliverables = deliverablesMatch ? 
        deliverablesMatch[1].split(',').map(d => d.trim()).filter(d => d.length > 0) : ['direct-response'];
      
      const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium';

      return {
        complexityLevel: (complexity === 'low' ? 'simple' : complexity === 'medium' ? 'moderate' : 'high') as 'simple' | 'moderate' | 'high',
        requiresOrchestration,
        requiredAgents: agents,
        deliverables: deliverables,
        priority: priority as 'low' | 'medium' | 'high'
      };
    } catch (error) {
      console.error('Error parsing intent analysis:', error);
      
      // Fallback: Use simple keyword analysis for basic categorization
      const userLower = (originalMessage || analysisText).toLowerCase();
      
      // Agent capability queries should be routed to Master Orchestrator
      const capabilityPatterns = [
        'what agents', 'which agents', 'agent capabilities', 'what can the team',
        'team capabilities', 'who can help', 'available agents', 'what agents can',
        'each one of your agents', 'reach out to each', 'elevator pitch',
        'compile their responses', 'agents and compile', 'one sentence',
        'capabilities of', 'capabilities?', 'what can each'
      ];
      
      const isCapabilityQuery = capabilityPatterns.some(pattern => userLower.includes(pattern));
      
      if (isCapabilityQuery) {
        return {
          complexityLevel: 'moderate',
          requiresOrchestration: true,
          requiredAgents: ['master-orchestrator'],
          deliverables: ['agent-capabilities-list'],
          priority: 'medium'
        };
      }
      
      // Simple greetings and check-ins should be direct responses
      const simplePatterns = [
        'are you awake', 'hello', 'hi', 'good morning', 'good afternoon', 
        'good evening', 'how are you', 'what can you do', 'who are you',
        'help', 'thanks', 'thank you', 'yes', 'no', 'okay', 'you there',
        'tell me about', 'explain', 'what is'
      ];
      
      const isSimple = simplePatterns.some(pattern => userLower.includes(pattern));
      
      if (isSimple) {
        return {
          complexityLevel: 'simple',
          requiresOrchestration: false,
          requiredAgents: [],
          deliverables: ['direct-response'],
          priority: 'low'
        };
      }
      
      // Default fallback
      return {
        complexityLevel: 'moderate',
        requiresOrchestration: false,
        requiredAgents: [],
        deliverables: ['direct-response'],
        priority: 'medium'
      };
    }
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

    // Handle get-agent-capabilities response format (string result)
    if (typeof orchestratorResults === 'string') {
      return orchestratorResults;
    }

    // Validate we have actual orchestrator results
    if (!orchestratorResults) {
      return `I apologize, but I encountered an issue coordinating with the team for your request: "${originalRequest}". Please try again.`;
    }

    // Handle the new orchestrator result format
    if (orchestratorResults.results && typeof orchestratorResults.results === 'string') {
      const results = orchestratorResults.results;
      
      // Clean up the results by filtering out unwanted agent outputs
      const cleanedResults = this.filterAgentResults(results);
      
      // Look for executable code in the results and prioritize it
      const codeMatch = cleanedResults.match(/✅ EXECUTABLE CODE GENERATED:[\s\S]*?```html[\s\S]*?```[\s\S]*?(?=; [a-z-]+:|$)/);
      if (codeMatch) {
        // Extract just the code generation part, filtering out architectural noise
        const codeSection = codeMatch[0];
        
        // Add instructions for saving/using the code
        return codeSection + '\n\n🎯 **Ready to use!** Save the HTML code above as a `.html` file and open in your browser.\n\n📋 **Next Steps:**\n1. Copy the HTML code above\n2. Save it as `tic-tac-toe.html` (or any `.html` file name)\n3. Double-click the file to open it in your browser\n4. Start playing!';
      }
      
      return cleanedResults;
    }

    // Handle legacy agentResults format for backwards compatibility
    if (orchestratorResults.agentResults) {
      // Extract only the actual agent outputs (no fabrication allowed)
      const actualAgentOutputs: Array<{ agent: string; output: string }> = [];
      
      if (orchestratorResults.agentResults && typeof orchestratorResults.agentResults === 'object') {
        for (const [agentId, result] of Object.entries(orchestratorResults.agentResults)) {
          if (result && typeof result === 'object' && 'success' in result && (result as any).success) {
            const agentResult = result as any;
            actualAgentOutputs.push({
              agent: agentId,
              output: agentResult.result || agentResult.response || 'Agent completed task successfully'
            });
          }
        }
      }

      if (actualAgentOutputs.length === 0) {
        return `I coordinated with the team regarding your request: "${originalRequest}", but no agents were able to complete deliverables at this time. Please try a different approach or let me know if you'd like me to try again.`;
      }

      const responsePrompt = `# Final Response Compilation

## Original User Request
"${originalRequest}"

## ACTUAL Agent Outputs (DO NOT FABRICATE OR ADD TO THESE)
${actualAgentOutputs.map(item => `### ${item.agent}:\n${item.output}`).join('\n\n')}

## Persona Context for Response Style
${this.formatPersonaContext(personaContext)}

## Response Compilation Task
Create a response that:
1. Directly addresses the original user request
2. ONLY reports the actual outputs provided above - DO NOT add content not explicitly provided by agents
3. Maintains the user's preferred communication style
4. Provides clear next steps or follow-up options
5. Acknowledges which specific agents contributed

CRITICAL: Only reference agent work that is explicitly listed above. Do not fabricate or simulate agent outputs.`;

      const messages: Anthropic.MessageParam[] = [
        { role: 'user', content: responsePrompt }
      ];

      const systemPrompt = await this.buildPersonaSystemPrompt(personaContext, originalRequest);

      try {
        const finalResponse = await this.claudeService.generateResponse(
          messages,
          systemPrompt
        );

        return finalResponse;
      } catch (error) {
        console.error('Error crafting final response:', error);
        return 'I apologize, but I encountered an issue while crafting the final response. The agents have completed their tasks, but I had difficulty presenting the results.';
      }
    }

    // If neither format is found, return error
    return `I apologize, but I encountered an issue coordinating with the team for your request: "${originalRequest}". Please try again.`;
  }

  /**
   * Error response generation for graceful failure handling
   */
  private generateErrorResponse(error: any): PersonalAssistantResponse {
    return {
      response: "I apologize, but I encountered an issue while processing your request. Let me try a different approach or please feel free to rephrase your question.",
      conversationType: 'error',
      suggestedFollowUps: [
        "Could you please rephrase your question?",
        "Would you like to try a different approach?",
        "Is there a specific part of your request I should focus on?"
      ],
      personaInfluence: ['error-handling']
    };
  }

  /**
   * Format clarifying questions in an engaging, conversational way
   */
  private async formatClarifyingQuestionsFromCNS(questions: string[], personaContext: any): Promise<string> {
    try {
      let formattedResponse = `I'd love to help you with this! To make sure I coordinate the right team members and create exactly what you're looking for, I have a few quick questions:\n\n`;
      
      questions.forEach((question, index) => {
        formattedResponse += `**${index + 1}. ${question}**\n\n`;
      });
      
      formattedResponse += `Once I have these details, I'll craft the perfect prompt and coordinate our specialized agents to deliver exactly what you need. Just answer what you can, and we'll get started right away! 🚀`;
      
      return formattedResponse;
    } catch (error) {
      console.error('Error formatting clarifying questions:', error);
      // Fallback formatting
      let fallbackResponse = `I'd like to ask a few questions to better help you:\n\n`;
      questions.forEach((question, index) => {
        fallbackResponse += `${index + 1}. ${question}\n\n`;
      });
      return fallbackResponse;
    }
  }

  /**
   * Enhanced requirements gathering with LLM-generated questions
   */
  private async startEnhancedRequirementsGathering(
    userMessage: string, 
    personaContext: PersonaContext, 
    intentAnalysis: IntentAnalysis,
    conversationContext?: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    // Step 1: Generate targeted clarifying questions using LLM
    const questionGenerationPrompt = `You are an expert requirements analyst. A user has made this request:

REQUEST: "${userMessage}"

INTENT ANALYSIS: ${JSON.stringify(intentAnalysis, null, 2)}

Your job is to generate 3-5 targeted clarifying questions that will help create the best possible deliverable. 

Focus on questions that determine:
1. Scope and depth of content needed
2. Target audience and purpose
3. Format and delivery preferences
4. Specific requirements or constraints
5. Success criteria

Make questions:
- Specific and actionable
- Not too technical for the user
- Focused on outcomes and preferences
- Essential for creating high-quality deliverables

Return ONLY a JSON array of questions like this:
["Question 1?", "Question 2?", "Question 3?"]`;

    try {
      const questionsResponse = await this.claudeService.generateResponse([
        { role: 'user', content: questionGenerationPrompt }
      ]);

      // Parse the questions
      let questions: string[] = [];
      try {
        questions = JSON.parse(questionsResponse);
      } catch (parseError) {
        // Fallback to manual parsing if JSON fails
        const lines = questionsResponse.split('\n').filter(line => line.trim().includes('?'));
        questions = lines.map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim());
      }

      // Create a new requirements session
      const requirementsSession: RequirementsSession = {
        id: `req_${Date.now()}`,
        originalRequest: userMessage,
        currentRequirements: `Original request: ${userMessage}`,
        questionsAsked: questions,
        userResponses: [],
        status: 'gathering',
        iterationCount: 1,
        lastUpdate: new Date()
      };

      // Update conversation context
      const updatedContext: ConversationContext = {
        ...conversationContext,
        requirementsSession,
        history: [
          ...(conversationContext?.history || []),
          { role: 'user', content: userMessage, timestamp: new Date() }
        ],
        lastActivity: new Date()
      };

      // Store the session for continuation
      this.conversationContexts.set(
        conversationContext?.sessionId || `session_${Date.now()}`, 
        updatedContext
      );

      const formattedQuestions = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');

      return {
        response: `I'll help you create ${intentAnalysis.deliverables.join(', ')}. To ensure I deliver exactly what you need, please answer these questions:

${formattedQuestions}

You can answer all at once or one by one. Once I have this information, I'll create a detailed plan for your review before we proceed.`,
        conversationType: 'direct',
        suggestedFollowUps: [],
        personaInfluence: ['enhanced-requirements-gathering']
      };

    } catch (error) {
      console.error('Enhanced requirements gathering failed:', error);
      // Fallback to direct orchestration
      return await this.handleOrchestratedRequest(userMessage, personaContext, intentAnalysis, conversationContext);
    }
  }

  /**
   * Start requirements gathering for complex requests (legacy method)
   */
  private async startRequirementsGathering(
    userMessage: string, 
    personaContext: PersonaContext, 
    intentAnalysis: IntentAnalysis,
    conversationContext?: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    // Check if this is a creative content + file generation request
    // These should proceed directly to orchestration without endless questions
    const message = userMessage.toLowerCase();
    const isCreativeWithFile = (
      (message.includes('song') || message.includes('poem') || message.includes('story') || message.includes('creative')) &&
      (message.includes('word') || message.includes('file') || message.includes('document') || message.includes('create'))
    );

    if (isCreativeWithFile) {
      console.log('[PersonalAssistant] Creative + file request detected - proceeding directly to orchestration');
      return await this.handleOrchestratedRequest(userMessage, personaContext, intentAnalysis, conversationContext);
    }

    const requirementsPrompt = `You are an expert requirements analyst. A user has made this request:

REQUEST: "${userMessage}"

INTENT ANALYSIS: ${JSON.stringify(intentAnalysis, null, 2)}

${conversationContext ? `## Conversation Context
${this.formatConversationHistory(conversationContext.history)}` : ''}

Your job is to:
1. Identify what information is missing to create a complete requirements document
2. Ask 2-3 specific, targeted questions to gather the most important missing details
3. Focus on questions that will significantly impact the solution

Create questions that are:
- Specific and actionable
- Not too technical for the user
- Focused on outcomes and preferences
- Help determine scope and priorities

Return your response in this format:
ANALYSIS: [Brief analysis of what's needed]
QUESTIONS: [List 2-3 specific questions]
NEXT: [What you'll do once you have these answers]`;

    try {
      const response = await this.claudeService.generateResponse([
        { role: 'user', content: requirementsPrompt }
      ]);

      // Create a new requirements session
      const requirementsSession: RequirementsSession = {
        id: `req_${Date.now()}`,
        originalRequest: userMessage,
        currentRequirements: `Original request: ${userMessage}`,
        questionsAsked: [],
        userResponses: [],
        status: 'gathering',
        iterationCount: 1,
        lastUpdate: new Date()
      };

      // Update conversation context
      const updatedContext: ConversationContext = {
        ...conversationContext,
        requirementsSession,
        history: [
          ...(conversationContext?.history || []),
          { role: 'user', content: userMessage, timestamp: new Date() }
        ],
        lastActivity: new Date()
      };

      return {
        response: `${response}

Please answer these questions so I can create the best possible solution for you. Once I have this information, I'll prepare a detailed requirements document and ask for your approval before proceeding.`,
        conversationType: 'direct',
        suggestedFollowUps: [],
        personaInfluence: ['requirements-gathering']
      };

    } catch (error) {
      console.error('Requirements gathering failed:', error);
      // Fallback to direct orchestration
      return await this.handleOrchestratedRequest(userMessage, personaContext, intentAnalysis, conversationContext);
    }
  }

  /**
   * Handle ongoing requirements gathering iteration
   */
  private async handleRequirementsIteration(
    userMessage: string, 
    conversationContext: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    const session = conversationContext.requirementsSession!;
    
    // Prevent endless requirements loops - force orchestration after 3 iterations
    if (session.iterationCount >= 3) {
      console.log('[PersonalAssistant] Maximum requirements iterations reached - proceeding to orchestration');
      session.status = 'approved';
      return await this.proceedWithApprovedRequirements(session, conversationContext);
    }

    // Check if user is expressing frustration or wants to proceed
    const frustrationIndicators = [
      'don\'t want to answer', 'no more questions', 'just write', 'stop asking',
      'enough questions', 'move on', 'proceed', 'go ahead', 'write the',
      'i don\'t know', 'don\'t know', 'think i\'ve given you enough',
      'given you enough', 'enough information', 'just do it', 'make it',
      'create it', 'write it', 'build it', 'i\'m done', 'write the paper'
    ];
    
    const userLower = userMessage.toLowerCase();
    const isFrustrated = frustrationIndicators.some(indicator => userLower.includes(indicator));
    
    // Also check for simple direct commands like "write the paper", "create the document", etc.
    const directCommands = /^(write|create|make|build|generate)\s+(the\s+)?(paper|document|report|essay|analysis)/i;
    const isDirectCommand = directCommands.test(userMessage.trim());
    
    if (isFrustrated || isDirectCommand) {
      console.log('[PersonalAssistant] User frustration detected - proceeding to orchestration');
      session.status = 'approved';
      session.currentRequirements += `\n\nUser provided details: ${userMessage}`;
      return await this.proceedWithApprovedRequirements(session, conversationContext);
    }
    
    // Check if user is approving final requirements
    if (this.isApprovalResponse(userMessage)) {
      if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('go ahead') || userMessage.toLowerCase().includes('approve')) {
        // User approved - proceed with orchestration
        session.status = 'approved';
        return await this.proceedWithApprovedRequirements(session, conversationContext);
      } else {
        // User wants changes - continue iteration
        return await this.refineRequirements(userMessage, session, conversationContext);
      }
    }

    // User is providing answers to questions - gather more information
    const refinementPrompt = `The user is responding to our requirements gathering. Here's the context:

ORIGINAL REQUEST: "${session.originalRequest}"
CURRENT REQUIREMENTS: "${session.currentRequirements}"
PREVIOUS QUESTIONS: ${JSON.stringify(session.questionsAsked)}
PREVIOUS ANSWERS: ${JSON.stringify(session.userResponses)}

## CONVERSATION HISTORY (for full context):
${this.formatConversationHistory(conversationContext.history)}

USER'S NEW RESPONSE: "${userMessage}"

CRITICAL: The user has already provided ${session.iterationCount} rounds of information. 
- If this is iteration 2 or higher, you should have enough information to proceed
- Avoid asking more than 1-2 additional questions maximum
- Be ready to approve with current information rather than endless questioning

Based on this new information:
1. Update the requirements document to incorporate their response
2. Determine if you have enough information to create a complete requirements document
3. If not, ask ONLY 1 specific question that is absolutely critical
4. If yes, present the final requirements document for approval

Your response should either:
- Ask ONE additional clarifying question, OR  
- Present final requirements document asking "Is this what you're looking for? Should I proceed with this plan?"

Format:
UPDATED_REQUIREMENTS: [Complete requirements based on all information gathered]
ACTION: [either "NEED_MORE_INFO" or "READY_FOR_APPROVAL"]
RESPONSE: [Your response to the user]`;

    try {
      const response = await this.claudeService.generateResponse([
        { role: 'user', content: refinementPrompt }
      ]);

      // Parse the response to determine next action
      const responseText = response;
      
      // Update session with user response
      session.userResponses.push({
        question: session.questionsAsked[session.questionsAsked.length - 1] || 'General response',
        answer: userMessage
      });
      
      session.iterationCount++;
      session.lastUpdate = new Date();

      // Force approval after iteration 2 to prevent infinite loops
      if (session.iterationCount >= 2 || responseText.includes('READY_FOR_APPROVAL')) {
        session.status = 'ready';
        // Extract requirements from response
        const reqMatch = responseText.match(/UPDATED_REQUIREMENTS:(.*?)(?=ACTION:|$)/);
        if (reqMatch) {
          session.currentRequirements = reqMatch[1].trim();
        }
      }

      // Extract the actual response to user
      const responseMatch = responseText.match(/RESPONSE:(.*?)$/);
      const finalResponse = responseMatch ? responseMatch[1].trim() : responseText;

      return {
        response: finalResponse,
        conversationType: 'direct',
        suggestedFollowUps: session.status === 'ready' ? ['Yes, proceed', 'I want to modify this'] : [],
        personaInfluence: ['requirements-refinement']
      };

    } catch (error) {
      console.error('Requirements iteration failed:', error);
      // Force proceed on error to prevent infinite loops
      session.status = 'approved';
      session.currentRequirements += `\n\nUser response: ${userMessage}`;
      return await this.proceedWithApprovedRequirements(session, conversationContext);
    }
  }

  /**
   * Check if user message is an approval/rejection response
   */
  private isApprovalResponse(message: string): boolean {
    const approvalPhrases = [
      'yes', 'no', 'go ahead', 'proceed', 'approve', 'looks good',
      'that\'s good', 'that\'s correct', 'that works', 'sounds right',
      'not quite', 'but I want', 'actually', 'change', 'modify'
    ];
    
    const lowerMessage = message.toLowerCase();
    return approvalPhrases.some(phrase => lowerMessage.includes(phrase));
  }

  /**
   * Proceed with orchestration using approved requirements
   */
  private async proceedWithApprovedRequirements(
    session: RequirementsSession,
    conversationContext: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    const personaContext = await this.getPersonaContext(session.originalRequest);
    
    // Create enhanced intent analysis with requirements
    const enhancedIntentAnalysis: IntentAnalysis = {
      complexityLevel: 'high',
      requiresOrchestration: true,
      requiredAgents: [], // Will be determined by orchestrator
      deliverables: [],   // Will be determined by orchestrator  
      priority: 'high'
    };

    // Use the refined requirements for orchestration
    const enhancedRequest = `${session.originalRequest}

DETAILED REQUIREMENTS:
${session.currentRequirements}

USER FEEDBACK INCORPORATED:
${session.userResponses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}`;

    return await this.handleOrchestratedRequest(enhancedRequest, personaContext, enhancedIntentAnalysis, conversationContext);
  }

  /**
   * Refine requirements based on user feedback
   */
  private async refineRequirements(
    userMessage: string,
    session: RequirementsSession, 
    conversationContext: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    const refinementPrompt = `The user wants to modify the requirements. Here's the context:

CURRENT REQUIREMENTS: "${session.currentRequirements}"
USER FEEDBACK: "${userMessage}"

## CONVERSATION HISTORY (for full context):
${this.formatConversationHistory(conversationContext.history)}

Please:
1. Understand what the user wants to change
2. Ask specific questions to clarify their modifications
3. Keep the conversation focused and productive

Respond naturally, asking for the specific changes they want to make.`;

    try {
      const response = await this.claudeService.generateResponse([
        { role: 'user', content: refinementPrompt }
      ]);

      session.status = 'gathering';
      session.iterationCount++;
      session.lastUpdate = new Date();

      return {
        response: response,
        conversationType: 'direct',
        suggestedFollowUps: [],
        personaInfluence: ['requirements-modification']
      };

    } catch (error) {
      console.error('Requirements refinement failed:', error);
      return {
        response: `I understand you'd like to make some changes. Could you please tell me specifically what you'd like to modify about the requirements?`,
        conversationType: 'direct',
        suggestedFollowUps: [],
        personaInfluence: ['fallback-modification']
      };
    }
  }

  /**
   * Generate project plan based on gathered requirements
   */
  private async generateProjectPlan(
    session: RequirementsSession,
    userMessage: string,
    intentAnalysis: IntentAnalysis
  ): Promise<ProjectPlan> {
    const planGenerationPrompt = `You are a project planning expert. Based on the user's requirements, create a detailed project plan.

ORIGINAL REQUEST: "${session.originalRequest}"

REQUIREMENTS GATHERED:
${session.userResponses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}

INTENT ANALYSIS: ${JSON.stringify(intentAnalysis, null, 2)}

Create a comprehensive project plan that includes:
1. Clear deliverables with specific formats
2. Detailed approach and methodology
3. Realistic timeframe
4. Required agents/capabilities
5. Step-by-step workflow

Return ONLY a JSON object with this structure:
{
  "title": "Project Title",
  "description": "Detailed description of what will be delivered",
  "deliverables": [
    {
      "type": "document|image|code|research|analysis",
      "name": "Deliverable Name",
      "description": "What this deliverable contains",
      "format": "specific format (e.g., 'Word document', 'PDF', 'PNG image')"
    }
  ],
  "approach": "Detailed methodology and approach",
  "estimatedTimeframe": "Realistic time estimate",
  "requiredAgents": ["agent1", "agent2"],
  "workflowSteps": ["Step 1", "Step 2", "Step 3"],
  "userApprovalRequired": true
}`;

    try {
      const planResponse = await this.claudeService.generateResponse([
        { role: 'user', content: planGenerationPrompt }
      ]);

      const plan = JSON.parse(planResponse);
      plan.id = `plan_${Date.now()}`;
      
      return plan as ProjectPlan;
    } catch (error) {
      console.error('Plan generation failed:', error);
      // Fallback plan
      return {
        id: `plan_${Date.now()}`,
        title: `Project: ${session.originalRequest}`,
        description: `Create deliverables based on: ${session.originalRequest}`,
        deliverables: intentAnalysis.deliverables.map(d => ({
          type: 'document' as const,
          name: d,
          description: `${d} based on user requirements`,
          format: 'Word document'
        })),
        approach: 'Research and create content using appropriate agents',
        estimatedTimeframe: 'Estimated completion time varies based on complexity',
        requiredAgents: intentAnalysis.requiredAgents,
        workflowSteps: [
          'Research and gather information',
          'Create initial content',
          'Review and refine',
          'Format and deliver'
        ],
        userApprovalRequired: true
      };
    }
  }

  /**
   * Present plan to user for approval
   */
  private async presentPlanForApproval(
    plan: ProjectPlan,
    session: RequirementsSession
  ): Promise<PersonalAssistantResponse> {
    const deliverablesList = plan.deliverables
      .map(d => `• ${d.name} (${d.type}) - ${d.description}`)
      .join('\n');
    
    const stepsList = plan.workflowSteps
      .map((step, i) => `${i + 1}. ${step}`)
      .join('\n');

    const response = `## 📋 Project Plan: ${plan.title}

**Description:** ${plan.description}

**Deliverables:**
${deliverablesList}

**Approach:** ${plan.approach}

**Workflow Steps:**
${stepsList}

**Required Agents:** ${plan.requiredAgents.join(', ')}
**Estimated Timeframe:** ${plan.estimatedTimeframe}

---

**Do you approve this plan?** 

Reply with:
- **"Yes"** or **"Approve"** to proceed with execution
- **"Modify [specific changes]"** to request adjustments
- **"Cancel"** to stop the project

I'll coordinate with the appropriate agents to execute this plan once approved.`;

    return {
      response,
      conversationType: 'direct',
      suggestedFollowUps: ['Yes, proceed', 'Modify the approach', 'Cancel this project'],
      personaInfluence: ['plan-approval']
    };
  }

  /**
   * Enhanced orchestration with clear deliverable instructions
   */
  private async executeApprovedPlan(
    plan: ProjectPlan,
    session: RequirementsSession,
    personaContext: PersonaContext,
    conversationContext?: ConversationContext
  ): Promise<PersonalAssistantResponse> {
    
    // Create enhanced orchestrator prompt with explicit content creation instructions
    const enhancedPrompt = `APPROVED PROJECT EXECUTION

PROJECT TITLE: ${plan.title}
PROJECT DESCRIPTION: ${plan.description}

CRITICAL: The user wants ACTUAL CONTENT, not instructions for creating content.

DELIVERABLES TO CREATE:
${plan.deliverables.map(d => `- ${d.name} (${d.format}): ${d.description}`).join('\n')}

APPROACH: ${plan.approach}

WORKFLOW STEPS:
${plan.workflowSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

REQUIREMENTS CONTEXT:
${session.userResponses.map(r => `Q: ${r.question}\nA: ${r.answer}`).join('\n\n')}

IMPORTANT INSTRUCTIONS FOR AGENTS:
- CREATE the actual content, documents, research, etc.
- DO NOT provide instructions on how to create content
- DELIVER finished deliverables that the user can immediately use
- ENSURE content matches the specific requirements gathered
- FORMAT properly according to requested formats

Execute this plan and create the actual deliverables now.`;

    try {
      const masterOrchestrator = new MasterOrchestratorAgent();
      const orchestratorResponse = await masterOrchestrator.handleTask({
        type: 'orchestrate',
        payload: {
          userRequest: enhancedPrompt,
          userMessage: enhancedPrompt,
          conversationHistory: conversationContext?.history || [],
          context: {
            projectPlan: plan,
            requirementsSession: session,
            personaContext,
            requestedDeliverables: plan.deliverables.map(d => d.name),
            timestamp: new Date().toISOString(),
            requestId: Math.random().toString(36).substr(2, 9)
          }
        }
      });

      if (orchestratorResponse?.success) {
        const finalResponse = await this.craftFinalUserResponse({
          originalRequest: session.originalRequest,
          orchestratorResults: orchestratorResponse.result,
          personaContext: personaContext
        });

        // Update session status
        session.status = 'completed';
        session.lastUpdate = new Date();

        return {
          response: finalResponse,
          conversationType: 'orchestrated',
          suggestedFollowUps: ['Request modifications', 'Start a new project'],
          personaInfluence: ['plan-execution']
        };
      } else {
        console.error('Plan execution failed:', orchestratorResponse);
        return {
          response: "I encountered an issue executing the approved plan. Please try again or request a modified approach.",
          conversationType: 'error',
          suggestedFollowUps: ['Try again', 'Modify the plan'],
          personaInfluence: ['error-handling']
        };
      }
    } catch (error) {
      console.error('Error executing plan:', error);
      return this.generateErrorResponse(error);
    }
  }
}
