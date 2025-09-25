// This is my central config for AI/NLP/fact-checking providers and models
// I update this file to change providers, API keys, or model names in one place
// If I want to add a new provider, I add a new section below and update my agent logic to use it.

import { universalAIClient } from '../lib/universal-ai-client';

export const AI_CONFIG = {
  // Fact-checking API provider (Google Fact Check Tools by default)
  factCheck: {
    provider: 'google_fact_check_tools', // or 'other_provider_name'
    apiKey: process.env.GOOGLE_FACT_CHECK_API_KEY || '',
    endpoint: 'https://factchecktools.googleapis.com/v1alpha1/claims:search',
    // I'll add more config fields here as I need them
  },
  // Embedding/NLP provider (OpenAI by default)
  embeddings: {
    provider: 'openai', // or 'cohere', 'azure_openai', etc.
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'text-embedding-3-small', // or 'text-embedding-ada-002', etc.
    endpoint: 'https://api.openai.com/v1/embeddings',
    // I'll add more config fields here as I need them
  },
  // Universal LLM client - automatically selects best provider with failover
  llm: {
    // Use the universal client instead of hardcoded providers
    generateResponse: universalAIClient.generateResponse.bind(universalAIClient),
    // Legacy fields for backward compatibility (will use UniversalAIClient)
    provider: 'universal', // Indicates multi-provider support
    apiKey: 'managed-by-universal-client',
    model: 'auto-selected',
    endpoint: 'universal-failover-system'
  },
  serpApi: {
    endpoint: 'https://serpapi.com/search',
    apiKey: process.env.SERPAPI_KEY || '',
  },
};

// Backward compatibility helper for agents still using direct API calls
export async function generateLLMResponse(
  agentId: string, 
  messages: any[], 
  systemPrompt?: string
): Promise<string> {
  const response = await universalAIClient.generateResponse(agentId, messages, systemPrompt);
  return response.content;
}

// Usage example:
// import { AI_CONFIG, generateLLMResponse } from './ai_config';
// const response = await generateLLMResponse('researcher', messages, systemPrompt);
// If you want to swap providers, the universal client handles that automatically with failover.
