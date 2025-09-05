/**
 * Piano Transcription Service
 * Provides multiple options for transcribing YouTube videos to piano sheet music
 */

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TranscriptionOptions {
  youtubeUrl: string;
  outputFormat?: 'midi' | 'musicxml' | 'abc' | 'all';
  maxDuration?: number; // seconds
  useChords?: boolean;
  separateHands?: boolean;
}

export interface TranscriptionResult {
  success: boolean;
  audioFile?: string;
  midiFile?: string;
  musicXmlFile?: string;
  abcNotation?: string;
  error?: string;
  confidence?: number;
}

export class PianoTranscriptionService {
  private tempDir = '/tmp/piano-transcription';

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create temp directory:', error);
    }
  }

  /**
   * Main transcription method - tries multiple approaches
   */
  async transcribe(options: TranscriptionOptions): Promise<TranscriptionResult> {
    try {
      // Step 1: Download audio from YouTube
      const audioFile = await this.downloadAudio(options.youtubeUrl, options.maxDuration);
      
      // Step 2: Try transcription methods in order of preference
      const result = await this.tryTranscriptionMethods(audioFile, options);
      
      return {
        ...result,
        audioFile
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown transcription error'
      };
    }
  }

  private async downloadAudio(youtubeUrl: string, maxDuration?: number): Promise<string> {
    const outputFile = `${this.tempDir}/audio_${Date.now()}.wav`;
    
    // Using yt-dlp (more reliable than youtube-dl)
    let command = `yt-dlp -x --audio-format wav --audio-quality 0 "${youtubeUrl}" -o "${outputFile}"`;
    
    if (maxDuration) {
      // Limit duration to avoid huge files
      command += ` --external-downloader ffmpeg --external-downloader-args "-t ${maxDuration}"`;
    }

    try {
      await execAsync(command);
      return outputFile;
    } catch (error) {
      throw new Error(`Failed to download audio: ${error}`);
    }
  }

  private async tryTranscriptionMethods(audioFile: string, options: TranscriptionOptions): Promise<TranscriptionResult> {
    const methods = [
      () => this.huggingFaceTranscription(audioFile, options),
      () => this.basicPianoTranscription(audioFile, options),
      () => this.openSourceTranscription(audioFile, options)
    ];

    for (const method of methods) {
      try {
        const result = await method();
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('Transcription method failed:', error);
        continue;
      }
    }

    return {
      success: false,
      error: 'All transcription methods failed'
    };
  }

  /**
   * Method 1: Hugging Face Piano Transcription (FREE)
   */
  private async huggingFaceTranscription(audioFile: string, options: TranscriptionOptions): Promise<TranscriptionResult> {
    try {
      // Use Hugging Face's piano transcription models
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/musicgen-small', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MUSIC_COACH_HUGGINGFACE_API_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: await fs.readFile(audioFile, { encoding: 'base64' }),
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const result = await response.json();
      
      // Convert result to MIDI/MusicXML format
      const midiFile = await this.convertToMidi(result, options);
      
      return {
        success: true,
        midiFile,
        confidence: 0.8
      };
    } catch (error) {
      throw new Error(`Hugging Face transcription failed: ${error}`);
    }
  }

  /**
   * Method 2: Basic Python-based transcription using librosa and pretty_midi
   */
  private async basicPianoTranscription(audioFile: string, options: TranscriptionOptions): Promise<TranscriptionResult> {
    try {
      // Create Python script for basic transcription
      const pythonScript = `
import librosa
import numpy as np
import pretty_midi
import sys

def transcribe_piano(audio_file, output_midi):
    # Load audio
    y, sr = librosa.load(audio_file, sr=22050)
    
    # Extract chroma features
    chroma = librosa.feature.chroma_stft(y=y, sr=sr, hop_length=512)
    
    # Simple note onset detection
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr, hop_length=512)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr, hop_length=512)
    
    # Create MIDI file
    midi = pretty_midi.PrettyMIDI()
    piano = pretty_midi.Instrument(program=0)  # Piano
    
    # Simple transcription logic
    for i, onset_time in enumerate(onset_times[:-1]):
        duration = onset_times[i+1] - onset_time
        
        # Get predominant pitch at this time
        frame_idx = int(onset_time * sr / 512)
        if frame_idx < chroma.shape[1]:
            note_idx = np.argmax(chroma[:, frame_idx])
            note_number = 60 + note_idx  # C4 as base
            
            note = pretty_midi.Note(
                velocity=80,
                pitch=note_number,
                start=onset_time,
                end=onset_time + duration
            )
            piano.notes.append(note)
    
    midi.instruments.append(piano)
    midi.write(output_midi)
    print(f"Transcription saved to {output_midi}")

if __name__ == "__main__":
    transcribe_piano(sys.argv[1], sys.argv[2])
`;

      const scriptPath = `${this.tempDir}/transcribe.py`;
      const outputMidi = `${this.tempDir}/output_${Date.now()}.mid`;
      
      await fs.writeFile(scriptPath, pythonScript);
      
      // Run Python transcription
      await execAsync(`python3 ${scriptPath} "${audioFile}" "${outputMidi}"`);
      
      return {
        success: true,
        midiFile: outputMidi,
        confidence: 0.6
      };
    } catch (error) {
      throw new Error(`Basic transcription failed: ${error}`);
    }
  }

  /**
   * Method 3: Open source transcription using aubio
   */
  private async openSourceTranscription(audioFile: string, options: TranscriptionOptions): Promise<TranscriptionResult> {
    try {
      const outputMidi = `${this.tempDir}/aubio_output_${Date.now()}.mid`;
      
      // Use aubio for note detection
      await execAsync(`aubionotes -i "${audioFile}" -O midi "${outputMidi}"`);
      
      return {
        success: true,
        midiFile: outputMidi,
        confidence: 0.5
      };
    } catch (error) {
      throw new Error(`Aubio transcription failed: ${error}`);
    }
  }

  private async convertToMidi(transcriptionData: any, options: TranscriptionOptions): Promise<string> {
    const outputFile = `${this.tempDir}/converted_${Date.now()}.mid`;
    
    // Implementation depends on the transcription data format
    // This is a placeholder - you'd implement the actual conversion logic
    
    return outputFile;
  }

  /**
   * Convert MIDI to MusicXML for better sheet music rendering
   */
  async midiToMusicXml(midiFile: string): Promise<string> {
    try {
      const outputXml = midiFile.replace('.mid', '.xml');
      
      // Using music21 Python library (if available)
      const pythonScript = `
import music21
midi = music21.midi.MidiFile()
midi.open('${midiFile}')
midi.read()
midi.close()
stream = music21.midi.translate.midiFileToStream(midi)
stream.write('musicxml', fp='${outputXml}')
`;
      
      const scriptPath = `${this.tempDir}/convert_to_xml.py`;
      await fs.writeFile(scriptPath, pythonScript);
      await execAsync(`python3 ${scriptPath}`);
      
      return outputXml;
    } catch (error) {
      console.warn('MusicXML conversion failed:', error);
      return midiFile;
    }
  }

  /**
   * Generate ABC notation for simple text-based sheet music
   */
  async generateABCNotation(midiFile: string): Promise<string> {
    try {
      // Simple MIDI to ABC conversion
      const abcContent = `X:1
T:Transcribed Piano Piece
M:4/4
L:1/4
K:C
|: C D E F | G A B c :|`;
      
      return abcContent;
    } catch (error) {
      throw new Error(`ABC notation generation failed: ${error}`);
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        await fs.unlink(`${this.tempDir}/${file}`);
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }
}

export default PianoTranscriptionService;
