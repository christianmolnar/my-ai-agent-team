/**
 * Centralized API Key Verification System
 * 
 * This utility verifies all API keys in the CENTRAL_AI_REGISTRY
 * and provides comprehensive status information for the multi-model system
 */

import { CENTRAL_AI_REGISTRY, getAvailableModelsSummary, type ModelConfig } from '../agents/ai_config';

interface ApiKeyStatus {
  service: string;
  provider: string;
  configured: boolean;
  valid?: boolean;
  error?: string;
  models?: string[];
  capabilities?: string[];
  costTier?: string;
}

/**
 * Verify OpenAI API key by making a simple request
 */
async function verifyOpenAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const availableModels = data.data?.map((model: any) => model.id) || [];
      return { 
        valid: true, 
        models: availableModels.slice(0, 5) // Show first 5 models
      };
    } else {
      const error = await response.text();
      return { valid: false, error: `HTTP ${response.status}: ${error}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Verify Anthropic API key
 */
async function verifyAnthropic(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Test with a minimal request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });

    if (response.ok || response.status === 400) { // 400 is ok, means API key works but request might be malformed
      return { valid: true };
    } else {
      const error = await response.text();
      return { valid: false, error: `HTTP ${response.status}: ${error}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Verify Google AI API key
 */
async function verifyGoogleAI(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.ok) {
      return { valid: true };
    } else {
      const error = await response.text();
      return { valid: false, error: `HTTP ${response.status}: ${error}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Verify Google Fact Check API key
 */
async function verifyGoogleFactCheck(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${apiKey}&query=test`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.ok) {
      return { valid: true };
    } else {
      const error = await response.text();
      return { valid: false, error: `HTTP ${response.status}: ${error}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Verify SerpAPI key
 */
async function verifySerpAPI(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://serpapi.com/search?engine=google&q=test&api_key=${apiKey}&num=1`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.ok) {
      return { valid: true };
    } else {
      const error = await response.text();
      return { valid: false, error: `HTTP ${response.status}: ${error}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Verify Together AI API key
 */
async function verifyTogetherAI(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.together.xyz/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return { valid: true };
    } else {
      const error = await response.text();
      return { valid: false, error: `HTTP ${response.status}: ${error}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

/**
 * Check all API keys in the central registry
 */
export async function verifyAllApiKeys(): Promise<ApiKeyStatus[]> {
  const results: ApiKeyStatus[] = [];
  
  // Group configs by provider for efficiency
  const providerGroups: Record<string, { key: string; config: ModelConfig }[]> = {};
  
  Object.entries(CENTRAL_AI_REGISTRY).forEach(([key, config]) => {
    if (!providerGroups[config.provider]) {
      providerGroups[config.provider] = [];
    }
    providerGroups[config.provider].push({ key, config });
  });

  // Verify each provider once
  for (const [provider, configs] of Object.entries(providerGroups)) {
    const firstConfig = configs[0].config;
    const apiKey = firstConfig.apiKey;
    
    if (!apiKey) {
      // Add entries for all models of this provider
      configs.forEach(({ key, config }) => {
        results.push({
          service: key,
          provider: config.provider,
          configured: false,
          error: 'API key not configured',
          models: config.models,
          capabilities: config.capabilities,
          costTier: config.costTier
        });
      });
      continue;
    }

    let verificationResult: { valid: boolean; error?: string; models?: string[] };

    try {
      switch (provider) {
        case 'openai':
          verificationResult = await verifyOpenAI(apiKey);
          break;
        case 'anthropic':
          verificationResult = await verifyAnthropic(apiKey);
          break;
        case 'google':
          verificationResult = await verifyGoogleAI(apiKey);
          break;
        case 'together':
          verificationResult = await verifyTogetherAI(apiKey);
          break;
        default:
          verificationResult = { valid: false, error: `Verification not implemented for ${provider}` };
      }
    } catch (error) {
      verificationResult = { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Verification failed' 
      };
    }

    // Add results for all models of this provider
    configs.forEach(({ key, config }) => {
      results.push({
        service: key,
        provider: config.provider,
        configured: true,
        valid: verificationResult.valid,
        error: verificationResult.error,
        models: verificationResult.models || config.models,
        capabilities: config.capabilities,
        costTier: config.costTier
      });
    });
  }

  // Add legacy services
  const legacyServices = [
    {
      name: 'Google Fact Check',
      key: process.env.GOOGLE_FACT_CHECK_API_KEY,
      verify: verifyGoogleFactCheck
    },
    {
      name: 'SerpAPI',
      key: process.env.SERPAPI_KEY,
      verify: verifySerpAPI
    }
  ];

  for (const service of legacyServices) {
    if (!service.key) {
      results.push({
        service: service.name,
        provider: 'legacy',
        configured: false,
        error: 'API key not configured'
      });
    } else {
      try {
        const result = await service.verify(service.key);
        results.push({
          service: service.name,
          provider: 'legacy',
          configured: true,
          valid: result.valid,
          error: result.error
        });
      } catch (error) {
        results.push({
          service: service.name,
          provider: 'legacy',
          configured: true,
          valid: false,
          error: error instanceof Error ? error.message : 'Verification failed'
        });
      }
    }
  }

  return results;
}

/**
 * Get a comprehensive status summary
 */
export function getApiKeysSummary(): { 
  configured: number; 
  total: number; 
  ready: boolean;
  byProvider: Record<string, number>;
  byCapability: Record<string, number>;
} {
  const modelsSummary = getAvailableModelsSummary();
  
  // Count configured providers
  const configuredProviders = new Set();
  Object.values(CENTRAL_AI_REGISTRY).forEach(config => {
    if (config.apiKey) {
      configuredProviders.add(config.provider);
    }
  });

  // Count by provider
  const byProvider: Record<string, number> = {};
  Object.values(CENTRAL_AI_REGISTRY).forEach(config => {
    if (config.apiKey) {
      byProvider[config.provider] = (byProvider[config.provider] || 0) + 1;
    }
  });

  // Check if core functionality is ready
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const ready = hasOpenAI; // Minimum requirement

  return {
    configured: modelsSummary.available,
    total: modelsSummary.total,
    ready,
    byProvider,
    byCapability: modelsSummary.by_capability
  };
}

/**
 * Console logging utility for API key status
 */
export function logApiKeyStatus(): void {
  const summary = getApiKeysSummary();
  
  console.log('🔑 Centralized AI Model Status:', {
    configured: summary.configured,
    total: summary.total,
    ready: summary.ready ? '✅ Ready' : '❌ Missing keys',
    providers: Object.keys(summary.byProvider).join(', '),
    capabilities: Object.keys(summary.byCapability).join(', ')
  });

  if (!summary.ready) {
    console.log('⚠️ Missing required API keys - agents may not function properly');
    console.log('Run ./setup-env.sh to configure your environment');
  } else {
    console.log('✅ Universal AI system ready - agents can access multiple models');
  }
}
