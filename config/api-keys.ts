/**
 * API Key Management System
 * Centralizes all API key configuration for the AI Agent Team
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local and .env files
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

export interface APIKeyConfig {
  provider: string;
  keyName: string;
  required: boolean;
  description: string;
  testEndpoint?: string;
}

export interface APIKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
  groq?: string;
  replicate?: string;
  elevenlabs?: string;
  stability?: string;
  deepl?: string;
  serper?: string;
  browserless?: string;
}

export const API_KEY_CONFIGS: APIKeyConfig[] = [
  {
    provider: 'openai',
    keyName: 'OPENAI_API_KEY',
    required: true,
    description: 'OpenAI API for GPT models',
    testEndpoint: 'https://api.openai.com/v1/models'
  },
  {
    provider: 'anthropic',
    keyName: 'ANTHROPIC_API_KEY',
    required: true,
    description: 'Anthropic API for Claude models',
    testEndpoint: 'https://api.anthropic.com/v1/messages'
  },
  {
    provider: 'google',
    keyName: 'GOOGLE_AI_API_KEY',
    required: false,
    description: 'Google AI API for Gemini models'
  },
  {
    provider: 'groq',
    keyName: 'GROQ_API_KEY',
    required: false,
    description: 'Groq API for fast inference'
  },
  {
    provider: 'replicate',
    keyName: 'REPLICATE_API_TOKEN',
    required: false,
    description: 'Replicate API for various AI models'
  },
  {
    provider: 'elevenlabs',
    keyName: 'ELEVENLABS_API_KEY',
    required: false,
    description: 'ElevenLabs API for voice synthesis'
  },
  {
    provider: 'stability',
    keyName: 'STABILITY_API_KEY',
    required: false,
    description: 'Stability AI API for image generation'
  },
  {
    provider: 'deepl',
    keyName: 'DEEPL_API_KEY',
    required: false,
    description: 'DeepL API for translation services'
  },
  {
    provider: 'serper',
    keyName: 'SERPER_API_KEY',
    required: false,
    description: 'Serper API for search capabilities'
  },
  {
    provider: 'browserless',
    keyName: 'BROWSERLESS_API_KEY',
    required: false,
    description: 'Browserless API for web automation'
  }
];

export class APIKeyManager {
  private keys: APIKeys = {};
  private initialized = false;

  constructor() {
    this.loadAPIKeys();
  }

  private loadAPIKeys(): void {
    try {
      // Load from environment variables - support both .env and .env.local formats
      this.keys = {
        openai: process.env.OPENAI_API_KEY || 
                process.env.MASTER_ORCHESTRATOR_OPENAI_API_KEY ||
                process.env.FRONT_END_DEVELOPER_OPENAI_API_KEY ||
                process.env.BACK_END_DEVELOPER_OPENAI_API_KEY ||
                process.env.COMMUNICATIONS_OPENAI_API_KEY,
        anthropic: process.env.ANTHROPIC_API_KEY || 
                  process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY ||
                  process.env.FRONT_END_DEVELOPER_ANTHROPIC_API_KEY ||
                  process.env.BACK_END_DEVELOPER_ANTHROPIC_API_KEY ||
                  process.env.COMMUNICATIONS_ANTHROPIC_API_KEY,
        google: process.env.GOOGLE_AI_API_KEY || 
                process.env.RESEARCHER_GOOGLE_AI_API_KEY,
        groq: process.env.GROQ_API_KEY,
        replicate: process.env.REPLICATE_API_TOKEN,
        elevenlabs: process.env.ELEVENLABS_API_KEY || 
                   process.env.MUSIC_COACH_ELEVENLABS_API_KEY,
        stability: process.env.STABILITY_API_KEY,
        deepl: process.env.DEEPL_API_KEY,
        serper: process.env.SERPER_API_KEY || 
                process.env.SERPAPI_KEY,
        browserless: process.env.BROWSERLESS_API_KEY
      };

      // Remove undefined values
      Object.keys(this.keys).forEach(key => {
        if (!this.keys[key as keyof APIKeys]) {
          delete this.keys[key as keyof APIKeys];
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to load API keys:', error);
      this.initialized = false;
    }
  }

  public getKey(provider: string): string | undefined {
    if (!this.initialized) {
      this.loadAPIKeys();
    }
    return this.keys[provider as keyof APIKeys];
  }

  public hasKey(provider: string): boolean {
    return !!this.getKey(provider);
  }

  public getAvailableProviders(): string[] {
    return Object.keys(this.keys);
  }

  public getMissingRequiredKeys(): string[] {
    const missing: string[] = [];
    for (const config of API_KEY_CONFIGS) {
      if (config.required && !this.hasKey(config.provider)) {
        missing.push(config.provider);
      }
    }
    return missing;
  }

  public getConfigurationStatus(): { [provider: string]: boolean } {
    const status: { [provider: string]: boolean } = {};
    for (const config of API_KEY_CONFIGS) {
      status[config.provider] = this.hasKey(config.provider);
    }
    return status;
  }

  public validateConfiguration(): { valid: boolean; missing: string[]; available: string[] } {
    const missing = this.getMissingRequiredKeys();
    const available = this.getAvailableProviders();
    
    return {
      valid: missing.length === 0,
      missing,
      available
    };
  }

  // Test API key validity (basic check)
  public async testAPIKey(provider: string): Promise<boolean> {
    const key = this.getKey(provider);
    if (!key) return false;

    const config = API_KEY_CONFIGS.find(c => c.provider === provider);
    if (!config?.testEndpoint) return true; // Can't test, assume valid

    try {
      // Basic HTTP test (would need actual implementation per provider)
      return true; // Placeholder - implement actual testing
    } catch (error) {
      console.error(`API key test failed for ${provider}:`, error);
      return false;
    }
  }
}

// Global instance
export const apiKeyManager = new APIKeyManager();
