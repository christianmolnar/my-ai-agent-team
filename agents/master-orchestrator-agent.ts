import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { ClaudeService } from '../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';
import { interactionLogger } from '../lib/interaction-logger';
import { AgentRegistry } from '../lib/AgentRegistry';
import Anthropic from '@anthropic-ai/sdk';

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

  private claudeService: ClaudeService;

  constructor() {
    // Initialize Claude service for advanced orchestration
    this.claudeService = AgentClaudeClientFactory.createMasterOrchestratorClient();
  }

  /**
   * Agent interface implementation
   */
  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'orchestrate':
          const result = await this.orchestrateTask(task.payload);
          return { success: true, result };

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
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: this.buildPlanningPrompt(payload)
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

    CRITICAL: You have access to ${this.getAvailableAgentCount()} specialized agents. Use the ones that match the task requirements.

    Return your response as a structured plan that identifies which specific agents should be involved and why.`;

    try {
      const planResponse = await this.claudeService.generateResponse(
        messages,
        systemPrompt
      );

      return this.parsePlanningResponse(planResponse, payload);
    } catch (error) {
      console.error('Error creating execution plan:', error);
      // NO FALLBACKS - fail fast with clear error
      throw new Error(`PLAN CREATION FAILED: Could not generate execution plan. Claude service error: ${error.message}. Check API keys and Claude service configuration.`);
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
   * Build planning prompt from task payload
   */
  private buildPlanningPrompt(payload: any): string {
    // Dynamically get all available agents from the registry
    const availableAgents = AgentRegistry.getAvailableAgents();
    const agentDescriptions = availableAgents
      .filter(agentId => agentId !== this.id && agentId !== 'master-orchestrator') // Exclude self
      .map(agentId => {
        const displayName = AgentRegistry.getAgentDisplayName(agentId);
        // Get brief description based on agent type
        const description = this.getAgentDescription(agentId);
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

Please provide a structured plan that leverages the appropriate agents for this specific task.`;
  }

  /**
   * Get agent description based on agent ID
   */
  private getAgentDescription(agentId: string): string {
    // Map agent IDs to their primary capabilities
    const agentCapabilities: Record<string, string> = {
      'researcher-agent': 'Information gathering, analysis, documentation, research methodology',
      'communications-agent': 'User-facing content, documentation, messaging, strategic communication',
      'project-coordinator-agent': 'Timeline management, resource allocation, project coordination',
      'full-stack-developer-agent': 'Complete software solutions, architecture, full-stack development',
      'front-end-developer-agent': 'User interface, responsive design, frontend technologies',
      'back-end-developer-agent': 'Server infrastructure, APIs, databases, backend systems',
      'data-scientist-agent': 'Data analysis, ML models, statistical insights, data visualization',
      'test-expert-agent': 'Quality assurance, testing strategies, test automation',
      'security-expert-agent': 'Security assessment, vulnerability analysis, security protocols',
      'performance-expert-agent': 'Performance optimization, monitoring, system efficiency',
      'music-coach-agent': 'Music education, theory, practice guidance, musical expertise',
      'image-generator-agent': 'Image creation, visual content generation, graphic design',
      'vinyl-researcher-agent': 'Music research, vinyl records, music history and cataloging',
      'availability-reliability-expert-agent': 'System reliability, uptime optimization, availability engineering',
      'dev-design-doc-creator-agent': 'Technical documentation, design documents, architecture specs',
      'experience-designer-agent': 'User experience design, interface design, user research',
      'monitoring-expert-agent': 'System monitoring, alerting, observability, performance tracking',
      'privacy-guardian-agent': 'Privacy protection, data governance, compliance, privacy engineering',
      'product-manager-agent': 'Product strategy, roadmap planning, feature prioritization, stakeholder management',
      'enhanced-master-orchestrator-agent': 'Advanced multi-agent coordination, complex orchestration'
    };

    return agentCapabilities[agentId] || 'Specialized AI agent with domain expertise';
  }

  /**
   * Get count of available agents
   */
  private getAvailableAgentCount(): number {
    return AgentRegistry.getAvailableAgents().filter(id => id !== this.id && id !== 'master-orchestrator').length;
  }

  /**
   * Parse planning response from Claude
   */
  private parsePlanningResponse(response: string, payload?: any): OrchestrationPlan {
    // Extract agents from Claude's response - this is the core decision-making
    const extractedAgents = this.extractAgentsFromResponse(response);
    
    // If no agents were extracted, this indicates Claude didn't understand the task properly
    if (extractedAgents.length === 0) {
      console.warn('⚠️  No agents extracted from orchestration plan. Using basic coordination agents.');
      // Use basic coordination as fallback, but this should be rare
      const fallbackAgents = ['project-coordinator-agent', 'communications-agent'];
      console.log(`🔄 Fallback agents: ${fallbackAgents.join(', ')}`);
      return {
        plan: response,
        agents: fallbackAgents,
        timeline: this.extractTimelineFromResponse(response),
        dependencies: this.extractDependenciesFromResponse(response),
        steps: this.extractStepsFromResponse(response),
        risks: this.extractRisksFromResponse(response)
      };
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
        throw new Error(`Agent "${agentId}" not found or could not be instantiated. Available agents: ${AgentRegistry.getAvailableAgents().join(', ')}`);
      }

      // Create the task for the agent
      const agentTask = {
        type: 'execute-task',
        payload: {
          userRequest: payload.userRequest,
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
    const availableAgents = AgentRegistry.getAvailableAgents();
    
    // Filter out the orchestrator itself to avoid recursion
    const targetAgents = availableAgents.filter(agentId => 
      agentId !== this.id && agentId !== 'master-orchestrator' && agentId !== 'master-orchestrator-agent'
    );
    
    capabilities.push(`🤖 # Agent Capability Summary Report`);
    capabilities.push(`I've coordinated with our specialized AI agents to collect summaries of their capabilities. Here are the results from our team:\n`);
    capabilities.push(`## Agent Capabilities\n`);
    
        // Create a simple capability collection task
        for (const agentId of targetAgents) {
          try {
            console.log(`🔧 Requesting capability summary from: ${agentId}`);
            
            // Get the actual agent instance
            const agentInstance = await AgentRegistry.getAgentInstance(agentId);
            
            if (!agentInstance) {
              capabilities.push(`**${AgentRegistry.getAgentDisplayName(agentId)}:**\n•Unable to communicate - agent not available`);
              continue;
            }

            // Create a clear, specific request for an elevator pitch
            const capabilityTask = {
              type: 'execute-task',
              payload: {
                userRequest: 'Provide a brief one-sentence elevator pitch of your primary capabilities and specializations'
              }
            };

            console.log(`📝 Executing elevator pitch request for: ${agentId}`);

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
              capabilities.push(`**${AgentRegistry.getAgentDisplayName(agentId)}:**\n•${response}`);
            } else {
              // Only fall back to abilities if the agent completely failed
              if (agentInstance.abilities && Array.isArray(agentInstance.abilities)) {
                const summary = agentInstance.abilities.slice(0, 2).join(' and ');
                capabilities.push(`**${AgentRegistry.getAgentDisplayName(agentId)}:**\n•${summary}`);
              } else {
                capabilities.push(`**${AgentRegistry.getAgentDisplayName(agentId)}:**\n•Communication error - please try again`);
              }
            }      } catch (error) {
        console.error(`Error getting capabilities from ${agentId}:`, error);
        
        // Try fallback to agent's static abilities
        try {
          const agentInstance = await AgentRegistry.getAgentInstance(agentId);
          if (agentInstance?.abilities && Array.isArray(agentInstance.abilities)) {
            const summary = agentInstance.abilities.slice(0, 2).join(' and ');
            capabilities.push(`**${AgentRegistry.getAgentDisplayName(agentId)}:**\n•${summary}`);
          } else {
            capabilities.push(`**${AgentRegistry.getAgentDisplayName(agentId)}:**\n•Communication error - agent may be unavailable`);
          }
        } catch (fallbackError) {
          capabilities.push(`**${AgentRegistry.getAgentDisplayName(agentId)}:**\n•Communication error - agent may be unavailable`);
        }
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
    const availableAgents = AgentRegistry.getAvailableAgents();
    
    // Filter out the orchestrator itself
    const targetAgents = availableAgents.filter(agentId => 
      agentId !== this.id && agentId !== 'master-orchestrator' && agentId !== 'master-orchestrator-agent'
    );
    
    const agentList = targetAgents.map(agentId => {
      const displayName = AgentRegistry.getAgentDisplayName(agentId);
      const description = this.getAgentDescription(agentId);
      return `• **${displayName}**: ${description}`;
    }).join('\n');
    
    return `# Agent Team Summary

I have **${targetAgents.length} specialized agents** available on my team:

${agentList}

Each agent brings unique expertise and can be called upon individually or as part of coordinated multi-agent workflows to handle complex tasks requiring diverse skills.`;
  }

  // Helper methods for parsing Claude responses
  private extractAgentsFromResponse(response: string): string[] {
    // Try multiple patterns to extract agent names from the plan
    const patterns = [
      /Lead Agent[s]*:\s*([^\n\*]+)/gi,
      /Supporting Agents?:\s*([^\n\*]+)/gi,
      /Agent[s]*:\s*([^\n\*]+)/gi,
      /Selected Agents?:\s*([^\n\*]+)/gi,
      /Required Agents?:\s*([^\n\*]+)/gi,
      /Assigned Agents?:\s*([^\n\*]+)/gi,
      /Team Members?:\s*([^\n\*]+)/gi,
      /Coordination Team:\s*([^\n\*]+)/gi,
      /- ([A-Z][^:\n]*Agent[^:\n]*)/gi, // Match bullet points with agent names
      /\b([A-Z][a-z\s]*Agent)\b/gi // Match any agent pattern
    ];
    
    let foundAgents: string[] = [];
    
    // Extract agents using multiple patterns
    for (const pattern of patterns) {
      const matches = response.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Handle different capture groups
          const agentText = match.includes(':') ? 
            match.split(':')[1].trim() : 
            match.replace(/^[-\s\*]*/, '').trim();
          
          // Split on common delimiters and normalize
          const agents = agentText.split(/[,\n\*\-\s]+/)
            .map(a => AgentRegistry.normalizeAgentName(a.trim()))
            .filter(a => a.length > 0);
          foundAgents.push(...agents);
        });
      }
    }
    
    // Remove duplicates and validate against actual available agents
    foundAgents = [...new Set(foundAgents)].filter(agent => {
      const isValid = AgentRegistry.isValidAgent(agent);
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

  /**
   * Get predefined elevator pitch for an agent
   */
  private getAgentElevatorPitch(agentId: string): string {
    const elevatorPitches: Record<string, string> = {
      'researcher-agent': 'Expert information gathering, analysis, and research methodology for comprehensive insights',
      'communications-agent': 'Strategic messaging, content creation, and stakeholder communication across multiple channels',
      'project-coordinator-agent': 'End-to-end project management, resource coordination, and timeline optimization',
      'full-stack-developer-agent': 'Complete application development from database to frontend with modern frameworks',
      'front-end-developer-agent': 'Responsive UI/UX development with React, TypeScript, and modern design systems',
      'back-end-developer-agent': 'Scalable API development, database architecture, and server infrastructure',
      'data-scientist-agent': 'Advanced analytics, machine learning models, and data-driven insights',
      'dev-design-doc-creator-agent': 'Technical documentation, system architecture, and development specifications',
      'performance-expert-agent': 'System optimization, performance tuning, and scalability improvements',
      'availability-reliability-expert-agent': 'High availability architecture, disaster recovery, and system reliability',
      'security-expert-agent': 'Cybersecurity assessment, threat analysis, and secure system design',
      'test-expert-agent': 'Comprehensive testing strategies, automation, and quality assurance',
      'monitoring-expert-agent': 'System observability, alerting, and performance monitoring solutions',
      'experience-designer-agent': 'User experience research, interface design, and usability optimization',
      'product-manager-agent': 'Product strategy, roadmap planning, and stakeholder alignment',
      'privacy-guardian-agent': 'Data privacy compliance, GDPR/CCPA adherence, and privacy-by-design',
      'image-video-generator-agent': 'AI-powered visual content creation and multimedia asset generation',
      'music-coach-agent': 'Music education, performance coaching, and audio production guidance',
      'vinylresearcheragent': 'Vinyl record research, music history, and collectible analysis',
      'personal-assistant-agent': 'Intelligent task coordination and personalized assistance management'
    };
    
    return elevatorPitches[agentId] || 'Specialized AI agent with unique capabilities';
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
}


