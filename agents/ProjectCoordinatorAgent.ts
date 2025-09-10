import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { ClaudeService } from '../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';
import { interactionLogger, InteractionLoggingService } from '../lib/interaction-logger';
import { AgentInteraction, ChatSession, InteractionSummary } from '../types/interaction-logging';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Project Coordinator Agent - Tier 1.5 Tactical Execution Layer
 * 
 * Assists Master Orchestrator in detailed project execution management.
 * Maintains comprehensive logs of all agent interactions for every chat session.
 * Creates detailed tactical plans from strategic oversight.
 */
export class ProjectCoordinatorAgent implements Agent {
  id = 'project-coordinator';
  name = 'Project Coordinator Agent';
  description = 'Detailed project execution coordination with comprehensive interaction logging';
  abilities = [
    'Detailed project execution planning',
    'Agent interaction coordination and logging',
    'Task breakdown and milestone management',
    'Inter-agent communication facilitation',
    'Progress tracking and status reporting',
    'Quality assurance coordination',
    'Risk management and mitigation',
    'Comprehensive session logging and analytics'
  ];

  // Services
  private claudeService: ClaudeService;
  private logger: InteractionLoggingService;
  
  // Session tracking
  private activeSessions: Map<string, ChatSession>;
  private sessionAgentTasks: Map<string, Map<string, AgentInteraction>>;

  constructor() {
    // Initialize Claude service for coordination planning
    this.claudeService = AgentClaudeClientFactory.createProjectCoordinatorClient();
    
    // Initialize logging service
    this.logger = interactionLogger;
    
    // Initialize tracking maps
    this.activeSessions = new Map();
    this.sessionAgentTasks = new Map();
  }

  /**
   * Agent interface implementation - handles project coordination tasks
   */
  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'coordinate-project':
          const result = await this.coordinateProject(task.payload);
          return { success: true, result };

        case 'start-session':
          const sessionId = await this.startChatSession(
            task.payload.userId,
            task.payload.userRequest,
            task.payload.requestSummary
          );
          return { success: true, result: { sessionId } };

        case 'log-agent-task':
          const interactionId = await this.logAgentTask(task.payload);
          return { success: true, result: { interactionId } };

        case 'complete-agent-task':
          await this.completeAgentTask(task.payload);
          return { success: true, result: { status: 'completed' } };

        case 'complete-session':
          await this.completeChatSession(task.payload);
          return { success: true, result: { status: 'session_completed' } };

        case 'get-session-log':
          const sessionLog = await this.getSessionLog(task.payload.sessionId);
          return { success: true, result: sessionLog };

        case 'get-interaction-stats':
          const stats = await this.getInteractionStats(task.payload);
          return { success: true, result: stats };

        default:
          throw new Error(`Unknown project coordination task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Project Coordinator error: ${error}`
      };
    }
  }

  /**
   * Start a new chat session with logging
   */
  async startChatSession(
    userId: string, 
    userRequest: string, 
    requestSummary?: string
  ): Promise<string> {
    try {
      const sessionId = await this.logger.startChatSession(userId, userRequest, requestSummary);
      
      // Initialize session tracking
      this.sessionAgentTasks.set(sessionId, new Map());
      
      console.log(`🎯 Project Coordinator started session: ${sessionId}`);
      return sessionId;
    } catch (error) {
      console.error('Error starting chat session:', error);
      throw new Error(`Failed to start chat session: ${error}`);
    }
  }

  /**
   * Log a new agent task assignment
   */
  async logAgentTask(payload: {
    sessionId: string;
    agentId: string;
    agentName: string;
    taskAssigned: string;
    inputReceived: string;
    agentType?: AgentInteraction['agentType'];
    taskPriority?: AgentInteraction['taskPriority'];
    taskComplexity?: AgentInteraction['taskComplexity'];
    assignedBy?: string;
  }): Promise<string> {
    
    try {
      const interactionId = await this.logger.logAgentInteraction(
        payload.sessionId,
        payload.agentId,
        payload.agentName,
        payload.taskAssigned,
        payload.inputReceived,
        payload.agentType || 'specialist',
        payload.taskPriority || 'medium',
        payload.taskComplexity || 'moderate',
        payload.assignedBy || 'project-coordinator'
      );

      // Track in session
      const sessionTasks = this.sessionAgentTasks.get(payload.sessionId);
      if (sessionTasks) {
        const interaction: AgentInteraction = {
          id: interactionId,
          timestamp: new Date(),
          sessionId: payload.sessionId,
          chatId: '', // Will be filled by logger
          sequenceNumber: sessionTasks.size + 1,
          agentId: payload.agentId,
          agentName: payload.agentName,
          agentType: payload.agentType || 'specialist',
          taskAssigned: payload.taskAssigned,
          taskSummary: payload.taskAssigned.substring(0, 80),
          taskPriority: payload.taskPriority || 'medium',
          taskComplexity: payload.taskComplexity || 'moderate',
          inputReceived: payload.inputReceived,
          outputProduced: '',
          outputSummary: '',
          executionTimeMs: 0,
          status: 'assigned',
          success: false,
          dependencies: [],
          followUpRequired: false,
          assignedBy: payload.assignedBy || 'project-coordinator',
          coordinatedBy: 'project-coordinator',
          relatedInteractions: []
        };
        
        sessionTasks.set(interactionId, interaction);
      }

      return interactionId;
    } catch (error) {
      console.error('Error logging agent task:', error);
      throw new Error(`Failed to log agent task: ${error}`);
    }
  }

  /**
   * Complete an agent task with results
   */
  async completeAgentTask(payload: {
    sessionId: string;
    interactionId: string;
    outputProduced: string;
    success?: boolean;
    executionTimeMs?: number;
  }): Promise<void> {
    
    try {
      await this.logger.completeAgentInteraction(
        payload.sessionId,
        payload.interactionId,
        payload.outputProduced,
        payload.success !== false, // Default to true unless explicitly false
        payload.executionTimeMs
      );

      // Update session tracking
      const sessionTasks = this.sessionAgentTasks.get(payload.sessionId);
      if (sessionTasks) {
        const interaction = sessionTasks.get(payload.interactionId);
        if (interaction) {
          interaction.outputProduced = payload.outputProduced;
          interaction.outputSummary = payload.outputProduced.substring(0, 120);
          interaction.status = payload.success !== false ? 'completed' : 'failed';
          interaction.success = payload.success !== false;
          interaction.executionTimeMs = payload.executionTimeMs || 0;
        }
      }

    } catch (error) {
      console.error('Error completing agent task:', error);
      throw new Error(`Failed to complete agent task: ${error}`);
    }
  }

  /**
   * Complete a chat session
   */
  async completeChatSession(payload: {
    sessionId: string;
    finalResponse: string;
    deliverables?: string[];
    userSatisfaction?: number;
  }): Promise<void> {
    
    try {
      await this.logger.completeChatSession(
        payload.sessionId,
        payload.finalResponse,
        payload.deliverables || [],
        payload.userSatisfaction
      );

      // Clean up session tracking
      this.sessionAgentTasks.delete(payload.sessionId);

    } catch (error) {
      console.error('Error completing chat session:', error);
      throw new Error(`Failed to complete chat session: ${error}`);
    }
  }

  /**
   * Get session log for viewing
   */
  async getSessionLog(sessionId: string): Promise<ChatSession | null> {
    try {
      return await this.logger.getSessionHistory(sessionId);
    } catch (error) {
      console.error('Error getting session log:', error);
      return null;
    }
  }

  /**
   * Get interaction statistics
   */
  async getInteractionStats(payload?: {
    periodStart?: Date;
    periodEnd?: Date;
  }): Promise<InteractionSummary> {
    try {
      return await this.logger.getInteractionStats(
        payload?.periodStart,
        payload?.periodEnd
      );
    } catch (error) {
      console.error('Error getting interaction stats:', error);
      throw new Error(`Failed to get interaction stats: ${error}`);
    }
  }

  /**
   * Get recent sessions for log viewer
   */
  async getRecentSessions(limit: number = 10): Promise<ChatSession[]> {
    try {
      const summaries = await this.logger.getRecentSessions(limit);
      const sessions: ChatSession[] = [];

      for (const summary of summaries) {
        const session = await this.logger.getSessionHistory(summary.sessionId);
        if (session) {
          sessions.push(session);
        }
      }

      return sessions;
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      return [];
    }
  }

  /**
   * Search interactions across sessions
   */
  async searchInteractions(
    query: string,
    agentFilter?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<AgentInteraction[]> {
    try {
      return await this.logger.searchInteractions(query, agentFilter, dateRange);
    } catch (error) {
      console.error('Error searching interactions:', error);
      return [];
    }
  }

  /**
   * Coordinate project execution (main orchestration function)
   */
  private async coordinateProject(payload: {
    masterPlan?: any;
    userRequest: string;
    requiredAgents: string[];
    deliverables: string[];
    sessionId?: string;
  }): Promise<any> {
    
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: this.buildCoordinationPrompt(payload)
      }
    ];

    const systemPrompt = `You are a Project Coordinator Agent working with a Master Orchestrator.

Your role is to:
1. Take strategic plans and create detailed tactical execution plans
2. Coordinate agent interactions and log all activities
3. Break down high-level tasks into specific agent assignments
4. Manage dependencies and ensure quality coordination
5. Track progress and report status throughout execution

Create detailed execution plans with:
- Specific task breakdowns for each agent
- Clear input/output expectations
- Timeline and dependency management
- Quality checkpoints and validation steps
- Risk mitigation strategies

Focus on practical, actionable coordination that ensures successful project completion.`;

    try {
      const coordinationPlan = await this.claudeService.generateResponse(
        messages,
        systemPrompt
      );

      return {
        coordinationPlan,
        agents: payload.requiredAgents,
        deliverables: payload.deliverables,
        sessionId: payload.sessionId,
        status: 'coordination_complete',
        nextSteps: this.extractNextSteps(coordinationPlan)
      };

    } catch (error) {
      console.error('Error coordinating project:', error);
      return {
        coordinationPlan: 'Failed to create detailed coordination plan',
        agents: payload.requiredAgents,
        deliverables: payload.deliverables,
        status: 'coordination_failed',
        error: error.toString()
      };
    }
  }

  /**
   * Build coordination planning prompt
   */
  private buildCoordinationPrompt(payload: any): string {
    return `# Project Coordination Request

## User Request
"${payload.userRequest}"

## Master Orchestrator Strategic Plan
${payload.masterPlan ? JSON.stringify(payload.masterPlan, null, 2) : 'No master plan provided - creating tactical plan from user request'}

## Required Agents
${payload.requiredAgents.join(', ')}

## Expected Deliverables
${payload.deliverables.join(', ')}

## Coordination Requirements
Create a detailed tactical execution plan that includes:

1. **Task Breakdown**: Specific tasks for each agent with clear inputs/outputs
2. **Execution Sequence**: Order of operations and dependencies
3. **Quality Gates**: Checkpoints and validation requirements
4. **Communication Plan**: How agents will coordinate and share results
5. **Progress Tracking**: Milestones and status reporting
6. **Risk Management**: Potential issues and mitigation strategies

The plan should be practical and immediately actionable, with clear next steps for initiating agent coordination.`;
  }

  /**
   * Extract next steps from coordination plan
   */
  private extractNextSteps(plan: string): string[] {
    // Simple extraction - could be enhanced with better parsing
    const lines = plan.split('\n');
    const nextSteps: string[] = [];

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        nextSteps.push(line.trim());
      }
    }

    return nextSteps.length > 0 ? nextSteps : ['Begin agent coordination', 'Execute tactical plan'];
  }
}