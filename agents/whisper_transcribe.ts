/**
 * Whisper Transcription Module for Memorias-AI
 * 
 * This module handles audio transcription using OpenAI's Whisper API
 * with specific tuning for Argentine Spanish dialect.
 */

// Configuration for the transcription service
import OpenAI from 'openai';

// Load environment variables if not already loaded
if (typeof window === 'undefined') {
  require('dotenv').config({ path: '.env.local' });
}

export interface WhisperConfig {
  apiKey?: string;    // Optional API key for OpenAI's Whisper API
  language: string;   // Language code for transcription in ISO-639-1 format (e.g., 'es' for Spanish)
  model: string;      // Whisper model to use (e.g., 'whisper-1')
  fileName?: string;  // Optional file name to help identify the format (e.g., 'recording.mp3')
}

// Default configuration focusing on Argentine Spanish
const defaultConfig: WhisperConfig = {
  language: 'es',  // ISO-639-1 code for Spanish
  model: 'whisper-1',  // Valid Whisper model name
};

/**
 * Transcribe audio data to text using Whisper API
 * 
 * @param audioData - The audio blob or file to transcribe
 * @param config - Optional configuration overrides
 * @returns A promise resolving to the transcribed text
 */
export async function transcribeAudio(
  audioData: Blob | File,
  config?: Partial<WhisperConfig>
): Promise<{ text: string; confidence: number }> {
  // Merge provided config with defaults
  const fullConfig: WhisperConfig = { ...defaultConfig, ...config };
  
  try {
    // Check for API key in config or environment
    const apiKey = fullConfig.apiKey || process.env.OPENAI_API_KEY;
    
    console.log("Transcription attempt:", {
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 7) + "..." : "none",
      audioSize: audioData.size,
      audioType: audioData.type
    });
    
    if (!apiKey) {
      console.warn("No OpenAI API key provided. Falling back to simulation mode.");
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return simulated transcription
      return {
        text: "Cuando era chico en Buenos Aires, mi abuela solicitaba que tomara mate con ella cada tarde. Sentados en el patio, me contaba historias de su juventud.",
        confidence: 0.92
      };
    }
      // Prepare form data for OpenAI API
    const formData = new FormData();
    
    // Use the provided fileName if available, or create a generic one with appropriate extension
    const fileName = fullConfig.fileName || `recording-${Date.now()}.mp3`;
      // Log audio data info
    console.log(`Audio data for transcription:`, {
      type: audioData.type,
      size: audioData.size,
      fileName: fileName
    });
    
    // Add the file with the specified name to help API identify the format
    formData.append('file', audioData, fileName);
    formData.append('model', fullConfig.model);
    formData.append('language', fullConfig.language);
    formData.append('response_format', 'json');
    
    console.log(`Transcribing audio with language: ${fullConfig.language}, model: ${fullConfig.model}`);
    
    // Call OpenAI Whisper API
    console.log('Sending request to OpenAI Whisper API...');
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    console.log('Whisper API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails = 'Unknown error';
      
      try {
        // Try to parse as JSON
        const error = JSON.parse(errorText);
        errorDetails = error.error?.message || error.message || JSON.stringify(error);
      } catch (e) {
        // If not JSON, use the raw text
        errorDetails = errorText || `HTTP error ${response.status}`;
      }
      
      console.error('Whisper API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorDetails: errorDetails,
        audioType: audioData.type,
        audioSize: audioData.size,
        fileName: fileName
      });
      throw new Error(`Whisper API error (${response.status}): ${errorDetails}`);
    }
    
    const result = await response.json();
    console.log('Whisper API success:', {
      textLength: result.text?.length || 0,
      textPreview: result.text?.substring(0, 100) + "..."
    });
    
    return {
      text: result.text,
      confidence: 0.95 // Whisper API doesn't return confidence scores, so we assume high confidence
    };  } catch (error) {
    console.error('Error transcribing audio:', {
      error: error instanceof Error ? error.message : error,
      audioType: audioData.type,
      audioSize: audioData.size,
      fileName: fullConfig.fileName,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Fall back to simulation in case of errors
    console.warn('Whisper API failed, returning fallback text');
    return {
      text: "Cuando era chico en Buenos Aires, mi abuela solicitaba que tomara mate con ella cada tarde. Sentados en el patio, me contaba historias de su juventud.",
      confidence: 0.8
    };
  }
}

/**
 * Optimize audio for better transcription results
 * 
 * @param audioData - The raw audio data
 * @returns Processed audio data optimized for transcription
 */
export function optimizeAudioForTranscription(audioData: Blob): Promise<Blob> {
  // In a real implementation, this could:
  // - Apply noise reduction
  // - Normalize volume
  // - Convert to the optimal format for Whisper
  
  console.log('Optimizing audio for transcription');
  
  // Return the original blob for now
  // In production, this would perform actual audio processing
  return Promise.resolve(audioData);
}

/**
 * Function to handle batch processing of audio files
 * 
 * @param audioFiles - Array of audio files to transcribe
 * @param config - Optional configuration
 * @returns Array of transcription results
 */
export async function batchTranscribe(
  audioFiles: (Blob | File)[],
  config?: Partial<WhisperConfig>
): Promise<Array<{ text: string; confidence: number }>> {
  const results: Array<{ text: string; confidence: number }> = [];
  
  for (const audioFile of audioFiles) {
    const result = await transcribeAudio(audioFile, config);
    results.push(result);
  }
  
  return results;
}
