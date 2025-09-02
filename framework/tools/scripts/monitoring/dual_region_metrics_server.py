#!/usr/bin/env python3
"""
Enhanced Dual-Region Robot Fleet Metrics Server - Phase 1
Generates realistic robot fleet metrics with:
1. Dual-region architecture (East US, West US)
2. Global Traffic Manager metrics
3. Regional Traffic Manager metrics
4. Infrastructure component baseline metrics
5. Scenario-based cascade failure simulation
"""

import time
import random
import math
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import logging
import json
import threading
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DualRegionRobotFleetSimulator:
    def __init__(self):
        # Base fleet size per tenant per region
        self.base_fleet_size_per_region = 856000  # Per tenant, per region
        self.regions = ['east_us', 'west_us']
        
        # Upward provisioning trend - gentle growth <500 robots/day total (both regions)
        self.start_time = time.time()
        self.daily_growth_rate = 450  # robots per day across ALL tenants and regions
        self.growth_per_tenant_per_region = self.daily_growth_rate / (9 * 2)  # ~25 robots per tenant per region per day
        
        # Robot health bounds (per tenant, per region) - tuned for 99.900%+ healthy
        self.robot_bounds = {
            'degraded': {'min': 150, 'max': 500},   # 150-500 per tenant per region
            'critical': {'min': 50, 'max': 250},    # 50-250 per tenant per region  
            'down': {'min': 25, 'max': 150}         # 25-150 per tenant per region
        }
        
        # Simulation mode
        self.simulation_mode = 'normal'  # 'normal', 'scenario_active'
        self.active_scenarios = []  # List of active scenarios
        
        # Tenants (same across both regions)
        self.tenants = [
            'enterprise', 'manufacturing', 'finance', 'healthcare',
            'retail', 'logistics', 'energy', 'telecom', 'government'
        ]
        
        # GTM (Global Traffic Manager) baseline metrics
        self.gtm_baseline = {
            'traffic_volume_req_per_min': 2500000,  # 2.5M req/min
            'response_time_ms': 45,                 # 45ms avg
            'success_rate_percent': 99.95,          # 99.95%
            'geographic_distribution': {            # East/West traffic split
                'east_us_percent': 52,
                'west_us_percent': 48
            }
        }
        
        # Regional Traffic Manager baseline metrics (per region)
        self.regional_tm_baseline = {
            'east_us': {
                'traffic_volume_req_per_min': 1300000,  # 1.3M req/min (52% of GTM)
                'response_time_ms': 42,                 # 42ms avg
                'success_rate_percent': 99.96,          # 99.96%
                'load_balancer_health': 4               # 4/4 active
            },
            'west_us': {
                'traffic_volume_req_per_min': 1200000,  # 1.2M req/min (48% of GTM)
                'response_time_ms': 48,                 # 48ms avg  
                'success_rate_percent': 99.94,          # 99.94%
                'load_balancer_health': 4               # 4/4 active
            }
        }
        
        # Infrastructure component baseline metrics (per region)
        self.infrastructure_baseline = {
            'orchestrator': {
                'pod_health_percent': 95,        # 95% (38/40 pods healthy)
                'cpu_utilization_percent': 65,   # 65% CPU
                'memory_utilization_percent': 70, # 70% Memory
                'task_success_rate_percent': 99.2, # 99.2%
                'queue_depth': 15                 # 15 pending tasks
            },
            'ha_addon': {
                'cluster_health_percent': 100,   # 100% (3/3 nodes active)
                'failover_time_ms': 500,         # 0.5s failover time
                'sync_status': 1,                # 1 = In Sync, 0 = Out of Sync
                'health_check_passing': 1        # 1 = Passing, 0 = Failing
            },
            'shared_storage': {
                'storage_health_percent': 98,    # 98% (196/200 volumes healthy)
                'iops_avg': 850,                 # 850 IOPS avg
                'capacity_utilization_percent': 72, # 72%
                'replication_status': 1          # 1 = Active, 0 = Failed
            },
            'elasticsearch': {
                'cluster_health_percent': 100,   # Green (6/6 nodes)
                'index_health_percent': 99.8,    # 99.8% (2,487/2,492 indices)
                'query_performance_ms': 12,      # 12ms avg
                'storage_usage_percent': 68      # 68%
            },
            'database': {
                'connection_health_percent': 98, # 98% (147/150 connections)
                'query_performance_ms': 8,       # 8ms avg
                'replication_lag_ms': 200,       # 0.2s
                'storage_usage_percent': 75      # 75%
            }
        }
        
        logger.info(f"🚀 Initialized DualRegionRobotFleetSimulator")
        logger.info(f"🌍 Regions: {self.regions}")
        logger.info(f"🏢 Tenants per region: {len(self.tenants)}")
        logger.info(f"🤖 Base fleet size per tenant per region: {self.base_fleet_size_per_region:,}")
        logger.info(f"📈 Daily growth rate: {self.daily_growth_rate} robots/day total ({self.growth_per_tenant_per_region:.1f} per tenant per region)")
        logger.info(f"🟢 Healthy datacenter bounds (per tenant per region): {self.robot_bounds}")
        logger.info(f"🎯 Target: >99.900% healthy robots globally")

    def get_current_fleet_size(self, tenant_index, region):
        """Calculate current fleet size with gentle upward provisioning trend"""
        current_time = time.time()
        days_elapsed = (current_time - self.start_time) / 86400  # Convert seconds to days
        
        # Apply gentle growth per tenant per region
        growth = days_elapsed * self.growth_per_tenant_per_region
        
        # Add some variation per tenant and region (stagger growth slightly)
        tenant_variation = tenant_index * 0.05  # Small variation factor
        region_variation = 0.05 if region == 'west_us' else 0  # West US grows slightly faster
        adjusted_growth = growth * (1 + tenant_variation + region_variation)
        
        current_fleet_size = self.base_fleet_size_per_region + int(adjusted_growth)
        return current_fleet_size

    def generate_robot_category_values(self, tenant_index, region):
        """Generate realistic values for degraded, critical, down categories"""
        current_time = time.time()
        current_fleet_size = self.get_current_fleet_size(tenant_index, region)
        
        # Base values for healthy datacenter (tuned for 99.900%+ healthy)
        fleet_scale = current_fleet_size / self.base_fleet_size_per_region
        degraded_base = int((300 + (tenant_index * 20)) * fleet_scale)  # ~300-480 base
        critical_base = int((150 + (tenant_index * 15)) * fleet_scale)  # ~150-270 base
        down_base = int((75 + (tenant_index * 10)) * fleet_scale)       # ~75-165 base
        
        # Normal mode - enhanced variations for healthy datacenter
        # Multiple sine waves for realistic fluctuations, region-specific timing
        region_offset = 100 if region == 'west_us' else 0  # Offset for regional variation
        time_factor = current_time + region_offset
        
        degraded_multiplier = 1.0 + 0.3 * math.sin(time_factor / 60) + 0.2 * math.sin(time_factor / 120)
        critical_multiplier = 1.0 + 0.4 * math.sin(time_factor / 45) + 0.3 * math.sin(time_factor / 90) 
        down_multiplier = 1.0 + 0.25 * math.sin(time_factor / 55) + 0.15 * math.sin(time_factor / 110)
        
        # TODO: Apply scenario effects here in future phases
        
        # Calculate values with bounds checking
        degraded = max(self.robot_bounds['degraded']['min'], 
                      min(self.robot_bounds['degraded']['max'], 
                          int(degraded_base * degraded_multiplier)))
        
        critical = max(self.robot_bounds['critical']['min'],
                      min(self.robot_bounds['critical']['max'],
                          int(critical_base * critical_multiplier)))
        
        down = max(self.robot_bounds['down']['min'],
                  min(self.robot_bounds['down']['max'],
                      int(down_base * down_multiplier)))
        
        return degraded, critical, down

    def generate_gtm_metrics(self):
        """Generate Global Traffic Manager metrics"""
        current_time = time.time()
        
        # Add realistic variations to baseline values
        traffic_variation = 1.0 + 0.1 * math.sin(current_time / 300)  # 5-minute cycle
        response_variation = 1.0 + 0.2 * math.sin(current_time / 180)  # 3-minute cycle
        success_variation = 1.0 + 0.001 * math.sin(current_time / 240)  # Very small variation
        
        # Calculate current values
        traffic_volume = int(self.gtm_baseline['traffic_volume_req_per_min'] * traffic_variation)
        response_time = self.gtm_baseline['response_time_ms'] * response_variation
        success_rate = min(99.99, self.gtm_baseline['success_rate_percent'] * success_variation)
        
        # Geographic distribution (slight fluctuation)
        geo_variation = 2 * math.sin(current_time / 600)  # 10-minute cycle, ±2% variation
        east_percent = max(40, min(60, self.gtm_baseline['geographic_distribution']['east_us_percent'] + geo_variation))
        west_percent = 100 - east_percent
        
        return {
            'traffic_volume_req_per_min': traffic_volume,
            'response_time_ms': response_time,
            'success_rate_percent': success_rate,
            'east_us_traffic_percent': east_percent,
            'west_us_traffic_percent': west_percent
        }

    def generate_regional_tm_metrics(self, region):
        """Generate Regional Traffic Manager metrics for a specific region"""
        current_time = time.time()
        baseline = self.regional_tm_baseline[region]
        
        # Add realistic variations with region-specific timing
        region_offset = 150 if region == 'west_us' else 0
        time_factor = current_time + region_offset
        
        traffic_variation = 1.0 + 0.08 * math.sin(time_factor / 250)
        response_variation = 1.0 + 0.15 * math.sin(time_factor / 170)
        success_variation = 1.0 + 0.0008 * math.sin(time_factor / 220)
        
        traffic_volume = int(baseline['traffic_volume_req_per_min'] * traffic_variation)
        response_time = baseline['response_time_ms'] * response_variation
        success_rate = min(99.99, baseline['success_rate_percent'] * success_variation)
        load_balancer_health = baseline['load_balancer_health']  # Keep stable for now
        
        return {
            'traffic_volume_req_per_min': traffic_volume,
            'response_time_ms': response_time,
            'success_rate_percent': success_rate,
            'load_balancer_health': load_balancer_health
        }

    def generate_infrastructure_metrics(self, region, component):
        """Generate infrastructure component metrics for a specific region and component"""
        current_time = time.time()
        baseline = self.infrastructure_baseline[component]
        
        # Add realistic variations with region and component-specific timing
        region_offset = 200 if region == 'west_us' else 0
        component_offset = hash(component) % 100  # Different timing per component
        time_factor = current_time + region_offset + component_offset
        
        metrics = {}
        
        # Apply variations based on component type
        if component == 'orchestrator':
            metrics['pod_health_percent'] = max(90, min(100, baseline['pod_health_percent'] + 3 * math.sin(time_factor / 400)))
            metrics['cpu_utilization_percent'] = max(50, min(85, baseline['cpu_utilization_percent'] + 10 * math.sin(time_factor / 350)))
            metrics['memory_utilization_percent'] = max(55, min(90, baseline['memory_utilization_percent'] + 8 * math.sin(time_factor / 320)))
            metrics['task_success_rate_percent'] = max(98, min(99.9, baseline['task_success_rate_percent'] + 0.5 * math.sin(time_factor / 280)))
            metrics['queue_depth'] = max(5, int(baseline['queue_depth'] + 8 * math.sin(time_factor / 150)))
            
        elif component == 'ha_addon':
            metrics['cluster_health_percent'] = baseline['cluster_health_percent']  # Keep stable
            metrics['failover_time_ms'] = max(300, baseline['failover_time_ms'] + 200 * abs(math.sin(time_factor / 500)))
            metrics['sync_status'] = baseline['sync_status']  # Keep stable for now
            metrics['health_check_passing'] = baseline['health_check_passing']  # Keep stable for now
            
        elif component == 'shared_storage':
            metrics['storage_health_percent'] = max(95, min(100, baseline['storage_health_percent'] + 2 * math.sin(time_factor / 450)))
            metrics['iops_avg'] = max(600, int(baseline['iops_avg'] + 200 * math.sin(time_factor / 300)))
            metrics['capacity_utilization_percent'] = max(65, min(85, baseline['capacity_utilization_percent'] + 8 * math.sin(time_factor / 600)))
            metrics['replication_status'] = baseline['replication_status']  # Keep stable for now
            
        elif component == 'elasticsearch':
            metrics['cluster_health_percent'] = baseline['cluster_health_percent']  # Keep stable
            metrics['index_health_percent'] = max(99, min(100, baseline['index_health_percent'] + 0.2 * math.sin(time_factor / 400)))
            metrics['query_performance_ms'] = max(8, baseline['query_performance_ms'] + 5 * abs(math.sin(time_factor / 200)))
            metrics['storage_usage_percent'] = max(60, min(80, baseline['storage_usage_percent'] + 6 * math.sin(time_factor / 800)))
            
        elif component == 'database':
            metrics['connection_health_percent'] = max(95, min(100, baseline['connection_health_percent'] + 2 * math.sin(time_factor / 350)))
            metrics['query_performance_ms'] = max(5, baseline['query_performance_ms'] + 3 * abs(math.sin(time_factor / 180)))
            metrics['replication_lag_ms'] = max(100, baseline['replication_lag_ms'] + 100 * abs(math.sin(time_factor / 250)))
            metrics['storage_usage_percent'] = max(70, min(85, baseline['storage_usage_percent'] + 5 * math.sin(time_factor / 700)))
        
        return metrics

    def generate_metrics(self):
        """Generate all robot fleet and infrastructure metrics"""
        metrics = []
        current_time = time.time()
        
        # Global totals
        global_total_healthy = 0
        global_total_degraded = 0
        global_total_critical = 0
        global_total_down = 0
        
        # Regional totals
        regional_totals = {region: {'healthy': 0, 'degraded': 0, 'critical': 0, 'down': 0} for region in self.regions}
        
        # Generate robot fleet metrics per region and tenant
        for region in self.regions:
            for i, tenant in enumerate(self.tenants):
                # Get current fleet size for this tenant in this region
                current_fleet_size = self.get_current_fleet_size(i, region)
                
                # Generate category values
                degraded, critical, down = self.generate_robot_category_values(i, region)
                
                # Healthy = current fleet size - problems  
                healthy = current_fleet_size - degraded - critical - down
                
                # Total for this tenant in this region
                tenant_total = healthy + degraded + critical + down
                
                # Accumulate regional totals
                regional_totals[region]['healthy'] += healthy
                regional_totals[region]['degraded'] += degraded
                regional_totals[region]['critical'] += critical
                regional_totals[region]['down'] += down
                
                # Accumulate global totals
                global_total_healthy += healthy
                global_total_degraded += degraded
                global_total_critical += critical
                global_total_down += down
                
                # Generate metrics for this tenant in this region
                metrics.extend([
                    f'dual_region_robot_fleet_healthy{{tenant="{tenant}",region="{region}"}} {healthy}',
                    f'dual_region_robot_fleet_degraded{{tenant="{tenant}",region="{region}"}} {degraded}',
                    f'dual_region_robot_fleet_critical{{tenant="{tenant}",region="{region}"}} {critical}',
                    f'dual_region_robot_fleet_down{{tenant="{tenant}",region="{region}"}} {down}',
                    f'dual_region_robot_fleet_total{{tenant="{tenant}",region="{region}"}} {tenant_total}'
                ])
        
        # Generate global robot fleet totals
        global_total_fleet = global_total_healthy + global_total_degraded + global_total_critical + global_total_down
        metrics.extend([
            f'dual_region_robot_fleet_healthy{{instance="global"}} {global_total_healthy}',
            f'dual_region_robot_fleet_degraded{{instance="global"}} {global_total_degraded}',
            f'dual_region_robot_fleet_critical{{instance="global"}} {global_total_critical}',
            f'dual_region_robot_fleet_down{{instance="global"}} {global_total_down}',
            f'dual_region_robot_fleet_total{{instance="global"}} {global_total_fleet}'
        ])
        
        # Generate regional robot fleet totals
        for region in self.regions:
            regional_total = sum(regional_totals[region].values())
            metrics.extend([
                f'dual_region_robot_fleet_healthy{{instance="{region}"}} {regional_totals[region]["healthy"]}',
                f'dual_region_robot_fleet_degraded{{instance="{region}"}} {regional_totals[region]["degraded"]}',
                f'dual_region_robot_fleet_critical{{instance="{region}"}} {regional_totals[region]["critical"]}',
                f'dual_region_robot_fleet_down{{instance="{region}"}} {regional_totals[region]["down"]}',
                f'dual_region_robot_fleet_total{{instance="{region}"}} {regional_total}'
            ])
        
        # Generate GTM metrics
        gtm_metrics = self.generate_gtm_metrics()
        metrics.extend([
            f'dual_region_gtm_traffic_volume_req_per_min {gtm_metrics["traffic_volume_req_per_min"]}',
            f'dual_region_gtm_response_time_ms {gtm_metrics["response_time_ms"]:.1f}',
            f'dual_region_gtm_success_rate_percent {gtm_metrics["success_rate_percent"]:.2f}',
            f'dual_region_gtm_east_us_traffic_percent {gtm_metrics["east_us_traffic_percent"]:.1f}',
            f'dual_region_gtm_west_us_traffic_percent {gtm_metrics["west_us_traffic_percent"]:.1f}'
        ])
        
        # Generate Regional TM metrics
        for region in self.regions:
            rtm_metrics = self.generate_regional_tm_metrics(region)
            metrics.extend([
                f'dual_region_regional_tm_traffic_volume_req_per_min{{region="{region}"}} {rtm_metrics["traffic_volume_req_per_min"]}',
                f'dual_region_regional_tm_response_time_ms{{region="{region}"}} {rtm_metrics["response_time_ms"]:.1f}',
                f'dual_region_regional_tm_success_rate_percent{{region="{region}"}} {rtm_metrics["success_rate_percent"]:.2f}',
                f'dual_region_regional_tm_load_balancer_health{{region="{region}"}} {rtm_metrics["load_balancer_health"]}'
            ])
        
        # Generate Infrastructure metrics
        for region in self.regions:
            for component in self.infrastructure_baseline.keys():
                infra_metrics = self.generate_infrastructure_metrics(region, component)
                for metric_name, metric_value in infra_metrics.items():
                    metrics.append(f'dual_region_infrastructure_{component}_{metric_name}{{region="{region}"}} {metric_value:.1f}')
        
        # Add system metadata
        global_total_problems = global_total_degraded + global_total_critical + global_total_down
        global_healthy_percentage = (global_total_healthy / global_total_fleet) * 100
        days_elapsed = (current_time - self.start_time) / 86400
        expected_growth = days_elapsed * self.daily_growth_rate
        
        metrics.extend([
            f'dual_region_simulation_mode{{mode="{self.simulation_mode}"}} 1',
            f'dual_region_active_scenarios_count {len(self.active_scenarios)}',
            f'dual_region_system_uptime_seconds {current_time - self.start_time:.0f}'
        ])
        
        logger.info(f"📊 Generated metrics - Mode: {self.simulation_mode}, "
                   f"Global Total: {global_total_fleet:,} (+{expected_growth:.0f} growth), "
                   f"Healthy: {global_healthy_percentage:.3f}%, Problems: {global_total_problems:,}")
        
        return '\n'.join(metrics) + '\n'

    def push_metrics_to_gateway(self, pushgateway_url):
        """Push metrics to Pushgateway in batch"""
        try:
            metrics_text = self.generate_metrics()
            
            # Use a unique job name to avoid conflicts
            job_name = "dual_region_metrics_v2"
            url = f"{pushgateway_url}/metrics/job/{job_name}"
            try:
                # Delete existing metrics first to avoid conflicts
                delete_response = requests.delete(url)
                logger.info(f"🗑️ Deleted existing metrics: HTTP {delete_response.status_code}")
                
                # Push all metrics as a batch
                post_url = f"{pushgateway_url}/metrics/job/{job_name}/instance/global"
                response = requests.post(post_url, data=metrics_text, 
                                       headers={'Content-Type': 'text/plain'})
                if response.status_code == 200:
                    logger.info("✅ Successfully pushed metrics to gateway")
                else:
                    logger.warning(f"❌ Failed to push metrics: HTTP {response.status_code}")
                    logger.warning(f"Response: {response.text}")
            except Exception as e:
                logger.error(f"❌ Error pushing metrics to gateway: {e}")
                            
        except Exception as e:
            logger.error(f"❌ Error generating/pushing metrics: {e}")

    def start_metrics_pusher(self, pushgateway_url, interval=30):
        """Start background thread to push metrics to pushgateway"""
        def push_loop():
            while True:
                try:
                    self.push_metrics_to_gateway(pushgateway_url)
                    time.sleep(interval)
                except Exception as e:
                    logger.error(f"Error in metrics push loop: {e}")
                    time.sleep(interval)
        
        thread = threading.Thread(target=push_loop, daemon=True)
        thread.start()
        logger.info(f"🔄 Started metrics pusher thread (interval: {interval}s)")
        return thread


class MetricsHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, simulator=None, **kwargs):
        self.simulator = simulator
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/metrics':
            # Serve metrics
            metrics = self.simulator.generate_metrics()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(metrics.encode('utf-8'))
            
        elif parsed_path.path == '/health':
            # Health check
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK\n')
            
        elif parsed_path.path == '/status':
            # Status information
            status = {
                'simulation_mode': self.simulator.simulation_mode,
                'active_scenarios': self.simulator.active_scenarios,
                'regions': self.simulator.regions,
                'tenants': self.simulator.tenants,
                'uptime_seconds': time.time() - self.simulator.start_time
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(status, indent=2).encode('utf-8'))
            
        else:
            # 404 for other paths
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress default HTTP logging
        pass


def create_handler(simulator):
    def handler(*args, **kwargs):
        return MetricsHandler(*args, simulator=simulator, **kwargs)
    return handler


if __name__ == '__main__':
    # Initialize simulator
    simulator = DualRegionRobotFleetSimulator()
    
    # Get pushgateway URL from environment or use default
    pushgateway_url = os.getenv('PUSHGATEWAY_URL', 'http://localhost:9091')
    
    # Start metrics pusher thread
    simulator.start_metrics_pusher(pushgateway_url, interval=30)
    
    # Create HTTP server for direct metrics access and control
    server = HTTPServer(('0.0.0.0', 8090), create_handler(simulator))
    
    logger.info("🚀 Enhanced Dual-Region Robot Fleet Metrics Server - Phase 1")
    logger.info("🌍 Features: Dual-region architecture (East US, West US)")
    logger.info("📈 GTM + Regional TM + Infrastructure metrics")
    logger.info("🟢 Maintains >99.900% healthy robots globally")
    logger.info(f"🔄 Pushing metrics to: {pushgateway_url}")
    logger.info("Endpoints:")
    logger.info("  GET /metrics - Prometheus metrics")
    logger.info("  GET /health - Health check")
    logger.info("  GET /status - System status (JSON)")
    logger.info("")
    logger.info("🎯 Phase 1 Deliverables:")
    logger.info("  ✅ Dual-region robot fleet metrics")
    logger.info("  ✅ Global Traffic Manager (GTM) metrics")
    logger.info("  ✅ Regional Traffic Manager metrics")
    logger.info("  ✅ Infrastructure component baseline metrics")
    logger.info("  ✅ Realistic variations and fluctuations")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
        server.shutdown()
