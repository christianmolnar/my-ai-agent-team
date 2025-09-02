/**
 * Universal AI Client
 * 
 * This client allows any agent to access any AI model through a unified interface
 * Handles provider differences, authentication, and intelligent fallback strategies
 */

import { 
  CENTRAL_AI_REGISTRY, 
  selectOptimalModel, 
  getModelConfig, 
  isModelAvailable, 
  type TaskRequirements, 
  type ModelConfig 
} from '../agents/ai_config';

export interface UniversalAIRequest {
  // Model selection (can specify exact model or let system choose)
  model?: string;
  taskRequirements?: TaskRequirements;
  
  // Request content
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
  input?: any;
  
  // Configuration
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  
  // Fallback strategy
  enableFallback?: boolean;
  maxRetries?: number;
}

export interface UniversalAIResponse {
  success: boolean;
  data?: any;
  error?: string;
  modelUsed: string;
  provider: string;
  tokensUsed?: number;
  cost?: number;
  latency?: number;
}

export class UniversalAIClient {
  private debugMode: boolean;

  constructor() {
    this.debugMode = process.env.DEBUG_AGENTS === 'true';
  }

  /**
   * Main method to interact with any AI model
   */
  async query(request: UniversalAIRequest): Promise<UniversalAIResponse> {
    const startTime = Date.now();

    try {
      // Determine which model to use
      const modelKey = this.selectModel(request);
      const config = getModelConfig(modelKey);

      if (!config) {
        throw new Error(`Model configuration not found: ${modelKey}`);
      }

      if (!isModelAvailable(modelKey)) {
        if (request.enableFallback !== false) {
          return this.tryFallback(request, modelKey);
        }
        throw new Error(`Model not available (missing API key): ${modelKey}`);
      }

      this.log(`Using model: ${modelKey} (${config.provider})`);

      // Route to appropriate provider
      const response = await this.routeToProvider(config, request);
      const latency = Date.now() - startTime;

      return {
        success: true,
        data: response,
        modelUsed: modelKey,
        provider: config.provider,
        latency
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      
      if (request.enableFallback !== false && request.maxRetries !== 0) {
        this.log(`Primary model failed, trying fallback: ${error}`);
        return this.tryFallback(request, undefined, error);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        modelUsed: 'none',
        provider: 'none',
        latency
      };
    }
  }

  /**
   * Select the optimal model for the request
   */
  private selectModel(request: UniversalAIRequest): string {
    // If specific model requested, use it
    if (request.model) {
      return request.model;
    }

    // If task requirements provided, use intelligent selection
    if (request.taskRequirements) {
      const selection = selectOptimalModel(request.taskRequirements);
      return selection.primary;
    }

    // Default fallback
    return process.env.DEFAULT_FALLBACK_MODEL || 'openai-gpt35';
  }

  /**
   * Try fallback models if primary fails
   */
  private async tryFallback(
    request: UniversalAIRequest, 
    failedModel?: string,
    originalError?: any
  ): Promise<UniversalAIResponse> {
    const maxRetries = request.maxRetries || 2;
    
    // Get fallback options
    let fallbackModels: string[] = [];
    
    if (request.taskRequirements) {
      const selection = selectOptimalModel(request.taskRequirements);
      fallbackModels = selection.fallback;
    } else {
      // Generic fallbacks
      fallbackModels = ['openai-gpt35', 'anthropic-claude3-haiku', 'openai-gpt4'];
    }

    // Remove the failed model from fallbacks
    if (failedModel) {
      fallbackModels = fallbackModels.filter(m => m !== failedModel);
    }

    // Try each fallback
    for (let i = 0; i < Math.min(fallbackModels.length, maxRetries); i++) {
      const fallbackModel = fallbackModels[i];
      
      if (!isModelAvailable(fallbackModel)) {
        continue;
      }

      try {
        this.log(`Trying fallback model: ${fallbackModel}`);
        
        const fallbackRequest = { ...request, model: fallbackModel, enableFallback: false };
        const result = await this.query(fallbackRequest);
        
        if (result.success) {
          return result;
        }
      } catch (error) {
        this.log(`Fallback model ${fallbackModel} also failed: ${error}`);
        continue;
      }
    }

    return {
      success: false,
      error: `All models failed. Original error: ${originalError}`,
      modelUsed: 'none',
      provider: 'none'
    };
  }

  /**
   * Route request to the appropriate AI provider
   */
  private async routeToProvider(config: ModelConfig, request: UniversalAIRequest): Promise<any> {
    switch (config.provider) {
      case 'openai':
        return this.callOpenAI(config, request);
      case 'anthropic':
        return this.callAnthropic(config, request);
      case 'google':
        return this.callGoogle(config, request);
      case 'together':
        return this.callTogether(config, request);
      case 'stability':
        return this.callStability(config, request);
      case 'cohere':
        return this.callCohere(config, request);
      case 'perplexity':
        return this.callPerplexity(config, request);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }

  /**
   * OpenAI API calls
   */
  private async callOpenAI(config: ModelConfig, request: UniversalAIRequest): Promise<any> {
    const headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    };

    // Chat completions
    if (config.endpoint.includes('chat/completions')) {
      const body = {
        model: config.models[0],
        messages: request.messages || [{ role: 'user', content: request.prompt || '' }],
        max_tokens: request.maxTokens || config.maxTokens,
        temperature: request.temperature || 0.7,
        stream: request.stream || false
      };

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
      }

      return response.json();
    }

    // Embeddings
    if (config.endpoint.includes('embeddings')) {
      const body = {
        model: config.models[0],
        input: request.input || request.prompt
      };

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`OpenAI Embeddings API error: ${response.status} ${await response.text()}`);
      }

      return response.json();
    }

    // Audio (Whisper/TTS)
    if (config.endpoint.includes('audio')) {
      // Implementation for audio endpoints
      throw new Error('Audio endpoints not yet implemented in Universal client');
    }

    // Images (DALL-E)
    if (config.endpoint.includes('images')) {
      const body = {
        model: config.models[0],
        prompt: request.prompt,
        n: 1,
        size: '1024x1024'
      };

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`OpenAI Images API error: ${response.status} ${await response.text()}`);
      }

      return response.json();
    }

    throw new Error('Unsupported OpenAI endpoint');
  }

  /**
   * Anthropic Claude API calls
   */
  private async callAnthropic(config: ModelConfig, request: UniversalAIRequest): Promise<any> {
    const headers = {
      'x-api-key': config.apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    };

    const body = {
      model: config.models[0],
      max_tokens: request.maxTokens || Math.min(config.maxTokens, 4096),
      messages: request.messages || [{ role: 'user', content: request.prompt || '' }]
    };

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Google AI API calls
   */
  private async callGoogle(config: ModelConfig, request: UniversalAIRequest): Promise<any> {
    const url = `${config.endpoint}?key=${config.apiKey}`;
    
    const body = {
      contents: [{
        parts: [{ text: request.prompt || request.messages?.[0]?.content || '' }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Google AI API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Together AI (Llama) API calls
   */
  private async callTogether(config: ModelConfig, request: UniversalAIRequest): Promise<any> {
    const headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    };

    const body = {
      model: config.models[0],
      prompt: request.prompt || request.messages?.map(m => `${m.role}: ${m.content}`).join('\n'),
      max_tokens: request.maxTokens || config.maxTokens,
      temperature: request.temperature || 0.7
    };

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.status} ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Placeholder methods for other providers
   */
  private async callStability(config: ModelConfig, request: UniversalAIRequest): Promise<any> {
    throw new Error('Stability AI implementation pending');
  }

  private async callCohere(config: ModelConfig, request: UniversalAIRequest): Promise<any> {
    throw new Error('Cohere implementation pending');
  }

  private async callPerplexity(config: ModelConfig, request: UniversalAIRequest): Promise<any> {
    throw new Error('Perplexity implementation pending');
  }

  /**
   * Logging utility
   */
  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[UniversalAI] ${message}`);
    }
  }
}

// Export singleton instance
export const universalAI = new UniversalAIClient();

// Convenience functions for common use cases
export async function chat(prompt: string, model?: string): Promise<string> {
  const response = await universalAI.query({
    prompt,
    model,
    taskRequirements: { type: 'chat', complexity: 'medium', budget: 'medium', speed: 'balanced' }
  });

  if (!response.success) {
    throw new Error(response.error);
  }

  return response.data?.choices?.[0]?.message?.content || response.data?.content?.[0]?.text || 'No response';
}

export async function reason(prompt: string, complexity: 'simple' | 'medium' | 'complex' = 'complex'): Promise<string> {
  const response = await universalAI.query({
    prompt,
    taskRequirements: { type: 'reasoning', complexity, budget: 'high', speed: 'quality' }
  });

  if (!response.success) {
    throw new Error(response.error);
  }

  return response.data?.choices?.[0]?.message?.content || response.data?.content?.[0]?.text || 'No response';
}

export async function generateCode(prompt: string): Promise<string> {
  const response = await universalAI.query({
    prompt,
    taskRequirements: { type: 'code', complexity: 'medium', budget: 'medium', speed: 'balanced' }
  });

  if (!response.success) {
    throw new Error(response.error);
  }

  return response.data?.choices?.[0]?.message?.content || response.data?.text || 'No response';
}
