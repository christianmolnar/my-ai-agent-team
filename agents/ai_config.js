"use strict";
// This is my central config for AI/NLP/fact-checking providers and models
// I update this file to change providers, API keys, or model names in one place
// If I want to add a new provider, I add a new section below and update my agent logic to use it.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_CONFIG = void 0;
exports.AI_CONFIG = {
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
    // LLM provider for synthesis (OpenAI Chat Completions)
    llm: {
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
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
