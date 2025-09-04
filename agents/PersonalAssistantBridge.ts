/**
 * Personal Assistant Bridge - Secure API Gateway
 * 
 * This bridge provides secure access to all API keys and sensitive operations
 * by acting as a controlled gateway between the public AI Agent Team and the
 * private repository containing sensitive credentials and data.
 * 
 * Architecture:
 * - All API calls flow through this bridge
 * - No direct API key access for public agents
 * - Complete audit logging and security validation
 * - Rate limiting and request validation
 * - Secure communication with private repository
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface BridgeRequest {
  api: string;
  params: any;
  agent: string;
  timestamp: number;
  requestId: string;
}

interface BridgeResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId: string;
  timestamp: number;
  cached?: boolean;
}

interface APIConfig {
  name: string;
  requiredParams: string[];
  rateLimitPerMinute: number;
  authorizedAgents: string[];
  securityLevel: 'public' | 'restricted' | 'confidential';
}

class PersonalAssistantBridge {
  private static instance: PersonalAssistantBridge;
  private privateRepoPath: string;
  private requestLog: Map<string, BridgeRequest> = new Map();
  private rateLimitTracker: Map<string, number[]> = new Map();
  private secureKeys: Map<string, string> = new Map();
  
  // API Configuration Registry
  private apiConfigs: Map<string, APIConfig> = new Map([
    ['openai-gpt4', {
      name: 'OpenAI GPT-4',
      requiredParams: ['messages'],
      rateLimitPerMinute: 60,
      authorizedAgents: ['all'],
      securityLevel: 'restricted'
    }],
    ['openai-dalle', {
      name: 'OpenAI DALL-E',
      requiredParams: ['prompt'],
      rateLimitPerMinute: 20,
      authorizedAgents: ['image-video-generator', 'personal-assistant'],
      securityLevel: 'restricted'
    }],
    ['anthropic-claude', {
      name: 'Anthropic Claude',
      requiredParams: ['messages'],
      rateLimitPerMinute: 40,
      authorizedAgents: ['all'],
      securityLevel: 'restricted'
    }],
    ['google-search', {
      name: 'Google Search API',
      requiredParams: ['query'],
      rateLimitPerMinute: 100,
      authorizedAgents: ['researcher', 'fact-checker'],
      securityLevel: 'public'
    }],
    ['gmail-api', {
      name: 'Gmail API',
      requiredParams: ['operation'],
      rateLimitPerMinute: 30,
      authorizedAgents: ['communications', 'personal-assistant'],
      securityLevel: 'confidential'
    }]
  ]);

  private constructor() {
    this.privateRepoPath = process.env.PRIVATE_REPO_PATH || '/Users/christian/Repos/my-personal-assistant-private';
    this.initializeSecureKeys();
  }

  public static getInstance(): PersonalAssistantBridge {
    if (!PersonalAssistantBridge.instance) {
      PersonalAssistantBridge.instance = new PersonalAssistantBridge();
    }
    return PersonalAssistantBridge.instance;
  }

  /**
   * Initialize secure key loading from private repository
   */
  private async initializeSecureKeys(): Promise<void> {
    try {
      const envPath = path.join(this.privateRepoPath, '.env.local');
      
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
          if (line.includes('=') && !line.startsWith('#')) {
            const [key, value] = line.split('=', 2);
            if (key && value) {
              this.secureKeys.set(key.trim(), value.trim());
            }
          }
        }
        
        console.log(`🔐 Loaded ${this.secureKeys.size} secure API keys from private repository`);
      } else {
        console.warn('⚠️  Private repository .env.local not found - bridge operating in demo mode');
      }
    } catch (error) {
      console.error('❌ Failed to load secure keys:', error);
    }
  }

  /**
   * Main entry point for all API requests
   */
  public async requestAPIAccess(api: string, params: any, agent: string): Promise<BridgeResponse> {
    const requestId = this.generateRequestId();
    const timestamp = Date.now();
    
    // Create request record
    const request: BridgeRequest = {
      api,
      params: this.sanitizeParams(params),
      agent,
      timestamp,
      requestId
    };
    
    try {
      // Log request
      this.logRequest(request);
      
      // Validate request
      const validation = await this.validateRequest(request);
      if (!validation.valid) {
        return this.createErrorResponse(requestId, validation.error!, timestamp);
      }
      
      // Check rate limits
      if (!this.checkRateLimit(agent, api)) {
        return this.createErrorResponse(requestId, 'Rate limit exceeded', timestamp);
      }
      
      // Process API request
      const response = await this.processAPIRequest(request);
      
      // Log response
      this.logResponse(requestId, response);
      
      return response;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Bridge request failed for ${requestId}:`, errorMessage);
      return this.createErrorResponse(requestId, errorMessage, timestamp);
    }
  }

  /**
   * Validate incoming request
   */
  private async validateRequest(request: BridgeRequest): Promise<{valid: boolean, error?: string}> {
    const config = this.apiConfigs.get(request.api);
    
    if (!config) {
      return { valid: false, error: `Unknown API: ${request.api}` };
    }
    
    // Check agent authorization
    if (!config.authorizedAgents.includes('all') && !config.authorizedAgents.includes(request.agent)) {
      return { valid: false, error: `Agent ${request.agent} not authorized for ${request.api}` };
    }
    
    // Check required parameters
    for (const param of config.requiredParams) {
      if (!(param in request.params)) {
        return { valid: false, error: `Missing required parameter: ${param}` };
      }
    }
    
    // Security level validation
    if (config.securityLevel === 'confidential') {
      const isAuthorized = await this.validateConfidentialAccess(request.agent, request.api);
      if (!isAuthorized) {
        return { valid: false, error: 'Insufficient security clearance for confidential API' };
      }
    }
    
    return { valid: true };
  }

  /**
   * Process the actual API request
   */
  private async processAPIRequest(request: BridgeRequest): Promise<BridgeResponse> {
    const timestamp = Date.now();
    
    try {
      switch (request.api) {
        case 'openai-gpt4':
          return await this.processOpenAIRequest(request, timestamp);
        
        case 'openai-dalle':
          return await this.processDALLERequest(request, timestamp);
        
        case 'anthropic-claude':
          return await this.processAnthropicRequest(request, timestamp);
        
        case 'google-search':
          return await this.processGoogleSearchRequest(request, timestamp);
        
        case 'gmail-api':
          return await this.processGmailRequest(request, timestamp);
        
        default:
          return this.createErrorResponse(request.requestId, `API handler not implemented: ${request.api}`, timestamp);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API processing failed';
      return this.createErrorResponse(request.requestId, errorMessage, timestamp);
    }
  }

  /**
   * OpenAI GPT-4 Request Handler
   */
  private async processOpenAIRequest(request: BridgeRequest, timestamp: number): Promise<BridgeResponse> {
    const apiKey = this.secureKeys.get('OPENAI_API_KEY');
    if (!apiKey) {
      return this.createErrorResponse(request.requestId, 'OpenAI API key not available', timestamp);
    }

    // In a real implementation, this would make the actual API call
    // For now, returning a mock response structure
    return {
      success: true,
      data: {
        response: 'Mock GPT-4 response - Bridge is working correctly',
        model: 'gpt-4-1106-preview',
        usage: { tokens: 150 }
      },
      requestId: request.requestId,
      timestamp
    };
  }

  /**
   * DALL-E Request Handler
   */
  private async processDALLERequest(request: BridgeRequest, timestamp: number): Promise<BridgeResponse> {
    const apiKey = this.secureKeys.get('OPENAI_API_KEY');
    if (!apiKey) {
      return this.createErrorResponse(request.requestId, 'OpenAI API key not available', timestamp);
    }

    return {
      success: true,
      data: {
        imageUrl: 'https://example.com/generated-image.png',
        prompt: request.params.prompt,
        size: request.params.size || '1024x1024'
      },
      requestId: request.requestId,
      timestamp
    };
  }

  /**
   * Anthropic Claude Request Handler
   */
  private async processAnthropicRequest(request: BridgeRequest, timestamp: number): Promise<BridgeResponse> {
    const apiKey = this.secureKeys.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return this.createErrorResponse(request.requestId, 'Anthropic API key not available', timestamp);
    }

    return {
      success: true,
      data: {
        response: 'Mock Claude response - Bridge is working correctly',
        model: 'claude-3-sonnet-20240229',
        usage: { tokens: 120 }
      },
      requestId: request.requestId,
      timestamp
    };
  }

  /**
   * Google Search Request Handler
   */
  private async processGoogleSearchRequest(request: BridgeRequest, timestamp: number): Promise<BridgeResponse> {
    const apiKey = this.secureKeys.get('GOOGLE_API_KEY');
    const searchEngineId = this.secureKeys.get('GOOGLE_SEARCH_ENGINE_ID');
    
    if (!apiKey || !searchEngineId) {
      return this.createErrorResponse(request.requestId, 'Google Search API credentials not available', timestamp);
    }

    return {
      success: true,
      data: {
        results: [
          {
            title: 'Mock Search Result 1',
            url: 'https://example.com/result1',
            snippet: 'This is a mock search result for: ' + request.params.query
          }
        ],
        query: request.params.query,
        totalResults: 1
      },
      requestId: request.requestId,
      timestamp
    };
  }

  /**
   * Gmail API Request Handler
   */
  private async processGmailRequest(request: BridgeRequest, timestamp: number): Promise<BridgeResponse> {
    const clientId = this.secureKeys.get('GMAIL_CLIENT_ID');
    const clientSecret = this.secureKeys.get('GMAIL_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      return this.createErrorResponse(request.requestId, 'Gmail API credentials not available', timestamp);
    }

    return {
      success: true,
      data: {
        operation: request.params.operation,
        status: 'completed',
        messageId: 'mock-message-' + request.requestId
      },
      requestId: request.requestId,
      timestamp
    };
  }

  /**
   * Check rate limits for agent/API combination
   */
  private checkRateLimit(agent: string, api: string): boolean {
    const key = `${agent}:${api}`;
    const now = Date.now();
    const minute = 60 * 1000;
    
    if (!this.rateLimitTracker.has(key)) {
      this.rateLimitTracker.set(key, []);
    }
    
    const requests = this.rateLimitTracker.get(key)!;
    const recentRequests = requests.filter(timestamp => now - timestamp < minute);
    
    const config = this.apiConfigs.get(api);
    if (!config) return false;
    
    if (recentRequests.length >= config.rateLimitPerMinute) {
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimitTracker.set(key, recentRequests);
    
    return true;
  }

  /**
   * Validate confidential access
   */
  private async validateConfidentialAccess(agent: string, api: string): Promise<boolean> {
    // In a real implementation, this would check enterprise security policies
    const confidentialAgents = ['personal-assistant', 'communications', 'security-expert'];
    return confidentialAgents.includes(agent);
  }

  /**
   * Utility methods
   */
  private generateRequestId(): string {
    return 'req_' + crypto.randomBytes(16).toString('hex');
  }

  private sanitizeParams(params: any): any {
    // Remove any sensitive data from params before logging
    const sanitized = { ...params };
    delete sanitized.apiKey;
    delete sanitized.token;
    delete sanitized.password;
    return sanitized;
  }

  private logRequest(request: BridgeRequest): void {
    this.requestLog.set(request.requestId, request);
    console.log(`🌉 Bridge Request: ${request.agent} → ${request.api} (${request.requestId})`);
  }

  private logResponse(requestId: string, response: BridgeResponse): void {
    console.log(`🔄 Bridge Response: ${requestId} → ${response.success ? '✅ Success' : '❌ Error'}`);
  }

  private createErrorResponse(requestId: string, error: string, timestamp: number): BridgeResponse {
    return {
      success: false,
      error,
      requestId,
      timestamp
    };
  }

  /**
   * Health check endpoint
   */
  public async healthCheck(): Promise<{status: string, keysLoaded: number, uptime: number}> {
    return {
      status: 'healthy',
      keysLoaded: this.secureKeys.size,
      uptime: process.uptime()
    };
  }

  /**
   * Get bridge statistics
   */
  public getStats(): {totalRequests: number, activeRateLimits: number} {
    return {
      totalRequests: this.requestLog.size,
      activeRateLimits: this.rateLimitTracker.size
    };
  }
}

// Export singleton instance
export default PersonalAssistantBridge.getInstance();

// Export types for use by other agents
export type { BridgeRequest, BridgeResponse, APIConfig };
