import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

interface ApiKeyStatus {
  envVar: string;
  provider: string;
  status: 'valid' | 'invalid' | 'rate_limited' | 'network_error' | 'unknown_error' | 'not_verified';
  error?: string;
  lastVerified: string;
  keyHash: string; // Hash of the key to detect changes
  consecutiveFailures?: number;
  lastUsed?: string;
  performanceMetrics?: {
    avgResponseTime: number;
    successRate: number;
    totalCalls: number;
  };
}

interface ApiMonitoringData {
  keys: Record<string, ApiKeyStatus>;
  lastUpdate: string;
  systemHealth: {
    overallScore: number;
    totalKeys: number;
    validKeys: number;
    problemKeys: number;
  };
}

const MONITORING_FILE = path.join(process.cwd(), 'logs', 'api-monitoring.json');

// Simple hash function for key comparison
function hashKey(key: string): string {
  return Buffer.from(key).toString('base64').slice(0, 16);
}

// Load existing monitoring data
async function loadMonitoringData(): Promise<ApiMonitoringData> {
  try {
    const data = await readFile(MONITORING_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      keys: {},
      lastUpdate: new Date().toISOString(),
      systemHealth: {
        overallScore: 0,
        totalKeys: 0,
        validKeys: 0,
        problemKeys: 0
      }
    };
  }
}

// Save monitoring data
async function saveMonitoringData(data: ApiMonitoringData): Promise<void> {
  try {
    // Ensure logs directory exists
    const logsDir = path.dirname(MONITORING_FILE);
    try {
      await readFile(logsDir);
    } catch {
      // Directory doesn't exist, but we'll let writeFile handle it
    }
    
    await writeFile(MONITORING_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save monitoring data:', error);
  }
}

// Check if a key needs verification (new, changed, or old verification)
function needsVerification(keyStatus: ApiKeyStatus | undefined, currentKeyHash: string): boolean {
  if (!keyStatus) return true; // New key
  if (keyStatus.keyHash !== currentKeyHash) return true; // Key changed
  if (keyStatus.status === 'not_verified') return true; // Never verified
  
  // Only re-verify invalid keys or very old verifications (> 7 days)
  const lastVerified = new Date(keyStatus.lastVerified);
  const now = new Date();
  const daysSinceVerification = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60 * 24);
  
  return keyStatus.status !== 'valid' || daysSinceVerification > 7;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const forceVerification = body.force === true;
    
    const monitoringData = await loadMonitoringData();
    const allKeys = { ...process.env, ...body.keys || {} };
    
    // Import verification functions from shared library
    const { verifyOpenAI, verifyAnthropic, verifyGoogleAI, verifyPerplexity, verifyStabilityAI, verifyTogetherAI, verifyCohere, verifySerpAPI, verifyDiscogs } = await import('../../../lib/api-verifiers');
    
    const providerMappings = [
      { pattern: /OPENAI_API_KEY/, provider: 'openai', verifyFn: verifyOpenAI },
      { pattern: /ANTHROPIC_API_KEY/, provider: 'anthropic', verifyFn: verifyAnthropic },
      { pattern: /GOOGLE_AI_API_KEY/, provider: 'google', verifyFn: verifyGoogleAI },
      { pattern: /PERPLEXITY_API_KEY/, provider: 'perplexity', verifyFn: verifyPerplexity },
      { pattern: /STABILITY_API_KEY/, provider: 'stability', verifyFn: verifyStabilityAI },
      { pattern: /TOGETHER_API_KEY/, provider: 'together', verifyFn: verifyTogetherAI },
      { pattern: /COHERE_API_KEY/, provider: 'cohere', verifyFn: verifyCohere },
      { pattern: /SERPAPI_KEY/, provider: 'serpapi', verifyFn: verifySerpAPI },
      { pattern: /DISCOGS_TOKEN/, provider: 'discogs', verifyFn: verifyDiscogs },
      // Placeholder verifiers for keys we don't actively verify
      { pattern: /ELEVENLABS_API_KEY/, provider: 'elevenlabs', verifyFn: async () => ({ valid: true }) },
      { pattern: /HUGGINGFACE_API_KEY/, provider: 'huggingface', verifyFn: async () => ({ valid: true }) }
    ];

    let verifiedCount = 0;
    let skippedCount = 0;

    // Process API keys
    for (const [envVar, apiKey] of Object.entries(allKeys)) {
      if ((envVar.includes('API_KEY') || envVar.includes('_TOKEN') || envVar.includes('_KEY')) && 
          apiKey && 
          typeof apiKey === 'string' && 
          apiKey.trim() !== '' &&
          !apiKey.startsWith('#') && 
          envVar !== 'NODE_ENV') {
        
        const currentKeyHash = hashKey(apiKey);
        const existingStatus = monitoringData.keys[envVar];
        
        // Check if verification is needed
        if (!forceVerification && !needsVerification(existingStatus, currentKeyHash)) {
          skippedCount++;
          continue; // Skip verification - use cached result
        }

        const mapping = providerMappings.find(m => m.pattern.test(envVar));
        
        if (mapping) {
          try {
            console.log(`Verifying ${envVar} (${mapping.provider})...`);
            const verification = await mapping.verifyFn(apiKey);
            
            const status: 'valid' | 'invalid' | 'rate_limited' | 'network_error' | 'unknown_error' = (() => {
              if (verification.valid) return 'valid';
              
              const error = (verification as any).error;
              if (error) {
                const errorLower = error.toLowerCase();
                if (errorLower.includes('429') || errorLower.includes('rate limit')) return 'rate_limited';
                if (errorLower.includes('401') || errorLower.includes('403') || errorLower.includes('invalid')) return 'invalid';
                if (errorLower.includes('500') || errorLower.includes('502') || errorLower.includes('503') || errorLower.includes('504')) return 'network_error';
              }
              
              return 'unknown_error';
            })();

            monitoringData.keys[envVar] = {
              envVar,
              provider: mapping.provider,
              status,
              error: (verification as any).error,
              lastVerified: new Date().toISOString(),
              keyHash: currentKeyHash,
              consecutiveFailures: status === 'valid' ? 0 : (existingStatus?.consecutiveFailures || 0) + 1,
              performanceMetrics: existingStatus?.performanceMetrics || {
                avgResponseTime: 0,
                successRate: 100,
                totalCalls: 0
              }
            };

            verifiedCount++;
          } catch (error) {
            console.error(`Error verifying ${envVar}:`, error);
            monitoringData.keys[envVar] = {
              envVar,
              provider: mapping.provider,
              status: 'unknown_error',
              error: error instanceof Error ? error.message : 'Verification failed',
              lastVerified: new Date().toISOString(),
              keyHash: currentKeyHash,
              consecutiveFailures: (existingStatus?.consecutiveFailures || 0) + 1
            };
            verifiedCount++;
          }
        }
      }
    }

    // Update system health
    const allStatuses = Object.values(monitoringData.keys);
    const validKeys = allStatuses.filter(k => k.status === 'valid').length;
    const problemKeys = allStatuses.filter(k => k.status !== 'valid' && k.status !== 'not_verified').length;
    
    monitoringData.systemHealth = {
      overallScore: allStatuses.length > 0 ? Math.round((validKeys / allStatuses.length) * 100) : 100,
      totalKeys: allStatuses.length,
      validKeys,
      problemKeys
    };
    
    monitoringData.lastUpdate = new Date().toISOString();

    // Save monitoring data
    await saveMonitoringData(monitoringData);

    return NextResponse.json({
      success: true,
      summary: {
        verified: verifiedCount,
        skipped: skippedCount,
        total: verifiedCount + skippedCount,
        systemHealth: monitoringData.systemHealth
      },
      keys: monitoringData.keys,
      message: `Smart verification: ${verifiedCount} verified, ${skippedCount} skipped (using cached results)`
    });

  } catch (error) {
    console.error('Smart API monitoring error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving monitoring data
export async function GET() {
  try {
    const monitoringData = await loadMonitoringData();
    
    return NextResponse.json({
      success: true,
      ...monitoringData
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load monitoring data'
      },
      { status: 500 }
    );
  }
}
