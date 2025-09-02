#!/usr/bin/env python3
"""
Enhanced Robot Fleet Metrics Server
Generates realistic robot fleet metrics with:
1. Total Fleet = sum of other categories
2. Configurable bounds for each category  
3. Simulation modes for network issues/failures
"""

import time
import random
import math
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RobotFleetSimulator:
    def __init__(self):
        # Base fleet size per tenant (total will be sum of all categories)
        self.base_fleet_size = 856000  # Per tenant, 9 tenants = ~7.7M total
        
        # Upward provisioning trend - gentle growth <500 robots/day total
        self.start_time = time.time()
        self.daily_growth_rate = 450  # robots per day across all tenants (< 500)
        self.growth_per_tenant = self.daily_growth_rate / 9  # ~50 robots per tenant per day
        
        # Category bounds (per tenant) - tuned for 99.900%+ healthy in normal mode
        # Total problems across all tenants should be ~7,700 (0.1% of 7.7M)
        # Distributed across 9 tenants = ~855 problems per tenant max
        self.bounds = {
            'degraded': {'min': 150, 'max': 500},   # 150-500 per tenant
            'critical': {'min': 50, 'max': 250},    # 50-250 per tenant  
            'down': {'min': 25, 'max': 150}         # 25-150 per tenant
        }
        # Max total problems per tenant: 500+250+150 = 900 (~0.105% of 856k)
        
        # Simulation mode
        self.simulation_mode = 'normal'  # 'normal', 'network_issue', 'major_outage'
        self.simulation_start_time = time.time()
        
        # Tenants
        self.tenants = [
            'enterprise', 'manufacturing', 'finance', 'healthcare',
            'retail', 'logistics', 'energy', 'telecom', 'government'
        ]
        
        logger.info(f"Initialized RobotFleetSimulator with {len(self.tenants)} tenants")
        logger.info(f"Base fleet size per tenant: {self.base_fleet_size:,}")
        logger.info(f"Daily growth rate: {self.daily_growth_rate} robots/day total ({self.growth_per_tenant:.1f} per tenant)")
        logger.info(f"Healthy datacenter bounds (per tenant): {self.bounds}")
        logger.info(f"Target healthy percentage: >99.900% (max problems: ~900 per tenant)")

    def set_simulation_mode(self, mode):
        """Set simulation mode: normal, network_issue, major_outage"""
        if mode in ['normal', 'network_issue', 'major_outage']:
            self.simulation_mode = mode
            self.simulation_start_time = time.time()
            logger.info(f"Simulation mode changed to: {mode}")
            return True
        return False

    def get_current_fleet_size(self, tenant_index):
        """Calculate current fleet size with gentle upward provisioning trend"""
        current_time = time.time()
        days_elapsed = (current_time - self.start_time) / 86400  # Convert seconds to days
        
        # Apply gentle growth per tenant
        growth = days_elapsed * self.growth_per_tenant
        
        # Add some variation per tenant (stagger growth slightly)
        tenant_variation = tenant_index * 0.1  # Small variation factor
        adjusted_growth = growth * (1 + tenant_variation)
        
        current_fleet_size = self.base_fleet_size + int(adjusted_growth)
        return current_fleet_size

    def generate_category_values(self, tenant_index):
        """Generate realistic values for degraded, critical, down categories"""
        current_time = time.time()
        current_fleet_size = self.get_current_fleet_size(tenant_index)
        
        # Base values for healthy datacenter (tuned for 99.900%+ healthy)
        # Values are much lower to maintain excellent health percentages
        fleet_scale = current_fleet_size / self.base_fleet_size
        degraded_base = int((300 + (tenant_index * 20)) * fleet_scale)  # ~300-480 base
        critical_base = int((150 + (tenant_index * 15)) * fleet_scale)  # ~150-270 base
        down_base = int((75 + (tenant_index * 10)) * fleet_scale)       # ~75-165 base
        
        # Apply simulation effects
        if self.simulation_mode == 'network_issue':
            # Simulate network issues - more degraded/critical
            degraded_multiplier = 1.5 + 0.3 * math.sin(current_time / 30)  # Oscillate
            critical_multiplier = 1.8 + 0.4 * math.sin(current_time / 25)
            down_multiplier = 1.2 + 0.2 * math.sin(current_time / 35)
            
        elif self.simulation_mode == 'major_outage':
            # Simulate major outage - lots of down/critical
            outage_duration = current_time - self.simulation_start_time
            if outage_duration < 120:  # 2 minutes of escalating failure
                severity = min(outage_duration / 120, 1.0)
                degraded_multiplier = 1 + severity * 2
                critical_multiplier = 1 + severity * 3  
                down_multiplier = 1 + severity * 4
            else:
                # Recovery phase
                recovery = min((outage_duration - 120) / 180, 1.0)  # 3 min recovery
                degraded_multiplier = 3 - recovery * 2
                critical_multiplier = 4 - recovery * 3
                down_multiplier = 5 - recovery * 4
        else:
            # Normal mode - enhanced variations for healthy datacenter
            # More dynamic variations with multiple sine waves for realistic fluctuations
            degraded_multiplier = 1.0 + 0.3 * math.sin(current_time / 60) + 0.2 * math.sin(current_time / 120)
            critical_multiplier = 1.0 + 0.4 * math.sin(current_time / 45) + 0.3 * math.sin(current_time / 90) 
            down_multiplier = 1.0 + 0.25 * math.sin(current_time / 55) + 0.15 * math.sin(current_time / 110)
        
        # Calculate values with bounds checking
        degraded = max(self.bounds['degraded']['min'], 
                      min(self.bounds['degraded']['max'], 
                          int(degraded_base * degraded_multiplier)))
        
        critical = max(self.bounds['critical']['min'],
                      min(self.bounds['critical']['max'],
                          int(critical_base * critical_multiplier)))
        
        down = max(self.bounds['down']['min'],
                  min(self.bounds['down']['max'],
                      int(down_base * down_multiplier)))
        
        return degraded, critical, down

    def generate_metrics(self):
        """Generate all robot fleet metrics"""
        metrics = []
        current_time = time.time()
        
        total_healthy = 0
        total_degraded = 0
        total_critical = 0
        total_down = 0
        
        for i, tenant in enumerate(self.tenants):
            # Get current fleet size for this tenant (with growth)
            current_fleet_size = self.get_current_fleet_size(i)
            
            # Generate category values
            degraded, critical, down = self.generate_category_values(i)
            
            # Healthy = current fleet size - problems  
            healthy = current_fleet_size - degraded - critical - down
            
            # Total for this tenant
            tenant_total = healthy + degraded + critical + down
            
            # Accumulate totals
            total_healthy += healthy
            total_degraded += degraded
            total_critical += critical
            total_down += down
            
            # Generate metrics for this tenant
            metrics.extend([
                f'robot_fleet_healthy{{tenant="{tenant}"}} {healthy}',
                f'robot_fleet_degraded{{tenant="{tenant}"}} {degraded}',
                f'robot_fleet_critical{{tenant="{tenant}"}} {critical}',
                f'robot_fleet_down{{tenant="{tenant}"}} {down}',
                f'robot_fleet_total{{tenant="{tenant}"}} {tenant_total}'
            ])
        
        # Add network/infrastructure metrics for simulation
        if self.simulation_mode == 'network_issue':
            lb_latency = 150 + 50 * math.sin(current_time / 20)
            ha_failovers = 3 + int(2 * math.sin(current_time / 30))
        elif self.simulation_mode == 'major_outage':
            outage_duration = current_time - self.simulation_start_time
            if outage_duration < 120:
                severity = outage_duration / 120
                lb_latency = 100 + severity * 500
                ha_failovers = int(severity * 10)
            else:
                recovery = min((outage_duration - 120) / 180, 1.0)
                lb_latency = 600 - recovery * 500
                ha_failovers = max(0, int(10 - recovery * 10))
        else:
            lb_latency = 50 + 10 * math.sin(current_time / 40)
            ha_failovers = 0
        
        metrics.extend([
            f'load_balancer_latency_ms {lb_latency:.1f}',
            f'ha_addon_failovers_total {ha_failovers}',
            f'simulation_mode{{mode="{self.simulation_mode}"}} 1'
        ])
        
        total_fleet = total_healthy + total_degraded + total_critical + total_down
        total_problems = total_degraded + total_critical + total_down
        healthy_percentage = (total_healthy / total_fleet) * 100
        days_elapsed = (current_time - self.start_time) / 86400
        expected_growth = days_elapsed * self.daily_growth_rate
        
        logger.info(f"Generated metrics - Mode: {self.simulation_mode}, "
                   f"Total: {total_fleet:,} (+{expected_growth:.0f} growth), "
                   f"Healthy: {healthy_percentage:.3f}%, Problems: {total_problems:,}")
        
        return '\n'.join(metrics) + '\n'


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
            
        elif parsed_path.path == '/simulate':
            # Handle simulation mode changes
            query_params = parse_qs(parsed_path.query)
            mode = query_params.get('mode', ['normal'])[0]
            
            if self.simulator.set_simulation_mode(mode):
                response = f"Simulation mode set to: {mode}\n"
                self.send_response(200)
            else:
                response = f"Invalid simulation mode: {mode}. Valid modes: normal, network_issue, major_outage\n"
                self.send_response(400)
                
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(response.encode('utf-8'))
            
        elif parsed_path.path == '/health':
            # Health check
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK\n')
            
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
    simulator = RobotFleetSimulator()
    
    # Create HTTP server
    server = HTTPServer(('0.0.0.0', 8080), create_handler(simulator))
    
    logger.info("🚀 Enhanced Robot Fleet Metrics Server starting on port 8080")
    logger.info("📈 Features: Gentle upward provisioning trend (<500 robots/day)")
    logger.info("🟢 Healthy Datacenter Mode: Maintains >99.900% healthy robots")
    logger.info("Endpoints:")
    logger.info("  GET /metrics - Prometheus metrics")
    logger.info("  GET /simulate?mode=normal|network_issue|major_outage - Change simulation mode")
    logger.info("  GET /health - Health check")
    logger.info("")
    logger.info("Simulation modes:")
    logger.info("  normal - Healthy datacenter with >99.900% robots operational + gentle growth")
    logger.info("  network_issue - Network problems causing degradation")  
    logger.info("  major_outage - Major system failure simulation")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down server...")
        server.shutdown()
