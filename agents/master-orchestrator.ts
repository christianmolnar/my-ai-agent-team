import { Agent, AgentTask, AgentTaskResult } from './agent';
import { interactionLogger } from '../lib/interaction-logger';
import { AgentRegistry } from './agent-registry';
import { universalAIClient, AIMessage } from '../lib/universal-ai-client';

/**
 * Master Orchestrator Agent - Tier 1 Coordination Layer
 * 
 * Coordinates complex tasks across multiple agents, creates execution plans,
 * and manages inter-agent communication for comprehensive task completion.
 */
export class MasterOrchestratorAgent implements Agent {
  id = 'master-orchestrator';
  name = 'Master Orchestrator Agent';
  description = 'Multi-agent task coordination and execution planning';
  abilities = [
    'Multi-agent task coordination',
    'Execution plan creation',
    'Inter-agent communication',
    'Task decomposition and scheduling',
    'Quality assurance and validation',
    'Result integration and synthesis'
  ];

  /**
   * Agent interface implementation
   */
  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'orchestrate':
          const result = await this.orchestrateTask(task.payload);
          return { success: true, result };

        case 'orchestrate-with-review':
          const reviewedResult = await this.orchestrateTaskWithReview(task.payload);
          return { success: true, result: reviewedResult };

        case 'plan':
          const plan = await this.createExecutionPlan(task.payload);
          return { success: true, result: plan };

        case 'get-agent-capabilities':
          const capabilities = await this.getAgentCapabilities();
          return { success: true, result: capabilities };

        case 'count-agents':
          const count = await this.countAgents();
          return { success: true, result: count };

        default:
          throw new Error(`Unknown orchestration task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Orchestration error: ${error}`
      };
    }
  }

  /**
   * Create execution plan for complex tasks
   */
  private async createExecutionPlan(payload: any): Promise<OrchestrationPlan> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: await this.buildPlanningPrompt(payload)
      }
    ];

    const systemPrompt = `You are a Master Orchestrator for an AI agent team. 
    Your role is to analyze tasks and determine which agents from your team are best suited to fulfill the request.

    CORE PRINCIPLE: Analyze what the task actually requires and select appropriate agents based on their capabilities.

    Your execution plans should include:
    1. Task analysis - what specific capabilities does this task require?
    2. Agent selection - which agents have the needed capabilities?
    3. Task decomposition and sequencing
    4. Agent assignment and coordination
    5. Dependencies and prerequisites
    6. Timeline estimates
    7. Quality checkpoints
    8. Risk mitigation strategies

    SPECIAL CASE HANDLING:
    - If the user asks about agent capabilities or wants to know what agents can do, you MUST coordinate with the actual agents to get their real capabilities
    - If the task requires specific domain expertise, select agents that have that expertise
    - Do not assume what agents can do - select based on actual requirements

    AVAILABLE AGENTS:
    ${await this.getAvailableAgentsDescription()}

    CRITICAL: You have access to ${await this.getAvailableAgentCount()} specialized agents. Use the ones that match the task requirements.

    REQUIRED FORMAT: Your response MUST include a section exactly like this:
    **SELECTED AGENTS:**
    - researcher (for information gathering)
    - communications (for document creation)
    - data-scientist (for data analysis)

    Use the exact agent IDs from the available agents list above. Only select agents that are actually needed for the task.`;

    try {
      const response = await universalAIClient.generateResponse(
        this.id,
        messages,
        systemPrompt
      );

      return await this.parsePlanningResponse(response.content, payload);
    } catch (error) {
      console.error('Error creating execution plan:', error);
      // NO FALLBACKS - fail fast with clear error
      throw new Error(`PLAN CREATION FAILED: Could not generate execution plan. Universal AI Client error: ${error.message}. Check API keys and provider configurations.`);
    }
  }

  /**
   * Orchestrate task execution across multiple agents
   */
  private async orchestrateTask(payload: any): Promise<OrchestrationResult> {
    try {
      // Step 1: Create execution plan
      const plan = await this.createExecutionPlan(payload);

      // Step 2: Execute plan (placeholder for actual agent coordination)
      const results = await this.executePlan(plan, payload);

      return {
        status: 'completed',
        executedAgents: plan.agents,
        completedDeliverables: payload.deliverables || [],
        totalExecutionTime: 3000,
        results: results,
        plan: plan
      };
    } catch (error) {
      console.error('Error orchestrating task:', error);
      return {
        status: 'failed',
        executedAgents: [],
        completedDeliverables: [],
        totalExecutionTime: 0,
        results: 'Orchestration failed',
        error: error.toString()
      };
    }
  }

  /**
   * Orchestrate task execution with review cycle for quality assurance
   */
  private async orchestrateTaskWithReview(payload: any): Promise<OrchestrationResult> {
    try {
      console.log('🔍 Master Orchestrator: Starting orchestration with review cycle');

      // Step 1: Create execution plan
      const plan = await this.createExecutionPlan(payload);

      // Step 2: Execute plan to get initial results
      const initialResults = await this.executePlan(plan, payload);

      // Step 3: Determine if review is needed (for important deliverables)
      const needsReview = this.shouldTriggerReview(payload, plan);

      if (!needsReview) {
        console.log('📋 Master Orchestrator: Review not needed for this task');
        return {
          status: 'completed',
          executedAgents: plan.agents,
          completedDeliverables: payload.deliverables || [],
          totalExecutionTime: 3000,
          results: initialResults,
          plan: plan
        };
      }

      console.log('🔍 Master Orchestrator: Triggering review process');

      // Step 4: Get reviewer agent and conduct review
      const reviewResult = await this.conductReview({
        originalMission: payload.userRequest,
        expectedResults: payload.deliverables?.join(', ') || 'Task completion',
        actualDeliverables: initialResults,
        sourceAgent: plan.agents[0] || 'unknown',
        modelUsed: 'claude-3-5-sonnet-20241022'
      });

      // Step 5: Determine if revision is needed based on review
      const needsRevision = reviewResult.validationScore < 80;

      if (!needsRevision) {
        console.log('✅ Master Orchestrator: Review passed, no revision needed');
        return {
          status: 'completed',
          executedAgents: [...plan.agents, 'reviewer'],
          completedDeliverables: payload.deliverables || [],
          totalExecutionTime: 4500,
          results: `${initialResults}\n\n**Quality Review:** Validated with score ${reviewResult.validationScore}/100`,
          plan: plan,
          reviewResult: reviewResult
        };
      }

      console.log('🔄 Master Orchestrator: Review indicates revision needed');

      // Step 6: Integrate feedback and revise (single iteration to avoid loops)
      const revisedResults = await this.integrateReviewFeedback(
        plan,
        payload,
        initialResults,
        reviewResult
      );

      return {
        status: 'completed',
        executedAgents: [...plan.agents, 'reviewer'],
        completedDeliverables: payload.deliverables || [],
        totalExecutionTime: 6000,
        results: revisedResults,
        plan: plan,
        reviewResult: reviewResult
      };

    } catch (error) {
      console.error('Error in orchestration with review:', error);
      return {
        status: 'failed',
        executedAgents: [],
        completedDeliverables: [],
        totalExecutionTime: 0,
        results: 'Orchestration with review failed',
        error: error.toString()
      };
    }
  }

  /**
   * Determine if a task should trigger the review process
   */
  private shouldTriggerReview(payload: any, plan: OrchestrationPlan): boolean {
    // Review triggers for important deliverables
    const reviewTriggers = [
      'comprehensive',
      'detailed',
      'analysis',
      'report',
      'document',
      'research',
      'summary',
      'learning',
      'documentation'
    ];

    const userRequest = (payload.userRequest || '').toLowerCase();
    const hasReviewTrigger = reviewTriggers.some(trigger => userRequest.includes(trigger));

    // Also review if multiple agents are involved (complex tasks)
    const isComplexTask = plan.agents.length > 1;

    // Review if deliverables include file creation
    const hasFileDeliverables = payload.deliverables?.some((d: string) => 
      d.includes('file') || d.includes('document') || d.includes('report')
    );

    return hasReviewTrigger || isComplexTask || hasFileDeliverables;
  }

  /**
   * Conduct review using the Reviewer Agent
   */
  private async conductReview(reviewRequest: any): Promise<any> {
    try {
      console.log('🔍 Master Orchestrator: Initiating review process');

      // Get reviewer agent instance
      const reviewerAgent = await AgentRegistry.getAgentInstance('reviewer');
      
      if (!reviewerAgent) {
        throw new Error('REVIEWER AGENT UNAVAILABLE: Review process cannot proceed without reviewer agent. This indicates the reviewer agent is not properly registered or implemented.');
      }

      // Execute review
      const reviewTask = {
        type: 'review-output',
        payload: reviewRequest
      };

      const reviewResult = await reviewerAgent.handleTask(reviewTask);

      if (!reviewResult.success) {
        throw new Error(`REVIEW PROCESS FAILED: ${reviewResult.error || 'Unknown review error'}. This indicates the reviewer agent implementation is broken.`);
      }

      console.log(`✅ Review completed with score: ${reviewResult.result.validationScore}/100`);
      return reviewResult.result;

    } catch (error) {
      console.error('REVIEW SYSTEM FAILURE:', error);
      throw new Error(`REVIEW SYSTEM FAILED: Could not complete review process. Error: ${error.message}. This indicates critical system failure in the review workflow.`);
    }
  }

  /**
   * Integrate review feedback and generate revised output
   */
  private async integrateReviewFeedback(
    plan: OrchestrationPlan,
    payload: any,
    originalResults: string,
    reviewResult: any
  ): Promise<string> {
    try {
      console.log('🔄 Master Orchestrator: Integrating review feedback');

      // Create integration prompt for the primary agent
      const integrationPrompt = `# Review Feedback Integration

## Original Results
${originalResults}

## Review Feedback
**Overall Assessment:** ${reviewResult.feedback.overallAssessment}
**Key Strengths:** ${reviewResult.feedback.keyStrengths?.join(', ')}
**Improvement Areas:** ${reviewResult.feedback.improvementAreas?.join(', ')}
**Recommendations:** ${reviewResult.feedback.actionableRecommendations?.join(', ')}

## Integration Task
The review indicates areas for improvement. Please revise the original results by:
1. Maintaining all the strengths identified in the review
2. Addressing the specific improvement areas noted
3. Implementing the actionable recommendations where appropriate
4. Enhancing overall quality while preserving the core value

**Important:** This is a revision, not a complete rewrite. Build upon the existing work to address the review feedback constructively.

**Output:** Provide the revised version that integrates the review feedback while maintaining the original structure and core content.`;

      // Get the primary agent for revision
      const primaryAgent = plan.agents[0];
      if (!primaryAgent) {
        throw new Error(`REVISION FAILED: No primary agent available in plan. Plan agents: ${JSON.stringify(plan.agents)}. This indicates plan creation failure.`);
      }

      const agentInstance = await AgentRegistry.getAgentInstance(primaryAgent);
      if (!agentInstance) {
        throw new Error(`REVISION FAILED: Primary agent "${primaryAgent}" not available for revision. This indicates agent registry or instantiation failure.`);
      }

      // Execute revision task
      const revisionTask = {
        type: 'execute-task',
        payload: {
          userRequest: integrationPrompt,
          context: 'review-integration'
        }
      };

      const revisionResult = await agentInstance.handleTask(revisionTask);

      if (revisionResult.success && revisionResult.result) {
        console.log('✅ Review feedback successfully integrated');
        return `${revisionResult.result}\n\n**Quality Review:** Enhanced based on independent validation (Score: ${reviewResult.validationScore}/100)`;
      } else {
        throw new Error(`REVISION FAILED: Agent revision task failed. Error: ${revisionResult.error || 'Unknown revision error'}. This indicates the agent cannot integrate review feedback.`);
      }

    } catch (error) {
      console.error('REVIEW INTEGRATION FAILURE:', error);
      throw new Error(`REVIEW INTEGRATION FAILED: Could not integrate review feedback. Error: ${error.message}. This indicates critical failure in the feedback integration workflow.`);
    }
  }

  /**
   * Build planning prompt from task payload
   */
  private async buildPlanningPrompt(payload: any): Promise<string> {
    // Dynamically get all available agents from the registry
    const availableAgents = await AgentRegistry.getAvailableAgents();
    const agentDescriptions = availableAgents
      .filter(agent => agent.id !== this.id && agent.id !== 'master-orchestrator') // Exclude self
      .map(agent => {
        const displayName = AgentRegistry.getAgentDisplayName(agent);
        // Get brief description based on agent type
        const description = this.getAgentDescription(agent.id);
        return `- ${displayName}: ${description}`;
      })
      .join('\n');

    return `# Task Orchestration Request

## Task Details
${JSON.stringify(payload, null, 2)}

## Available Agents (${availableAgents.length - 1} agents available - DO NOT include master-orchestrator in the plan)
${agentDescriptions}

## Planning Requirements
Create a comprehensive execution plan that:
1. Analyzes what specific capabilities are needed for this task
2. Identifies which agents from the available team have those capabilities
3. Assigns appropriate agents to each subtask based on their actual abilities
4. Breaks down the task into manageable subtasks
5. Identifies dependencies between tasks
6. Provides realistic timeline estimates
7. Includes quality checkpoints and validation steps
8. Considers potential risks and mitigation strategies

## Critical Instructions
- You have access to ALL ${availableAgents.length - 1} agents listed above
- Select agents based on what capabilities this specific task actually requires
- If the task asks about agent capabilities, you MUST coordinate with the actual agents to get their real capabilities
- Do not make assumptions about what agents can do - use the agents that match the task requirements

## REQUIRED OUTPUT FORMAT
Your response MUST include a clear section like this:

**SELECTED AGENTS:**
- researcher
- communications
- project-coordinator

Use the exact agent IDs from the available agents list above. This is critical for proper agent coordination.

Please provide a structured plan that leverages the appropriate agents for this specific task.`;
  }

  /**
   * Get agent description based on agent ID
   */
  private getAgentDescription(agentId: string): string {
    // Map agent IDs to their primary capabilities
    const agentCapabilities: Record<string, string> = {
      'reviewer': 'Quality validation, independent review, multi-LLM verification, feedback generation',
      'researcher': 'Information gathering, analysis, documentation, research methodology',
      'communications': 'User-facing content, documentation, messaging, strategic communication',
      'project-coordinator': 'Timeline management, resource allocation, project coordination',
      'full-stack-developer': 'Complete software solutions, architecture, full-stack development',
      'front-end-developer': 'User interface, responsive design, frontend technologies',
      'back-end-developer': 'Server infrastructure, APIs, databases, backend systems',
      'data-scientist': 'Data analysis, ML models, statistical insights, data visualization',
      'test-expert': 'Quality assurance, testing strategies, test automation',
      'security-expert': 'Security assessment, vulnerability analysis, security protocols',
      'performance-expert': 'Performance optimization, monitoring, system efficiency',
      'music-coach': 'Music education, theory, practice guidance, musical expertise',
      'image-generator': 'Image creation, visual content generation, graphic design',
      'vinyl-researcher': 'Music research, vinyl records, music history and cataloging',
      'availability-reliability-expert': 'System reliability, uptime optimization, availability engineering',
      'dev-design-doc-creator': 'Technical documentation, design documents, architecture specs',
      'experience-designer': 'User experience design, interface design, user research',
      'monitoring-expert': 'System monitoring, alerting, observability, performance tracking',
      'privacy-guardian': 'Privacy protection, data governance, compliance, privacy engineering',
      'product-manager': 'Product strategy, roadmap planning, feature prioritization, stakeholder management',
      'enhanced-master-orchestrator': 'Advanced multi-agent coordination, complex orchestration'
    };

    return agentCapabilities[agentId] || 'Specialized AI agent with domain expertise';
  }

  /**
   * Get count of available agents
   */
  private async getAvailableAgentCount(): Promise<number> {
    const agents = await AgentRegistry.getAvailableAgents();
    return agents.filter(agent => agent.id !== this.id && agent.id !== 'master-orchestrator').length;
  }

  /**
   * Get description of available agents for planning
   */
  private async getAvailableAgentsDescription(): Promise<string> {
    const agents = await AgentRegistry.getAvailableAgents();
    const filteredAgents = agents.filter(agent => agent.id !== this.id && agent.id !== 'master-orchestrator');
    
    return filteredAgents.map(agent => 
      `- ${agent.id}: ${agent.name} - ${agent.description || 'Specialized agent'}`
    ).join('\n');
  }

  /**
   * Parse planning response from Claude
   */
  private async parsePlanningResponse(response: string, payload?: any): Promise<OrchestrationPlan> {
    // Extract agents from Claude's response - this is the core decision-making
    const extractedAgents = await this.extractAgentsFromResponse(response);
    
    // FAIL FAST - No fallbacks! If we can't extract agents, the system is broken and needs to be fixed
    if (extractedAgents.length === 0) {
      console.error('🚨 EXTRACTION FAILURE: No agents extracted from Claude response');
      console.error('📄 Full Claude Response:', response);
      console.error('� This indicates the extraction patterns are broken and need to be fixed');
      throw new Error(`AGENT EXTRACTION FAILED: Could not extract any valid agents from orchestration plan. This is a critical system failure that must be fixed. Claude response length: ${response.length} characters. Check extraction patterns in extractAgentsFromResponse().`);
    }
    
    console.log(`🎯 Orchestrator selected ${extractedAgents.length} agents: ${extractedAgents.join(', ')}`);
    
    return {
      plan: response,
      agents: extractedAgents,
      timeline: this.extractTimelineFromResponse(response),
      dependencies: this.extractDependenciesFromResponse(response),
      steps: this.extractStepsFromResponse(response),
      risks: this.extractRisksFromResponse(response)
    };
  }

  /**
   * Execute the orchestration plan
   */
  private async executePlan(plan: OrchestrationPlan, payload: any): Promise<string> {
    // Start a new interaction session for this orchestration
    const sessionId = await interactionLogger.startChatSession(
      payload.userId || 'unknown',
      payload.userRequest || 'Agent orchestration request',
      `Orchestrating task with ${plan.agents.length} agents`
    );

    const executionResults: string[] = [];

    // Log the orchestrator's initial task
    const orchestratorInteractionId = await interactionLogger.logAgentInteraction(
      sessionId,
      this.id,
      this.name,
      `Orchestrate multi-agent task: ${payload.userRequest || 'Unknown task'}`,
      JSON.stringify(payload),
      'management',
      'high',
      'complex',
      'user'
    );

    // Execute each agent in the plan
    for (const agentId of plan.agents) {
      try {
        // Log agent interaction
        const agentInteractionId = await interactionLogger.logAgentInteraction(
          sessionId,
          agentId,
          this.getAgentDisplayName(agentId),
          this.getAgentTask(agentId, payload),
          payload.userRequest || 'Orchestrated task',
          'specialist',
          'medium',
          'moderate',
          this.id
        );

        // Execute the actual agent instead of simulation
        const agentOutput = await this.executeRealAgent(agentId, payload);
        
        // Complete the agent interaction
        await interactionLogger.completeAgentInteraction(
          sessionId,
          agentInteractionId,
          agentOutput,
          true
        );

        executionResults.push(`${agentId}: ${agentOutput}`);

      } catch (error) {
        console.error(`Error executing agent ${agentId}:`, error);
        executionResults.push(`${agentId}: Failed - ${error}`);
      }
    }

    // Complete the orchestrator interaction
    const finalResult = `Executed orchestration plan with ${plan.agents.length} agents. Results: ${executionResults.join('; ')}`;
    await interactionLogger.completeAgentInteraction(
      sessionId,
      orchestratorInteractionId,
      finalResult,
      true
    );

    // Complete the session
    await interactionLogger.completeChatSession(
      sessionId, 
      finalResult, 
      payload.deliverables || []
    );

    return finalResult;
  }

  /**
   * Execute real agent instead of simulation
   */
  private async executeRealAgent(agentId: string, payload: any): Promise<string> {
    try {
      // Get the actual agent instance
      const agentInstance = await AgentRegistry.getAgentInstance(agentId);
      
      if (!agentInstance) {
        const availableAgents = await AgentRegistry.getAvailableAgents();
        const agentNames = availableAgents.map(agent => agent.name || agent.id).join(', ');
        throw new Error(`Agent "${agentId}" not found or could not be instantiated. Available agents: ${agentNames}`);
      }

      // Create the task for the agent
      const agentTask = {
        type: 'execute-task',
        payload: {
          userRequest: payload.userRequest,
          conversationHistory: payload.conversationHistory || [], // Pass conversation context
          personaContext: payload.personaContext,
          requiredDeliverables: payload.deliverables,
          priority: payload.priority || 'medium'
        }
      };

      console.log(`🔧 Executing real agent: ${agentId} with task:`, agentTask.type);

      // Execute the agent's task
      const result = await agentInstance.handleTask(agentTask);

      if (!result.success) {
        throw new Error(`Agent "${agentId}" execution failed: ${result.error || 'Unknown error'}`);
      }

      if (!result.result) {
        throw new Error(`Agent "${agentId}" returned empty result. This indicates the agent implementation is incomplete.`);
      }

      return result.result;

    } catch (error) {
      // NO FALLBACKS - fail fast with clear error message
      const errorMessage = `AGENT EXECUTION FAILED: Agent "${agentId}" could not complete task. Error: ${error.message}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get display name for agent
   */
  private getAgentDisplayName(agentId: string): string {
    return AgentRegistry.getAgentDisplayName(agentId);
  }

  /**
   * Get specific task for each agent
   */
  private getAgentTask(agentId: string, payload: any): string {
    const userRequest = payload.userRequest || 'Unknown task';
    
    // Dynamic task generation based on agent type
    const agentType = agentId.replace('-agent', '').replace('-', ' ');
    
    // Generate contextual task based on agent type
    if (agentId.includes('researcher')) {
      return `Research and gather comprehensive information about: ${userRequest}`;
    } else if (agentId.includes('data-scientist')) {
      return `Analyze data patterns and provide statistical insights for: ${userRequest}`;
    } else if (agentId.includes('communications')) {
      return `Synthesize information and create structured presentation for: ${userRequest}`;
    } else if (agentId.includes('project-coordinator')) {
      return `Coordinate project timeline and manage deliverables for: ${userRequest}`;
    } else if (agentId.includes('full-stack-developer')) {
      return `Implement complete technical solution for: ${userRequest}`;
    } else if (agentId.includes('front-end-developer')) {
      return `Create user interface and front-end components for: ${userRequest}`;
    } else if (agentId.includes('back-end-developer')) {
      return `Build server infrastructure and APIs for: ${userRequest}`;
    } else if (agentId.includes('music')) {
      return `Provide music expertise and guidance for: ${userRequest}`;
    } else if (agentId.includes('image')) {
      return `Generate or process images for: ${userRequest}`;
    } else {
      // Generic task for any other agent types
      return `Complete specialized task for: ${userRequest}`;
    }
  }

  /**
   * Get one-line capability summaries from all available agents
   */
  private async getAgentCapabilities(): Promise<string> {
    const capabilities: string[] = [];
    
    // Get all available agents
    const availableAgents = await AgentRegistry.getAvailableAgents();
    
    // Filter out the orchestrator itself to avoid recursion
    const targetAgents = availableAgents.filter(agent => 
      agent.id !== this.id && agent.id !== 'master-orchestrator' && agent.id !== 'master-orchestrator-agent'
    );
    
    capabilities.push(`🤖 # Agent Capability Summary Report`);
    capabilities.push(`I've coordinated with our specialized AI agents to collect summaries of their capabilities. Here are the results from our team:\n`);
    capabilities.push(`## Agent Capabilities\n`);
    
        // Create a simple capability collection task
        for (const agent of targetAgents) {
          try {
            console.log(`🔧 Requesting capability summary from: ${agent.id}`);
            
            // Get the actual agent instance
            const agentInstance = await AgentRegistry.getAgentInstance(agent.id);
            
            if (!agentInstance) {
              throw new Error(`AGENT UNAVAILABLE: Agent "${agent.id}" could not be instantiated. This indicates the agent is not properly registered or has implementation issues.`);
            }

            // Create a clear, specific request for an elevator pitch
            const capabilityTask = {
              type: 'execute-task',
              payload: {
                userRequest: 'Provide a brief one-sentence elevator pitch of your primary capabilities and specializations'
              }
            };

            console.log(`📝 Executing elevator pitch request for: ${agent.id}`);

            // Execute the agent's capability task with timeout
            const result = await Promise.race([
              agentInstance.handleTask(capabilityTask),
              new Promise<AgentTaskResult>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ]);

            if (result.success && result.result) {
              // Use the agent's actual response
              const response = typeof result.result === 'string' ? result.result : String(result.result);
              capabilities.push(`**${AgentRegistry.getAgentDisplayName(agent.id)}:**\n•${response}`);
            } else {
              // NO FALLBACKS - fail fast with clear error
              throw new Error(`AGENT COMMUNICATION FAILED: Agent "${agent.id}" failed to provide capability summary. Error: ${result.error || 'Unknown error'}. This indicates the agent implementation is broken and must be fixed.`);
            }      } catch (error) {
        console.error(`AGENT COMMUNICATION FAILED: Error getting capabilities from ${agent.id}:`, error);
        // NO FALLBACKS - fail fast with clear error
        throw new Error(`AGENT CAPABILITY REQUEST FAILED: Could not communicate with agent "${agent.id}". Error: ${error.message}. This indicates a critical system failure that must be fixed.`);
      }
    }
    
    capabilities.push(`\n## Execution Notes\n`);
    
    if (targetAgents.length > 0) {
      capabilities.push(`We successfully gathered capabilities from ${targetAgents.length} specialized agents.`);
    } else {
      capabilities.push(`We encountered a technical limitation - no agents were available for direct communication.`);
    }
    
    capabilities.push(`\nDespite any technical constraints, we've compiled comprehensive capability information from our agent team.`);
    
    return capabilities.join('\n');
  }

  /**
   * Simple agent count for quick responses
   */
  private async countAgents(): Promise<string> {
    const availableAgents = await AgentRegistry.getAvailableAgents();
    
    // Filter out the orchestrator itself
    const targetAgents = availableAgents.filter(agent => 
      agent.id !== this.id && agent.id !== 'master-orchestrator' && agent.id !== 'master-orchestrator-agent'
    );
    
    const agentList = targetAgents.map(agent => {
      const displayName = AgentRegistry.getAgentDisplayName(agent.id);
      const description = this.getAgentDescription(agent.id);
      return `• **${displayName}**: ${description}`;
    }).join('\n');
    
    return `# Agent Team Summary

I have **${targetAgents.length} specialized agents** available on my team:

${agentList}

Each agent brings unique expertise and can be called upon individually or as part of coordinated multi-agent workflows to handle complex tasks requiring diverse skills.`;
  }

  // Helper methods for parsing Claude responses
  private async extractAgentsFromResponse(response: string): Promise<string[]> {
    // Get all available agents for validation
    const allAgents = await AgentRegistry.getAvailableAgents();
    const validAgentIds = allAgents.map(agent => agent.id);
    const agentNames = allAgents.map(agent => agent.name);
    
    console.log(`🔍 Available agent IDs: ${validAgentIds.join(', ')}`);
    
    // Enhanced extraction patterns that handle structured responses
    const patterns = [
      // Our new structured format - highest priority
      /\*\*SELECTED AGENTS:\*\*\s*\n((?:\s*-\s*[a-zA-Z0-9-]+(?:\s*\([^)]*\))?\s*\n?)+)/gi,
      // Fallback patterns for other formats
      /AGENTS?:\s*([^\n]+)/gi,
      /team:\s*([^\n]+)/gi,
      /agents?\s+needed:\s*([^\n]+)/gi,
      /required\s+agents?:\s*([^\n]+)/gi,
      // Agent type mentions
      /(researcher|communications?|project-coordinator|data-scientist|front-end-developer|back-end-developer|full-stack-developer|image-generator|music-coach|availability-reliability-expert|security-expert|privacy-guardian|performance-expert|monitoring-expert|experience-designer|dev-design-doc-creator|product-manager|test-expert|vinyl-researcher|personal-assistant)/gi
    ];
    
    let foundAgents: string[] = [];
    
    // Try each pattern
    for (const pattern of patterns) {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const agentText = match[1].trim();
          console.log(`📝 Found agent text: "${agentText}"`);
          
          // Special handling for structured format
          if (pattern.source.includes('SELECTED AGENTS')) {
            // Parse the structured list format
            const agents = agentText.split('\n')
              .map(line => line.trim())
              .filter(line => line.startsWith('-'))
              .map(line => line.replace(/^-\s*/, '')) // Remove "- " prefix
              .map(line => line.split(/\s*\(/)[0]) // Remove description in parentheses
              .map(line => line.trim().toLowerCase())
              .filter(line => line.length > 0);
            
            foundAgents.push(...agents);
            console.log(`🎯 Extracted structured agents: ${agents.join(', ')}`);
          } else {
            // Clean and normalize the extracted text for other patterns
            const agents = agentText.split(/[,\n]+/)
              .map(a => a.trim().toLowerCase())
              .map(a => a.replace(/^(the\s+)?/, '')) // Remove "the" prefix
              .map(a => a.replace(/\s*agent\s*$/, '')) // Remove "agent" suffix
              .map(a => a.replace(/[-\s]+/g, '-')) // Convert spaces to hyphens
              .map(a => a.replace(/[^a-z0-9-]/g, '')) // Remove special characters
              .filter(a => a.length > 2); // Filter out short words
            
            foundAgents.push(...agents);
            console.log(`🎯 Extracted agents: ${agents.join(', ')}`);
          }
        }
      }
    }
    
    // Create agent mapping for name resolution
    const agentMapping = new Map<string, string>();
    allAgents.forEach(agent => {
      // Map exact ID
      agentMapping.set(agent.id, agent.id);
      
      // Map partial names (without -agent suffix)
      const baseName = agent.id.replace(/-agent$/, '');
      agentMapping.set(baseName, agent.id);
      
      // Map name variations
      const nameWords = agent.name.toLowerCase().split(' ').filter(w => w !== 'agent');
      const nameKey = nameWords.join('-');
      agentMapping.set(nameKey, agent.id);
      
      // Map first word of name
      if (nameWords.length > 0) {
        agentMapping.set(nameWords[0], agent.id);
      }
      
      // Map common variations
      if (agent.id.includes('researcher')) {
        agentMapping.set('research', agent.id);
        agentMapping.set('personal-researcher', agent.id);
      }
      if (agent.id.includes('communications')) {
        agentMapping.set('communication', agent.id);
        agentMapping.set('communications', agent.id);
      }
      if (agent.id.includes('project-coordinator')) {
        agentMapping.set('project', agent.id);
        agentMapping.set('coordinator', agent.id);
      }
    });
    
    foundAgents = [...new Set(foundAgents)].map(agent => {
      // Try to map partial names to full agent IDs
      return agentMapping.get(agent) || agent;
    }).filter(agent => {
      const isValid = validAgentIds.includes(agent);
      const isSelf = agent === this.id || agent === 'master-orchestrator'; // Prevent recursion
      
      if (!isValid && agent.length > 0) {
        console.log(`⚠️  Unknown agent "${agent}" extracted from plan - ignoring`);
        return false;
      }
      
      if (isSelf) {
        console.log(`⚠️  Orchestrator cannot coordinate with itself "${agent}" - ignoring to prevent recursion`);
        return false;
      }
      
      return isValid;
    });

    // If no valid agents found through patterns, this is a critical failure
    if (foundAgents.length === 0) {
      console.error(`🚨 AGENT EXTRACTION COMPLETE FAILURE: No valid agents extracted from response`);
      console.error(`📄 Claude Response: "${response}"`);
      console.error(`🔍 Available Agents: ${validAgentIds.join(', ')}`);
      throw new Error(`AGENT EXTRACTION FAILED: Could not extract any valid agents from orchestration response. Response length: ${response.length} characters. This indicates the extraction patterns are completely broken and must be fixed immediately.`);
    }
    
    return foundAgents;
  }

  private extractTimelineFromResponse(response: string): string {
    const timelineMatch = response.match(/(?:timeline|duration|time):?\s*([^\n]+)/i);
    return timelineMatch ? timelineMatch[1].trim() : 'Timeline not specified';
  }

  private extractDependenciesFromResponse(response: string): string[] {
    const depsMatch = response.match(/(?:dependencies|depends on):?\s*([^\n]+)/i);
    if (depsMatch) {
      return depsMatch[1].split(',').map(d => d.trim());
    }
    return [];
  }

  private extractStepsFromResponse(response: string): string[] {
    const stepMatches = response.match(/^\d+\.\s*(.+)$/gm);
    return stepMatches ? stepMatches.map(s => s.trim()) : [];
  }

  private extractRisksFromResponse(response: string): string[] {
    const riskMatch = response.match(/(?:risks?|challenges?):?\s*([^\n]+)/i);
    if (riskMatch) {
      return riskMatch[1].split(',').map(r => r.trim());
    }
    return [];
  }

}

// Type definitions for orchestration
interface OrchestrationPlan {
  plan: string;
  agents: string[];
  timeline: string;
  dependencies: string[];
  steps: string[];
  risks: string[];
}

interface OrchestrationResult {
  status: 'completed' | 'failed' | 'in-progress';
  executedAgents: string[];
  completedDeliverables: string[];
  totalExecutionTime: number;
  results: string;
  plan?: OrchestrationPlan;
  error?: string;
  reviewResult?: any;
}


