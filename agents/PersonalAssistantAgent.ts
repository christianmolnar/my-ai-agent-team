import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { MasterOrchestratorAgent } from './master-orchestrator-agent';
// import { PersonalAssistantBridge } from './PersonalAssistantBridge'; // TODO: Remove bridge dependency in new architecture
// import { EnhancedGlobalLearningSystem } from './GlobalAgentLearningSystem'; // TODO: Replace with CNS integration
import { ClaudeService } from '../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';
import Anthropic from '@anthropic-ai/sdk';

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
  
  // Configuration
  private readonly maxContextTokens = 200000; // Claude Sonnet context window
  private readonly maxResponseTokens = 4096;

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
      console.log('🤖 Personal Assistant - Handling conversation:');
      console.log('  📝 User Message:', userMessage);
      console.log('  📚 Conversation Context:', conversationContext ? 
        `${conversationContext.history.length} previous messages` : 'No context');
      
      // Step 1: Load persona context from private repository
      const personaContext = await this.getPersonaContext(userMessage);
      
      // Step 2: Analyze user intent and complexity
      const intentAnalysis = await this.analyzeUserIntent(userMessage, conversationContext);
      
      // Step 2.5: Load CNS data and check if we should ask clarifying questions
      const cnsData = await this.loadCNSData();
      const shouldAskQuestions = await this.shouldAskClarifyingQuestions(userMessage, intentAnalysis, cnsData);
      
      if (shouldAskQuestions.shouldAsk && shouldAskQuestions.questions.length > 0) {
        return {
          response: await this.formatClarifyingQuestionsFromCNS(shouldAskQuestions.questions, personaContext),
          conversationType: 'direct', 
          suggestedFollowUps: shouldAskQuestions.questions,
          personaInfluence: ['question-asking-protocol']
        };
      }
      
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
        preferences: {},
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
      const messages: Anthropic.MessageParam[] = [
        { role: 'user', content: analysisPrompt }
      ];

      const systemPrompt = `You are an expert intent analysis system for a Personal Assistant Agent. 
      Analyze user messages to determine complexity and coordination requirements.

      CLASSIFICATION GUIDELINES:
      - LOW COMPLEXITY: Greetings, simple questions, casual conversation, basic information requests
      - MEDIUM COMPLEXITY: Specific knowledge requests, single-task assistance, straightforward help
      - HIGH COMPLEXITY: Multi-step projects, research + analysis + report creation, coordinated workflows

      ORCHESTRATION DECISION:
      ALWAYS require orchestration (multiple agents) for:
      - Agent capability queries (what agents, which agents, agent capabilities, team capabilities, etc.)
      - Multi-step projects or workflows
      - Research + analysis + report creation
      - Complex tasks requiring multiple skill sets
      - Project-level work with multiple deliverables

      DO NOT require orchestration for:
      - Simple greetings ("Are you awake?", "Hello", "How are you?")
      - Basic personal questions about the assistant ("What can you do?", "Who are you?")
      - Single-domain requests that one agent could handle

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
      const taskType = this.determineTaskType(userMessage, intentAnalysis);
      console.log(`[PersonalAssistant] Using task type: ${taskType}`);
      
      const masterOrchestrator = new MasterOrchestratorAgent();
      const orchestratorResponse = await masterOrchestrator.handleTask({
        type: taskType,
        payload: {
          userMessage,
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
        const finalResponse = await this.craftFinalUserResponse({
          originalRequest: userMessage,
          orchestratorResults: orchestratorResponse.result,
          personaContext: personaContext
        });

        return {
          response: finalResponse,
          conversationType: 'orchestrated',
          involvedAgents: orchestratorResponse.result?.agentsUsed || [],
          deliverables: orchestratorResponse.result?.completedDeliverables || intentAnalysis.deliverables,
          executionTime: orchestratorResponse.result?.totalExecutionTime || 5000
        };
      } else {
        return {
          response: "I encountered an issue coordinating with the team. Please try your request again.",
          conversationType: 'error',
          involvedAgents: [],
          deliverables: [],
          executionTime: 0
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
      conversationHistory: conversationContext?.history || [],
      currentContext: conversationContext?.currentContext
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

      return {
        response: response,
        conversationType: 'direct',
        personaInfluence: personaContext.appliedElements,
        suggestedFollowUps: this.generateFollowUpSuggestions(userMessage, response)
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

    return `# Personal Assistant Team Coordination

## Your Role
You are the Personal Assistant that coordinates with a team of specialized AI agents. You can orchestrate multi-agent workflows and access team capabilities.

## Team Context
Available specialized agents: researcher, communications, data-scientist, developer, music-coach, image-generator, and others.
Your role: Primary interface and coordination hub for complex tasks.

## Persona Integration
${this.formatPersonaContext(personaContext)}

## Conversation Context
${conversationHistory.length > 0 ? 
  `**IMPORTANT**: This is a continuing conversation. Previous context:\n${this.formatConversationHistory(conversationHistory)}\n\n**Current user message builds on this context.**` : 
  'Starting new conversation'}

${currentContext ? `## Current Context\n${currentContext}` : ''}

## User Message
"${userMessage}"

## Response Guidelines
1. **Team Awareness**: Acknowledge your coordination role when relevant
2. **Personalization**: Incorporate relevant persona elements naturally  
3. **Conversational Tone**: Maintain friendly, professional, and helpful tone
4. **Context Awareness**: Reference previous conversation elements when relevant
5. **Collaboration Transparency**: Be open about team coordination when it occurs
6. **Professional Confidence**: Present your team capabilities with confidence

Generate a response that demonstrates your role as a team coordinator while providing personalized assistance.`;
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
          agentType: 'personal-assistant-agent',
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
          complexityLevel: 'medium',
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
        complexityLevel: complexity as 'low' | 'medium' | 'high',
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
          complexityLevel: 'medium',
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
          complexityLevel: 'low',
          requiresOrchestration: false,
          requiredAgents: [],
          deliverables: ['direct-response'],
          priority: 'low'
        };
      }
      
      // Default fallback
      return {
        complexityLevel: 'medium',
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
    if (!orchestratorResults || !orchestratorResults.agentResults) {
      return `I apologize, but I encountered an issue coordinating with the team for your request: "${originalRequest}". Please try again.`;
    }

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

  /**
   * Formats clarifying questions using CNS formatting guidelines
   */
  private async formatClarifyingQuestions(questions: string[], personaContext: PersonaContext): Promise<string> {
    try {
      // Format according to the learned preferences
      let formattedResponse = `I'd like to ask a few clarifying questions to better understand your request:\n\n`;
      
      questions.forEach((question, index) => {
        formattedResponse += `**${index + 1}. ${question}**\n\n`;
      });
      
      formattedResponse += `These questions will help me coordinate the right team members and provide you with the most relevant and useful information.\n\n`;
      formattedResponse += `Please let me know your thoughts on any or all of these questions, and I'll get started on your research right away.`;
      
      return formattedResponse;
    } catch (error) {
      // Fallback formatting if CNS loading fails
      let fallbackResponse = `I'd like to ask a few questions to better help you:\n\n`;
      questions.forEach((question, index) => {
        fallbackResponse += `${index + 1}. ${question}\n\n`;
      });
      return fallbackResponse;
    }
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

  /**
   * Load CNS data from private repository
   * TODO: Replace with local CNS integration in new architecture
   */
  private async loadCNSData(): Promise<any> {
    try {
      // TODO: Replace bridge call with local CNS integration
      /*
      const cnsResult = await this.personaBridge.handleTask({
        type: 'get-cns-data',
        payload: {
          requestingAgent: 'personal-assistant',
          dataType: 'conversation-patterns',
          agentType: 'personal-assistant-agent',
          section: 'all'
        }
      });

      if (cnsResult.success && cnsResult.result) {
        console.log('✅ CNS: Data loaded successfully');
        return cnsResult.result;
      } else {
        console.log('❌ CNS: Failed to load data:', cnsResult.error);
        return {};
      }
      */
      
      // Temporary fallback - return empty object
      console.log('🔄 CNS: Bridge functionality disabled for new architecture');
      return {};
    } catch (error) {
      console.error('Error loading CNS data:', error);
      return {};
    }
  }

  /**
   * Check if clarifying questions should be asked based on CNS patterns
   */
  private async shouldAskClarifyingQuestions(userMessage: string, intentAnalysis: any, cnsData: any): Promise<{shouldAsk: boolean, questions: string[]}> {
    try {
      // TODO: Replace learning system with CNS integration
      /*
      const questionCheck = await this.learningSystem.shouldAskClarifyingQuestions(
        intentAnalysis.complexityLevel === 'high' ? 'complex-research' : 'general',
        userMessage
      );

      return {
        shouldAsk: questionCheck.shouldAsk,
        questions: questionCheck.questions
      };
      */
      
      // Temporary fallback - no clarifying questions
      return {
        shouldAsk: false,
        questions: []
      };
    } catch (error) {
      console.error('Error checking clarifying questions:', error);
      return { shouldAsk: false, questions: [] };
    }
  }

  /**
   * Format clarifying questions using CNS formatting guidelines
   */
  private async formatClarifyingQuestionsFromCNS(questions: string[], personaContext: any): Promise<string> {
    try {
      let formattedResponse = `I'd like to ask a few clarifying questions to ensure I coordinate the right team members and provide exactly what you need:\n\n`;
      
      questions.forEach((question, index) => {
        formattedResponse += `**${index + 1}. ${question}**\n\n`;
      });
      
      formattedResponse += `These questions will help me coordinate our team's expertise effectively. Please let me know your preferences, and I'll get our specialists working on your request right away.`;
      
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
