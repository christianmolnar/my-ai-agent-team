import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKeys } = body;

    if (!apiKeys || typeof apiKeys !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid API keys data' },
        { status: 400 }
      );
    }

    // Path to .env.local file
    const envPath = path.join(process.cwd(), '.env.local');
    
    // Read existing .env.local file
    let existingEnv = '';
    try {
      existingEnv = await fs.readFile(envPath, 'utf-8');
    } catch (error) {
      // File doesn't exist, we'll create it
      console.log('.env.local file not found, creating new one');
    }

    // Parse existing environment variables
    const existingVars: Record<string, string> = {};
    const envLines = existingEnv.split('\n');
    const commentLines: string[] = [];
    
    envLines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#') || trimmedLine === '') {
        commentLines.push(line);
      } else if (trimmedLine.includes('=')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        existingVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    // Update with new API keys (only non-empty values)
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim() !== '') {
        existingVars[key] = value.trim();
      }
    });

    // Rebuild .env.local content
    const envContent: string[] = [
      '# AI Agent Team Environment Variables',
      '',
      '# Research Agent - SerpAPI for Google search integration',
      `SERPAPI_KEY=${existingVars.SERPAPI_KEY || ''}`,
      '',
      '# Research Agent - Discogs API for music/vinyl research',
      `DISCOGS_TOKEN=${existingVars.DISCOGS_TOKEN || ''}`,
      '',
      '# OpenAI API Keys (per agent)',
      `COMMUNICATIONS_OPENAI_API_KEY=${existingVars.COMMUNICATIONS_OPENAI_API_KEY || ''}`,
      `RESEARCH_OPENAI_API_KEY=${existingVars.RESEARCH_OPENAI_API_KEY || ''}`,
      `CREATIVE_OPENAI_API_KEY=${existingVars.CREATIVE_OPENAI_API_KEY || ''}`,
      `CODE_OPENAI_API_KEY=${existingVars.CODE_OPENAI_API_KEY || ''}`,
      `ANALYSIS_OPENAI_API_KEY=${existingVars.ANALYSIS_OPENAI_API_KEY || ''}`,
      '',
      '# Anthropic API Keys (per agent)',
      `COMMUNICATIONS_ANTHROPIC_API_KEY=${existingVars.COMMUNICATIONS_ANTHROPIC_API_KEY || ''}`,
      `RESEARCH_ANTHROPIC_API_KEY=${existingVars.RESEARCH_ANTHROPIC_API_KEY || ''}`,
      `CREATIVE_ANTHROPIC_API_KEY=${existingVars.CREATIVE_ANTHROPIC_API_KEY || ''}`,
      `CODE_ANTHROPIC_API_KEY=${existingVars.CODE_ANTHROPIC_API_KEY || ''}`,
      '',
      '# Other Provider Keys',
      `RESEARCH_PERPLEXITY_API_KEY=${existingVars.RESEARCH_PERPLEXITY_API_KEY || ''}`,
      `RESEARCH_GOOGLE_AI_API_KEY=${existingVars.RESEARCH_GOOGLE_AI_API_KEY || ''}`,
      `CREATIVE_STABILITY_API_KEY=${existingVars.CREATIVE_STABILITY_API_KEY || ''}`,
      `CODE_TOGETHER_API_KEY=${existingVars.CODE_TOGETHER_API_KEY || ''}`,
      `ANALYSIS_COHERE_API_KEY=${existingVars.ANALYSIS_COHERE_API_KEY || ''}`
    ];

    // Write the updated .env.local file
    await fs.writeFile(envPath, envContent.join('\n'));

    return NextResponse.json({
      success: true,
      message: 'Environment variables saved to .env.local',
      savedKeys: Object.keys(apiKeys).filter(key => apiKeys[key] && apiKeys[key].trim() !== '')
    });

  } catch (error) {
    console.error('Error saving environment variables:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
