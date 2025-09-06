import { Agent } from './Agent';
import { AgentCapabilityAware } from './AgentCapabilityAware';
import { 
  GlobalAgentInspector, 
  AgentCapability,
  CollaborationRequest, 
  CollaborationResponse,
  TeamCapabilityMatrix,
  CapabilityEnhancement,
  EnhancementResponse
} from './GlobalAgentInspector';
import { CommunicationsAgent } from './CommunicationsAgent';
import { ResearcherAgent } from './ResearcherAgent';
import { ImageGeneratorAgent } from './ImageGeneratorAgent';
import { VinylResearcherAgent } from './VinylResearcherAgent';
import { PersonalAssistantBridge } from './PersonalAssistantBridge';

/**
 * Enhanced Agent Registry with Global Capability Inspection
 * 
 * This registry automatically injects capability awareness into all agents,
 * enabling them to inspect each other's capabilities, request collaborations,
 * and propose enhancements for optimal team coordination.
 */

interface CollaborationGraph {
  recordCollaboration(requestingAgent: string, targetAgent: string, taskDescription: string): void;
  getCollaborationHistory(agentId: string): CollaborationHistory[];
}

interface CollaborationHistory {
  withAgent: string;
  taskType: string;
  timestamp: Date;
  success: boolean;
}

interface ComplexTask {
  description: string;
  requirements: string[];
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
}

interface TaskAllocationPlan {
  primaryAgent: string;
  supportingAgents: string[];
  collaborationPlan: CollaborationStep[];
  estimatedEffort: string;
  riskFactors: string[];
  fallbackOptions: string[];
}

interface CollaborationStep {
  step: string;
  responsible: string;
  dependencies: string[];
  estimatedTime: string;
}

class SimpleCollaborationGraph implements CollaborationGraph {
  private collaborations: Map<string, CollaborationHistory[]> = new Map();
  
  recordCollaboration(requestingAgent: string, targetAgent: string, taskDescription: string): void {
    // Record for requesting agent
    if (!this.collaborations.has(requestingAgent)) {
      this.collaborations.set(requestingAgent, []);
    }
    this.collaborations.get(requestingAgent)!.push({
      withAgent: targetAgent,
      taskType: taskDescription,
      timestamp: new Date(),
      success: true // Assume success for now
    });
    
    // Record for target agent
    if (!this.collaborations.has(targetAgent)) {
      this.collaborations.set(targetAgent, []);
    }
    this.collaborations.get(targetAgent)!.push({
      withAgent: requestingAgent,
      taskType: taskDescription,
      timestamp: new Date(),
      success: true
    });
  }
  
  getCollaborationHistory(agentId: string): CollaborationHistory[] {
    return this.collaborations.get(agentId) || [];
  }
}

export class GlobalAgentRegistry {
  private agents: Map<string, AgentCapabilityAware> = new Map();
  private globalInspector: GlobalAgentInspector;
  private capabilityCache: Map<string, AgentCapability[]> = new Map();
  private collaborationGraph: CollaborationGraph;
  
  constructor() {
    // Initialize with self-reference for inspector
    this.globalInspector = new GlobalAgentInspector(this as any);
    this.collaborationGraph = new SimpleCollaborationGraph();
    
    // Auto-register core agents
    this.autoRegisterCoreAgents();
  }
  
  private autoRegisterCoreAgents(): void {
    try {
      // Convert existing agents to capability-aware agents
      const coreAgents = [
        this.wrapAgent(new PersonalAssistantBridge()),
        this.wrapAgent(new CommunicationsAgent()),
        this.wrapAgent(new ResearcherAgent()),
        this.wrapAgent(new ImageGeneratorAgent()),
        this.wrapAgent(new VinylResearcherAgent())
      ];
      
      // Try to add MusicCoachAgent if available
      try {
        const { MusicCoachAgent } = require('./MusicCoachAgent');
        coreAgents.push(this.wrapAgent(new MusicCoachAgent()));
      } catch (error) {
        console.warn('MusicCoachAgent not available:', error.message);
      }
      
      coreAgents.forEach(agent => this.register(agent));
      console.log(`✅ Registered ${coreAgents.length} core agents with capability awareness`);
    } catch (error) {
      console.warn('⚠️ Some core agents could not be registered:', error.message);
    }
  }
  
  private wrapAgent(agent: Agent): AgentCapabilityAware {
    // Create a capability-aware wrapper for existing agents
    const capabilityAwareAgent = {
      ...agent,
      agentInspector: this.globalInspector,
      
      async queryAgentCapability(agentId: string, query: string) {
        return await this.globalInspector.queryAgentCapability(agentId, query, agent.id);
      },
      
      async getAvailableAgents() {
        const teamMatrix = await this.globalInspector.getTeamCapabilityMatrix();
        return teamMatrix.agents.map(agentProfile => ({
          agentId: agentProfile.agentId,
          agentName: agentProfile.agentId,
          coreCompetencies: agentProfile.capabilities.currentCapabilities.map(c => c.name),
          currentSkills: agentProfile.capabilities.currentCapabilities,
          recentLearnings: agentProfile.capabilities.recentLearnings,
          availability: { online: true, workload: 0.5, nextAvailable: new Date() },
          activeProjects: [],
          specializations: agentProfile.capabilities.currentCapabilities.map(c => c.category),
          apiAccess: [],
          cnsStructure: {
            learningFiles: [],
            performanceMetrics: [],
            skillDatabase: [],
            memoryPatterns: [],
            selfReflectionData: [],
            capabilityGaps: agentProfile.capabilities.knowledgeGaps,
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
      },
      
      async requestAgentCollaboration(targetAgent: string, request: CollaborationRequest) {
        return await this.handleCollaborationRequest(agent.id, targetAgent, request);
      },
      
      async proposeCapabilityEnhancement(targetAgent: string, enhancement: CapabilityEnhancement) {
        return await this.globalInspector.suggestAgentEnhancement(targetAgent, agent.id, enhancement);
      }
    } as AgentCapabilityAware;
    
    return capabilityAwareAgent;
  }
  
  register(agent: AgentCapabilityAware): void {
    // Inject global inspector if not already present
    if (!agent.agentInspector) {
      agent.agentInspector = this.globalInspector;
    }
    
    // Ensure capability methods are bound
    if (!agent.queryAgentCapability) {
      agent.queryAgentCapability = async (agentId: string, query: string) => 
        this.globalInspector.queryAgentCapability(agentId, query, agent.id);
    }
    
    if (!agent.getAvailableAgents) {
      agent.getAvailableAgents = async () => this.getAllAgentCapabilities();
    }
    
    if (!agent.requestAgentCollaboration) {
      agent.requestAgentCollaboration = async (targetAgent: string, request: CollaborationRequest) => 
        this.handleCollaborationRequest(agent.id, targetAgent, request);
    }
    
    if (!agent.proposeCapabilityEnhancement) {
      agent.proposeCapabilityEnhancement = async (targetAgent: string, enhancement: CapabilityEnhancement) =>
        this.globalInspector.suggestAgentEnhancement(targetAgent, agent.id, enhancement);
    }
    
    this.agents.set(agent.id, agent);
    this.invalidateCapabilityCache(); // Refresh capabilities when new agent joins
    
    console.log(`🤖 Registered capability-aware agent: ${agent.name} (${agent.id})`);
  }
  
  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }
  
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
  
  async getAllAgentCapabilities(): Promise<AgentCapability[]> {
    const cacheKey = 'all_agent_capabilities';
    if (this.capabilityCache.has(cacheKey)) {
      const cached = this.capabilityCache.get(cacheKey);
      if (cached && this.isCacheValid(cacheKey)) {
        return cached;
      }
    }
    
    try {
      const teamMatrix = await this.globalInspector.getTeamCapabilityMatrix();
      const capabilities = teamMatrix.agents.map(agentProfile => ({
        agentId: agentProfile.agentId,
        agentName: this.getAgentName(agentProfile.agentId),
        coreCompetencies: agentProfile.capabilities.currentCapabilities.map(c => c.name),
        currentSkills: agentProfile.capabilities.currentCapabilities,
        recentLearnings: agentProfile.capabilities.recentLearnings,
        availability: { online: true, workload: 0.5, nextAvailable: new Date() },
        activeProjects: [],
        specializations: agentProfile.capabilities.currentCapabilities.map(c => c.category),
        apiAccess: [],
        cnsStructure: {
          learningFiles: [],
          performanceMetrics: [],
          skillDatabase: [],
          memoryPatterns: [],
          selfReflectionData: [],
          capabilityGaps: agentProfile.capabilities.knowledgeGaps,
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
      
      this.capabilityCache.set(cacheKey, capabilities);
      return capabilities;
    } catch (error) {
      console.error('Error getting agent capabilities:', error);
      return this.getFallbackCapabilities();
    }
  }
  
  private getAgentName(agentId: string): string {
    const agent = this.agents.get(agentId);
    return agent?.name || agentId.charAt(0).toUpperCase() + agentId.slice(1);
  }
  
  private getFallbackCapabilities(): AgentCapability[] {
    return Array.from(this.agents.values()).map(agent => ({
      agentId: agent.id,
      agentName: agent.name,
      coreCompetencies: agent.abilities,
      currentSkills: agent.abilities.map(ability => ({ name: ability, level: 7, category: 'core' })),
      recentLearnings: [],
      availability: { online: true, workload: 0.5, nextAvailable: new Date() },
      activeProjects: [],
      specializations: agent.abilities,
      apiAccess: [],
      cnsStructure: {
        learningFiles: [],
        performanceMetrics: [],
        skillDatabase: [],
        memoryPatterns: [],
        selfReflectionData: [],
        capabilityGaps: [],
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
  
  async handleCollaborationRequest(
    requestingAgent: string, 
    targetAgent: string, 
    request: CollaborationRequest
  ): Promise<CollaborationResponse> {
    try {
      // Check if target agent exists
      const targetAgentInstance = this.agents.get(targetAgent);
      if (!targetAgentInstance) {
        return {
          accepted: false,
          reason: `Agent ${targetAgent} not found in registry`,
          alternatives: await this.suggestAlternativeCollaborators(request.taskDescription),
          capabilityGaps: []
        };
      }
      
      // Check if target agent can handle the collaboration
      const targetCapability = await this.globalInspector.queryAgentCapability(
        targetAgent, 
        request.taskDescription,
        requestingAgent
      );
      
      if (targetCapability.canPerform && targetCapability.confidenceLevel >= request.minimumConfidence) {
        // Record successful collaboration
        this.collaborationGraph.recordCollaboration(requestingAgent, targetAgent, request.taskDescription);
        
        // For now, simulate successful collaboration acceptance
        // In full implementation, this would route to the target agent
        return {
          accepted: true,
          reason: `Agent ${targetAgent} accepts collaboration with ${(targetCapability.confidenceLevel * 100).toFixed(1)}% confidence`,
          estimatedCompletion: new Date(Date.now() + this.parseTimelineToMs(request.timeline))
        };
      } else {
        return {
          accepted: false,
          reason: `Agent ${targetAgent} cannot handle request with required confidence. Current: ${(targetCapability.confidenceLevel * 100).toFixed(1)}%`,
          alternatives: await this.suggestAlternativeCollaborators(request.taskDescription),
          capabilityGaps: targetCapability.requiredPreparation
        };
      }
    } catch (error) {
      return {
        accepted: false,
        reason: `Error processing collaboration request: ${error.message}`,
        alternatives: [],
        capabilityGaps: []
      };
    }
  }
  
  async getTeamCapabilityMatrix(): Promise<TeamCapabilityMatrix> {
    return await this.globalInspector.getTeamCapabilityMatrix();
  }
  
  async suggestOptimalTaskAllocation(task: ComplexTask): Promise<TaskAllocationPlan> {
    try {
      const teamMatrix = await this.getTeamCapabilityMatrix();
      
      // Assess each agent's capability for the task
      const agentAssessments = await Promise.all(
        teamMatrix.agents.map(async agent => ({
          agentId: agent.agentId,
          assessment: await this.globalInspector.queryAgentCapability(
            agent.agentId, 
            task.description, 
            'system'
          )
        }))
      );
      
      // Sort by capability confidence
      agentAssessments.sort((a, b) => b.assessment.confidenceLevel - a.assessment.confidenceLevel);
      
      const primaryAgent = agentAssessments[0];
      const supportingAgents = agentAssessments
        .slice(1)
        .filter(a => a.assessment.canPerform && a.assessment.confidenceLevel > 0.6)
        .slice(0, 2); // Limit to 2 supporting agents
      
      return {
        primaryAgent: primaryAgent.agentId,
        supportingAgents: supportingAgents.map(a => a.agentId),
        collaborationPlan: [
          {
            step: 'Initial assessment and planning',
            responsible: primaryAgent.agentId,
            dependencies: [],
            estimatedTime: '2 hours'
          },
          {
            step: 'Collaborative execution',
            responsible: 'all',
            dependencies: ['Initial assessment and planning'],
            estimatedTime: task.priority === 'high' ? '4 hours' : '8 hours'
          }
        ],
        estimatedEffort: this.calculateEstimatedEffort(task, agentAssessments),
        riskFactors: this.identifyRiskFactors(task, agentAssessments),
        fallbackOptions: this.generateFallbackOptions(task, agentAssessments)
      };
    } catch (error) {
      console.error('Error suggesting task allocation:', error);
      return this.createFallbackTaskAllocation(task);
    }
  }
  
  // Utility methods
  private invalidateCapabilityCache(): void {
    this.capabilityCache.clear();
  }
  
  private isCacheValid(cacheKey: string): boolean {
    // Simple time-based cache invalidation (5 minutes)
    // In production, this would be more sophisticated
    return true; // For now, always use cache if available
  }
  
  private async suggestAlternativeCollaborators(taskDescription: string): Promise<Agent[]> {
    try {
      const allAgents = await this.getAllAgentCapabilities();
      const alternatives = await Promise.all(
        allAgents.map(async agent => ({
          agent,
          capability: await this.globalInspector.queryAgentCapability(
            agent.agentId, 
            taskDescription,
            'system'
          )
        }))
      );
      
      return alternatives
        .filter(alt => alt.capability.canPerform)
        .sort((a, b) => b.capability.confidenceLevel - a.capability.confidenceLevel)
        .slice(0, 3) // Top 3 alternatives
        .map(alt => this.agents.get(alt.agent.agentId)!)
        .filter(agent => agent); // Remove undefined agents
    } catch (error) {
      console.error('Error suggesting alternative collaborators:', error);
      return [];
    }
  }
  
  private parseTimelineToMs(timeline: string): number {
    // Simple timeline parser - in production would be more sophisticated
    const timelineMap: Record<string, number> = {
      '1 hour': 60 * 60 * 1000,
      '2 hours': 2 * 60 * 60 * 1000,
      '4 hours': 4 * 60 * 60 * 1000,
      '1 day': 24 * 60 * 60 * 1000,
      '2 days': 2 * 24 * 60 * 60 * 1000,
      '3 days': 3 * 24 * 60 * 60 * 1000,
      '1 week': 7 * 24 * 60 * 60 * 1000
    };
    
    return timelineMap[timeline] || 24 * 60 * 60 * 1000; // Default 24 hours
  }
  
  private calculateEstimatedEffort(task: ComplexTask, assessments: any[]): string {
    const avgConfidence = assessments.reduce((sum, a) => sum + a.assessment.confidenceLevel, 0) / assessments.length;
    
    if (avgConfidence > 0.8) return 'Low effort - team is well-suited for this task';
    if (avgConfidence > 0.6) return 'Medium effort - some preparation may be needed';
    return 'High effort - significant preparation and collaboration required';
  }
  
  private identifyRiskFactors(task: ComplexTask, assessments: any[]): string[] {
    const risks: string[] = [];
    
    const lowConfidenceAgents = assessments.filter(a => a.assessment.confidenceLevel < 0.6);
    if (lowConfidenceAgents.length > assessments.length / 2) {
      risks.push('More than half the team has low confidence in this task');
    }
    
    if (task.deadline && task.deadline.getTime() < Date.now() + 24 * 60 * 60 * 1000) {
      risks.push('Very tight deadline may impact quality');
    }
    
    if (assessments.some(a => a.assessment.requiredPreparation.length > 2)) {
      risks.push('Significant preparation required by some agents');
    }
    
    return risks;
  }
  
  private generateFallbackOptions(task: ComplexTask, assessments: any[]): string[] {
    const fallbacks: string[] = [];
    
    fallbacks.push('Break task into smaller, more manageable components');
    fallbacks.push('Extend timeline to allow for proper preparation');
    
    if (assessments.some(a => a.assessment.collaborationSuggestions.length > 0)) {
      fallbacks.push('Utilize suggested collaborations from agent assessments');
    }
    
    fallbacks.push('Consider external resources or API integrations');
    
    return fallbacks;
  }
  
  private createFallbackTaskAllocation(task: ComplexTask): TaskAllocationPlan {
    const agents = Array.from(this.agents.keys());
    return {
      primaryAgent: agents[0] || 'communications',
      supportingAgents: agents.slice(1, 3),
      collaborationPlan: [
        {
          step: 'Task analysis and breakdown',
          responsible: agents[0] || 'communications',
          dependencies: [],
          estimatedTime: '1 hour'
        }
      ],
      estimatedEffort: 'Unknown - analysis required',
      riskFactors: ['Unable to assess team capabilities'],
      fallbackOptions: ['Manual task assignment', 'Sequential execution']
    };
  }
}

// Singleton instance for global use
export const globalAgentRegistry = new GlobalAgentRegistry();

export default globalAgentRegistry;
