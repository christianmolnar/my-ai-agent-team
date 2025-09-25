/**
 * Agent ID to Environment Variable Mapping Analysis
 * 
 * This file analyzes the mapping between agent IDs in the registry
 * and the environment variable naming convention.
 */

// Current Agent IDs from registry
const AGENT_IDS = [
  'researcher',
  'communications', 
  'data-scientist',
  'front-end-developer',
  'back-end-developer',
  'full-stack-developer',
  'project-coordinator',
  'image-generator', // Note: env has IMAGE_VIDEO_GENERATOR
  'music-coach',
  'availability-reliability-expert',
  'security-expert',
  'privacy-guardian',
  'performance-expert',
  'monitoring-expert',
  'experience-designer',
  'dev-design-doc-creator',
  'product-manager',
  'test-expert',
  'vinyl-researcher',
  'master-orchestrator',
  'personal-assistant'
];

// Environment Variable Prefixes (from .env.local)
const ENV_PREFIXES = [
  'RESEARCHER',
  'COMMUNICATIONS',
  'DATA_SCIENTIST',
  'FRONT_END_DEVELOPER',
  'BACK_END_DEVELOPER', 
  'FULL_STACK_DEVELOPER',
  'PROJECT_COORDINATOR',
  'IMAGE_VIDEO_GENERATOR', // MISMATCH: agent is 'image-generator'
  'MUSIC_COACH',
  'AVAILABILITY_RELIABILITY_EXPERT',
  'SECURITY_EXPERT',
  'PRIVACY_GUARDIAN',
  'PERFORMANCE_EXPERT',
  'MONITORING_EXPERT',
  'EXPERIENCE_DESIGNER',
  'DEV_DESIGN_DOC_CREATOR',
  'PRODUCT_MANAGER',
  'TEST_EXPERT',
  // MISSING: vinyl-researcher env vars
  'MASTER_ORCHESTRATOR',
  'PERSONAL_ASSISTANT',
  'PERSONAL_ASSISTANT_BRIDGE' // Extra in env
];

/**
 * Convert agent ID to environment variable prefix
 */
export function agentIdToEnvPrefix(agentId: string): string {
  // Handle special cases first
  const specialCases: Record<string, string> = {
    'image-generator': 'IMAGE_VIDEO_GENERATOR',
    'image-video-generator': 'IMAGE_VIDEO_GENERATOR',  // Both variations
    'dev-design-doc-creator': 'DEV_DESIGN_DOC_CREATOR'
  };
  
  if (specialCases[agentId]) {
    return specialCases[agentId];
  }
  
  // Standard conversion: kebab-case to SCREAMING_SNAKE_CASE
  return agentId
    .toUpperCase()
    .replace(/-/g, '_');
}

/**
 * Get available API keys for an agent
 */
export function getAvailableProviders(agentId: string): Array<{
  name: string;
  apiKey: string | undefined;
  endpoint: string;
  model?: string;
}> {
  const envPrefix = agentIdToEnvPrefix(agentId);
  
  return [
    {
      name: 'anthropic',
      apiKey: process.env[`${envPrefix}_ANTHROPIC_API_KEY`],
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-sonnet-4-20250514'
    },
    {
      name: 'openai',
      apiKey: process.env[`${envPrefix}_OPENAI_API_KEY`],
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini'
    },
    {
      name: 'google',
      apiKey: process.env[`${envPrefix}_GOOGLE_AI_API_KEY`],
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-1.5-flash'
    }
  ].filter(provider => provider.apiKey && provider.apiKey.length > 0);
}

export { AGENT_IDS, ENV_PREFIXES };
