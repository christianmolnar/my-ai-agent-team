import { ClaudeService } from '../../lib/claude/ClaudeService';
import { AgentClaudeClientFactory } from '../../lib/claude/AgentClaudeClients';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Integration tests for Claude SDK implementation
 * 
 * These tests verify that the Claude integration works correctly
 * across the agent architecture.
 */

describe('Claude SDK Integration', () => {
  // Mock environment variables for testing
  beforeAll(() => {
    process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY = 'test-key-12345';
    process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY = 'test-key-12345';
  });

  afterAll(() => {
    delete process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY;
    delete process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY;
  });

  test('ClaudeService class can be instantiated', () => {
    const config = {
      apiKey: 'test-key',
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1000,
      temperature: 0.5,
      timeout: 30000,
      maxRetries: 2
    };

    const service = new ClaudeService(config);
    expect(service).toBeInstanceOf(ClaudeService);
    
    const modelInfo = service.getModelInfo();
    expect(modelInfo.model).toBe('claude-3-5-sonnet-20241022');
    expect(modelInfo.maxTokens).toBe(1000);
    expect(modelInfo.temperature).toBe(0.5);
  });

  test('Personal Assistant Client Creation', () => {
    expect(() => {
      const client = AgentClaudeClientFactory.createPersonalAssistantClient();
      expect(client).toBeInstanceOf(ClaudeService);
    }).not.toThrow();
  });

  test('Master Orchestrator Client Creation', () => {
    expect(() => {
      const client = AgentClaudeClientFactory.createMasterOrchestratorClient();
      expect(client).toBeInstanceOf(ClaudeService);
    }).not.toThrow();
  });

  test('All Agent Client Types Available', () => {
    const clientTypes = AgentClaudeClientFactory.getAllClientTypes();
    expect(clientTypes).toContain('personal-assistant');
    expect(clientTypes).toContain('master-orchestrator');
    expect(clientTypes).toContain('full-stack-developer');
    expect(clientTypes).toContain('devops-engineer');
    expect(clientTypes.length).toBeGreaterThan(5);
  });

  test('Client Creation by Type String', () => {
    expect(() => {
      const client = AgentClaudeClientFactory.createClientByType('personal-assistant');
      expect(client).toBeInstanceOf(ClaudeService);
    }).not.toThrow();
  });

  test('Custom Client Creation', () => {
    expect(() => {
      const client = AgentClaudeClientFactory.createCustomClient(
        'PERSONAL_ASSISTANT_ANTHROPIC_API_KEY',
        'claude-3-5-sonnet-20241022',
        { temperature: 0.8, maxTokens: 2000 }
      );
      expect(client).toBeInstanceOf(ClaudeService);
    }).not.toThrow();
  });

  test('Configuration Validation', () => {
    // Valid configuration should not throw
    expect(() => {
      ClaudeService.validateConfig({
        apiKey: 'sk-ant-test-key',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 1000,
        temperature: 0.5,
        timeout: 30000,
        maxRetries: 3
      });
    }).not.toThrow();

    // Invalid API key should throw
    expect(() => {
      ClaudeService.validateConfig({
        apiKey: 'invalid-key',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 1000,
        temperature: 0.5,
        timeout: 30000,
        maxRetries: 3
      });
    }).toThrow('Invalid Anthropic API key format');

    // Invalid max tokens should throw
    expect(() => {
      ClaudeService.validateConfig({
        apiKey: 'sk-ant-test-key',
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 10000,
        temperature: 0.5,
        timeout: 30000,
        maxRetries: 3
      });
    }).toThrow('Max tokens must be between 1 and 8192');
  });
});

/**
 * Agent Integration Tests
 * 
 * These tests verify that agents properly integrate with Claude services.
 */
describe('Agent Claude Integration', () => {
  beforeAll(() => {
    // Set up test environment variables
    process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY = 'sk-ant-test-key';
    process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY = 'sk-ant-test-key';
  });

  afterAll(() => {
    delete process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY;
    delete process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY;
  });

  test('PersonalAssistantAgent Initialization', async () => {
    const { PersonalAssistantAgent } = await import('../../agents/personal-assistant');
    
    expect(() => {
      const agent = new PersonalAssistantAgent();
      expect(agent.id).toBe('personal-assistant');
      expect(agent.abilities).toContain('Claude Sonnet 4 conversation management');
    }).not.toThrow();
  });

  test('MasterOrchestratorAgent Initialization', async () => {
    const { MasterOrchestratorAgent } = await import('../../agents/master-orchestrator');
    
    expect(() => {
      const agent = new MasterOrchestratorAgent();
      expect(agent.id).toBe('master-orchestrator');
      expect(agent.abilities).toContain('Multi-agent task coordination');
    }).not.toThrow();
  });

  // Integration tests would go here - these would require actual API keys
  // and would be marked as integration tests to run separately from unit tests
  
  test.skip('Live API Integration Test - Personal Assistant', async () => {
    // This test would require a real API key and would make actual API calls
    // Skip by default to avoid API costs during development
    
    if (!process.env.PERSONAL_ASSISTANT_ANTHROPIC_API_KEY?.startsWith('sk-ant-')) {
      console.log('Skipping live API test - no valid API key provided');
      return;
    }

    const client = AgentClaudeClientFactory.createPersonalAssistantClient();
    
    const response = await client.generateResponse([
      { role: 'user', content: 'Hello, this is a test message' }
    ], 'You are a helpful assistant.');

    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});

/**
 * Error Handling Tests
 */
describe('Claude Service Error Handling', () => {
  test('Graceful API Error Handling', async () => {
    const config = {
      apiKey: 'sk-ant-invalid-key-for-testing',
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 1000,
      temperature: 0.5,
      timeout: 5000,
      maxRetries: 1
    };

    const service = new ClaudeService(config);

    // This should handle the API error gracefully
    await expect(service.generateResponse([
      { role: 'user', content: 'Test message' }
    ])).rejects.toThrow();
  });

  test('Invalid Client Type Handling', () => {
    expect(() => {
      AgentClaudeClientFactory.createClientByType('invalid-agent-type');
    }).toThrow('Unknown agent type: invalid-agent-type');
  });
});

export { }; // Make this a module
