import { getAvailableProviders } from './agent-env-mapping';
import { apiKeyManager } from '../config/api-keys';
import axios from 'axios';

/**
 * Universal AI Client with Multi-Provider Failover and Learning
 * 
 * This client provides a unified interface for all LLM providers and includes:
 * - Automatic failover between providers
 * - Performance tracking and learning
 * - CNS integration for storing preferences
 */

export interface AIProvider {
  name: string;
  apiKey: string;
  endpoint: string;
  model?: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ProviderMetrics {
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  lastUsed: Date;
  lastError?: string;
}

export class UniversalAIClient {
  private metrics: Map<string, Map<string, ProviderMetrics>> = new Map(); // agentId -> provider -> metrics
  
  constructor() {
    this.loadMetricsFromCNS();
  }

  /**
   * Generate response with automatic provider failover
   */
  async generateResponse(
    agentId: string,
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    const providers = this.getProvidersInPreferenceOrder(agentId);
    
    if (providers.length === 0) {
      throw new Error(`No API keys configured for agent: ${agentId}. Check environment variables.`);
    }

    let lastError: Error | null = null;

    for (const provider of providers) {
      const startTime = Date.now();
      
      try {
        console.log(`🔄 [${agentId}] Trying ${provider.name} (${provider.model})...`);
        
        const response = await this.callProvider(provider, messages, systemPrompt);
        const responseTime = Date.now() - startTime;
        
        // Record success
        this.recordSuccess(agentId, provider.name, responseTime);
        
        console.log(`✅ [${agentId}] ${provider.name} succeeded in ${responseTime}ms`);
        
        return {
          content: response.content,
          provider: provider.name,
          model: provider.model || 'unknown',
          usage: response.usage
        };
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        lastError = error as Error;
        
        // Record failure
        this.recordFailure(agentId, provider.name, responseTime, lastError.message);
        
        console.warn(`❌ [${agentId}] ${provider.name} failed after ${responseTime}ms: ${lastError.message}`);
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new Error(`All LLM providers failed for agent ${agentId}. Last error: ${lastError?.message}`);
  }

  /**
   * Call a specific provider with the appropriate API format
   */
  private async callProvider(
    provider: AIProvider,
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<{ content: string; usage?: any }> {
    
    switch (provider.name) {
      case 'anthropic':
        return this.callAnthropic(provider, messages, systemPrompt);
      case 'openai':
        return this.callOpenAI(provider, messages, systemPrompt);
      case 'google':
        return this.callGoogle(provider, messages, systemPrompt);
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(
    provider: AIProvider,
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<{ content: string; usage?: any }> {
    
    // Format messages for Anthropic
    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    const requestBody = {
      model: provider.model || 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: anthropicMessages,
      ...(systemPrompt && { system: systemPrompt })
    };

    const response = await axios.post(
      provider.endpoint,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.content[0].text,
      usage: response.data.usage
    };
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    provider: AIProvider,
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<{ content: string; usage?: any }> {
    
    const openaiMessages = [...messages];
    if (systemPrompt) {
      openaiMessages.unshift({ role: 'system', content: systemPrompt });
    }

    const requestBody = {
      model: provider.model || 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: 4000,
      temperature: 0.7
    };

    const response = await axios.post(
      provider.endpoint,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  /**
   * Call Google Gemini API
   */
  private async callGoogle(
    provider: AIProvider,
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<{ content: string; usage?: any }> {
    
    // Google uses a different format
    const prompt = [
      ...(systemPrompt ? [systemPrompt] : []),
      ...messages.map(m => `${m.role}: ${m.content}`)
    ].join('\n\n');

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        maxOutputTokens: 4000,
        temperature: 0.7
      }
    };

    const response = await axios.post(
      `${provider.endpoint}/${provider.model || 'gemini-1.5-flash'}:generateContent?key=${provider.apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.candidates[0].content.parts[0].text,
      usage: response.data.usageMetadata
    };
  }

  /**
   * Get providers ordered by preference (success rate + recency)
   */
  private getProvidersInPreferenceOrder(agentId: string): AIProvider[] {
    // Get base providers from agent mapping
    const baseProviders = getAvailableProviders(agentId) as AIProvider[];
    
    // Filter to only providers with configured API keys
    const availableProviders = baseProviders.filter(provider => {
      const hasKey = apiKeyManager.hasKey(provider.name);
      if (!hasKey) {
        console.log(`⚠️ [${agentId}] Skipping ${provider.name} - no API key configured`);
      }
      return hasKey;
    }).map(provider => ({
      ...provider,
      apiKey: apiKeyManager.getKey(provider.name) || ''
    }));

    if (availableProviders.length === 0) {
      throw new Error(`No API keys configured for agent: ${agentId}. Please configure API keys in .env file.`);
    }

    const agentMetrics = this.metrics.get(agentId) || new Map();

    return availableProviders.sort((a, b) => {
      const aMetrics = agentMetrics.get(a.name);
      const bMetrics = agentMetrics.get(b.name);

      // If no metrics, prioritize by provider order (Anthropic, OpenAI, Google)
      if (!aMetrics && !bMetrics) {
        const providerOrder = { anthropic: 0, openai: 1, google: 2 };
        return (providerOrder[a.name as keyof typeof providerOrder] || 99) - 
               (providerOrder[b.name as keyof typeof providerOrder] || 99);
      }

      if (!aMetrics) return 1;
      if (!bMetrics) return -1;

      // Calculate success rate
      const aSuccessRate = aMetrics.successCount / (aMetrics.successCount + aMetrics.failureCount);
      const bSuccessRate = bMetrics.successCount / (bMetrics.successCount + bMetrics.failureCount);

      // Prefer higher success rate, then faster response time
      if (aSuccessRate !== bSuccessRate) {
        return bSuccessRate - aSuccessRate;
      }

      return aMetrics.averageResponseTime - bMetrics.averageResponseTime;
    });
  }

  /**
   * Record successful API call
   */
  private recordSuccess(agentId: string, provider: string, responseTime: number): void {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, new Map());
    }

    const agentMetrics = this.metrics.get(agentId)!;
    const providerMetrics = agentMetrics.get(provider) || {
      successCount: 0,
      failureCount: 0,
      averageResponseTime: 0,
      lastUsed: new Date()
    };

    providerMetrics.successCount++;
    providerMetrics.averageResponseTime = 
      (providerMetrics.averageResponseTime * (providerMetrics.successCount - 1) + responseTime) / 
      providerMetrics.successCount;
    providerMetrics.lastUsed = new Date();
    delete providerMetrics.lastError;

    agentMetrics.set(provider, providerMetrics);
    this.saveMetricsToCNS(agentId);
  }

  /**
   * Record failed API call
   */
  private recordFailure(agentId: string, provider: string, responseTime: number, error: string): void {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, new Map());
    }

    const agentMetrics = this.metrics.get(agentId)!;
    const providerMetrics = agentMetrics.get(provider) || {
      successCount: 0,
      failureCount: 0,
      averageResponseTime: 0,
      lastUsed: new Date()
    };

    providerMetrics.failureCount++;
    providerMetrics.lastUsed = new Date();
    providerMetrics.lastError = error;

    agentMetrics.set(provider, providerMetrics);
    this.saveMetricsToCNS(agentId);
  }

  /**
   * Load metrics from CNS (placeholder - implement CNS integration)
   */
  private loadMetricsFromCNS(): void {
    // TODO: Implement CNS integration to load provider preferences
    console.log('📊 Loading provider metrics from CNS...');
  }

  /**
   * Save metrics to CNS (placeholder - implement CNS integration)
   */
  private saveMetricsToCNS(agentId: string): void {
    // TODO: Implement CNS integration to save provider preferences
    console.log(`💾 Saving provider metrics for ${agentId} to CNS...`);
  }

  /**
   * Get metrics for debugging
   */
  getMetrics(agentId: string): Record<string, ProviderMetrics> {
    const agentMetrics = this.metrics.get(agentId);
    if (!agentMetrics) return {};

    const result: Record<string, ProviderMetrics> = {};
    for (const [provider, metrics] of agentMetrics) {
      result[provider] = { ...metrics };
    }
    return result;
  }
}

// Global instance
export const universalAIClient = new UniversalAIClient();
