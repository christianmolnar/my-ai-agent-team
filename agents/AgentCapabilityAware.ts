import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { 
  GlobalAgentInspector, 
  AgentCapability, 
  CapabilityAssessment, 
  CollaborationRequest, 
  CollaborationResponse,
  CapabilityEnhancement,
  EnhancementResponse 
} from './GlobalAgentInspector';

/**
 * Extended Agent interface that includes global capability awareness
 * All agents implementing this interface can inspect other agents,
 * request collaborations, and propose capability enhancements.
 */
export interface AgentCapabilityAware extends Agent {
  agentInspector: GlobalAgentInspector;
  
  // Standard capability query methods available to all agents
  queryAgentCapability(agentId: string, query: string): Promise<CapabilityAssessment>;
  getAvailableAgents(): Promise<AgentCapability[]>;
  requestAgentCollaboration(targetAgent: string, task: CollaborationRequest): Promise<CollaborationResponse>;
  proposeCapabilityEnhancement(targetAgent: string, enhancement: CapabilityEnhancement): Promise<EnhancementResponse>;
}

/**
 * Base implementation that can be extended by all agents
 * Provides standard capability awareness functionality
 */
export abstract class CapabilityAwareAgent implements AgentCapabilityAware {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract abilities: string[];
  
  agentInspector!: GlobalAgentInspector; // Will be injected by GlobalAgentRegistry
  
  abstract handleTask(task: AgentTask): Promise<AgentTaskResult>;
  
  async queryAgentCapability(agentId: string, query: string): Promise<CapabilityAssessment> {
    if (!this.agentInspector) {
      throw new Error('GlobalAgentInspector not initialized. Agent must be registered with GlobalAgentRegistry.');
    }
    return await this.agentInspector.queryAgentCapability(agentId, query, this.id);
  }
  
  async getAvailableAgents(): Promise<AgentCapability[]> {
    if (!this.agentInspector) {
      throw new Error('GlobalAgentInspector not initialized. Agent must be registered with GlobalAgentRegistry.');
    }
    const teamMatrix = await this.agentInspector.getTeamCapabilityMatrix();
    return teamMatrix.agents.map(agent => ({
      agentId: agent.agentId,
      agentName: agent.agentId, // Will be enhanced with proper names
      coreCompetencies: agent.capabilities.currentCapabilities.map(c => c.name),
      currentSkills: agent.capabilities.currentCapabilities,
      recentLearnings: agent.capabilities.recentLearnings,
      availability: { online: true, workload: 0.5, nextAvailable: new Date() },
      activeProjects: [],
      specializations: agent.capabilities.currentCapabilities.map(c => c.category),
      apiAccess: [],
      cnsStructure: {
        learningFiles: [],
        performanceMetrics: [],
        skillDatabase: [],
        memoryPatterns: [],
        selfReflectionData: [],
        capabilityGaps: agent.capabilities.knowledgeGaps,
        crossAgentKnowledge: []
      },
      fileSystemCapabilities: {
        workingDirectory: { files: [], size: 0, lastModified: new Date() },
        incomingQueue: [],
        outgoingDeliverables: [],
        resourceAccess: [],
        toolAvailability: [],
        sharedResources: []
      },
      collaborationPatterns: [],
      lastCapabilityUpdate: new Date()
    } as AgentCapability));
  }
  
  async requestAgentCollaboration(targetAgent: string, request: CollaborationRequest): Promise<CollaborationResponse> {
    if (!this.agentInspector) {
      throw new Error('GlobalAgentInspector not initialized. Agent must be registered with GlobalAgentRegistry.');
    }
    
    // First check if the target agent can handle the request
    const capability = await this.queryAgentCapability(targetAgent, request.taskDescription);
    
    if (capability.canPerform && capability.confidenceLevel >= request.minimumConfidence) {
      return {
        accepted: true,
        reason: `Agent ${targetAgent} can handle the request with ${(capability.confidenceLevel * 100).toFixed(1)}% confidence`,
        estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours
      };
    } else {
      return {
        accepted: false,
        reason: `Agent ${targetAgent} cannot handle the request. Confidence: ${(capability.confidenceLevel * 100).toFixed(1)}%`,
        alternatives: [], // Will be populated by registry
        capabilityGaps: capability.requiredPreparation
      };
    }
  }
  
  async proposeCapabilityEnhancement(targetAgent: string, enhancement: CapabilityEnhancement): Promise<EnhancementResponse> {
    if (!this.agentInspector) {
      throw new Error('GlobalAgentInspector not initialized. Agent must be registered with GlobalAgentRegistry.');
    }
    return await this.agentInspector.suggestAgentEnhancement(targetAgent, this.id, enhancement);
  }
  
  // Utility methods for common capability queries
  protected async canAgentHandle(agentId: string, taskDescription: string, minimumConfidence: number = 0.7): Promise<boolean> {
    const assessment = await this.queryAgentCapability(agentId, taskDescription);
    return assessment.canPerform && assessment.confidenceLevel >= minimumConfidence;
  }
  
  protected async findCapableAgents(taskDescription: string, minimumConfidence: number = 0.7): Promise<string[]> {
    const availableAgents = await this.getAvailableAgents();
    const capableAgents: string[] = [];
    
    for (const agent of availableAgents) {
      if (await this.canAgentHandle(agent.agentId, taskDescription, minimumConfidence)) {
        capableAgents.push(agent.agentId);
      }
    }
    
    return capableAgents;
  }
  
  protected async suggestTeamCollaboration(taskDescription: string): Promise<{ primaryAgent: string; supportingAgents: string[] } | null> {
    const capableAgents = await this.findCapableAgents(taskDescription, 0.6);
    
    if (capableAgents.length === 0) {
      return null;
    }
    
    // Simple logic: highest confidence agent as primary, others as supporting
    const assessments = await Promise.all(
      capableAgents.map(async agentId => ({
        agentId,
        assessment: await this.queryAgentCapability(agentId, taskDescription)
      }))
    );
    
    assessments.sort((a, b) => b.assessment.confidenceLevel - a.assessment.confidenceLevel);
    
    return {
      primaryAgent: assessments[0].agentId,
      supportingAgents: assessments.slice(1, 3).map(a => a.agentId) // Up to 2 supporting agents
    };
  }
}

/**
 * Utility functions for common capability patterns
 */
export class CapabilityUtils {
  static async assessMultiAgentTask(
    inspector: GlobalAgentInspector,
    task: string,
    requiredAgents: string[],
    requestingAgent: string
  ): Promise<{ feasible: boolean; bottlenecks: string[]; recommendations: string[] }> {
    const assessments = await Promise.all(
      requiredAgents.map(async agentId => ({
        agentId,
        assessment: await inspector.queryAgentCapability(agentId, task, requestingAgent)
      }))
    );
    
    const bottlenecks = assessments
      .filter(a => !a.assessment.canPerform || a.assessment.confidenceLevel < 0.7)
      .map(a => a.agentId);
    
    const recommendations = assessments
      .flatMap(a => a.assessment.collaborationSuggestions.map(s => s.approach));
    
    return {
      feasible: bottlenecks.length === 0,
      bottlenecks,
      recommendations
    };
  }
  
  static createCollaborationRequest(
    taskDescription: string,
    expectedDeliverables: string[],
    timeframe: string = '24 hours',
    minimumConfidence: number = 0.8
  ): CollaborationRequest {
    return {
      taskDescription,
      expectedDeliverables,
      timeline: timeframe,
      minimumConfidence,
      context: {
        createdAt: new Date().toISOString(),
        priority: 'medium'
      }
    };
  }
  
  static createCapabilityEnhancement(
    capability: string,
    justification: string,
    urgency: 'low' | 'medium' | 'high' = 'medium',
    benefits: string[] = []
  ): CapabilityEnhancement {
    return {
      capability,
      justification,
      urgency,
      benefits: benefits.length > 0 ? benefits : [`Enhanced ${capability} capability for better team performance`]
    };
  }
}

export default CapabilityAwareAgent;
