import { NextResponse } from 'next/server';

interface ApiVerificationResult {
  provider: string;
  configured: boolean;
  status: 'valid' | 'invalid' | 'rate_limited' | 'network_error' | 'unknown_error' | 'not_verified';
  error?: string;
  models?: string[];
  envVar?: string;
  keyValue?: string;
}

// Helper function to classify error status
function classifyVerificationResult(result: { valid: boolean; error?: string }): 'valid' | 'invalid' | 'rate_limited' | 'network_error' | 'unknown_error' {
  if (result.valid) return 'valid';
  
  if (result.error) {
    const errorLower = result.error.toLowerCase();
    
    // Rate limiting
    if (errorLower.includes('429') || errorLower.includes('rate limit') || errorLower.includes('too many requests')) {
      return 'rate_limited';
    }
    
    // Invalid API key / Authentication errors
    if (errorLower.includes('401') || errorLower.includes('403') || errorLower.includes('invalid api key') || errorLower.includes('unauthorized')) {
      return 'invalid';
    }
    
    // Network/Service errors
    if (errorLower.includes('500') || errorLower.includes('502') || errorLower.includes('503') || errorLower.includes('504') ||
        errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('connection') ||
        errorLower.includes('service unavailable') || errorLower.includes('bad gateway')) {
      return 'network_error';
    }
  }
  
  return 'unknown_error';
}

// Helper function to verify OpenAI API
async function verifyOpenAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        valid: true, 
        models: data.data?.slice(0, 5).map((m: any) => m.id) || []
      };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper function to verify Anthropic API
async function verifyAnthropic(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      }),
    });

    // Anthropic returns 400 for incomplete requests, but 401/403 for auth issues
    if (response.status === 400) {
      return { valid: true }; // API key is valid, just a bad request
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else if (response.ok) {
      return { valid: true };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper function to verify Google AI API
async function verifyGoogleAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    
    if (response.ok) {
      return { valid: true };
    } else if (response.status === 400 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper function to verify Perplexity API
async function verifyPerplexity(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
    });

    if (response.ok || response.status === 400) {
      return { valid: true };
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper function to verify Stability AI API
async function verifyStabilityAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch('https://api.stability.ai/v1/user/account', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper function to verify Together AI API
async function verifyTogetherAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch('https://api.together.xyz/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper function to verify Cohere API
async function verifyCohere(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch('https://api.cohere.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { valid: true };
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper function to verify SerpAPI
async function verifySerpAPI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch(`https://serpapi.com/search?q=test&api_key=${apiKey}&engine=google`);
    
    if (response.ok) {
      const data = await response.json();
      // SerpAPI returns search results, check if it's valid
      if (data.search_metadata && data.search_metadata.status === 'Success') {
        return { valid: true };
      } else if (data.error) {
        return { valid: false, error: data.error };
      } else {
        return { valid: true }; // Assume valid if no explicit error
      }
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API key' };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Helper function to verify Discogs API
async function verifyDiscogs(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
  try {
    const response = await fetch('https://api.discogs.com/database/search?q=test&type=release', {
      headers: {
        'Authorization': `Discogs token=${apiKey}`,
        'User-Agent': 'MyAIAgentTeam/1.0',
      },
    });

    if (response.ok) {
      return { valid: true };
    } else if (response.status === 401 || response.status === 403) {
      return { valid: false, error: 'Invalid API token' };
    } else {
      return { valid: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

export async function GET() {
  try {
    const results: ApiVerificationResult[] = [];

    // Get all environment variables that might contain API keys
    const envVars = process.env;
    
    // Debug: Log available environment variables (without values for security)
    console.log('Available env vars with API_KEY:', Object.keys(envVars).filter(key => key.includes('API_KEY')));
    
    // Define provider mappings
    const providerChecks = [
      {
        provider: 'openai',
        envKeys: Object.keys(envVars).filter(key => key.includes('OPENAI_API_KEY')),
        verifyFn: verifyOpenAI
      },
      {
        provider: 'anthropic',
        envKeys: Object.keys(envVars).filter(key => key.includes('ANTHROPIC_API_KEY')),
        verifyFn: verifyAnthropic
      },
      {
        provider: 'google',
        envKeys: Object.keys(envVars).filter(key => key.includes('GOOGLE_AI_API_KEY')),
        verifyFn: verifyGoogleAI
      },
      {
        provider: 'perplexity',
        envKeys: Object.keys(envVars).filter(key => key.includes('PERPLEXITY_API_KEY')),
        verifyFn: verifyPerplexity
      },
      {
        provider: 'stability',
        envKeys: Object.keys(envVars).filter(key => key.includes('STABILITY_API_KEY')),
        verifyFn: verifyStabilityAI
      },
      {
        provider: 'together',
        envKeys: Object.keys(envVars).filter(key => key.includes('TOGETHER_API_KEY')),
        verifyFn: verifyTogetherAI
      },
      {
        provider: 'cohere',
        envKeys: Object.keys(envVars).filter(key => key.includes('COHERE_API_KEY')),
        verifyFn: verifyCohere
      },
      {
        provider: 'serpapi',
        envKeys: Object.keys(envVars).filter(key => key.includes('SERPAPI_KEY')),
        verifyFn: verifySerpAPI
      },
      {
        provider: 'discogs',
        envKeys: Object.keys(envVars).filter(key => key.includes('DISCOGS_TOKEN')),
        verifyFn: verifyDiscogs
      }
    ];

    // Check each provider
    for (const { provider, envKeys, verifyFn } of providerChecks) {
      if (envKeys.length > 0) {
        // Use the first available key for this provider
        const apiKey = envVars[envKeys[0]];
        if (apiKey && apiKey.trim() !== '') {
          console.log(`Checking ${provider} API with key: ${apiKey.substring(0, 10)}...`);
          const verification = await verifyFn(apiKey);
          const status = classifyVerificationResult(verification);
          results.push({
            provider,
            configured: true,
            status,
            error: verification.error,
            ...(verification.models && { models: verification.models })
          });
        } else {
          results.push({
            provider,
            configured: false,
            status: 'not_verified'
          });
        }
      } else {
        results.push({
          provider,
          configured: false,
          status: 'not_verified'
        });
      }
    }

    return NextResponse.json({
      success: true,
      statuses: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        statuses: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const providedKeys = body || {};
    
    // Combine environment variables with provided keys (provided keys take precedence)
    const allKeys = { ...process.env, ...providedKeys };
    
    const results: ApiVerificationResult[] = [];
    
    // Define provider mappings with verification functions
    const providerMappings = [
      { pattern: /OPENAI_API_KEY/, provider: 'openai', verifyFn: verifyOpenAI },
      { pattern: /ANTHROPIC_API_KEY/, provider: 'anthropic', verifyFn: verifyAnthropic },
      { pattern: /GOOGLE_AI_API_KEY/, provider: 'google', verifyFn: verifyGoogleAI },
      { pattern: /PERPLEXITY_API_KEY/, provider: 'perplexity', verifyFn: verifyPerplexity },
      { pattern: /STABILITY_API_KEY/, provider: 'stability', verifyFn: verifyStabilityAI },
      { pattern: /TOGETHER_API_KEY/, provider: 'together', verifyFn: verifyTogetherAI },
      { pattern: /COHERE_API_KEY/, provider: 'cohere', verifyFn: verifyCohere },
      { pattern: /SERPAPI_KEY/, provider: 'serpapi', verifyFn: verifySerpAPI },
      { pattern: /DISCOGS_TOKEN/, provider: 'discogs', verifyFn: verifyDiscogs },
      // Add support for other services
      { pattern: /ELEVENLABS_API_KEY/, provider: 'elevenlabs', verifyFn: async (key: string) => ({ valid: true }) }, // Placeholder
      { pattern: /HUGGINGFACE_API_KEY/, provider: 'huggingface', verifyFn: async (key: string) => ({ valid: true }) }, // Placeholder
      { pattern: /NOTION_API_KEY/, provider: 'notion', verifyFn: async (key: string) => ({ valid: true }) }, // Placeholder
      { pattern: /SLACK_API_KEY/, provider: 'slack', verifyFn: async (key: string) => ({ valid: true }) }, // Placeholder
      { pattern: /RESEND_API_KEY/, provider: 'resend', verifyFn: async (key: string) => ({ valid: true }) }, // Placeholder
      { pattern: /FIGMA_API_KEY/, provider: 'figma', verifyFn: async (key: string) => ({ valid: true }) }, // Placeholder
      { pattern: /DATADOG_API_KEY/, provider: 'datadog', verifyFn: async (key: string) => ({ valid: true }) } // Placeholder
    ];

    // Check every API key in the environment
    for (const [envVar, apiKey] of Object.entries(allKeys)) {
      // Only process keys that look like API keys and have values
      if ((envVar.includes('API_KEY') || envVar.includes('_TOKEN') || envVar.includes('_KEY')) && 
          apiKey && 
          typeof apiKey === 'string' && 
          apiKey.trim() !== '' &&
          !apiKey.startsWith('#') && // Skip commented keys
          envVar !== 'NODE_ENV') {
        
        // Find the appropriate provider mapping
        const mapping = providerMappings.find(m => m.pattern.test(envVar));
        
        if (mapping) {
          console.log(`Checking ${envVar} with ${mapping.provider}...`);
          
          try {
            const verification = await mapping.verifyFn(apiKey);
            const status = classifyVerificationResult(verification);
            results.push({
              envVar,
              provider: mapping.provider,
              configured: true,
              status,
              error: (verification as any).error || undefined,
              keyValue: apiKey, // Include the actual key value
              models: (verification as any).models || undefined
            });
          } catch (error) {
            console.error(`Error verifying ${envVar}:`, error);
            results.push({
              envVar,
              provider: mapping.provider,
              configured: true,
              status: 'unknown_error',
              error: error instanceof Error ? error.message : 'Verification failed'
            });
          }
        } else {
          // Unknown key type - mark as configured but not verified
          results.push({
            envVar,
            provider: 'unknown',
            configured: true,
            status: 'not_verified',
            error: 'Unknown API key type'
          });
        }
      }
    }

    console.log(`Verified ${results.length} API keys total`);

    return NextResponse.json({
      success: true,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: []
      },
      { status: 500 }
    );
  }
}