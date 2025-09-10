#!/usr/bin/env node

/**
 * Quick test script for Piano Transcription Service
 * Usage: node test-piano-transcription.js "https://youtube.com/watch?v=..."
 */

const PianoTranscriptionService = require('./lib/piano-transcription.ts');

async function testTranscription() {
  const youtubeUrl = process.argv[2];
  
  if (!youtubeUrl) {
    console.log('❌ Please provide a YouTube URL');
    console.log('Usage: node test-piano-transcription.js "https://youtube.com/watch?v=..."');
    process.exit(1);
  }

  console.log('🎹 Testing Piano Transcription Service...');
  console.log(`📺 YouTube URL: ${youtubeUrl}`);
  
  const transcriptionService = new PianoTranscriptionService();
  
  try {
    const result = await transcriptionService.transcribe({
      youtubeUrl,
      outputFormat: 'all',
      maxDuration: 60,
      useChords: true,
      separateHands: true
    });
    
    console.log('\n📊 Transcription Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Transcription successful!');
      if (result.midiFile) console.log(`🎵 MIDI file: ${result.midiFile}`);
      if (result.musicXmlFile) console.log(`🎼 MusicXML file: ${result.musicXmlFile}`);
      if (result.abcNotation) console.log('📝 ABC notation generated');
      if (result.confidence) console.log(`🎯 Confidence: ${Math.round(result.confidence * 100)}%`);
    } else {
      console.log('\n❌ Transcription failed');
      console.log(`Error: ${result.error}`);
    }
    
    // Cleanup
    await transcriptionService.cleanup();
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Example YouTube URLs for testing:
const examples = [
  'https://www.youtube.com/watch?v=4Tr0otuiQuU', // Canon in D
  'https://www.youtube.com/watch?v=rEGOihjqO9w', // Clair de Lune
  'https://www.youtube.com/watch?v=4uOxOgm5jQ4'  // Für Elise
];

if (process.argv.includes('--examples')) {
  console.log('🎼 Example YouTube URLs you can test with:');
  examples.forEach((url, i) => {
    console.log(`${i + 1}. ${url}`);
  });
  process.exit(0);
}

testTranscription();
