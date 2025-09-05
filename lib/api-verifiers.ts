// Shared API verification functions

// Helper function to verify OpenAI API
export async function verifyOpenAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
export async function verifyAnthropic(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
export async function verifyGoogleAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
export async function verifyPerplexity(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
export async function verifyStabilityAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
export async function verifyTogetherAI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
export async function verifyCohere(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
export async function verifySerpAPI(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
export async function verifyDiscogs(apiKey: string): Promise<{ valid: boolean; error?: string; models?: string[] }> {
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
