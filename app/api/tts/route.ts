import { NextRequest, NextResponse } from 'next/server';

interface TTSRequest {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: TTSRequest = await request.json();
    const { text, voice = 'alloy', language = 'en', speed = 1.0 } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Simulate TTS processing (replace with actual TTS service)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const audioUrl = `data:audio/mp3;base64,${Buffer.from('fake-audio-data').toString('base64')}`;
    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      audioUrl,
      voice,
      language,
      duration: duration / 1000,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Text-to-Speech Agent',
    status: 'operational',
    capabilities: {
      voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
      formats: ['mp3', 'wav', 'aac'],
      maxTextLength: 4096
    },
    metrics: {
      endpoint: '/api/metrics',
      description: 'Enhanced per-action metrics with voice/language tracking'
    }
  });
}
