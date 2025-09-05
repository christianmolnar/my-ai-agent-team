import { NextResponse } from 'next/server';

interface ApiVerificationResult {
  provider: string;
  configured: boolean;
  valid?: boolean;
  error?: string;
  models?: string[];
  envVar?: string;
  keyValue?: string;
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
          results.push({
            provider,
            configured: true,
            valid: verification.valid,
            error: verification.error,
            ...(verification.models && { models: verification.models })
          });
        } else {
          results.push({
            provider,
            configured: false
          });
        }
      } else {
        results.push({
          provider,
          configured: false
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
    
    // Define provider mappings
    const providerChecks = [
      {
        provider: 'openai',
        envKeys: Object.keys(allKeys).filter(key => key.includes('OPENAI_API_KEY')),
        verifyFn: verifyOpenAI
      },
      {
        provider: 'anthropic',
        envKeys: Object.keys(allKeys).filter(key => key.includes('ANTHROPIC_API_KEY')),
        verifyFn: verifyAnthropic
      },
      {
        provider: 'google',
        envKeys: Object.keys(allKeys).filter(key => key.includes('GOOGLE_AI_API_KEY')),
        verifyFn: verifyGoogleAI
      },
      {
        provider: 'perplexity',
        envKeys: Object.keys(allKeys).filter(key => key.includes('PERPLEXITY_API_KEY')),
        verifyFn: verifyPerplexity
      },
      {
        provider: 'stability',
        envKeys: Object.keys(allKeys).filter(key => key.includes('STABILITY_API_KEY')),
        verifyFn: verifyStabilityAI
      },
      {
        provider: 'together',
        envKeys: Object.keys(allKeys).filter(key => key.includes('TOGETHER_API_KEY')),
        verifyFn: verifyTogetherAI
      },
      {
        provider: 'cohere',
        envKeys: Object.keys(allKeys).filter(key => key.includes('COHERE_API_KEY')),
        verifyFn: verifyCohere
      },
      {
        provider: 'serpapi',
        envKeys: Object.keys(allKeys).filter(key => key.includes('SERPAPI_KEY')),
        verifyFn: verifySerpAPI
      }
    ];

    // Create results for each specific environment variable that could exist
    const specificEnvVars = [
      { envVar: 'COMMUNICATIONS_OPENAI_API_KEY', provider: 'openai', verifyFn: verifyOpenAI },
      { envVar: 'COMMUNICATIONS_ANTHROPIC_API_KEY', provider: 'anthropic', verifyFn: verifyAnthropic },
      { envVar: 'RESEARCHER_OPENAI_API_KEY', provider: 'openai', verifyFn: verifyOpenAI },
      { envVar: 'RESEARCHER_ANTHROPIC_API_KEY', provider: 'anthropic', verifyFn: verifyAnthropic },
      { envVar: 'RESEARCHER_PERPLEXITY_API_KEY', provider: 'perplexity', verifyFn: verifyPerplexity },
      { envVar: 'RESEARCHER_GOOGLE_AI_API_KEY', provider: 'google', verifyFn: verifyGoogleAI },
      { envVar: 'SERPAPI_KEY', provider: 'serpapi', verifyFn: verifySerpAPI },
      { envVar: 'DISCOGS_TOKEN', provider: 'discogs', verifyFn: verifyDiscogs },
      { envVar: 'IMAGE_VIDEO_GENERATOR_OPENAI_API_KEY', provider: 'openai', verifyFn: verifyOpenAI },
      { envVar: 'IMAGE_VIDEO_GENERATOR_STABILITY_API_KEY', provider: 'stability', verifyFn: verifyStabilityAI },
      { envVar: 'IMAGE_VIDEO_GENERATOR_ANTHROPIC_API_KEY', provider: 'anthropic', verifyFn: verifyAnthropic },
      { envVar: 'FULL_STACK_DEVELOPER_OPENAI_API_KEY', provider: 'openai', verifyFn: verifyOpenAI },
      { envVar: 'FULL_STACK_DEVELOPER_ANTHROPIC_API_KEY', provider: 'anthropic', verifyFn: verifyAnthropic },
      { envVar: 'FULL_STACK_DEVELOPER_TOGETHER_API_KEY', provider: 'together', verifyFn: verifyTogetherAI },
      { envVar: 'DATA_SCIENTIST_OPENAI_API_KEY', provider: 'openai', verifyFn: verifyOpenAI },
      { envVar: 'DATA_SCIENTIST_COHERE_API_KEY', provider: 'cohere', verifyFn: verifyCohere },
      { envVar: 'BACK_END_DEVELOPER_OPENAI_API_KEY', provider: 'openai', verifyFn: verifyOpenAI },
      { envVar: 'BACK_END_DEVELOPER_ANTHROPIC_API_KEY', provider: 'anthropic', verifyFn: verifyAnthropic },
      { envVar: 'BACK_END_DEVELOPER_TOGETHER_API_KEY', provider: 'together', verifyFn: verifyTogetherAI },
      { envVar: 'FRONT_END_DEVELOPER_OPENAI_API_KEY', provider: 'openai', verifyFn: verifyOpenAI },
      { envVar: 'FRONT_END_DEVELOPER_ANTHROPIC_API_KEY', provider: 'anthropic', verifyFn: verifyAnthropic },
      { envVar: 'FRONT_END_DEVELOPER_TOGETHER_API_KEY', provider: 'together', verifyFn: verifyTogetherAI }
    ];

    for (const { envVar, provider, verifyFn } of specificEnvVars) {
      const apiKey = allKeys[envVar];
      if (apiKey && apiKey.trim() !== '') {
        console.log(`Checking ${envVar} with key: ${apiKey.substring(0, 10)}...`);
        const verification = await verifyFn(apiKey);
        results.push({
          envVar,
          provider,
          configured: true,
          valid: verification.valid,
          error: verification.error,
          keyValue: apiKey, // Include the actual key value
          ...(verification.models && { models: verification.models })
        });
      } else {
        results.push({
          envVar,
          provider,
          configured: false
        });
      }
    }

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