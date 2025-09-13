/**
 * Dynamic Agent Registry - Auto-discovers all available agents
 * This eliminates hardcoded agent lists and makes the system truly extensible
 */

import fs from 'fs';
import path from 'path';
import { Agent } from '../agents/Agent';
import { ResearcherAgent } from '../agents/researcher-agent';
import { CommunicationsAgent } from '../agents/communications-agent';
import { ImageGeneratorAgent } from '../agents/ImageGeneratorAgent';
import { MusicCoachAgent } from '../agents/MusicCoachAgent';
import { ProjectCoordinatorAgent } from '../agents/project-coordinator-agent';
import { VinylResearcherAgent } from '../agents/VinylResearcherAgent';
import { AvailabilityReliabilityExpertAgent } from '../agents/AvailabilityReliabilityExpertAgent';
import { BackEndDeveloperAgent } from '../agents/back-end-developer-agent';
import { DataScientistAgent } from '../agents/data-scientist-agent';
import { DevDesignDocCreatorAgent } from '../agents/DevDesignDocCreatorAgent';
import { ExperienceDesignerAgent } from '../agents/ExperienceDesignerAgent';
import { FrontEndDeveloperAgent } from '../agents/front-end-developer-agent';
import { FullStackDeveloperAgent } from '../agents/FullStackDeveloperAgent';
import { MonitoringExpertAgent } from '../agents/MonitoringExpertAgent';
import { PerformanceExpertAgent } from '../agents/PerformanceExpertAgent';
import { PrivacyGuardianAgent } from '../agents/PrivacyGuardianAgent';
import { ProductManagerAgent } from '../agents/ProductManagerAgent';
import { SecurityExpertAgent } from '../agents/SecurityExpertAgent';
import { TestExpertAgent } from '../agents/TestExpertAgent';
import { EnhancedMasterOrchestratorAgent } from '../agents/EnhancedMasterOrchestratorAgent';

// Static agent registry that directly imports all agent classes (excluding agents that import AgentRegistry to avoid circular imports)
export const AGENT_CLASSES: Record<string, new () => Agent> = {
  'ResearcherAgent': ResearcherAgent,
  'CommunicationsAgent': CommunicationsAgent,
  'ImageGeneratorAgent': ImageGeneratorAgent,
  'MusicCoachAgent': MusicCoachAgent,
  'ProjectCoordinatorAgent': ProjectCoordinatorAgent,
  'VinylResearcherAgent': VinylResearcherAgent,
  'AvailabilityReliabilityExpertAgent': AvailabilityReliabilityExpertAgent,
  'BackEndDeveloperAgent': BackEndDeveloperAgent,
  'DataScientistAgent': DataScientistAgent,
  'DevDesignDocCreatorAgent': DevDesignDocCreatorAgent,
  'ExperienceDesignerAgent': ExperienceDesignerAgent,
  'FrontEndDeveloperAgent': FrontEndDeveloperAgent,
  'FullStackDeveloperAgent': FullStackDeveloperAgent,
  'MonitoringExpertAgent': MonitoringExpertAgent,
  'PerformanceExpertAgent': PerformanceExpertAgent,
  'PrivacyGuardianAgent': PrivacyGuardianAgent,
  'ProductManagerAgent': ProductManagerAgent,
  'SecurityExpertAgent': SecurityExpertAgent,
  'TestExpertAgent': TestExpertAgent,
  'EnhancedMasterOrchestratorAgent': EnhancedMasterOrchestratorAgent,
};

export class AgentRegistry {
  private static agentCache: string[] | null = null;
  private static agentDisplayNames: Map<string, string> = new Map();
  private static agentInstances: Map<string, Agent> = new Map();

  /**
   * Dynamically discover all available agents by scanning the agents directory
   */
  static getAvailableAgents(): string[] {
    if (this.agentCache !== null) {
      return this.agentCache;
    }

    try {
      const agentsDir = path.join(process.cwd(), 'agents');
      const files = fs.readdirSync(agentsDir);
      
      const agents = files
        .filter(file => file.endsWith('Agent.ts') && file !== 'Agent.ts') // Exclude base Agent interface
        .map(file => {
          // Convert "ResearcherAgent.ts" -> "researcher-agent"
          const agentName = file
            .replace('Agent.ts', '')
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .replace(/^-/, '') + '-agent'; // Add -agent suffix to match orchestrator expectations
          
          // Store display name mapping
          const displayName = file.replace('Agent.ts', '').replace(/([A-Z])/g, ' $1').trim();
          this.agentDisplayNames.set(agentName, displayName);
          
          return agentName;
        })
        .filter(agent => agent.length > 0);

      this.agentCache = agents;
      console.log('🤖 Dynamically discovered agents:', agents);
      return agents;
    } catch (error) {
      console.error('Error discovering agents:', error);
      // NO FALLBACKS - fail fast with clear error
      throw new Error(`AGENT DISCOVERY FAILED: Could not scan agents directory. Error: ${error.message}. Check file system permissions and project structure.`);
    }
  }

  /**
   * Get display name for an agent ID
   */
  static getAgentDisplayName(agentId: string): string {
    // Ensure agents are discovered first
    this.getAvailableAgents();
    
    return this.agentDisplayNames.get(agentId) || 
           agentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Check if an agent ID is valid
   */
  static isValidAgent(agentId: string): boolean {
    return this.getAvailableAgents().includes(agentId);
  }

  /**
   * Normalize agent name (handle variations like "researcher" vs "researcher-agent")
   */
  static normalizeAgentName(name: string): string {
    const cleaned = name.toLowerCase().trim()
      .replace(/^\*\*:?/, '') // Remove markdown formatting
      .replace(/\*\*$/, '')
      .replace(/^[\*\-\s]+/, '')
      .replace(/[\*\-\s]+$/, '')
      .replace(/\s+/g, '-');

    // Check if it matches any known agent
    const availableAgents = this.getAvailableAgents();
    
    // Direct match
    if (availableAgents.includes(cleaned)) {
      return cleaned;
    }
    
    // Try adding "-agent" suffix
    if (availableAgents.includes(cleaned + '-agent')) {
      return cleaned + '-agent';
    }
    
    // Try removing "-agent" suffix
    const withoutAgent = cleaned.replace('-agent', '');
    if (availableAgents.includes(withoutAgent)) {
      return withoutAgent;
    }
    
    // Partial match (for fuzzy matching)
    const partialMatch = availableAgents.find(agent => 
      agent.includes(cleaned) || cleaned.includes(agent.replace('-agent', ''))
    );
    
    if (partialMatch) {
      return partialMatch;
    }
    
    // Return original if no match found
    return cleaned;
  }

  /**
   * Clear cache to force re-discovery (useful for testing or when agents are added)
   */
  static clearCache(): void {
    this.agentCache = null;
    this.agentDisplayNames.clear();
    this.agentInstances.clear();
  }

  /**
   * Get or create an agent instance
   */
  static async getAgentInstance(agentId: string): Promise<Agent | null> {
    // Check if we already have an instance
    if (this.agentInstances.has(agentId)) {
      return this.agentInstances.get(agentId)!;
    }

    // Try to get agent class from static registry
    try {
      const className = this.getClassName(agentId);
      const AgentClass = AGENT_CLASSES[className];
      
      console.log(`🔄 Loading agent: ${agentId} (${className}) from static registry`);
      
      if (!AgentClass) {
        console.error(`❌ Agent class ${className} not found in static registry. Available classes:`, Object.keys(AGENT_CLASSES));
        return null;
      }

      // Instantiate the agent
      const agentInstance = new AgentClass();
      
      // Cache the instance
      this.agentInstances.set(agentId, agentInstance);
      
      console.log(`✅ Agent ${agentId} loaded and cached`);
      return agentInstance;
      
    } catch (error) {
      console.error(`❌ Failed to load agent ${agentId}:`, error.message);
      return null;
    }
  }  /**
   * Convert agent ID to class name (e.g. "researcher" -> "ResearcherAgent", "researcher-agent" -> "ResearcherAgent")
   */
  private static getClassName(agentId: string): string {
    // Remove any "-agent" suffix first to avoid double Agent suffix
    const cleanId = agentId.replace('-agent', '');
    
    return cleanId
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') + 'Agent';
  }

  /**
   * Execute an agent task
   */
  static async executeAgent(agentId: string, task: any): Promise<any> {
    const agent = await this.getAgentInstance(agentId);
    
    if (!agent) {
      throw new Error(`Agent ${agentId} could not be loaded`);
    }

    console.log(`🚀 Executing ${agentId} with task:`, task.type);
    const result = await agent.handleTask(task);
    console.log(`✅ ${agentId} completed:`, result.success ? 'SUCCESS' : 'FAILED');
    
    return result;
  }
}
