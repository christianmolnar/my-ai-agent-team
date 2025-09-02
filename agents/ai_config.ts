/**
 * Central AI Model Configuration Hub
 * 
 * ARCHITECTURE: Every agent can access every AI model through this central configuration
 * This provides maximum flexibility, redundancy, and intelligent model selection
 */

export interface ModelConfig {
  provider: string;
  apiKey: string;
  endpoint: string;
  models: string[];
  capabilities: string[];
  costTier: 'low' | 'medium' | 'high';
  maxTokens: number;
  supportsStreaming: boolean;
}

export interface ModelSelection {
  primary: string;
  fallback: string[];
  reasoning?: string;
}

// =============================================================================
// CENTRALIZED MODEL REGISTRY
// =============================================================================
// Every agent can access any of these models based on task requirements

export const CENTRAL_AI_REGISTRY: Record<string, ModelConfig> = {
  // OpenAI Models
  'openai-gpt4': {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-4-32k'],
    capabilities: ['chat', 'reasoning', 'code', 'analysis'],
    costTier: 'high',
    maxTokens: 32768,
    supportsStreaming: true
  },
  'openai-gpt35': {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
    capabilities: ['chat', 'general', 'fast'],
    costTier: 'low',
    maxTokens: 16384,
    supportsStreaming: true
  },
  'openai-embeddings': {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1/embeddings',
    models: ['text-embedding-3-large', 'text-embedding-3-small', 'text-embedding-ada-002'],
    capabilities: ['embeddings', 'search', 'similarity'],
    costTier: 'low',
    maxTokens: 8192,
    supportsStreaming: false
  },
  'openai-whisper': {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1/audio/transcriptions',
    models: ['whisper-1'],
    capabilities: ['audio', 'transcription', 'speech-to-text'],
    costTier: 'medium',
    maxTokens: 0,
    supportsStreaming: false
  },
  'openai-tts': {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1/audio/speech',
    models: ['tts-1', 'tts-1-hd'],
    capabilities: ['audio', 'tts', 'text-to-speech'],
    costTier: 'medium',
    maxTokens: 0,
    supportsStreaming: true
  },
  'openai-dalle': {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    endpoint: 'https://api.openai.com/v1/images/generations',
    models: ['dall-e-3', 'dall-e-2'],
    capabilities: ['image', 'generation', 'creative'],
    costTier: 'high',
    maxTokens: 0,
    supportsStreaming: false
  },

  // Anthropic Claude Models
  'anthropic-claude3-opus': {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-opus-20240229'],
    capabilities: ['reasoning', 'analysis', 'complex-tasks', 'strategic'],
    costTier: 'high',
    maxTokens: 200000,
    supportsStreaming: true
  },
  'anthropic-claude3-sonnet': {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-sonnet-20240229'],
    capabilities: ['balanced', 'reasoning', 'creative', 'fast'],
    costTier: 'medium',
    maxTokens: 200000,
    supportsStreaming: true
  },
  'anthropic-claude3-haiku': {
    provider: 'anthropic',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-haiku-20240307'],
    capabilities: ['fast', 'efficient', 'simple-tasks'],
    costTier: 'low',
    maxTokens: 200000,
    supportsStreaming: true
  },

  // Google AI Models
  'google-gemini-pro': {
    provider: 'google',
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
    models: ['gemini-pro'],
    capabilities: ['chat', 'reasoning', 'multimodal'],
    costTier: 'medium',
    maxTokens: 32768,
    supportsStreaming: true
  },
  'google-gemini-vision': {
    provider: 'google',
    apiKey: process.env.GOOGLE_AI_API_KEY || '',
    endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent',
    models: ['gemini-pro-vision'],
    capabilities: ['multimodal', 'vision', 'image-analysis'],
    costTier: 'medium',
    maxTokens: 16384,
    supportsStreaming: false
  },

  // Meta Llama Models (via Together AI)
  'meta-llama-70b': {
    provider: 'together',
    apiKey: process.env.TOGETHER_AI_API_KEY || '',
    endpoint: 'https://api.together.xyz/inference',
    models: ['meta-llama/Llama-2-70b-chat-hf'],
    capabilities: ['chat', 'open-source', 'reasoning'],
    costTier: 'medium',
    maxTokens: 4096,
    supportsStreaming: true
  },
  'meta-codellama-34b': {
    provider: 'together',
    apiKey: process.env.TOGETHER_AI_API_KEY || '',
    endpoint: 'https://api.together.xyz/inference',
    models: ['codellama/CodeLlama-34b-Instruct-hf'],
    capabilities: ['code', 'programming', 'development'],
    costTier: 'medium',
    maxTokens: 16384,
    supportsStreaming: true
  },

  // Specialized Services
  'stability-sdxl': {
    provider: 'stability',
    apiKey: process.env.STABILITY_AI_API_KEY || '',
    endpoint: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    models: ['stable-diffusion-xl-1024-v1-0'],
    capabilities: ['image', 'generation', 'artistic'],
    costTier: 'medium',
    maxTokens: 0,
    supportsStreaming: false
  },
  'cohere-embed': {
    provider: 'cohere',
    apiKey: process.env.COHERE_API_KEY || '',
    endpoint: 'https://api.cohere.ai/v1/embed',
    models: ['embed-english-v3.0'],
    capabilities: ['embeddings', 'multilingual', 'search'],
    costTier: 'low',
    maxTokens: 512,
    supportsStreaming: false
  },
  'perplexity-search': {
    provider: 'perplexity',
    apiKey: process.env.PERPLEXITY_API_KEY || '',
    endpoint: 'https://api.perplexity.ai/chat/completions',
    models: ['pplx-7b-online', 'pplx-70b-online'],
    capabilities: ['search', 'research', 'real-time'],
    costTier: 'medium',
    maxTokens: 4096,
    supportsStreaming: true
  }
};

// =============================================================================
// INTELLIGENT MODEL SELECTION
// =============================================================================

export interface TaskRequirements {
  type: 'chat' | 'reasoning' | 'code' | 'image' | 'audio' | 'search' | 'embeddings';
  complexity: 'simple' | 'medium' | 'complex';
  budget: 'low' | 'medium' | 'high';
  speed: 'fast' | 'balanced' | 'quality';
  capabilities?: string[];
}

/**
 * Intelligent model selection based on task requirements
 */
export function selectOptimalModel(requirements: TaskRequirements): ModelSelection {
  const strategy = process.env.MODEL_SELECTION_STRATEGY || 'balanced';
  const availableModels = Object.entries(CENTRAL_AI_REGISTRY)
    .filter(([_, config]) => config.apiKey && config.capabilities.includes(requirements.type));

  if (availableModels.length === 0) {
    throw new Error(`No available models for task type: ${requirements.type}`);
  }

  // Sort by suitability score
  const rankedModels = availableModels
    .map(([key, config]) => ({
      key,
      config,
      score: calculateSuitabilityScore(config, requirements, strategy)
    }))
    .sort((a, b) => b.score - a.score);

  return {
    primary: rankedModels[0].key,
    fallback: rankedModels.slice(1, 4).map(m => m.key),
    reasoning: `Selected ${rankedModels[0].key} for ${requirements.type} task (complexity: ${requirements.complexity}, strategy: ${strategy})`
  };
}

function calculateSuitabilityScore(
  config: ModelConfig, 
  requirements: TaskRequirements, 
  strategy: string
): number {
  let score = 0;

  // Capability match
  const capabilityMatch = requirements.capabilities?.every(cap => config.capabilities.includes(cap)) ?? true;
  if (capabilityMatch) score += 50;

  // Task type match
  if (config.capabilities.includes(requirements.type)) score += 30;

  // Strategy-based scoring
  switch (strategy) {
    case 'performance':
      if (config.costTier === 'high') score += 20;
      if (config.maxTokens > 32000) score += 10;
      break;
    case 'cost':
      if (config.costTier === 'low') score += 20;
      if (config.costTier === 'medium') score += 10;
      break;
    case 'balanced':
      if (config.costTier === 'medium') score += 15;
      if (config.costTier === 'low') score += 10;
      break;
  }

  // Complexity match
  if (requirements.complexity === 'complex' && config.capabilities.includes('reasoning')) score += 15;
  if (requirements.complexity === 'simple' && config.capabilities.includes('fast')) score += 15;

  // Speed preference
  if (requirements.speed === 'fast' && config.capabilities.includes('fast')) score += 10;

  return score;
}

// =============================================================================
// AGENT-SPECIFIC MODEL ASSIGNMENTS
// =============================================================================
// Every agent can use any model, but these are optimized defaults

export const AGENT_MODEL_PREFERENCES: Record<string, Record<string, ModelSelection>> = {
  // Current Agents
  researcher: {
    search: { primary: 'perplexity-search', fallback: ['openai-gpt4', 'anthropic-claude3-sonnet'] },
    analysis: { primary: 'anthropic-claude3-sonnet', fallback: ['openai-gpt4', 'google-gemini-pro'] },
    summarization: { primary: 'openai-gpt35', fallback: ['anthropic-claude3-haiku'] }
  },
  factChecker: {
    verification: { primary: 'anthropic-claude3-opus', fallback: ['openai-gpt4', 'google-gemini-pro'] },
    search: { primary: 'perplexity-search', fallback: ['openai-gpt4'] }
  },
  vinylResearcher: {
    search: { primary: 'openai-gpt35', fallback: ['perplexity-search'] },
    recommendation: { primary: 'anthropic-claude3-sonnet', fallback: ['openai-gpt4'] }
  },
  imageGenerator: {
    generation: { primary: 'openai-dalle', fallback: ['stability-sdxl'] },
    analysis: { primary: 'google-gemini-vision', fallback: ['openai-gpt4'] }
  },

  // Phase 4 CNS Development Team
  productManager: {
    strategy: { primary: 'anthropic-claude3-opus', fallback: ['openai-gpt4'] },
    analysis: { primary: 'anthropic-claude3-sonnet', fallback: ['google-gemini-pro'] }
  },
  devDesigner: {
    design: { primary: 'openai-gpt4', fallback: ['anthropic-claude3-sonnet'] },
    code: { primary: 'meta-codellama-34b', fallback: ['openai-gpt4'] }
  },
  experienceDesigner: {
    creative: { primary: 'anthropic-claude3-sonnet', fallback: ['openai-gpt4'] },
    user_research: { primary: 'google-gemini-pro', fallback: ['anthropic-claude3-opus'] }
  },
  fullStackDeveloper: {
    coding: { primary: 'meta-codellama-34b', fallback: ['openai-gpt4'] },
    architecture: { primary: 'anthropic-claude3-opus', fallback: ['openai-gpt4'] }
  },
  testExpert: {
    testing: { primary: 'openai-gpt4', fallback: ['anthropic-claude3-sonnet'] },
    analysis: { primary: 'anthropic-claude3-haiku', fallback: ['openai-gpt35'] }
  }
};

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================
// Maintain backward compatibility with existing agent code

export const AI_CONFIG = {
  factCheck: {
    provider: 'google_fact_check_tools',
    apiKey: process.env.GOOGLE_FACT_CHECK_API_KEY || '',
    endpoint: 'https://factchecktools.googleapis.com/v1alpha1/claims:search'
  },
  embeddings: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'text-embedding-3-small',
    endpoint: 'https://api.openai.com/v1/embeddings'
  },
  llm: {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.DEFAULT_FALLBACK_MODEL || 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  serpApi: {
    endpoint: 'https://serpapi.com/search',
    apiKey: process.env.SERPAPI_KEY || ''
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all available models for a specific capability
 */
export function getModelsForCapability(capability: string): string[] {
  return Object.keys(CENTRAL_AI_REGISTRY).filter(key => 
    CENTRAL_AI_REGISTRY[key].capabilities.includes(capability)
  );
}

/**
 * Check if a specific model is available (has API key)
 */
export function isModelAvailable(modelKey: string): boolean {
  const config = CENTRAL_AI_REGISTRY[modelKey];
  return config && !!config.apiKey;
}

/**
 * Get model configuration
 */
export function getModelConfig(modelKey: string): ModelConfig | null {
  return CENTRAL_AI_REGISTRY[modelKey] || null;
}

/**
 * Get available models summary
 */
export function getAvailableModelsSummary(): { total: number; available: number; by_capability: Record<string, number> } {
  const total = Object.keys(CENTRAL_AI_REGISTRY).length;
  const available = Object.values(CENTRAL_AI_REGISTRY).filter(config => !!config.apiKey).length;
  
  const by_capability: Record<string, number> = {};
  Object.values(CENTRAL_AI_REGISTRY).forEach(config => {
    if (config.apiKey) {
      config.capabilities.forEach(cap => {
        by_capability[cap] = (by_capability[cap] || 0) + 1;
      });
    }
  });

  return { total, available, by_capability };
}
