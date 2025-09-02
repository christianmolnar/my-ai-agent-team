/**
 * Text-to-Speech Module for Memorias-AI
 * 
 * This module handles converting text to speech with Argentine Spanish accent using OpenAI's TTS API.
 * Includes comprehensive metrics tracking following UiPath robot monitoring methodology.
 */

// Configuration for the Text-to-Speech service
interface TTSConfig {
  apiKey?: string;      // Optional API key for TTS service
  voice: string;        // Voice ID to use
  model: string;        // TTS model to use
  speed: number;        // Speech rate (0.25 to 4.0)
  responseFormat: string; // Output format ('mp3', 'opus', 'aac', 'flac')
}

// Server-side only metrics imports
let metrics: any = null;
let agentHeartbeatTotal: any = null;
let agentQueueDepthTotal: any = null;
let agentProcessExecutionsTotal: any = null;
let apiCallsTotal: any = null;
let apiResponseTime: any = null;

// Only import metrics on server side
if (typeof window === 'undefined') {
  try {
    const promClient = require('prom-client');
    const metricsModule = require('../lib/metrics');
    
    const { Counter, Gauge, Histogram, register } = promClient;
    
    // Import existing metrics
    agentHeartbeatTotal = metricsModule.agentHeartbeatTotal;
    agentQueueDepthTotal = metricsModule.agentQueueDepthTotal;
    agentProcessExecutionsTotal = metricsModule.agentProcessExecutionsTotal;
    apiCallsTotal = metricsModule.apiCallsTotal;
    apiResponseTime = metricsModule.apiResponseTime;
    
    // TTS-specific metrics following UiPath methodology
    const ttsRequestsTotal = new Counter({
      name: 'tts_requests_total',
      help: 'Total TTS requests processed',
      labelNames: ['voice', 'language', 'status', 'error_type'],
    });

    const ttsRequestDuration = new Histogram({
      name: 'tts_request_duration_seconds',
      help: 'TTS request processing duration',
      labelNames: ['voice', 'language', 'model'],
      buckets: [0.5, 1, 2, 5, 10, 20, 30],
    });

    const ttsTextLength = new Histogram({
      name: 'tts_text_length_chars',
      help: 'Length of text being converted to speech',
      labelNames: ['voice', 'language'],
      buckets: [50, 100, 250, 500, 1000, 2000, 5000],
    });

    const ttsAudioSize = new Histogram({
      name: 'tts_audio_size_bytes',
      help: 'Size of generated audio files',
      labelNames: ['voice', 'format', 'model'],
      buckets: [1024, 5120, 10240, 25600, 51200, 102400, 256000],
    });

    const ttsVoiceUsage = new Counter({
      name: 'tts_voice_usage_total',
      help: 'Usage count per voice configuration',
      labelNames: ['voice', 'gender', 'argentine_name'],
    });

    const ttsLanguageProcessing = new Counter({
      name: 'tts_language_processing_total',
      help: 'Language processing and grammar application',
      labelNames: ['language', 'grammar_applied', 'corrections_made'],
    });

    const ttsApiLatency = new Histogram({
      name: 'tts_openai_api_latency_seconds',
      help: 'OpenAI TTS API response latency',
      labelNames: ['model', 'voice'],
      buckets: [0.5, 1, 2, 5, 10, 15, 30],
    });

    const ttsConcurrentRequests = new Gauge({
      name: 'tts_concurrent_requests',
      help: 'Number of concurrent TTS requests being processed',
    });

    const ttsHealthStatus = new Gauge({
      name: 'tts_agent_health_status',
      help: 'TTS agent health status (1=healthy, 0=unhealthy)',
    });

    // Register TTS metrics
    try {
      register.registerMetric(ttsRequestsTotal);
      register.registerMetric(ttsRequestDuration);
      register.registerMetric(ttsTextLength);
      register.registerMetric(ttsAudioSize);
      register.registerMetric(ttsVoiceUsage);
      register.registerMetric(ttsLanguageProcessing);
      register.registerMetric(ttsApiLatency);
      register.registerMetric(ttsConcurrentRequests);
      register.registerMetric(ttsHealthStatus);
    } catch (e) {
      // Metrics might already be registered
      console.log('TTS metrics already registered');
    }

    // Initialize TTS agent health
    ttsHealthStatus.set(1);

    // Store metrics in the metrics object
    metrics = {
      ttsRequestsTotal,
      ttsRequestDuration,
      ttsTextLength,
      ttsAudioSize,
      ttsVoiceUsage,
      ttsLanguageProcessing,
      ttsApiLatency,
      ttsConcurrentRequests,
      ttsHealthStatus
    };
  } catch (error) {
    console.log('Failed to initialize TTS metrics (client-side execution):', error);
  }
}

// TTS Metrics Manager Class
class TTSMetrics {
  private static instance: TTSMetrics;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    if (typeof window === 'undefined') {
      this.startHeartbeat();
    }
  }
  
  static getInstance(): TTSMetrics {
    if (!TTSMetrics.instance) {
      TTSMetrics.instance = new TTSMetrics();
    }
    return TTSMetrics.instance;
  }
  
  private startHeartbeat() {
    if (agentHeartbeatTotal) {
      this.heartbeatInterval = setInterval(() => {
        agentHeartbeatTotal.inc({ agent_name: 'tts_agent', status: 'healthy' });
      }, 30000);
    }
  }
  
  setHealthStatus(healthy: boolean) {
    if (metrics?.ttsHealthStatus) {
      metrics.ttsHealthStatus.set(healthy ? 1 : 0);
    }
    if (agentHeartbeatTotal) {
      agentHeartbeatTotal.inc({ 
        agent_name: 'tts_agent', 
        status: healthy ? 'healthy' : 'unhealthy' 
      });
    }
  }
  
  recordRequest(voice: string, language: string, status: 'success' | 'failure', errorType?: string) {
    if (metrics?.ttsRequestsTotal) {
      metrics.ttsRequestsTotal.inc({ 
        voice, 
        language, 
        status, 
        error_type: errorType || 'none' 
      });
    }
    
    if (agentProcessExecutionsTotal) {
      agentProcessExecutionsTotal.inc({
        agent_name: 'tts_agent',
        process_type: 'text_to_speech',
        status
      });
    }
  }
  
  recordProcessingTime(duration: number, voice: string, language: string, model: string) {
    if (metrics?.ttsRequestDuration) {
      metrics.ttsRequestDuration.labels(voice, language, model).observe(duration);
    }
  }
  
  recordTextMetrics(textLength: number, voice: string, language: string) {
    if (metrics?.ttsTextLength) {
      metrics.ttsTextLength.labels(voice, language).observe(textLength);
    }
  }
  
  recordAudioMetrics(audioSize: number, voice: string, format: string, model: string) {
    if (metrics?.ttsAudioSize) {
      metrics.ttsAudioSize.labels(voice, format, model).observe(audioSize);
    }
  }
  
  recordVoiceUsage(voice: string, gender: string, argentineName: string) {
    if (metrics?.ttsVoiceUsage) {
      metrics.ttsVoiceUsage.inc({ voice, gender, argentine_name: argentineName });
    }
  }
  
  recordLanguageProcessing(language: string, grammarApplied: boolean, corrections: number) {
    if (metrics?.ttsLanguageProcessing) {
      metrics.ttsLanguageProcessing.inc({ 
        language, 
        grammar_applied: grammarApplied ? 'true' : 'false',
        corrections_made: corrections.toString()
      });
    }
  }
  
  recordApiCall(latency: number, model: string, voice: string, success: boolean) {
    if (metrics?.ttsApiLatency) {
      metrics.ttsApiLatency.labels(model, voice).observe(latency);
    }
    
    if (apiCallsTotal) {
      apiCallsTotal.inc({
        agent_name: 'tts_agent',
        api_endpoint: 'openai_tts',
        status_code: success ? '200' : '500'
      });
    }
    
    if (apiResponseTime) {
      apiResponseTime.labels('tts_agent', 'openai_tts').observe(latency);
    }
  }
  
  setConcurrentRequests(count: number) {
    if (metrics?.ttsConcurrentRequests) {
      metrics.ttsConcurrentRequests.set(count);
    }
  }
  
  setQueueDepth(depth: number) {
    if (agentQueueDepthTotal) {
      agentQueueDepthTotal.set({ agent_name: 'tts_agent', queue_type: 'pending' }, depth);
    }
  }
}

// Initialize metrics manager
const ttsMetrics = TTSMetrics.getInstance();

// Default configuration for Spanish TTS with warm, friendly voice
const defaultConfig: TTSConfig = {
  voice: 'nova',         // Nova is a feminine voice good for Spanish (Carmen)
  model: 'tts-1',        // Standard quality model
  speed: 0.9,            // Slightly slower for clear pronunciation
  responseFormat: 'mp3'
};

/**
 * Convert text to speech using OpenAI's TTS API with comprehensive metrics tracking
 * 
 * @param text - The text to convert to speech
 * @param config - Optional configuration overrides
 * @returns Promise resolving to an audio blob
 */
export async function textToSpeech(
  text: string,
  config?: Partial<TTSConfig>
): Promise<Blob> {
  const startTime = Date.now();
  const requestId = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Merge provided config with defaults
  const fullConfig: TTSConfig = { ...defaultConfig, ...config };
  
  // Get voice information
  const voices = getArgentineVoices();
  const voiceInfo = voices.find(v => v.id === fullConfig.voice);
  const argentineName = voiceInfo?.name || fullConfig.voice;
  const gender = voiceInfo?.gender || 'female';
  const language = 'spanish'; // Default language
  
  // Increment concurrent requests
  if (metrics?.ttsConcurrentRequests) {
    metrics.ttsConcurrentRequests.inc();
  }
  
  // Record text metrics
  ttsMetrics.recordTextMetrics(text.length, fullConfig.voice, language);
  
  // Record voice usage
  ttsMetrics.recordVoiceUsage(fullConfig.voice, gender, argentineName);
  
  console.log(`[${requestId}] Converting text to speech:`, {
    textLength: text.length,
    voice: fullConfig.voice,
    argentineName,
    gender,
    model: fullConfig.model,
    speed: fullConfig.speed
  });

  try {
    // Check for API key
    const apiKey = fullConfig.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      const error = new Error("No API key available for text-to-speech");
      console.warn(`[${requestId}] No OpenAI API key provided for TTS. Cannot generate speech.`);
      
      // Record metrics for failure
      ttsMetrics.recordRequest(fullConfig.voice, language, 'failure', 'no_api_key');
      if (metrics?.ttsConcurrentRequests) {
        metrics.ttsConcurrentRequests.dec();
      }
      
      throw error;
    }

    // Apply gender-aware grammar if needed
    let processedText = text;
    let grammarCorrections = 0;
    let grammarApplied = false;
    
    if (language === 'spanish') {
      const originalText = text;
      processedText = applyGenderGrammar(text, gender);
      grammarApplied = processedText !== originalText;
      
      if (grammarApplied) {
        // Count corrections made
        grammarCorrections = (originalText.match(/\b(listo|bueno|preparado|cansado|contento|emocionado|perfecto|seguro|terminado)\b/gi) || []).length;
        console.log(`[${requestId}] Applied ${grammarCorrections} gender grammar corrections for ${gender} voice`);
      }
      
      ttsMetrics.recordLanguageProcessing(language, grammarApplied, grammarCorrections);
    }

    const apiStartTime = Date.now();

    // Call OpenAI TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: fullConfig.model,
        input: processedText,
        voice: fullConfig.voice,
        speed: fullConfig.speed,
        response_format: fullConfig.responseFormat
      })
    });

    const apiLatency = (Date.now() - apiStartTime) / 1000;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] OpenAI TTS API error:`, response.status, errorText);
      
      // Record metrics for API failure
      ttsMetrics.recordApiCall(apiLatency, fullConfig.model, fullConfig.voice, false);
      ttsMetrics.recordRequest(fullConfig.voice, language, 'failure', `api_error_${response.status}`);
      if (metrics?.ttsConcurrentRequests) {
        metrics.ttsConcurrentRequests.dec();
      }
      
      throw new Error(`TTS API error: ${response.status} ${errorText}`);
    }

    // Record successful API call
    ttsMetrics.recordApiCall(apiLatency, fullConfig.model, fullConfig.voice, true);

    // Return the audio blob
    const audioBlob = await response.blob();
    const totalDuration = (Date.now() - startTime) / 1000;
    
    // Record comprehensive metrics
    ttsMetrics.recordAudioMetrics(audioBlob.size, fullConfig.voice, fullConfig.responseFormat, fullConfig.model);
    ttsMetrics.recordProcessingTime(totalDuration, fullConfig.voice, language, fullConfig.model);
    ttsMetrics.recordRequest(fullConfig.voice, language, 'success');
    
    // Decrement concurrent requests
    if (metrics?.ttsConcurrentRequests) {
      metrics.ttsConcurrentRequests.dec();
    }
    
    console.log(`[${requestId}] TTS successful:`, {
      audioSize: audioBlob.size,
      totalDuration: `${totalDuration.toFixed(2)}s`,
      apiLatency: `${apiLatency.toFixed(2)}s`,
      grammarCorrections
    });
    
    return audioBlob;

  } catch (error) {
    const totalDuration = (Date.now() - startTime) / 1000;
    
    console.error(`[${requestId}] Error in text-to-speech conversion:`, error);
    
    // Record metrics for unexpected failure
    ttsMetrics.recordProcessingTime(totalDuration, fullConfig.voice, language, fullConfig.model);
    if (!(error as Error).message.includes('API error') && !(error as Error).message.includes('No API key')) {
      ttsMetrics.recordRequest(fullConfig.voice, language, 'failure', 'unexpected_error');
    }
    
    // Decrement concurrent requests
    if (metrics?.ttsConcurrentRequests) {
      metrics.ttsConcurrentRequests.dec();
    }
    
    throw error;
  }
}

/**
 * Get available voices with Argentine names
 * 
 * @returns Array of available voice options
 */
export function getArgentineVoices(): Array<{
  id: string;
  name: string;
  gender: 'male' | 'female';
  description: string;
}> {
  // OpenAI TTS API voices mapped to Argentine names - properly gender-matched
  return [
    {
      id: 'alloy',
      name: 'Carmen',
      gender: 'female',
      description: 'Voz femenina cálida y amigable'
    },
    {
      id: 'onyx',
      name: 'Diego',
      gender: 'male',
      description: 'Voz masculina profunda y confiable'
    },
    {
      id: 'nova',
      name: 'Valentina',
      gender: 'female',
      description: 'Voz femenina joven y vibrante'
    },
    {
      id: 'fable',
      name: 'Mateo',
      gender: 'male',
      description: 'Voz masculina suave y expresiva'
    }
  ];
}

/**
 * Get the gender of a voice by its ID
 * 
 * @param voiceId - The voice ID to look up
 * @returns The gender of the voice ('male' or 'female'), defaults to 'female'
 */
export function getVoiceGender(voiceId: string): 'male' | 'female' {
  const voice = getArgentineVoices().find(v => v.id === voiceId);
  return voice?.gender || 'female'; // Default to female if voice not found
}

/**
 * Apply gender-aware Spanish grammar corrections to agent messages
 * 
 * @param text - The original Spanish text with masculine grammar
 * @param gender - The gender of the agent voice ('male' or 'female')
 * @returns Text with gender-appropriate grammar
 */
export function applyGenderGrammar(text: string, gender: 'male' | 'female'): string {
  if (gender === 'male') {
    return text; // Masculine forms are already correct
  }
  
  // Apply feminine grammar corrections for female voices
  let correctedText = text;
  
  // Common adjective corrections (add more as needed)
  const grammarCorrections: Array<{ masculine: RegExp; feminine: string }> = [
    // "estoy listo" -> "estoy lista"
    { masculine: /\bestoy listo\b/gi, feminine: 'estoy lista' },
    
    // "soy bueno" -> "soy buena"  
    { masculine: /\bsoy bueno\b/gi, feminine: 'soy buena' },
    
    // "estoy preparado" -> "estoy preparada"
    { masculine: /\bestoy preparado\b/gi, feminine: 'estoy preparada' },
    
    // "estoy cansado" -> "estoy cansada"
    { masculine: /\bestoy cansado\b/gi, feminine: 'estoy cansada' },
    
    // "soy feliz" (no change needed - feliz is gender neutral)
    // "estoy contento" -> "estoy contenta"
    { masculine: /\bestoy contento\b/gi, feminine: 'estoy contenta' },
    
    // "me siento listo" -> "me siento lista"
    { masculine: /\bme siento listo\b/gi, feminine: 'me siento lista' },
    
    // "estoy emocionado" -> "estoy emocionada"
    { masculine: /\bestoy emocionado\b/gi, feminine: 'estoy emocionada' },
    
    // "soy perfecto" -> "soy perfecta" 
    { masculine: /\bsoy perfecto\b/gi, feminine: 'soy perfecta' },
    
    // "estoy seguro" -> "estoy segura"
    { masculine: /\bestoy seguro\b/gi, feminine: 'estoy segura' },
    
    // "he terminado" -> "he terminada" (past participle agreement)
    { masculine: /\bhe terminado\b/gi, feminine: 'he terminada' },
    
    // "estoy terminado" -> "estoy terminada"
    { masculine: /\bestoy terminado\b/gi, feminine: 'estoy terminada' }
  ];
  
  // Apply each correction
  grammarCorrections.forEach(({ masculine, feminine }) => {
    correctedText = correctedText.replace(masculine, feminine);
  });
  
  return correctedText;
}

/**
 * Process audio for better playback quality
 * 
 * @param audioBlob - The raw TTS audio blob
 * @returns Processed audio with enhanced quality
 */
export async function enhanceAudioQuality(audioBlob: Blob): Promise<Blob> {
  // In a real implementation, this could:
  // - Apply compression
  // - Adjust volume levels
  // - Add subtle effects to increase naturalness
  
  console.log('Enhancing audio quality for playback');
  
  // Return the original blob for now
  // In production, this would apply actual audio processing
  return audioBlob;
}
