import { ClaudeService, ClaudeConfig } from './ClaudeService';

export class AgentClaudeClientFactory {
  // Development Tier Clients (Sonnet 4)
  static createFullStackDeveloperClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.FULL_STACK_DEVELOPER_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022', // Using current available model
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 60000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  static createDevOpsEngineerClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.DEVOPS_ENGINEER_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 3000,
      temperature: 0.2,
      timeout: 60000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  static createQAEngineerClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.QA_ENGINEER_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 3000,
      temperature: 0.1,
      timeout: 60000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  static createDataScientistClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.DATA_SCIENTIST_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4000,
      temperature: 0.2,
      timeout: 60000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  // Management Tier Clients (Opus 3)
  static createMasterOrchestratorClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY!,
      model: 'claude-3-opus-20240229', // Using current available Opus model
      maxTokens: 4000,
      temperature: 0.4,
      timeout: 120000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  static createProjectCoordinatorClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.PROJECT_COORDINATOR_ANTHROPIC_API_KEY!,
      model: 'claude-3-opus-20240229',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 120000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  // Personal Assistant Tier (Sonnet 3.5)
  static createPersonalAssistantClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 60000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  static createMusicCoachClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.MUSIC_COACH_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4000,
      temperature: 0.8,
      timeout: 60000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  // Specialized Tier (Haiku for faster responses where appropriate)
  static createCommunicationsClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.COMMUNICATIONS_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022', // Using Sonnet for better quality
      maxTokens: 3000,
      temperature: 0.6,
      timeout: 30000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  static createResearcherClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.RESEARCHER_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4000,
      temperature: 0.3,
      timeout: 90000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  static createContentCreatorClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.CONTENT_CREATOR_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4000,
      temperature: 0.8,
      timeout: 60000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  static createVinylResearcherClient(): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env.VINYL_RESEARCHER_ANTHROPIC_API_KEY!,
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 3000,
      temperature: 0.4,
      timeout: 60000,
      maxRetries: 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  // Utility method to create a client with custom configuration
  static createCustomClient(
    apiKeyEnvVar: string,
    model: string,
    options: Partial<Omit<ClaudeConfig, 'apiKey' | 'model'>> = {}
  ): ClaudeService {
    const config: ClaudeConfig = {
      apiKey: process.env[apiKeyEnvVar]!,
      model,
      maxTokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.5,
      timeout: options.timeout || 60000,
      maxRetries: options.maxRetries || 3
    };
    ClaudeService.validateConfig(config);
    return new ClaudeService(config);
  }

  // Helper method to get all available clients
  static getAllClientTypes(): string[] {
    return [
      'full-stack-developer',
      'devops-engineer',
      'qa-engineer',
      'data-scientist',
      'master-orchestrator',
      'project-coordinator',
      'personal-assistant',
      'music-coach',
      'communications',
      'researcher',
      'content-creator',
      'vinyl-researcher'
    ];
  }

  // Helper method to create client by type string
  static createClientByType(type: string): ClaudeService {
    switch (type) {
      case 'full-stack-developer':
        return this.createFullStackDeveloperClient();
      case 'devops-engineer':
        return this.createDevOpsEngineerClient();
      case 'qa-engineer':
        return this.createQAEngineerClient();
      case 'data-scientist':
        return this.createDataScientistClient();
      case 'master-orchestrator':
        return this.createMasterOrchestratorClient();
      case 'project-coordinator':
        return this.createProjectCoordinatorClient();
      case 'personal-assistant':
        return this.createPersonalAssistantClient();
      case 'music-coach':
        return this.createMusicCoachClient();
      case 'communications':
        return this.createCommunicationsClient();
      case 'researcher':
        return this.createResearcherClient();
      case 'content-creator':
        return this.createContentCreatorClient();
      case 'vinyl-researcher':
        return this.createVinylResearcherClient();
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}
