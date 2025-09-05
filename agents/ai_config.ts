// This is my central config for AI/NLP/fact-checking providers and models
// Updated to use PersonalAssistantBridge for secure API access
// If I want to add a new provider, I add a new section below and update my agent logic to use it.

export const AI_CONFIG = {
  // Fact-checking API provider (Google Fact Check Tools by default)
  factCheck: {
    provider: 'google_fact_check_tools', // or 'other_provider_name'
    apiKey: 'BRIDGE_ACCESS', // Now accessed through PersonalAssistantBridge
    endpoint: 'https://factchecktools.googleapis.com/v1alpha1/claims:search',
    // I'll add more config fields here as I need them
  },
  // Embedding/NLP provider (OpenAI by default)
  embeddings: {
    provider: 'openai', // or 'cohere', 'azure_openai', etc.
    apiKey: 'BRIDGE_ACCESS', // Now accessed through PersonalAssistantBridge
    model: 'text-embedding-3-small', // or 'text-embedding-ada-002', etc.
    endpoint: 'https://api.openai.com/v1/embeddings',
    // I'll add more config fields here as I need them
  },
  // LLM provider for synthesis (OpenAI Chat Completions)
  llm: {
    provider: 'openai',
    apiKey: 'BRIDGE_ACCESS', // Now accessed through PersonalAssistantBridge
    model: 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    // I'll add more config fields here as I need them
  },
  serpApi: {
    endpoint: 'https://serpapi.com/search',
    apiKey: process.env.SERPAPI_KEY || '',
  },
};

// Usage example:
// import { AI_CONFIG } from './ai_config';
// fetch(AI_CONFIG.factCheck.endpoint, { headers: { 'Authorization': ... } })
// If I want to swap providers, I just change the provider/model/apiKey/endpoint above.
