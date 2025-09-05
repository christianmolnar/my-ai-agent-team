import { Agent } from './Agent';
import { CommunicationsAgent } from './CommunicationsAgent';
import { ResearcherAgent } from './ResearcherAgent';
import { ImageGeneratorAgent } from './ImageGeneratorAgent';
import { VinylResearcherAgent } from './VinylResearcherAgent';
import { MasterOrchestratorAgent } from './MasterOrchestratorAgent';
import { ProjectCoordinatorAgent } from './ProjectCoordinatorAgent';
import { PersonalAssistantAgent } from './PersonalAssistantAgent';
import { MusicCoachAgent } from './MusicCoachAgent';

// Registry for all available agents
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  constructor() {
    // Register core agents here
    // Note: PersonalAssistantBridge is not registered as it's a service, not an agent
    
    // Priority 4-agent team
    this.register(new MasterOrchestratorAgent());
    this.register(new ProjectCoordinatorAgent());
    this.register(new PersonalAssistantAgent());
    this.register(new MusicCoachAgent());
    
    // Existing agents
    this.register(new CommunicationsAgent());
    this.register(new ResearcherAgent());
    this.register(new ImageGeneratorAgent());
    this.register(new VinylResearcherAgent());
    
    // I'll add more agents as I implement them
  }

  register(agent: Agent) {
    this.agents.set(agent.id, agent);
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
}
