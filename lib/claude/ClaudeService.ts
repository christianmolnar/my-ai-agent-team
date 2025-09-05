import Anthropic from '@anthropic-ai/sdk';
import { Agent, AgentTask, AgentTaskResult } from '../../agents/Agent';

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
}

export class ClaudeService {
  private client: Anthropic;
  private config: ClaudeConfig;
  
  constructor(config: ClaudeConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: config.maxRetries,
      timeout: config.timeout
    });
  }

  async generateResponse(
    messages: Anthropic.MessageParam[],
    systemPrompt?: string,
    tools?: Anthropic.Tool[]
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages,
        system: systemPrompt,
        tools: tools || undefined
      });

      return response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : 'No text response received';
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Claude API request failed: ${error}`);
    }
  }

  async streamResponse(
    messages: Anthropic.MessageParam[],
    systemPrompt?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      const stream = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages,
        system: systemPrompt,
        stream: true
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const text = chunk.delta.text;
          fullResponse += text;
          onChunk?.(text);
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Claude Streaming Error:', error);
      throw new Error(`Claude streaming request failed: ${error}`);
    }
  }

  async generateResponseWithTools(
    messages: Anthropic.MessageParam[],
    tools: Anthropic.Tool[],
    systemPrompt?: string
  ): Promise<{ response: string; toolCalls: any[] }> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages,
        system: systemPrompt,
        tools
      });

      const toolCalls: any[] = [];
      let textResponse = '';

      for (const content of response.content) {
        if (content.type === 'text') {
          textResponse += content.text;
        } else if (content.type === 'tool_use') {
          toolCalls.push({
            id: content.id,
            name: content.name,
            input: content.input
          });
        }
      }

      return {
        response: textResponse,
        toolCalls
      };
    } catch (error) {
      console.error('Claude Tool Response Error:', error);
      throw new Error(`Claude tool response failed: ${error}`);
    }
  }

  // Helper method to validate configuration
  static validateConfig(config: ClaudeConfig): boolean {
    if (!config.apiKey || !config.apiKey.startsWith('sk-ant-')) {
      throw new Error('Invalid Anthropic API key format');
    }
    if (!config.model) {
      throw new Error('Model must be specified');
    }
    if (config.maxTokens <= 0 || config.maxTokens > 8192) {
      throw new Error('Max tokens must be between 1 and 8192');
    }
    return true;
  }

  // Get current model information
  getModelInfo(): { model: string; maxTokens: number; temperature: number } {
    return {
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    };
  }
}
