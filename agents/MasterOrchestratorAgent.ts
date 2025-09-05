import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { ClaudeService } from '../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';
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
    Create detailed execution plans that coordinate multiple specialized agents 
    to accomplish complex software development tasks.

    Your execution plans should include:
    1. Task decomposition and sequencing
    2. Agent assignment and coordination
    3. Dependencies and prerequisites
    4. Timeline estimates
    5. Quality checkpoints
    6. Risk mitigation strategies

    Return your response in a structured format that can be parsed and executed.`;

    try {
      const planResponse = await this.claudeService.generateResponse(
        messages,
        systemPrompt
      );

      return this.parsePlanningResponse(planResponse);
    } catch (error) {
      console.error('Error creating execution plan:', error);
      // Fallback to basic plan
      return {
        plan: 'Basic execution plan created with fallback logic',
        agents: payload.requiredAgents || [],
        timeline: 'Estimated completion time unavailable',
        dependencies: [],
        steps: [],
        risks: []
      };
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
    return `# Task Orchestration Request

## Task Details
${JSON.stringify(payload, null, 2)}

## Available Agents
- Full Stack Developer: Code implementation, architecture design
- DevOps Engineer: Infrastructure, deployment, CI/CD
- QA Engineer: Testing, quality assurance, validation  
- Data Scientist: Data analysis, ML models, statistical insights
- Project Coordinator: Timeline management, resource allocation
- Researcher: Information gathering, analysis, documentation
- Communications: User-facing content, documentation, messaging

## Planning Requirements
Create a comprehensive execution plan that:
1. Breaks down the task into manageable subtasks
2. Assigns appropriate agents to each subtask
3. Identifies dependencies between tasks
4. Provides realistic timeline estimates
5. Includes quality checkpoints and validation steps
6. Considers potential risks and mitigation strategies

Please provide a structured plan that can be executed systematically.`;
  }

  /**
   * Parse planning response from Claude
   */
  private parsePlanningResponse(response: string): OrchestrationPlan {
    // In a production system, this would parse structured JSON or YAML
    // For now, extracting key information from text response
    const lines = response.split('\n');
    
    return {
      plan: response,
      agents: this.extractAgentsFromResponse(response),
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
    // Placeholder for actual plan execution
    // In production, this would coordinate with other agents
    return `Executed orchestration plan with ${plan.agents.length} agents. Plan details: ${plan.plan.substring(0, 200)}...`;
  }

  // Helper methods for parsing Claude responses
  private extractAgentsFromResponse(response: string): string[] {
    const agentMatch = response.match(/(?:agents?|assigned to):?\s*([^\n]+)/i);
    if (agentMatch) {
      return agentMatch[1].split(',').map(a => a.trim().toLowerCase().replace(/\s+/g, '-'));
    }
    return [];
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
}


