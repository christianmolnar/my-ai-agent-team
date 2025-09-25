import { Agent } from './agent';
import * as fs from 'fs';
import * as path from 'path';

interface AgentDefinition {
  id: string;
  name: string;
  type: string;
  status: string;
  capabilities: string[];
  folder: string;
}

interface AgentRegistryConfig {
  agents: AgentDefinition[];
  totalAgents: number;
  lastUpdated: string;
  version: string;
}

// Dynamic registry that loads available agents based on the JSON config
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  private agentDefinitions: Map<string, AgentDefinition> = new Map();
  private initialized = false;

  constructor() {
    // Initialize will be called when needed
  }

  private async initialize() {
    if (this.initialized) return;

    try {
      // Load agent registry configuration
      const registryPath = path.join(process.cwd(), 'agents-cns', 'agent-registry.json');
      const configData = fs.readFileSync(registryPath, 'utf8');
      const config: AgentRegistryConfig = JSON.parse(configData);

      // Store agent definitions for reference
      for (const agentDef of config.agents) {
        this.agentDefinitions.set(agentDef.id, agentDef);
      }

      this.initialized = true;
      console.log(`🤖 AgentRegistry initialized with ${config.totalAgents} agent definitions available for dynamic loading`);
    } catch (error) {
      console.error('Failed to initialize AgentRegistry:', error);
      this.initialized = true; // Prevent retry loops
    }
  }

  private async loadAgent(id: string): Promise<Agent | null> {
    try {
      const agentDef = this.agentDefinitions.get(id);
      if (!agentDef) {
        console.warn(`Agent definition not found for: ${id}`);
        return null;
      }

      // Convert agent ID to kebab-case filename (our naming convention)
      const fileName = this.getAgentFileName(id);
      
      // Try to dynamically import the agent module
      const agentModule = await import(`./${fileName}`);
      
      // Get the agent class from the module (assume it matches the type name)
      const AgentClass = agentModule[agentDef.type];
      
      if (!AgentClass) {
        console.warn(`Agent class ${agentDef.type} not found in module ${fileName}`);
        return null;
      }

      // Create and register the agent instance
      const agent = new AgentClass();
      this.agents.set(id, agent);
      
      console.log(`✅ Dynamically loaded agent: ${agentDef.name} (${id})`);
      return agent;
      
    } catch (error) {
      console.warn(`Failed to load agent ${id}:`, error.message);
      return null;
    }
  }

  private getAgentFileName(agentId: string): string {
    // Map agent IDs to their actual filenames
    const fileNameMap: { [key: string]: string } = {
      'personal-assistant': 'personal-assistant',
      'master-orchestrator': 'master-orchestrator',
      'reviewer': 'reviewer',
      'communications': 'communications',
      'researcher': 'researcher',
      'data-scientist': 'data-scientist',
      'front-end-developer': 'front-end-developer',
      'back-end-developer': 'back-end-developer',
      'full-stack-developer': 'full-stack-developer',
      'project-coordinator': 'project-coordinator',
      'image-video-generator': 'image-generator',
      'vinyl-researcher': 'vinyl-researcher',
      'availability-reliability-expert': 'availability-reliability-expert',
      'security-expert': 'security-expert',
      'privacy-guardian': 'privacy-guardian',
      'performance-expert': 'performance-expert',
      'monitoring-expert': 'monitoring-expert',
      'experience-designer': 'experience-designer',
      'dev-design-doc-creator': 'dev-design-doc-creator',
      'product-manager': 'product-manager',
      'test-expert': 'test-expert',
      'music-coach': 'music-coach'
    };

    return fileNameMap[agentId] || agentId;
  }

  register(agent: Agent) {
    this.agents.set(agent.id, agent);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    await this.initialize();
    
    // Return cached agent if available
    if (this.agents.has(id)) {
      return this.agents.get(id);
    }

    // Try to load the agent dynamically
    const agent = await this.loadAgent(id);
    return agent || undefined;
  }

  async getAllAgents(): Promise<Agent[]> {
    await this.initialize();
    
    // Load all active agents
    const allAgents: Agent[] = [];
    for (const [agentId, agentDef] of this.agentDefinitions) {
      if (agentDef.status === 'active') {
        const agent = await this.getAgent(agentId);
        if (agent) {
          allAgents.push(agent);
        }
      }
    }
    
    return allAgents;
  }

  async getAvailableAgentIds(): Promise<string[]> {
    await this.initialize();
    return Array.from(this.agentDefinitions.keys()).filter(id => 
      this.agentDefinitions.get(id)?.status === 'active'
    );
  }

  getAgentDefinition(id: string): AgentDefinition | undefined {
    return this.agentDefinitions.get(id);
  }

  // Static instance for global access
  private static instance: AgentRegistry | null = null;

  static getInstance(): AgentRegistry {
    if (!this.instance) {
      this.instance = new AgentRegistry();
    }
    return this.instance;
  }

  static async getAgentInstance(id: string): Promise<Agent | undefined> {
    return await this.getInstance().getAgent(id);
  }

  static async getAvailableAgents(): Promise<Agent[]> {
    return await this.getInstance().getAllAgents();
  }

  static getAgentDisplayName(agent: Agent | string): string {
    if (typeof agent === 'string') {
      const registry = this.getInstance();
      const agentDef = registry.getAgentDefinition(agent);
      return agentDef?.name || agent;
    }
    return agent.name || agent.id;
  }
}
