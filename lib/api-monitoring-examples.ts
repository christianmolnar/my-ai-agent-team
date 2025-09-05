import { recordApiCall } from './api-runtime-monitor';

/**
 * Example: How to use the runtime monitor in your agent code
 */

// Example 1: OpenAI API call with monitoring
export async function makeOpenAiCall(prompt: string): Promise<string> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      // Record the failure
      await recordApiCall('OPENAI_API_KEY', 'OpenAI', false, responseTime, `HTTP ${response.status}: ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Record successful call
    await recordApiCall('OPENAI_API_KEY', 'OpenAI', true, responseTime);
    
    return data.choices[0].message.content;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Record the failure with error details
    await recordApiCall('OPENAI_API_KEY', 'OpenAI', false, responseTime, error instanceof Error ? error.message : 'Unknown error');
    
    throw error;
  }
}

// Example 2: Anthropic Claude call with monitoring
export async function makeClaudeCall(prompt: string): Promise<string> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      await recordApiCall('ANTHROPIC_API_KEY', 'Anthropic', false, responseTime, `HTTP ${response.status}: ${errorText}`);
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Record successful call
    await recordApiCall('ANTHROPIC_API_KEY', 'Anthropic', true, responseTime);
    
    return data.content[0].text;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    await recordApiCall('ANTHROPIC_API_KEY', 'Anthropic', false, responseTime, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Example 3: Generic API wrapper with monitoring
export async function monitoredApiCall<T>(
  envVar: string,
  provider: string,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await apiCall();
    const responseTime = Date.now() - startTime;
    
    // Record successful call
    await recordApiCall(envVar, provider, true, responseTime);
    
    return result;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Record the failure
    await recordApiCall(envVar, provider, false, responseTime, error instanceof Error ? error.message : 'Unknown error');
    
    throw error;
  }
}

// Usage example:
// const result = await monitoredApiCall('GOOGLE_AI_KEY', 'Google AI', async () => {
//   return await googleAi.generateContent('Hello world');
// });
