import OpenAI from 'openai';

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
}

export class AgentOpenAIClientFactory {
  
  // Strategic Tier (GPT-4o for complex reasoning)
  static createMasterOrchestratorClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.MASTER_ORCHESTRATOR_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.4, // Strategic, measured responses
      timeout: 120000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createProjectCoordinatorClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.PROJECT_COORDINATOR_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.3, // Precise coordination
      timeout: 90000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  // Development Tier (GPT-4o for coding excellence)
  static createFullStackDeveloperClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.FULL_STACK_DEVELOPER_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.3, // Precise coding
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createFrontEndDeveloperClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.FRONT_END_DEVELOPER_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.4, // Slightly creative for UI
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createBackEndDeveloperClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.BACK_END_DEVELOPER_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.2, // Very precise for systems
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createDataScientistClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.DATA_SCIENTIST_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.2, // Analytical precision
      timeout: 90000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  // Quality Assurance Tier
  static createQAEngineerClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.QA_ENGINEER_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 3000,
      temperature: 0.1, // Extremely precise testing
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createTestExpertClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.TEST_EXPERT_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 3000,
      temperature: 0.1, // Methodical testing
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  // Research Tier (GPT-4o for deep analysis)
  static createResearcherClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.RESEARCHER_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.3, // Thorough but focused
      timeout: 90000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createSecurityExpertClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.SECURITY_EXPERT_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.2, // Security precision
      timeout: 90000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  // Creative Tier (GPT-4o with higher temperature)
  static createCommunicationsClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.COMMUNICATIONS_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 3000,
      temperature: 0.7, // Creative communication
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createExperienceDesignerClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.EXPERIENCE_DESIGNER_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.8, // Highly creative
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createContentCreatorClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.CONTENT_CREATOR_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.8, // Creative content
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  // Personal Assistance Tier
  static createPersonalAssistantClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.PERSONAL_ASSISTANT_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.6, // Helpful and personable
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  static createMusicCoachClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.MUSIC_COACH_OPENAI_API_KEY!,
      model: 'gpt-4o',
      maxTokens: 4000,
      temperature: 0.7, // Educational but engaging
      timeout: 60000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  // Fast Operations Tier (GPT-4o-mini for cost efficiency)
  static createVinylResearcherClient(): OpenAI {
    const config: OpenAIConfig = {
      apiKey: process.env.VINYL_RESEARCHER_OPENAI_API_KEY!,
      model: 'gpt-4o-mini',
      maxTokens: 3000,
      temperature: 0.4, // Focused research
      timeout: 30000,
      maxRetries: 3
    };
    return this.createClient(config);
  }

  // Utility method to create OpenAI client
  private static createClient(config: OpenAIConfig): OpenAI {
    if (!config.apiKey || !config.apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key provided');
    }

    return new OpenAI({
      apiKey: config.apiKey,
      timeout: config.timeout,
      maxRetries: config.maxRetries
    });
  }

  // Helper method to create client by agent type
  static createClientByType(agentType: string): OpenAI {
    switch (agentType) {
      case 'master-orchestrator':
        return this.createMasterOrchestratorClient();
      case 'project-coordinator':
        return this.createProjectCoordinatorClient();
      case 'full-stack-developer':
        return this.createFullStackDeveloperClient();
      case 'front-end-developer':
        return this.createFrontEndDeveloperClient();
      case 'back-end-developer':
        return this.createBackEndDeveloperClient();
      case 'data-scientist':
        return this.createDataScientistClient();
      case 'qa-engineer':
        return this.createQAEngineerClient();
      case 'test-expert':
        return this.createTestExpertClient();
      case 'researcher':
        return this.createResearcherClient();
      case 'security-expert':
        return this.createSecurityExpertClient();
      case 'communications':
        return this.createCommunicationsClient();
      case 'experience-designer':
        return this.createExperienceDesignerClient();
      case 'content-creator':
        return this.createContentCreatorClient();
      case 'personal-assistant':
        return this.createPersonalAssistantClient();
      case 'music-coach':
        return this.createMusicCoachClient();
      case 'vinyl-researcher':
        return this.createVinylResearcherClient();
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  // Get model configuration for an agent
  static getModelConfig(agentType: string): { model: string; temperature: number } {
    const configs: Record<string, { model: string; temperature: number }> = {
      'master-orchestrator': { model: 'gpt-4o', temperature: 0.4 },
      'project-coordinator': { model: 'gpt-4o', temperature: 0.3 },
      'full-stack-developer': { model: 'gpt-4o', temperature: 0.3 },
      'front-end-developer': { model: 'gpt-4o', temperature: 0.4 },
      'back-end-developer': { model: 'gpt-4o', temperature: 0.2 },
      'data-scientist': { model: 'gpt-4o', temperature: 0.2 },
      'qa-engineer': { model: 'gpt-4o', temperature: 0.1 },
      'test-expert': { model: 'gpt-4o', temperature: 0.1 },
      'researcher': { model: 'gpt-4o', temperature: 0.3 },
      'security-expert': { model: 'gpt-4o', temperature: 0.2 },
      'communications': { model: 'gpt-4o', temperature: 0.7 },
      'experience-designer': { model: 'gpt-4o', temperature: 0.8 },
      'content-creator': { model: 'gpt-4o', temperature: 0.8 },
      'personal-assistant': { model: 'gpt-4o', temperature: 0.6 },
      'music-coach': { model: 'gpt-4o', temperature: 0.7 },
      'vinyl-researcher': { model: 'gpt-4o-mini', temperature: 0.4 },
    };
    
    return configs[agentType] || { model: 'gpt-4o-mini', temperature: 0.5 };
  }
}
