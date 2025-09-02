import { NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

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
    const envPath = join(process.cwd(), '.env.local');
    
    // Read current .env.local content
    let envContent = '';
    try {
      envContent = readFileSync(envPath, 'utf8');
    } catch (error) {
      // File doesn't exist, start with empty content
      envContent = '# AI Agent Team Environment Variables\n\n';
    }

    // Update or add each API key
    Object.entries(apiKeys).forEach(([envVar, value]) => {
      if (value && typeof value === 'string' && value.trim() !== '') {
        const keyLine = `${envVar}=${value}`;
        
        // Check if the key already exists
        const keyRegex = new RegExp(`^${envVar}=.*$`, 'm');
        
        if (keyRegex.test(envContent)) {
          // Update existing key
          envContent = envContent.replace(keyRegex, keyLine);
        } else {
          // Add new key at the end
          if (!envContent.endsWith('\n')) {
            envContent += '\n';
          }
          envContent += `${keyLine}\n`;
        }
      }
    });

    // Write updated content back to .env.local
    writeFileSync(envPath, envContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'API keys saved to .env.local successfully',
      savedKeys: Object.keys(apiKeys).filter(key => apiKeys[key] && apiKeys[key].trim() !== '')
    });

  } catch (error) {
    console.error('Error saving API keys to .env.local:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
