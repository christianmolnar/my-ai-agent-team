// Enhanced AI Personal Team Metrics - Per-Agent and Cross-Agent Analytics
// File: lib/enhanced-metrics.ts

import { register, Counter, Histogram, Gauge, Summary } from 'prom-client';

// ===================================================================
// PER-AGENT ACTION METRICS
// ===================================================================

// TTS Agent Specific Metrics
export const ttsActionRequests = new Counter({
  name: 'tts_agent_action_requests_total',
  help: 'Total TTS action requests by voice and language',
  labelNames: ['voice_type', 'language', 'speed', 'pitch', 'status'], // status: success, failure, timeout
});

export const ttsActionDuration = new Histogram({
  name: 'tts_agent_action_duration_seconds',
  help: 'TTS generation time per action',
  labelNames: ['voice_type', 'language', 'text_length_category'], // short, medium, long
  buckets: [0.5, 1, 2, 5, 10, 15, 30],
});

export const ttsQueueWaitTime = new Histogram({
  name: 'tts_agent_queue_wait_seconds',
  help: 'Time requests wait in TTS queue',
  labelNames: ['priority'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// Image Generation Agent Specific Metrics
export const imageGenActionRequests = new Counter({
  name: 'image_gen_agent_action_requests_total',
  help: 'Total image generation requests by style and size',
  labelNames: ['style', 'size', 'model', 'status'],
});

export const imageGenActionDuration = new Histogram({
  name: 'image_gen_agent_action_duration_seconds',
  help: 'Image generation time per action',
  labelNames: ['style', 'size', 'complexity'], // simple, medium, complex
  buckets: [5, 10, 20, 30, 60, 120, 300],
});

export const imageGenResourceUsage = new Gauge({
  name: 'image_gen_agent_gpu_utilization_percent',
  help: 'GPU utilization during image generation',
  labelNames: ['model', 'size'],
});

// Research Agent Specific Metrics
export const researchActionRequests = new Counter({
  name: 'research_agent_action_requests_total',
  help: 'Total research requests by type and depth',
  labelNames: ['research_type', 'depth', 'sources_count', 'status'], // depth: quick, standard, deep
});

export const researchActionDuration = new Histogram({
  name: 'research_agent_action_duration_seconds',
  help: 'Research completion time per action',
  labelNames: ['research_type', 'depth', 'sources_count'],
  buckets: [10, 30, 60, 120, 300, 600, 1200],
});

export const researchSourcesAccessed = new Counter({
  name: 'research_agent_sources_accessed_total',
  help: 'Number of sources accessed per research request',
  labelNames: ['source_type', 'success'], // source_type: web, academic, news, etc.
});

// Crypto Agent Specific Metrics
export const cryptoActionRequests = new Counter({
  name: 'crypto_agent_action_requests_total',
  help: 'Total crypto analysis requests by type',
  labelNames: ['analysis_type', 'exchange', 'symbol', 'status'], // analysis_type: price, trend, portfolio
});

export const cryptoActionDuration = new Histogram({
  name: 'crypto_agent_action_duration_seconds',
  help: 'Crypto analysis time per action',
  labelNames: ['analysis_type', 'complexity'],
  buckets: [0.5, 1, 2, 5, 10, 20, 60],
});

export const cryptoApiCallsPerAction = new Counter({
  name: 'crypto_agent_api_calls_per_action_total',
  help: 'Number of API calls required per crypto action',
  labelNames: ['api_provider', 'action_type'],
});

// ===================================================================
// CROSS-AGENT WORKFLOW METRICS
// ===================================================================

// Multi-Agent Workflows
export const workflowExecution = new Counter({
  name: 'multi_agent_workflow_executions_total',
  help: 'Cross-agent workflow executions',
  labelNames: ['workflow_type', 'agents_involved', 'status'], // workflow_type: research_to_summary, data_to_visualization
});

export const workflowDuration = new Histogram({
  name: 'multi_agent_workflow_duration_seconds',
  help: 'End-to-end workflow completion time',
  labelNames: ['workflow_type', 'agents_count'],
  buckets: [30, 60, 120, 300, 600, 1200, 1800],
});

export const agentHandoffTime = new Histogram({
  name: 'agent_handoff_duration_seconds',
  help: 'Time between agent handoffs in workflows',
  labelNames: ['from_agent', 'to_agent'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// ===================================================================
// BUSINESS INTELLIGENCE METRICS
// ===================================================================

// User Interaction Patterns
export const userSessionDuration = new Histogram({
  name: 'user_session_duration_seconds',
  help: 'User session length',
  labelNames: ['user_type'], // free, premium, enterprise
  buckets: [60, 300, 600, 1200, 1800, 3600],
});

export const userAgentPreference = new Counter({
  name: 'user_agent_preference_total',
  help: 'Which agents users prefer to use',
  labelNames: ['agent_type', 'user_segment'],
});

export const businessValueGenerated = new Counter({
  name: 'business_value_generated_total',
  help: 'Business value metrics per agent action',
  labelNames: ['agent_type', 'value_category'], // value_category: time_saved, cost_reduction, revenue_generation
});

// ===================================================================
// REAL-TIME FLEET ANALYTICS
// ===================================================================

// Agent Fleet Status
export const agentFleetSize = new Gauge({
  name: 'agent_fleet_size_total',
  help: 'Current number of active agents by type',
  labelNames: ['agent_type', 'status'], // status: active, idle, busy, error
});

export const agentLoadDistribution = new Gauge({
  name: 'agent_load_distribution_percent',
  help: 'Load distribution across agent fleet',
  labelNames: ['agent_type', 'load_category'], // load_category: underutilized, optimal, overloaded
});

export const agentCapacityUtilization = new Gauge({
  name: 'agent_capacity_utilization_percent',
  help: 'How much of each agent type capacity is being used',
  labelNames: ['agent_type'],
});

// ===================================================================
// QUALITY & SATISFACTION METRICS
// ===================================================================

// Output Quality Tracking
export const agentOutputQuality = new Histogram({
  name: 'agent_output_quality_score',
  help: 'Quality score of agent outputs (1-10 scale)',
  labelNames: ['agent_type', 'quality_dimension'], // quality_dimension: accuracy, relevance, completeness
  buckets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
});

export const userSatisfactionScore = new Histogram({
  name: 'user_satisfaction_score',
  help: 'User satisfaction with agent interactions',
  labelNames: ['agent_type', 'interaction_type'],
  buckets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
});

// ===================================================================
// COST & EFFICIENCY METRICS
// ===================================================================

// Cost Per Action
export const agentActionCost = new Histogram({
  name: 'agent_action_cost_usd',
  help: 'Cost per agent action in USD',
  labelNames: ['agent_type', 'cost_category'], // cost_category: api_calls, compute, storage
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 5],
});

export const agentEfficiencyRatio = new Gauge({
  name: 'agent_efficiency_ratio',
  help: 'Efficiency ratio (output value / input cost)',
  labelNames: ['agent_type'],
});

// ===================================================================
// HELPER FUNCTIONS FOR INSTRUMENTATION
// ===================================================================

export class AgentMetricsInstrumentation {
  // TTS Agent Instrumentation
  static recordTTSAction(voice: string, language: string, textLength: string, duration: number, success: boolean) {
    const status = success ? 'success' : 'failure';
    ttsActionRequests.labels(voice, language, 'normal', 'normal', status).inc();
    ttsActionDuration.labels(voice, language, textLength).observe(duration);
  }

  // Image Generation Instrumentation
  static recordImageGenAction(style: string, size: string, model: string, duration: number, success: boolean) {
    const status = success ? 'success' : 'failure';
    imageGenActionRequests.labels(style, size, model, status).inc();
    imageGenActionDuration.labels(style, size, 'medium').observe(duration);
  }

  // Research Agent Instrumentation
  static recordResearchAction(type: string, depth: string, sourcesCount: number, duration: number, success: boolean) {
    const status = success ? 'success' : 'failure';
    researchActionRequests.labels(type, depth, sourcesCount.toString(), status).inc();
    researchActionDuration.labels(type, depth, sourcesCount.toString()).observe(duration);
  }

  // Crypto Agent Instrumentation
  static recordCryptoAction(analysisType: string, exchange: string, symbol: string, duration: number, success: boolean) {
    const status = success ? 'success' : 'failure';
    cryptoActionRequests.labels(analysisType, exchange, symbol, status).inc();
    cryptoActionDuration.labels(analysisType, 'standard').observe(duration);
  }

  // Workflow Instrumentation
  static recordWorkflow(workflowType: string, agentsInvolved: string[], duration: number, success: boolean) {
    const status = success ? 'success' : 'failure';
    const agentsCount = agentsInvolved.length.toString();
    workflowExecution.labels(workflowType, agentsInvolved.join(','), status).inc();
    workflowDuration.labels(workflowType, agentsCount).observe(duration);
  }

  // Business Value Tracking
  static recordBusinessValue(agentType: string, valueCategory: string, amount: number = 1) {
    businessValueGenerated.labels(agentType, valueCategory).inc(amount);
  }

  // Quality Tracking
  static recordOutputQuality(agentType: string, qualityDimension: string, score: number) {
    agentOutputQuality.labels(agentType, qualityDimension).observe(score);
  }

  // Fleet Status Updates
  static updateFleetStatus(agentType: string, activeCount: number, idleCount: number, busyCount: number, errorCount: number) {
    agentFleetSize.labels(agentType, 'active').set(activeCount);
    agentFleetSize.labels(agentType, 'idle').set(idleCount);
    agentFleetSize.labels(agentType, 'busy').set(busyCount);
    agentFleetSize.labels(agentType, 'error').set(errorCount);
  }

  // Capacity Utilization
  static updateCapacityUtilization(agentType: string, utilizationPercent: number) {
    agentCapacityUtilization.labels(agentType).set(utilizationPercent);
  }
}

export { register };
