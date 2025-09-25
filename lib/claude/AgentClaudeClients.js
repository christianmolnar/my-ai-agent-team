"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentClaudeClientFactory = void 0;
const ClaudeService_1 = require("./ClaudeService");
class AgentClaudeClientFactory {
    // Development Tier Clients (Sonnet 4)
    static createFullStackDeveloperClient() {
        const config = {
            apiKey: process.env.FULL_STACK_DEVELOPER_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514', // Using current available model
            maxTokens: 4000,
            temperature: 0.3,
            timeout: 60000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    static createDevOpsEngineerClient() {
        const config = {
            apiKey: process.env.DEVOPS_ENGINEER_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 3000,
            temperature: 0.2,
            timeout: 60000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    static createQAEngineerClient() {
        const config = {
            apiKey: process.env.QA_ENGINEER_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 3000,
            temperature: 0.1,
            timeout: 60000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    static createDataScientistClient() {
        const config = {
            apiKey: process.env.DATA_SCIENTIST_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 4000,
            temperature: 0.2,
            timeout: 60000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    // Management Tier Clients (Opus 3)
    static createMasterOrchestratorClient() {
        const apiKey = process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY;
        // Return mock service if no API key is available
        if (!apiKey || !apiKey.startsWith('sk-ant-')) {
            return this.createMockOrchestratorService();
        }
        const config = {
            apiKey: apiKey,
            model: 'claude-sonnet-4-20250514', // Fixed to use correct model
            maxTokens: 4000,
            temperature: 0.4,
            timeout: 120000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    // Create mock Master Orchestrator service
    static createMockOrchestratorService() {
        const mockConfig = {
            apiKey: 'sk-ant-mock-development-key-placeholder',
            model: 'claude-opus-4-1-20250805',
            maxTokens: 4000,
            temperature: 0.4,
            timeout: 120000,
            maxRetries: 3
        };
        const service = new ClaudeService_1.ClaudeService(mockConfig);
        // Override generateResponse to return mock orchestration responses
        service.generateResponse = async (messages, systemPrompt, tools) => {
            const userMessage = messages.find(m => m.role === 'user')?.content || '';
            const messageStr = Array.isArray(userMessage) ?
                userMessage.map(c => c.type === 'text' ? c.text : '').join(' ') :
                userMessage.toString();
            console.log('🎯 Mock Orchestrator Response - User Message:', messageStr);
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Return a structured orchestration plan
            return `**ORCHESTRATION PLAN**

**AGENTS:** music-coach,researcher-agent,communications-agent
**TIMELINE:** 2-3 weeks for comprehensive learning program
**DEPENDENCIES:** User preference assessment, resource availability
**STEPS:** 
1. Initial assessment and goal setting
2. Foundation learning materials curation
3. Structured timeline development
4. Interactive components integration
5. Progress tracking setup

**RISKS:** Time commitment requirements, resource access limitations

**EXECUTION RESULTS:**
- music-coach: Created comprehensive blues history curriculum with listening guides
- researcher-agent: Compiled historical context and cultural significance materials  
- communications-agent: Developed structured presentation format and learning materials

Mock orchestration completed successfully with simulated agent coordination.`;
        };
        return service;
    }
    static createProjectCoordinatorClient() {
        const config = {
            apiKey: process.env.PROJECT_COORDINATOR_ANTHROPIC_API_KEY,
            model: 'claude-opus-4-1-20250805',
            maxTokens: 4000,
            temperature: 0.3,
            timeout: 120000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    // Personal Assistant Tier (Sonnet 3.5)
    static createPersonalAssistantClient() {
        const apiKey = process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY;
        // Return mock service if no API key is available
        if (!apiKey || !apiKey.startsWith('sk-ant-')) {
            return this.createMockPersonalAssistantService();
        }
        const config = {
            apiKey: apiKey,
            model: 'claude-sonnet-4-20250514', // Updated to current active model
            maxTokens: 4000,
            temperature: 0.7,
            timeout: 60000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    // Create mock Personal Assistant service
    static createMockPersonalAssistantService() {
        const mockConfig = {
            apiKey: 'sk-ant-mock-development-key-placeholder',
            model: 'claude-sonnet-4-20250514', // Updated to current active model
            maxTokens: 4000,
            temperature: 0.7,
            timeout: 60000,
            maxRetries: 3
        };
        const service = new ClaudeService_1.ClaudeService(mockConfig);
        // Override generateResponse to return mock responses
        service.generateResponse = async (messages, systemPrompt, tools) => {
            const userMessage = messages.find(m => m.role === 'user')?.content || '';
            const messageStr = Array.isArray(userMessage) ?
                userMessage.map(c => c.type === 'text' ? c.text : '').join(' ') :
                userMessage.toString();
            console.log('🤖 Mock Claude Response - User Message:', messageStr);
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (messageStr.toLowerCase().includes('blues music')) {
                return `## Blues Music Learning Plan

I'd be happy to help you create a comprehensive plan to learn about blues music history!

**Phase 1: Foundation**
• Origins in African American communities
• Evolution from work songs and spirituals  
• Basic musical elements of blues

**Phase 2: Historical Development**  
• Delta Blues emergence
• Chicago Blues evolution
• Regional variations and styles

**Phase 3: Key Influences**
• Legendary performers and their impact
• Important recordings and performances
• Cultural and social context

**Deliverables**
• Customized learning timeline
• Curated resource lists
• Progress tracking metrics
• Interactive learning components

Would you like me to elaborate on any of these areas?`;
            }
            if (messageStr.toLowerCase().includes('hello') || messageStr.toLowerCase().includes('what can you do')) {
                return `Hello! I'm your Personal Assistant, and I coordinate with our entire AI agent team to help you accomplish complex projects.

**Team Capabilities**
• Research and analysis across all domains
• Content creation and communications
• Software development and technical work  
• Project planning and coordination
• Music education and creative services

**What I Can Help With**
• Multi-agent project coordination
• Learning plan development
• Resource gathering and analysis
• Progress tracking and updates

How can I help you today?`;
            }
            return `Thank you for your message. I'm working with our team to provide you with a comprehensive response. 

**Current Status**
• Analyzing your request with our specialists
• Coordinating appropriate team resources
• Preparing detailed recommendations

This is a mock response since we're in development mode without API keys configured. In production, I would provide a fully personalized response based on your specific needs and our team's capabilities.

How else can I assist you?`;
        };
        return service;
    }
    static createMusicCoachClient() {
        const config = {
            apiKey: process.env.MUSIC_COACH_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 4000,
            temperature: 0.8,
            timeout: 60000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    // Specialized Tier (Haiku for faster responses where appropriate)
    static createCommunicationsClient() {
        const config = {
            apiKey: process.env.COMMUNICATIONS_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514', // Using Sonnet for better quality
            maxTokens: 3000,
            temperature: 0.6,
            timeout: 30000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    static createResearcherClient() {
        const config = {
            apiKey: process.env.RESEARCHER_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 4000,
            temperature: 0.3,
            timeout: 90000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    static createContentCreatorClient() {
        const config = {
            apiKey: process.env.CONTENT_CREATOR_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 4000,
            temperature: 0.8,
            timeout: 60000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    static createVinylResearcherClient() {
        const config = {
            apiKey: process.env.VINYL_RESEARCHER_ANTHROPIC_API_KEY,
            model: 'claude-sonnet-4-20250514',
            maxTokens: 3000,
            temperature: 0.4,
            timeout: 60000,
            maxRetries: 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    // Utility method to create a client with custom configuration
    static createCustomClient(apiKeyEnvVar, model, options = {}) {
        const config = {
            apiKey: process.env[apiKeyEnvVar],
            model,
            maxTokens: options.maxTokens || 4000,
            temperature: options.temperature || 0.5,
            timeout: options.timeout || 60000,
            maxRetries: options.maxRetries || 3
        };
        ClaudeService_1.ClaudeService.validateConfig(config);
        return new ClaudeService_1.ClaudeService(config);
    }
    // Helper method to get all available clients
    static getAllClientTypes() {
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
    static createClientByType(type) {
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
exports.AgentClaudeClientFactory = AgentClaudeClientFactory;
