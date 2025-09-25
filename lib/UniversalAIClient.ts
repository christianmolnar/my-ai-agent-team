import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';

export interface AIProvider {
  name: string;
  priority: number;
  isAvailable: boolean;
}

export class UniversalAIClient {
  private providers: Map<string, any> = new Map();
  private providerPriority: string[] = ['openai', 'anthropic', 'google'];
  
  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    console.log('🔧 Initializing AI providers...');
    
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      console.log('✅ OpenAI API key found, initializing provider');
      this.providers.set('openai', new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      }));
    } else {
      console.log('❌ OpenAI API key not found');
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('✅ Anthropic API key found, initializing provider');
      this.providers.set('anthropic', new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      }));
    } else {
      console.log('❌ Anthropic API key not found');
    }

    console.log(`🔧 Initialized ${this.providers.size} providers:`, Array.from(this.providers.keys()));
  }

  async generateResponse(prompt: string, agentId: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (const providerName of this.providerPriority) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 [${agentId}] Trying ${providerName} (attempt ${attempt})...`);
          
          const response = await this.callProvider(provider, providerName, prompt);
          
          console.log(`✅ [${agentId}] ${providerName} succeeded`);
          return response;

        } catch (error) {
          lastError = error as Error;
          console.error(`❌ [${agentId}] ${providerName} attempt ${attempt} failed:`, error.message);
          
          if (attempt < maxRetries) {
            await this.delay(1000 * attempt); // Exponential backoff
          }
        }
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  private async callProvider(provider: any, providerName: string, prompt: string): Promise<string> {
    switch (providerName) {
      case 'openai':
        return await this.callOpenAI(provider, prompt);
      
      case 'anthropic':
        return await this.callAnthropic(provider, prompt);
      
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  private async callOpenAI(openai: OpenAI, prompt: string): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'No response generated';
  }

  private async callAnthropic(anthropic: Anthropic, prompt: string): Promise<string> {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    return 'No response generated';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAvailableProviders(): AIProvider[] {
    return this.providerPriority.map(name => ({
      name,
      priority: this.providerPriority.indexOf(name),
      isAvailable: this.providers.has(name)
    }));
  }
}
