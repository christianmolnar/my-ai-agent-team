import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { AgentRegistry } from './AgentRegistry';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AgentClaudeClientFactory } from '../lib/claude/AgentClaudeClients';

/**
 * Global Agent Inspector - Provides capability awareness to all agents
 * 
 * This system allows any agent to inspect other agents' capabilities,
 * request collaborations, and propose enhancements for better team coordination.
 */

export interface AgentCapability {
  agentName: string;
  agentId: string;
  coreCompetencies: string[];
  currentSkills: Skill[];
  recentLearnings: Learning[];
  availability: AvailabilityStatus;
  activeProjects: Project[];
  specializations: string[];
  apiAccess: APIService[];
  cnsStructure: CNSStructure;
  fileSystemCapabilities: FileSystemCapabilities;
  collaborationPatterns: CollaborationPattern[];
  lastCapabilityUpdate: Date;
}

export interface CNSStructure {
  learningFiles: LearningFile[];
  performanceMetrics: PerformanceMetric[];
  skillDatabase: SkillEntry[];
  memoryPatterns: MemoryPattern[];
  selfReflectionData: ReflectionEntry[];
  capabilityGaps: CapabilityGap[];
  crossAgentKnowledge: AgentKnowledgeMap[];
}

export interface FileSystemCapabilities {
  workingDirectory: DirectoryStructure;
  incomingQueue: QueuedTask[];
  outgoingDeliverables: Deliverable[];
  resourceAccess: ResourceAccess[];
  toolAvailability: Tool[];
  sharedResources: SharedResource[];
}

export interface CollaborationPattern {
  withAgent: string;
  interactionTypes: string[];
  successRate: number;
  lastCollaboration: Date;
  recommendedForTasks: string[];
}

export interface CapabilityAssessment {
  canPerform: boolean;
  confidenceLevel: number; // 0.0 to 1.0
  requiredPreparation: PreparationStep[];
  estimatedEffort: EffortEstimate;
  recommendedApproach: string;
  fallbackOptions: FallbackOption[];
  collaborationSuggestions: CollaborationSuggestion[];
}

export interface CNSAnalysis {
  currentCapabilities: Skill[];
  recentLearnings: Learning[];
  knowledgeGaps: CapabilityGap[];
  confidenceLevels: ConfidenceMap;
  recommendedEnhancements: Enhancement[];
  collaborationReadiness: CollaborationReadiness;
  crossAgentSynergies: AgentSynergy[];
}

export interface CollaborationRequest {
  taskDescription: string;
  expectedDeliverables: string[];
  timeline: string;
  minimumConfidence: number;
  context?: any;
}

export interface CollaborationResponse {
  accepted: boolean;
  reason: string;
  alternatives?: Agent[];
  capabilityGaps?: PreparationStep[];
  estimatedCompletion?: Date;
}

export interface CapabilityEnhancement {
  capability: string;
  justification: string;
  urgency: 'low' | 'medium' | 'high';
  benefits: string[];
  prerequisites?: string[];
}

export interface EnhancementResponse {
  feasible: boolean;
  reasoning: string;
  prerequisites: string[];
  implementationPlan: ImplementationStep[];
  impactOnTeam: TeamImpact;
  approvalRequired: boolean;
}

export interface TeamCapabilityMatrix {
  agents: AgentCapabilityProfile[];
  synergies: TeamSynergy[];
  gaps: TeamGap[];
  recommendedEnhancements: TeamEnhancement[];
  optimalCollaborationPaths: CollaborationPath[];
}

// Supporting type definitions (simplified for now)
export interface Skill { name: string; level: number; category: string; }
export interface Learning { topic: string; date: Date; confidence: number; }
export interface AvailabilityStatus { online: boolean; workload: number; nextAvailable: Date; }
export interface Project { name: string; status: string; priority: string; }
export interface APIService { name: string; available: boolean; lastUsed: Date; }
export interface LearningFile { path: string; topic: string; lastModified: Date; }
export interface PerformanceMetric { name: string; value: number; trend: string; }
export interface SkillEntry { skill: string; confidence: number; lastPracticed: Date; }
export interface MemoryPattern { pattern: string; frequency: number; context: string; }
export interface ReflectionEntry { topic: string; insights: string[]; date: Date; }
export interface CapabilityGap { area: string; severity: string; impact: string; }
export interface AgentKnowledgeMap { agentId: string; knownCapabilities: string[]; lastUpdated: Date; }
export interface DirectoryStructure { files: string[]; size: number; lastModified: Date; }
export interface QueuedTask { id: string; type: string; priority: string; }
export interface Deliverable { name: string; format: string; status: string; }
export interface ResourceAccess { resource: string; permissions: string[]; }
export interface Tool { name: string; version: string; available: boolean; }
export interface SharedResource { name: string; sharedWith: string[]; }
export interface PreparationStep { step: string; estimatedTime: string; }
export interface EffortEstimate { complexity: string; timeRequired: string; resourcesNeeded: string[]; }
export interface FallbackOption { approach: string; tradeoffs: string[]; }
export interface CollaborationSuggestion { withAgent: string; approach: string; benefits: string[]; }
export interface ConfidenceMap { [skill: string]: number; }
export interface Enhancement { area: string; suggestion: string; priority: string; }
export interface CollaborationReadiness { score: number; strengths: string[]; limitations: string[]; }
export interface AgentSynergy { withAgent: string; synergyType: string; potential: number; }
export interface ImplementationStep { step: string; timeframe: string; resources: string[]; }
export interface TeamImpact { beneficiaries: string[]; risks: string[]; overallImpact: string; }
export interface AgentCapabilityProfile { agentId: string; capabilities: CNSAnalysis; collaborationPotential: number; }
export interface TeamSynergy { agents: string[]; synergyType: string; potential: number; }
export interface TeamGap { area: string; severity: string; recommendedSolution: string; }
export interface TeamEnhancement { enhancement: string; priority: string; beneficiaries: string[]; }
export interface CollaborationPath { agents: string[]; taskTypes: string[]; efficiency: number; }
export interface CollaborationContext { 
  recentCollaborations: any[]; 
  preferredWorkingStyles: any; 
  communicationPatterns: any; 
  successfulPartnerships: any; 
  challengingInteractions: any; 
}

export class GlobalAgentInspector {
  private agentRegistry: AgentRegistry;
  private claudeService: any; // Will be initialized with proper Claude client
  private capabilityCache: Map<string, any> = new Map();
  
  constructor(agentRegistry: AgentRegistry) {
    this.agentRegistry = agentRegistry;
    // Use a generic Claude client for now - will enhance with specific inspector client later
    this.claudeService = AgentClaudeClientFactory.createPersonalAssistantClient();
  }
  
  async inspectAgentCNS(agentId: string, requestingAgent: string): Promise<CNSAnalysis> {
    // Security check - agents can inspect each other for collaboration
    if (!this.validateInspectionPermission(requestingAgent, agentId)) {
      throw new Error(`Agent ${requestingAgent} not authorized to inspect ${agentId}`);
    }
    
    // Try to load actual CNS data
    try {
      const cnsPath = path.join(process.cwd(), 'agents', agentId, 'cns');
      const learnings = await this.readLearningFiles(cnsPath);
      const skills = await this.analyzeSkillDatabase(cnsPath);
      const gaps = await this.identifyCapabilityGaps(cnsPath);
      const collaborations = await this.getCollaborationHistory(agentId);
      
      return {
        currentCapabilities: skills,
        recentLearnings: learnings,
        knowledgeGaps: gaps,
        confidenceLevels: await this.assessConfidence(skills),
        recommendedEnhancements: await this.suggestImprovements(gaps),
        collaborationReadiness: await this.assessCollaborationReadiness(agentId, collaborations),
        crossAgentSynergies: await this.identifyTeamSynergies(agentId)
      };
    } catch (error) {
      // Fallback to agent's declared abilities if CNS not available
      console.warn(`CNS not available for ${agentId}, using declared abilities`);
      return await this.createFallbackCNSAnalysis(agentId);
    }
  }
  
  async queryAgentCapability(
    agentId: string, 
    query: string, 
    requestingAgent: string
  ): Promise<CapabilityAssessment> {
    try {
      const agent = this.agentRegistry.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }
      
      const cnsAnalysis = await this.inspectAgentCNS(agentId, requestingAgent);
      const fileSystemState = await this.inspectFileSystem(agentId);
      const teamContext = await this.getTeamCollaborationContext(agentId);
      
      // Use Claude to analyze the query against actual agent state
      const assessment = await this.claudeService.complete([{
        role: 'system',
        content: this.buildCapabilityAssessmentPrompt(agent, cnsAnalysis, fileSystemState, teamContext, query, requestingAgent)
      }, {
        role: 'user',
        content: `Assess capability: "${query}"`
      }]);
      
      return this.parseCapabilityAssessment(assessment);
    } catch (error) {
      console.error(`Error assessing capability for ${agentId}:`, error);
      return this.createErrorCapabilityAssessment(error.message);
    }
  }
  
  async suggestAgentEnhancement(
    targetAgent: string, 
    requestingAgent: string, 
    enhancement: CapabilityEnhancement
  ): Promise<EnhancementResponse> {
    try {
      const targetCapabilities = await this.inspectAgentCNS(targetAgent, requestingAgent);
      const requestorCapabilities = await this.inspectAgentCNS(requestingAgent, requestingAgent);
      
      const enhancementAnalysis = await this.claudeService.complete([{
        role: 'system',
        content: this.buildEnhancementAnalysisPrompt(targetCapabilities, requestorCapabilities, enhancement)
      }, {
        role: 'user',
        content: `Analyze enhancement proposal: ${JSON.stringify(enhancement)}`
      }]);
      
      return this.parseEnhancementResponse(enhancementAnalysis);
    } catch (error) {
      console.error(`Error analyzing enhancement for ${targetAgent}:`, error);
      return {
        feasible: false,
        reasoning: `Error analyzing enhancement: ${error.message}`,
        prerequisites: [],
        implementationPlan: [],
        impactOnTeam: { beneficiaries: [], risks: [error.message], overallImpact: 'negative' },
        approvalRequired: true
      };
    }
  }
  
  async getTeamCapabilityMatrix(): Promise<TeamCapabilityMatrix> {
    try {
      const allAgents = this.agentRegistry.getAllAgents();
      const capabilities = await Promise.all(
        allAgents.map(async agent => ({
          agentId: agent.id,
          capabilities: await this.inspectAgentCNS(agent.id, 'system'),
          collaborationPotential: await this.assessCollaborationPotential(agent.id)
        }))
      );
      
      return {
        agents: capabilities,
        synergies: await this.identifyGlobalTeamSynergies(),
        gaps: await this.identifyTeamGaps(),
        recommendedEnhancements: await this.recommendTeamEnhancements(),
        optimalCollaborationPaths: await this.mapOptimalCollaborations()
      };
    } catch (error) {
      console.error('Error creating team capability matrix:', error);
      return this.createFallbackTeamMatrix();
    }
  }
  
  // Private helper methods
  private validateInspectionPermission(requestingAgent: string, targetAgent: string): boolean {
    // For now, allow all agents to inspect each other for collaboration
    // In production, this could have more sophisticated permission checks
    return true;
  }
  
  private async readLearningFiles(cnsPath: string): Promise<Learning[]> {
    try {
      const learningPath = path.join(cnsPath, 'learnings.json');
      const data = await fs.readFile(learningPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return []; // No learning files found
    }
  }
  
  private async analyzeSkillDatabase(cnsPath: string): Promise<Skill[]> {
    try {
      const skillsPath = path.join(cnsPath, 'skills.json');
      const data = await fs.readFile(skillsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return []; // No skills database found
    }
  }
  
  private async identifyCapabilityGaps(cnsPath: string): Promise<CapabilityGap[]> {
    try {
      const gapsPath = path.join(cnsPath, 'capability-gaps.json');
      const data = await fs.readFile(gapsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return []; // No capability gaps identified
    }
  }
  
  private async getCollaborationHistory(agentId: string): Promise<any[]> {
    try {
      const historyPath = path.join(process.cwd(), 'agents', agentId, 'collaboration-history.json');
      const data = await fs.readFile(historyPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return []; // No collaboration history
    }
  }
  
  private async assessConfidence(skills: Skill[]): Promise<ConfidenceMap> {
    const confidenceMap: ConfidenceMap = {};
    skills.forEach(skill => {
      confidenceMap[skill.name] = skill.level / 10; // Normalize to 0-1
    });
    return confidenceMap;
  }
  
  private async suggestImprovements(gaps: CapabilityGap[]): Promise<Enhancement[]> {
    return gaps.map(gap => ({
      area: gap.area,
      suggestion: `Enhance ${gap.area} capability through targeted learning`,
      priority: gap.severity
    }));
  }
  
  private async assessCollaborationReadiness(agentId: string, collaborations: any[]): Promise<CollaborationReadiness> {
    const recentCollaborations = collaborations.filter(c => 
      new Date(c.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    );
    
    return {
      score: Math.min(1.0, recentCollaborations.length * 0.2), // Simple scoring
      strengths: ['Clear communication', 'Reliable delivery'],
      limitations: ['Limited cross-domain knowledge']
    };
  }
  
  private async identifyTeamSynergies(agentId: string): Promise<AgentSynergy[]> {
    // Simplified implementation - in production, this would analyze collaboration patterns
    return [
      { withAgent: 'communications', synergyType: 'content-creation', potential: 0.8 },
      { withAgent: 'researcher', synergyType: 'fact-checking', potential: 0.7 }
    ];
  }
  
  private async identifyGlobalTeamSynergies(): Promise<TeamSynergy[]> {
    // Convert agent synergies to team synergies
    return [
      { agents: ['communications', 'researcher'], synergyType: 'content-creation', potential: 0.8 },
      { agents: ['music-coach', 'image-generator'], synergyType: 'educational-content', potential: 0.7 }
    ];
  }
  
  private async inspectFileSystem(agentId: string): Promise<FileSystemCapabilities> {
    try {
      const agentPath = path.join(process.cwd(), 'agents', agentId);
      const stats = await fs.stat(agentPath);
      
      return {
        workingDirectory: { files: [], size: 0, lastModified: stats.mtime },
        incomingQueue: [],
        outgoingDeliverables: [],
        resourceAccess: [],
        toolAvailability: [],
        sharedResources: []
      };
    } catch (error) {
      return {
        workingDirectory: { files: [], size: 0, lastModified: new Date() },
        incomingQueue: [],
        outgoingDeliverables: [],
        resourceAccess: [],
        toolAvailability: [],
        sharedResources: []
      };
    }
  }
  
  private async getTeamCollaborationContext(agentId: string): Promise<CollaborationContext> {
    const collaborationHistory = await this.getCollaborationHistory(agentId);
    
    return {
      recentCollaborations: collaborationHistory.slice(-10),
      preferredWorkingStyles: { async: true, documentation: 'detailed' },
      communicationPatterns: { frequency: 'daily', format: 'structured' },
      successfulPartnerships: [],
      challengingInteractions: []
    };
  }
  
  private async createFallbackCNSAnalysis(agentId: string): Promise<CNSAnalysis> {
    const agent = this.agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    // Create CNS analysis based on declared abilities
    const skills: Skill[] = agent.abilities.map((ability, index) => ({
      name: ability,
      level: 7, // Assume good proficiency
      category: 'core'
    }));
    
    return {
      currentCapabilities: skills,
      recentLearnings: [],
      knowledgeGaps: [],
      confidenceLevels: await this.assessConfidence(skills),
      recommendedEnhancements: [],
      collaborationReadiness: { score: 0.8, strengths: agent.abilities, limitations: [] },
      crossAgentSynergies: []
    };
  }
  
  private buildCapabilityAssessmentPrompt(
    agent: Agent, 
    cnsAnalysis: CNSAnalysis, 
    fileSystem: FileSystemCapabilities,
    teamContext: CollaborationContext,
    query: string,
    requestingAgent: string
  ): string {
    return `
You are analyzing whether agent "${agent.name}" (ID: ${agent.id}) can handle a specific capability request.

Agent Profile:
- Name: ${agent.name}
- Description: ${agent.description}
- Declared Abilities: ${agent.abilities.join(', ')}

Current Capabilities Analysis:
- Skills: ${cnsAnalysis.currentCapabilities.map(s => `${s.name} (level ${s.level})`).join(', ')}
- Recent Learnings: ${cnsAnalysis.recentLearnings.map(l => l.topic).join(', ')}
- Knowledge Gaps: ${cnsAnalysis.knowledgeGaps.map(g => g.area).join(', ')}
- Collaboration Readiness: ${cnsAnalysis.collaborationReadiness.score}

Capability Query: "${query}"
Requesting Agent: ${requestingAgent}

Assess whether this agent can perform the requested capability. Provide a structured response with:
1. Can perform (true/false)
2. Confidence level (0.0-1.0)
3. Required preparation steps
4. Estimated effort
5. Recommended approach
6. Fallback options
7. Collaboration suggestions

Format as JSON.
    `;
  }
  
  private buildEnhancementAnalysisPrompt(
    targetCapabilities: CNSAnalysis,
    requestorCapabilities: CNSAnalysis,
    enhancement: CapabilityEnhancement
  ): string {
    return `
Analyze a capability enhancement proposal from one agent to another.

Target Agent Capabilities:
- Current Skills: ${targetCapabilities.currentCapabilities.map(s => s.name).join(', ')}
- Knowledge Gaps: ${targetCapabilities.knowledgeGaps.map(g => g.area).join(', ')}

Requesting Agent Capabilities:
- Current Skills: ${requestorCapabilities.currentCapabilities.map(s => s.name).join(', ')}

Enhancement Proposal:
- Capability: ${enhancement.capability}
- Justification: ${enhancement.justification}
- Urgency: ${enhancement.urgency}
- Expected Benefits: ${enhancement.benefits.join(', ')}

Analyze feasibility, prerequisites, implementation plan, and team impact. Format as JSON.
    `;
  }
  
  private parseCapabilityAssessment(response: string): CapabilityAssessment {
    try {
      const parsed = JSON.parse(response);
      return {
        canPerform: parsed.canPerform || false,
        confidenceLevel: parsed.confidenceLevel || 0.0,
        requiredPreparation: parsed.requiredPreparation || [],
        estimatedEffort: parsed.estimatedEffort || { complexity: 'unknown', timeRequired: 'unknown', resourcesNeeded: [] },
        recommendedApproach: parsed.recommendedApproach || 'No approach provided',
        fallbackOptions: parsed.fallbackOptions || [],
        collaborationSuggestions: parsed.collaborationSuggestions || []
      };
    } catch (error) {
      return this.createErrorCapabilityAssessment(`Failed to parse assessment: ${error.message}`);
    }
  }
  
  private parseEnhancementResponse(response: string): EnhancementResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        feasible: parsed.feasible || false,
        reasoning: parsed.reasoning || 'No reasoning provided',
        prerequisites: parsed.prerequisites || [],
        implementationPlan: parsed.implementationPlan || [],
        impactOnTeam: parsed.impactOnTeam || { beneficiaries: [], risks: [], overallImpact: 'unknown' },
        approvalRequired: parsed.approvalRequired || true
      };
    } catch (error) {
      return {
        feasible: false,
        reasoning: `Failed to parse enhancement response: ${error.message}`,
        prerequisites: [],
        implementationPlan: [],
        impactOnTeam: { beneficiaries: [], risks: [error.message], overallImpact: 'negative' },
        approvalRequired: true
      };
    }
  }
  
  private createErrorCapabilityAssessment(errorMessage: string): CapabilityAssessment {
    return {
      canPerform: false,
      confidenceLevel: 0.0,
      requiredPreparation: [],
      estimatedEffort: { complexity: 'unknown', timeRequired: 'unknown', resourcesNeeded: [] },
      recommendedApproach: `Error: ${errorMessage}`,
      fallbackOptions: [],
      collaborationSuggestions: []
    };
  }
  
  // Placeholder implementations for complex team analysis
  private async assessCollaborationPotential(agentId: string): Promise<number> {
    return 0.8; // Default collaboration potential
  }
  
  private async identifyTeamGaps(): Promise<TeamGap[]> {
    return [
      { area: 'audio-processing', severity: 'medium', recommendedSolution: 'Add audio transcription capability' },
      { area: 'image-analysis', severity: 'low', recommendedSolution: 'Enhance image generation with analysis' }
    ];
  }
  
  private async recommendTeamEnhancements(): Promise<TeamEnhancement[]> {
    return [
      { enhancement: 'Cross-agent memory sharing', priority: 'high', beneficiaries: ['all'] },
      { enhancement: 'Real-time collaboration interfaces', priority: 'medium', beneficiaries: ['communications', 'researcher'] }
    ];
  }
  
  private async mapOptimalCollaborations(): Promise<CollaborationPath[]> {
    return [
      { agents: ['researcher', 'communications'], taskTypes: ['market-analysis', 'report-creation'], efficiency: 0.9 },
      { agents: ['music-coach', 'image-generator'], taskTypes: ['educational-content', 'visual-learning'], efficiency: 0.8 }
    ];
  }
  
  private createFallbackTeamMatrix(): TeamCapabilityMatrix {
    return {
      agents: [],
      synergies: [],
      gaps: [],
      recommendedEnhancements: [],
      optimalCollaborationPaths: []
    };
  }
}
