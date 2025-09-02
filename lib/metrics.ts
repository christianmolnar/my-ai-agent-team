import { register, Counter, Gauge, Histogram } from 'prom-client';

// Clear default metrics and register our custom ones
register.clear();

// Agent Health Metrics
export const agentHeartbeatTotal = new Counter({
  name: 'agent_heartbeat_total',
  help: 'Total number of agent heartbeats',
  labelNames: ['agent_name', 'status'],
});

export const agentQueueDepthTotal = new Gauge({
  name: 'agent_queue_depth_total',
  help: 'Current queue depth for agents',
  labelNames: ['agent_name', 'queue_type'],
});

export const agentProcessExecutionsTotal = new Counter({
  name: 'agent_process_executions_total',
  help: 'Total number of process executions by agents',
  labelNames: ['agent_name', 'process_type', 'status'],
});

// Business Process Metrics
export const businessProcessDuration = new Histogram({
  name: 'business_process_duration_seconds',
  help: 'Duration of business processes in seconds',
  labelNames: ['process_name', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
});

export const businessProcessSuccess = new Counter({
  name: 'business_process_success_total',
  help: 'Total successful business processes',
  labelNames: ['process_name'],
});

export const businessProcessErrors = new Counter({
  name: 'business_process_errors_total',
  help: 'Total business process errors',
  labelNames: ['process_name', 'error_type'],
});

// Integration Metrics
export const apiCallsTotal = new Counter({
  name: 'api_calls_total',
  help: 'Total API calls made by agents',
  labelNames: ['agent_name', 'api_endpoint', 'status_code'],
});

export const apiResponseTime = new Histogram({
  name: 'api_response_time_seconds',
  help: 'API response time in seconds',
  labelNames: ['agent_name', 'api_endpoint'],
  buckets: [0.1, 0.2, 0.5, 1, 2, 5],
});

// Resource Utilization Metrics
export const cpuUsagePercent = new Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage',
  labelNames: ['agent_name'],
});

export const memoryUsageBytes = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['agent_name'],
});

// Register all metrics
register.registerMetric(agentHeartbeatTotal);
register.registerMetric(agentQueueDepthTotal);
register.registerMetric(agentProcessExecutionsTotal);
register.registerMetric(businessProcessDuration);
register.registerMetric(businessProcessSuccess);
register.registerMetric(businessProcessErrors);
register.registerMetric(apiCallsTotal);
register.registerMetric(apiResponseTime);
register.registerMetric(cpuUsagePercent);
register.registerMetric(memoryUsageBytes);

// Initialize some baseline metrics
agentHeartbeatTotal.inc({ agent_name: 'image_generator', status: 'healthy' }, 0);
agentHeartbeatTotal.inc({ agent_name: 'tts_agent', status: 'healthy' }, 0);
agentHeartbeatTotal.inc({ agent_name: 'crypto_analyzer', status: 'healthy' }, 0);
agentHeartbeatTotal.inc({ agent_name: 'researcher', status: 'healthy' }, 0);

agentQueueDepthTotal.set({ agent_name: 'image_generator', queue_type: 'pending' }, 0);
agentQueueDepthTotal.set({ agent_name: 'tts_agent', queue_type: 'pending' }, 0);
agentQueueDepthTotal.set({ agent_name: 'crypto_analyzer', queue_type: 'pending' }, 0);
agentQueueDepthTotal.set({ agent_name: 'researcher', queue_type: 'pending' }, 0);

console.log('AI Personal Team metrics initialized');
