// Enhanced Robot Fleet Metrics with Multi-Tenant Support
// File: lib/enhanced-robot-fleet-metrics.ts

import { register, Counter, Histogram, Gauge, Summary } from 'prom-client';

// ===================================================================
// MULTI-TENANT CONFIGURATION
// ===================================================================

export const ENTERPRISE_TENANTS = [
  { name: 'NASA', scale: 0.25, priority: 'critical' },
  { name: 'Microsoft', scale: 0.20, priority: 'high' },
  { name: 'Ernst-Young', scale: 0.18, priority: 'high' },
  { name: 'NASDAQ', scale: 0.15, priority: 'medium' },
  { name: 'Google', scale: 0.12, priority: 'medium' },
  { name: 'Apple', scale: 0.10, priority: 'medium' },
] as const;

// ===================================================================
// ENHANCED ROBOT FLEET STATUS METRICS
// ===================================================================

// Fleet Overview Metrics with Tenant Labels
export const robotFleetTotal = new Gauge({
  name: 'robot_fleet_total',
  help: 'Total deployable robot capacity by tenant',
  labelNames: ['robot_type', 'tenant'], // Added tenant label
});

export const robotFleetHealthy = new Gauge({
  name: 'robot_fleet_healthy',
  help: 'Number of healthy robots by type and tenant',
  labelNames: ['robot_type', 'tenant'],
});

export const robotFleetDegraded = new Gauge({
  name: 'robot_fleet_degraded', 
  help: 'Number of degraded robots by type and tenant',
  labelNames: ['robot_type', 'tenant'],
});

export const robotFleetCritical = new Gauge({
  name: 'robot_fleet_critical',
  help: 'Number of critical robots by type and tenant', 
  labelNames: ['robot_type', 'tenant'],
});

export const robotFleetDown = new Gauge({
  name: 'robot_fleet_down',
  help: 'Number of down robots by type and tenant',
  labelNames: ['robot_type', 'tenant'],
});

// Total Active Robots (sum of healthy + degraded + critical)
export const robotFleetActiveTotal = new Gauge({
  name: 'robot_fleet_active_total',
  help: 'Total number of active robots (healthy + degraded + critical)',
  labelNames: ['tenant'],
});

// ===================================================================
// INTEGRATION MONITORING METRICS
// ===================================================================

// OpenAI API Monitoring
export const openaiApiMetrics = {
  availability: new Gauge({
    name: 'openai_api_availability_status',
    help: 'OpenAI API availability (1 = up, 0 = down)',
  }),
  responseTime: new Histogram({
    name: 'openai_api_response_time_seconds',
    help: 'OpenAI API response time',
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  }),
  rateLimitUsage: new Gauge({
    name: 'openai_api_rate_limit_utilization_percent',
    help: 'OpenAI API rate limit utilization percentage',
  }),
  errorRate: new Counter({
    name: 'openai_api_errors_total',
    help: 'Total OpenAI API errors',
    labelNames: ['error_type'],
  }),
};

// Whisper TTS Monitoring
export const whisperTtsMetrics = {
  availability: new Gauge({
    name: 'whisper_tts_availability_status',
    help: 'Whisper TTS service availability',
  }),
  processingTime: new Histogram({
    name: 'whisper_tts_audio_processing_seconds',
    help: 'Audio processing time by file size',
    labelNames: ['file_size_category'],
    buckets: [1, 5, 10, 30, 60, 120, 300],
  }),
  transcriptionAccuracy: new Gauge({
    name: 'whisper_tts_transcription_accuracy_percent',
    help: 'Transcription accuracy percentage',
    labelNames: ['audio_quality'],
  }),
};

// Schwab API Monitoring
export const schwabApiMetrics = {
  availability: new Gauge({
    name: 'schwab_api_availability_status',
    help: 'Schwab API availability status',
  }),
  marketDataLatency: new Histogram({
    name: 'schwab_api_market_data_delay_seconds',
    help: 'Market data latency from Schwab API',
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  }),
  tradingSuccessRate: new Gauge({
    name: 'schwab_api_order_success_rate_percent',
    help: 'Trading order success rate',
  }),
  dataFreshness: new Gauge({
    name: 'schwab_api_data_age_seconds',
    help: 'Age of most recent market data',
  }),
};

// Coinbase API Monitoring
export const coinbaseApiMetrics = {
  availability: new Gauge({
    name: 'coinbase_api_availability_status',
    help: 'Coinbase API availability status',
  }),
  cryptoDataFreshness: new Gauge({
    name: 'coinbase_api_data_age_seconds',
    help: 'Age of crypto market data',
  }),
  walletSyncStatus: new Gauge({
    name: 'coinbase_wallet_sync_success_rate_percent',
    help: 'Wallet synchronization success rate',
  }),
  transactionLatency: new Histogram({
    name: 'coinbase_api_transaction_time_seconds',
    help: 'Cryptocurrency transaction processing time',
    buckets: [1, 5, 10, 30, 60, 300],
  }),
};

// ===================================================================
// INFRASTRUCTURE MONITORING METRICS
// ===================================================================

// Network Infrastructure (UiPath Architecture Simulation)
export const networkMetrics = {
  orchestratorConnectivity: new Gauge({
    name: 'uipath_orchestrator_connectivity_status',
    help: 'UiPath Orchestrator connectivity status',
    labelNames: ['orchestrator_instance'],
  }),
  robotHeartbeat: new Counter({
    name: 'uipath_robot_heartbeat_success_total',
    help: 'Successful robot heartbeats to orchestrator',
    labelNames: ['robot_id', 'tenant'],
  }),
  queueDepth: new Gauge({
    name: 'uipath_orchestrator_queue_length',
    help: 'Number of items in UiPath orchestrator queues',
    labelNames: ['queue_name', 'tenant'],
  }),
  dmzLatency: new Gauge({
    name: 'network_dmz_response_time_ms',
    help: 'DMZ network response time in milliseconds',
    labelNames: ['zone'],
  }),
  bandwidthUtilization: new Gauge({
    name: 'network_internal_utilization_percent',
    help: 'Internal network bandwidth utilization',
    labelNames: ['segment'],
  }),
  loadBalancerHealth: new Gauge({
    name: 'load_balancer_backend_health',
    help: 'Load balancer backend health ratio',
    labelNames: ['load_balancer_name'],
  }),
  vpnConnectionStatus: new Gauge({
    name: 'vpn_connection_uptime_percent',
    help: 'VPN connection uptime percentage',
    labelNames: ['vpn_endpoint'],
  }),
};

// ===================================================================
// SUCCESS RATE METRICS
// ===================================================================

export const robotSuccessRate = new Gauge({
  name: 'robot_success_rate_percent',
  help: 'Success rate percentage for each robot type by tenant',
  labelNames: ['robot_type', 'tenant', 'function_type'],
});

// ===================================================================
// RESOURCE UTILIZATION METRICS
// ===================================================================

export const robotCpuUtilization = new Gauge({
  name: 'robot_cpu_utilization_percent',
  help: 'CPU utilization percentage by robot type and tenant',
  labelNames: ['robot_type', 'tenant'],
});

export const robotMemoryUtilization = new Gauge({
  name: 'robot_memory_utilization_percent', 
  help: 'Memory utilization percentage by robot type and tenant',
  labelNames: ['robot_type', 'tenant'],
});

export const robotThroughputRate = new Gauge({
  name: 'robot_throughput_transactions_per_minute',
  help: 'Current throughput rate by robot type and tenant',
  labelNames: ['robot_type', 'tenant'],
});

export const robotThroughputBaseline = new Gauge({
  name: 'robot_throughput_baseline_transactions_per_minute',
  help: 'Baseline throughput rate by robot type and tenant',
  labelNames: ['robot_type', 'tenant'],
});

// ===================================================================
// API HEALTH METRICS
// ===================================================================

export const apiHealthStatus = new Gauge({
  name: 'up',
  help: 'API endpoint availability (1 = up, 0 = down)',
  labelNames: ['job', 'instance'],
});

export const apiResponseTime = new Histogram({
  name: 'api_response_time_seconds',
  help: 'API response time in seconds',
  labelNames: ['api_name', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const apiErrorRate = new Counter({
  name: 'api_errors_total',
  help: 'Total API errors by type',
  labelNames: ['api_name', 'error_type'],
});

export const apiRateLimitUsage = new Gauge({
  name: 'api_rate_limit_utilization_percent',
  help: 'API rate limit utilization percentage',
  labelNames: ['api_name'],
});

// Database Performance Monitoring
export const databaseMetrics = {
  supabaseConnections: new Gauge({
    name: 'supabase_active_connections',
    help: 'Active Supabase database connections',
    labelNames: ['database_name'],
  }),
  supabaseMaxConnections: new Gauge({
    name: 'supabase_max_connections',
    help: 'Maximum Supabase database connections',
    labelNames: ['database_name'],
  }),
  supabaseSlowQueries: new Counter({
    name: 'supabase_slow_queries_total',
    help: 'Total slow queries in Supabase',
    labelNames: ['database_name', 'query_type'],
  }),
  supabaseStorageUsage: new Gauge({
    name: 'supabase_storage_usage_percent',
    help: 'Supabase storage utilization percentage',
    labelNames: ['database_name'],
  }),
  redisHitRatio: new Gauge({
    name: 'redis_cache_hit_ratio_percent',
    help: 'Redis cache hit ratio percentage',
    labelNames: ['redis_instance'],
  }),
  redisMemoryUsage: new Gauge({
    name: 'redis_memory_utilization_percent',
    help: 'Redis memory utilization percentage',
    labelNames: ['redis_instance'],
  }),
  prometheusStorageUsage: new Gauge({
    name: 'prometheus_tsdb_disk_usage_percent',
    help: 'Prometheus time series database storage usage',
    labelNames: ['instance'],
  }),
  prometheusIngestionRate: new Gauge({
    name: 'prometheus_samples_ingested_per_second',
    help: 'Prometheus samples ingested per second',
    labelNames: ['instance'],
  }),
};

// ===================================================================
// ENHANCED ROBOT FLEET INSTRUMENTATION CLASS
// ===================================================================

export class EnhancedRobotFleetInstrumentation {
  // Internal tracking for total active robots calculation
  private static tenantActiveRobots: Map<string, number> = new Map();
  
  // Multi-Tenant Fleet Status Updates with safeguards
  static updateFleetStatus(robotType: string, tenant: string, total: number, healthy: number, degraded: number, critical: number, down: number) {
    // Ensure all values are non-negative
    const safeTotal = Math.max(0, total);
    const safeHealthy = Math.max(0, Math.min(healthy, safeTotal));
    const safeDegraded = Math.max(0, Math.min(degraded, safeTotal - safeHealthy));
    const safeCritical = Math.max(0, Math.min(critical, safeTotal - safeHealthy - safeDegraded));
    const safeDown = Math.max(0, Math.min(down, safeTotal - safeHealthy - safeDegraded - safeCritical));
    
    robotFleetTotal.labels(robotType, tenant).set(safeTotal);
    robotFleetHealthy.labels(robotType, tenant).set(safeHealthy);
    robotFleetDegraded.labels(robotType, tenant).set(safeDegraded);
    robotFleetCritical.labels(robotType, tenant).set(safeCritical);
    robotFleetDown.labels(robotType, tenant).set(safeDown);
    
    // Track active robots for this tenant (healthy + degraded + critical)
    const activeCount = safeHealthy + safeDegraded + safeCritical;
    const currentTotal = this.tenantActiveRobots.get(tenant) || 0;
    this.tenantActiveRobots.set(tenant, currentTotal + activeCount);
  }

  // Update Total Active Robots per tenant (called after all robot types are updated)
  static updateTotalActiveRobots() {
    // Clear previous totals
    this.tenantActiveRobots.clear();
    
    // Set the total active robots metrics
    ENTERPRISE_TENANTS.forEach(tenant => {
      const totalActive = this.tenantActiveRobots.get(tenant.name) || 0;
      robotFleetActiveTotal.labels(tenant.name).set(totalActive);
    });
  }

  // Initialize Multi-Tenant Fleet Data
  static initializeEnhancedFleetData() {
    const baseFleetConfig = [
      { type: 'image_generator', baseTotal: 800000, baseline: 90, cpuAvg: 65, memAvg: 70 },    // 800K robots
      { type: 'vinyl_researcher', baseTotal: 300000, baseline: 25, cpuAvg: 45, memAvg: 60 },  // 300K robots  
      { type: 'communications', baseTotal: 900000, baseline: 170, cpuAvg: 35, memAvg: 50 },   // 900K robots
      { type: 'memorias_ai', baseTotal: 1200000, baseline: 285, cpuAvg: 55, memAvg: 65 },     // 1.2M robots
      { type: 'fact_checker', baseTotal: 400000, baseline: 32, cpuAvg: 40, memAvg: 55 },      // 400K robots
      { type: 'finsight_ai', baseTotal: 600000, baseline: 142, cpuAvg: 50, memAvg: 60 },      // 600K robots
    ]; // Total: 4.2M robots - realistic UiPath enterprise scale

    // Generate metrics for each tenant
    ENTERPRISE_TENANTS.forEach(tenant => {
      baseFleetConfig.forEach(config => {
        const tenantTotal = Math.floor(config.baseTotal * tenant.scale);
        
        // Apply tenant-specific performance variations
        const performanceMultiplier = this.getTenantPerformanceMultiplier(tenant.name);
        
        // UiPath Status Heuristics with Enterprise Color Coding:
        // 🟢 GREEN (Healthy): 85-98% operational
        // 🟡 YELLOW (Degraded): 70-84% operational  
        // 🟠 ORANGE (Critical): 50-69% operational
        // 🔴 RED (Down): <50% operational
        
        // Calculate healthy ratio based on tenant performance (85-98%)
        const baseHealthyRatio = 0.85 + (Math.random() * 0.13); // 85-98%
        const tenantHealthyBonus = this.getTenantPerformanceMultiplier(tenant.name) * 0.02;
        const healthyRatio = Math.max(0.82, Math.min(0.98, baseHealthyRatio + tenantHealthyBonus));
        
        // Degraded ratio (2-8% of fleet experiencing performance issues)
        const degradedRatio = Math.max(0.02, Math.min(0.08, 0.03 + Math.random() * 0.05));
        
        // Critical ratio (0.5-3% of fleet in critical state)
        const criticalRatio = Math.max(0.005, Math.min(0.03, 0.008 + Math.random() * 0.015));
        
        // Down ratio (remaining fleet - typically 0-2%)
        const downRatio = Math.max(0, Math.min(0.02, 1 - healthyRatio - degradedRatio - criticalRatio));
        
        // Ensure ratios don't exceed 100% total with normalized distribution
        const totalRatio = healthyRatio + degradedRatio + criticalRatio + downRatio;
        const normalizedHealthy = totalRatio > 1 ? healthyRatio / totalRatio : healthyRatio;
        const normalizedDegraded = totalRatio > 1 ? degradedRatio / totalRatio : degradedRatio;
        const normalizedCritical = totalRatio > 1 ? criticalRatio / totalRatio : criticalRatio;
        const normalizedDown = totalRatio > 1 ? downRatio / totalRatio : downRatio;
        
        const healthy = Math.floor(tenantTotal * normalizedHealthy);
        const degraded = Math.floor(tenantTotal * normalizedDegraded);
        const critical = Math.floor(tenantTotal * normalizedCritical);
        const down = Math.max(0, tenantTotal - healthy - degraded - critical);

        this.updateFleetStatus(config.type, tenant.name, tenantTotal, healthy, degraded, critical, down);
        
        // Success rates with tenant variation
        const baseSuccess = 95 + Math.random() * 4; // 95-99%
        const tenantVariation = (Math.random() - 0.5) * 5; // ±2.5%
        const successRate = Math.max(85, Math.min(99.5, baseSuccess + tenantVariation));
        
        this.updateSuccessRate(config.type, tenant.name, 'primary_function', successRate);
        
        // Throughput with tenant-specific variation
        const tenantThroughputMultiplier = 0.8 + Math.random() * 0.4; // 0.8-1.2x
        const currentThroughput = config.baseline * tenantThroughputMultiplier;
        
        this.updateThroughput(config.type, tenant.name, currentThroughput, config.baseline);
        
        // Resource utilization with tenant-specific patterns
        const tenantCpuBase = config.cpuAvg + (tenant.scale - 0.15) * 20; // Larger tenants = higher utilization
        const tenantMemBase = config.memAvg + (tenant.scale - 0.15) * 15;
        
        const cpuUtil = Math.max(10, Math.min(95, tenantCpuBase + (Math.random() - 0.5) * 15));
        const memUtil = Math.max(10, Math.min(95, tenantMemBase + (Math.random() - 0.5) * 15));
        
        this.updateResourceUtilization(config.type, tenant.name, cpuUtil, memUtil);
      });
    });

    // Generate total summaries with UiPath enterprise heuristics
    baseFleetConfig.forEach(config => {
      const totalRobots = config.baseTotal;
      
      // UiPath Enterprise Fleet Status Distribution:
      // 🟢 Healthy: 88-96% (enterprise-grade reliability)
      // 🟡 Degraded: 2-6% (performance issues, maintenance)
      // 🟠 Critical: 0.5-2% (requiring immediate attention)
      // 🔴 Down: 0-2% (offline, failed, disconnected)
      
      const healthyRatio = Math.max(0.88, Math.min(0.96, 0.91 + Math.random() * 0.05));
      const degradedRatio = Math.max(0.02, Math.min(0.06, 0.03 + Math.random() * 0.03));
      const criticalRatio = Math.max(0.005, Math.min(0.02, 0.008 + Math.random() * 0.012));
      const downRatio = Math.max(0, Math.min(0.02, 1 - healthyRatio - degradedRatio - criticalRatio));
      
      // Normalize ratios to ensure they don't exceed 100%
      const totalRatio = healthyRatio + degradedRatio + criticalRatio + downRatio;
      const normalizedHealthy = totalRatio > 1 ? healthyRatio / totalRatio : healthyRatio;
      const normalizedDegraded = totalRatio > 1 ? degradedRatio / totalRatio : degradedRatio;
      const normalizedCritical = totalRatio > 1 ? criticalRatio / totalRatio : criticalRatio;
      const normalizedDown = totalRatio > 1 ? downRatio / totalRatio : downRatio;
      
      const totalHealthy = Math.floor(totalRobots * normalizedHealthy);
      const totalDegraded = Math.floor(totalRobots * normalizedDegraded);
      const totalCritical = Math.floor(totalRobots * normalizedCritical);
      const totalDown = Math.max(0, totalRobots - totalHealthy - totalDegraded - totalCritical);

      this.updateFleetStatus(config.type, 'total', totalRobots, totalHealthy, totalDegraded, totalCritical, totalDown);
      this.updateSuccessRate(config.type, 'total', 'primary_function', 95 + Math.random() * 4);
      this.updateThroughput(config.type, 'total', config.baseline * (0.9 + Math.random() * 0.2), config.baseline);
      this.updateResourceUtilization(config.type, 'total', config.cpuAvg + (Math.random() - 0.5) * 20, config.memAvg + (Math.random() - 0.5) * 20);
    });
    
    // Update total active robots after all fleet status updates
    this.updateTotalActiveRobots();
    
    // Initialize integration metrics
    this.initializeIntegrationMetrics();
    this.initializeNetworkMetrics();
    this.initializeDatabaseMetrics();
  }

  // Update success rates with bounds checking
  static updateSuccessRate(robotType: string, tenant: string, functionType: string, successRate: number) {
    const safeSuccessRate = Math.max(0, Math.min(100, successRate));
    robotSuccessRate.labels(robotType, tenant, functionType).set(safeSuccessRate);
  }

  // Update throughput metrics with non-negative values
  static updateThroughput(robotType: string, tenant: string, currentRate: number, baselineRate: number) {
    const safeCurrentRate = Math.max(0, currentRate);
    const safeBaselineRate = Math.max(0, baselineRate);
    robotThroughputRate.labels(robotType, tenant).set(safeCurrentRate);
    robotThroughputBaseline.labels(robotType, tenant).set(safeBaselineRate);
  }

  // Update resource utilization with percentage bounds
  static updateResourceUtilization(robotType: string, tenant: string, cpuPercent: number, memoryPercent: number) {
    const safeCpuPercent = Math.max(0, Math.min(100, cpuPercent));
    const safeMemoryPercent = Math.max(0, Math.min(100, memoryPercent));
    robotCpuUtilization.labels(robotType, tenant).set(safeCpuPercent);
    robotMemoryUtilization.labels(robotType, tenant).set(safeMemoryPercent);
  }

  // Initialize integration monitoring
  static initializeIntegrationMetrics() {
    // API Health Status
    const apis = [
      { name: 'openai-api', status: Math.random() > 0.05 ? 1 : 0 },
      { name: 'whisper-tts', status: Math.random() > 0.02 ? 1 : 0 },
      { name: 'schwab-api', status: Math.random() > 0.03 ? 1 : 0 },
      { name: 'coinbase-api', status: Math.random() > 0.04 ? 1 : 0 },
      { name: 'discogs-api', status: Math.random() > 0.06 ? 1 : 0 },
      { name: 'musicbrainz-api', status: Math.random() > 0.03 ? 1 : 0 },
      { name: 'alpha-vantage', status: Math.random() > 0.02 ? 1 : 0 },
      { name: 'polygon-io', status: Math.random() > 0.03 ? 1 : 0 },
    ];

    apis.forEach(api => {
      apiHealthStatus.labels(api.name, `${api.name}-instance`).set(api.status);
      
      // Response times
      const responseTime = api.status === 1 ? Math.random() * 2 + 0.1 : Math.random() * 10 + 5;
      apiResponseTime.labels(api.name, 'primary').observe(responseTime);
      
      // Rate limit usage
      apiRateLimitUsage.labels(api.name).set(Math.random() * 80 + 10); // 10-90%
    });
  }

  // Initialize network monitoring
  static initializeNetworkMetrics() {
    // UiPath Orchestrator
    networkMetrics.orchestratorConnectivity.labels('primary').set(Math.random() > 0.02 ? 1 : 0);
    
    // Queue depths per tenant
    ENTERPRISE_TENANTS.forEach(tenant => {
      networkMetrics.queueDepth.labels('high-priority', tenant.name).set(Math.floor(Math.random() * 50));
      networkMetrics.queueDepth.labels('normal-priority', tenant.name).set(Math.floor(Math.random() * 200));
    });

    // Network latency
    networkMetrics.dmzLatency.labels('external').set(80 + Math.random() * 40); // 80-120ms
    networkMetrics.bandwidthUtilization.labels('core').set(30 + Math.random() * 40); // 30-70%
    
    // Load balancer health
    networkMetrics.loadBalancerHealth.labels('primary-lb').set(0.85 + Math.random() * 0.14); // 85-99%
    
    // VPN status
    networkMetrics.vpnConnectionStatus.labels('site-to-site').set(98 + Math.random() * 2); // 98-100%
  }

  // Initialize database monitoring
  static initializeDatabaseMetrics() {
    // Supabase metrics
    databaseMetrics.supabaseConnections.labels('primary').set(45 + Math.floor(Math.random() * 30)); // 45-75
    databaseMetrics.supabaseMaxConnections.labels('primary').set(100);
    databaseMetrics.supabaseStorageUsage.labels('primary').set(25 + Math.random() * 50); // 25-75%
    
    // Redis metrics
    databaseMetrics.redisHitRatio.labels('cache-01').set(85 + Math.random() * 12); // 85-97%
    databaseMetrics.redisMemoryUsage.labels('cache-01').set(40 + Math.random() * 35); // 40-75%
    
    // Prometheus metrics
    databaseMetrics.prometheusStorageUsage.labels('prometheus-01').set(45 + Math.random() * 30); // 45-75%
    databaseMetrics.prometheusIngestionRate.labels('prometheus-01').set(5000 + Math.random() * 3000); // 5K-8K samples/sec
  }

  // Simulate transaction activity
  static simulateTransactionActivity() {
    const robotTypes = ['image_generator', 'vinyl_researcher', 'communications', 'memorias_ai', 'fact_checker', 'finsight_ai'];
    
    robotTypes.forEach(robotType => {
      ENTERPRISE_TENANTS.forEach(tenant => {
        // Simulate heartbeats
        const heartbeatCount = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < heartbeatCount; i++) {
          networkMetrics.robotHeartbeat.labels(`${robotType}-${Math.floor(Math.random() * 1000)}`, tenant.name).inc();
        }
      });
    });

    // Simulate slow queries
    if (Math.random() < 0.1) { // 10% chance of slow query
      databaseMetrics.supabaseSlowQueries.labels('primary', 'SELECT').inc();
    }
    
    // Simulate API errors
    if (Math.random() < 0.05) { // 5% chance of API error
      const apis = ['openai-api', 'whisper-tts', 'schwab-api', 'coinbase-api'];
      const randomApi = apis[Math.floor(Math.random() * apis.length)];
      apiErrorRate.labels(randomApi, 'timeout').inc();
    }
  }

  // Tenant Performance Multiplier (NASA and Microsoft perform better)
  private static getTenantPerformanceMultiplier(tenantName: string): number {
    const multipliers: Record<string, number> = {
      'NASA': 1.1,        // Best performance
      'Microsoft': 1.08,  // Excellent performance
      'Ernst-Young': 1.05, // Good performance
      'NASDAQ': 1.02,     // Slightly above average
      'Google': 1.0,      // Average performance
      'Apple': 0.98,      // Slightly below average
    };
    return multipliers[tenantName] || 1.0;
  }

  // Update Integration Metrics
  static updateIntegrationHealth() {
    // OpenAI API Simulation
    const openaiAvailable = Math.random() > 0.05; // 95% uptime
    openaiApiMetrics.availability.set(openaiAvailable ? 1 : 0);
    openaiApiMetrics.responseTime.observe(Math.random() * 2 + 0.5);
    openaiApiMetrics.rateLimitUsage.set(Math.random() * 80 + 10);

    // Whisper TTS Simulation
    const whisperAvailable = Math.random() > 0.03; // 97% uptime
    whisperTtsMetrics.availability.set(whisperAvailable ? 1 : 0);
    whisperTtsMetrics.processingTime.labels('medium').observe(Math.random() * 15 + 5);
    whisperTtsMetrics.transcriptionAccuracy.labels('high').set(Math.random() * 5 + 95);

    // Schwab API Simulation
    const schwabAvailable = Math.random() > 0.02; // 98% uptime
    schwabApiMetrics.availability.set(schwabAvailable ? 1 : 0);
    schwabApiMetrics.marketDataLatency.observe(Math.random() * 1 + 0.1);
    schwabApiMetrics.tradingSuccessRate.set(Math.random() * 3 + 97);
    schwabApiMetrics.dataFreshness.set(Math.random() * 5);

    // Coinbase API Simulation
    const coinbaseAvailable = Math.random() > 0.04; // 96% uptime
    coinbaseApiMetrics.availability.set(coinbaseAvailable ? 1 : 0);
    coinbaseApiMetrics.cryptoDataFreshness.set(Math.random() * 10 + 1);
    coinbaseApiMetrics.walletSyncStatus.set(Math.random() * 2 + 98);
  }

  // Update Infrastructure Metrics
  static updateInfrastructureHealth() {
    // Network Infrastructure
    networkMetrics.orchestratorConnectivity.labels('primary').set(Math.random() > 0.01 ? 1 : 0); // 99% uptime
    networkMetrics.queueDepth.labels('high-priority', 'NASA').set(Math.floor(Math.random() * 50));
    networkMetrics.dmzLatency.labels('external').set(Math.random() * 20 + 5);
    networkMetrics.bandwidthUtilization.labels('core').set(Math.random() * 30 + 40);
    networkMetrics.loadBalancerHealth.labels('primary-lb').set(0.85 + Math.random() * 0.14);
    networkMetrics.vpnConnectionStatus.labels('site-to-site').set(Math.random() * 5 + 95);

    // Database Performance
    databaseMetrics.supabaseConnections.labels('primary').set(Math.floor(Math.random() * 80 + 20));
    databaseMetrics.supabaseMaxConnections.labels('primary').set(100);
    databaseMetrics.supabaseStorageUsage.labels('primary').set(Math.random() * 30 + 45);
    databaseMetrics.redisHitRatio.labels('cache-01').set(Math.random() * 10 + 85);
    databaseMetrics.redisMemoryUsage.labels('cache-01').set(Math.random() * 25 + 60);
    databaseMetrics.prometheusStorageUsage.labels('prometheus-01').set(Math.random() * 20 + 70);
    databaseMetrics.prometheusIngestionRate.labels('prometheus-01').set(5000 + Math.random() * 3000);
  }

  // Failure Simulation Methods
  static simulateFailureScenario(scenarioType: string, tenantName?: string, robotType?: string) {
    switch (scenarioType) {
      case 'tenant_degradation':
        if (tenantName) this.simulateTenantDegradation(tenantName);
        break;
      case 'robot_type_failure':
        if (robotType) this.simulateRobotTypeFailure(robotType);
        break;
      case 'api_rate_limiting':
        this.simulateApiRateLimit();
        break;
      case 'network_partition':
        this.simulateNetworkPartition();
        break;
      case 'database_slowdown':
        this.simulateDatabaseSlowdown();
        break;
    }
  }

  private static simulateTenantDegradation(tenantName: string) {
    // Reduce performance for specific tenant
    console.log(`🚨 Simulating degradation for tenant: ${tenantName}`);
    // Implementation would modify metrics for this tenant
  }

  private static simulateRobotTypeFailure(robotType: string) {
    // Simulate failure of entire robot type
    console.log(`🚨 Simulating failure for robot type: ${robotType}`);
    // Implementation would set robot type metrics to critical levels
  }

  private static simulateApiRateLimit() {
    // Simulate API rate limiting
    openaiApiMetrics.rateLimitUsage.set(95);
    openaiApiMetrics.errorRate.labels('rate_limit').inc(10);
  }

  private static simulateNetworkPartition() {
    // Simulate network connectivity issues
    networkMetrics.orchestratorConnectivity.labels('primary').set(0);
    networkMetrics.vpnConnectionStatus.labels('site-to-site').set(70);
  }

  private static simulateDatabaseSlowdown() {
    // Simulate database performance issues
    databaseMetrics.supabaseSlowQueries.inc(50);
    databaseMetrics.redisHitRatio.set(60);
  }
}

export { register };
