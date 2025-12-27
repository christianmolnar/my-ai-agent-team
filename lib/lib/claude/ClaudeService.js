"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeService = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class ClaudeService {
    constructor(config) {
        this.config = config;
        this.isMock = config.apiKey.includes('mock-development-key');
        if (this.isMock) {
            // Don't create real Anthropic client for mock services
            this.client = null;
        }
        else {
            this.client = new sdk_1.default({
                apiKey: config.apiKey,
                maxRetries: config.maxRetries,
                timeout: config.timeout
            });
        }
    }
    async generateResponse(messages, systemPrompt, tools) {
        // If this is a mock service, the generateResponse will be overridden by the factory
        if (this.isMock || !this.client) {
            throw new Error('Mock service should have generateResponse overridden');
        }
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
        }
        catch (error) {
            console.error('Claude API Error:', error);
            throw new Error(`Claude API request failed: ${error}`);
        }
    }
    async streamResponse(messages, systemPrompt, onChunk) {
        if (this.isMock || !this.client) {
            throw new Error('Mock service does not support streaming');
        }
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
        }
        catch (error) {
            console.error('Claude Streaming Error:', error);
            throw new Error(`Claude streaming request failed: ${error}`);
        }
    }
    async generateResponseWithTools(messages, tools, systemPrompt) {
        if (this.isMock || !this.client) {
            throw new Error('Mock service does not support tools');
        }
        try {
            const response = await this.client.messages.create({
                model: this.config.model,
                max_tokens: this.config.maxTokens,
                temperature: this.config.temperature,
                messages,
                system: systemPrompt,
                tools
            });
            const toolCalls = [];
            let textResponse = '';
            for (const content of response.content) {
                if (content.type === 'text') {
                    textResponse += content.text;
                }
                else if (content.type === 'tool_use') {
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
        }
        catch (error) {
            console.error('Claude Tool Response Error:', error);
            throw new Error(`Claude tool response failed: ${error}`);
        }
    }
    // Helper method to validate configuration
    static validateConfig(config) {
        // Allow mock keys for development
        if (config.apiKey.includes('mock-development-key')) {
            return true;
        }
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
    getModelInfo() {
        return {
            model: this.config.model,
            maxTokens: this.config.maxTokens,
            temperature: this.config.temperature
        };
    }
}
exports.ClaudeService = ClaudeService;
