import { Agent } from './Agent';
import { CommunicationsAgent } from './communications-agent';
import { ResearcherAgent } from './researcher-agent';
import { ImageGeneratorAgent } from './ImageGeneratorAgent';
import { VinylResearcherAgent } from './VinylResearcherAgent';
import { PersonalAssistantBridge } from './PersonalAssistantBridge';
import { AvailabilityReliabilityExpertAgent } from './AvailabilityReliabilityExpertAgent';
import { BackEndDeveloperAgent } from './back-end-developer-agent';
import { DataScientistAgent } from './data-scientist-agent';
import { DevDesignDocCreatorAgent } from './DevDesignDocCreatorAgent';
import { ExperienceDesignerAgent } from './ExperienceDesignerAgent';
import { FrontEndDeveloperAgent } from './front-end-developer-agent';
import { FullStackDeveloperAgent } from './FullStackDeveloperAgent';
import { MasterOrchestratorAgent } from './master-orchestrator-agent';
import { MonitoringExpertAgent } from './MonitoringExpertAgent';
import { MusicCoachAgent } from './MusicCoachAgent';
import { PerformanceExpertAgent } from './PerformanceExpertAgent';
import { PersonalAssistantAgent } from './PersonalAssistantAgent';
import { PrivacyGuardianAgent } from './PrivacyGuardianAgent';
import { ProductManagerAgent } from './ProductManagerAgent';
import { ProjectCoordinatorAgent } from './project-coordinator-agent';
import { SecurityExpertAgent } from './SecurityExpertAgent';
import { TestExpertAgent } from './TestExpertAgent';

// Registry for all available agents
export class AgentRegistry {
  private agents: Map<string, Agent> = new Map();
  constructor() {
    // Register all available agents
    this.register(new PersonalAssistantBridge());
    this.register(new PersonalAssistantAgent());
    this.register(new MasterOrchestratorAgent());
    this.register(new CommunicationsAgent());
    this.register(new ResearcherAgent());
    this.register(new ProjectCoordinatorAgent());
    this.register(new DataScientistAgent());
    this.register(new FullStackDeveloperAgent());
    this.register(new FrontEndDeveloperAgent());
    this.register(new BackEndDeveloperAgent());
    this.register(new ImageGeneratorAgent());
    this.register(new VinylResearcherAgent());
    this.register(new AvailabilityReliabilityExpertAgent());
    this.register(new DevDesignDocCreatorAgent());
    this.register(new ExperienceDesignerAgent());
    this.register(new MonitoringExpertAgent());
    this.register(new MusicCoachAgent());
    this.register(new PerformanceExpertAgent());
    this.register(new PrivacyGuardianAgent());
    this.register(new ProductManagerAgent());
    this.register(new SecurityExpertAgent());
    this.register(new TestExpertAgent());
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
