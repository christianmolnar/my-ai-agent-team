import { NextRequest, NextResponse } from 'next/server';
import SimplePianoTranscriptionService from '../../../lib/simple-piano-transcription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl, maxDuration } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { success: false, error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    if (!youtubeRegex.test(youtubeUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const transcriptionService = new SimplePianoTranscriptionService();
    
    const result = await transcriptionService.transcribe({
      youtubeUrl,
      maxDuration: maxDuration || 120 // Default 2 minutes
    });

    // Generate MIDI if ABC notation was created
    if (result.success && result.abcNotation) {
      result.midiData = await transcriptionService.generateMidiFromABC(result.abcNotation);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Piano transcription API - POST to /api/transcribe-piano with YouTube URL',
    supportedFormats: ['midi', 'musicxml', 'abc'],
    maxDuration: '300 seconds recommended',
    methods: [
      'Hugging Face AI Models (Free)',
      'Basic Python transcription',
      'Open source aubio'
    ]
  });
}
