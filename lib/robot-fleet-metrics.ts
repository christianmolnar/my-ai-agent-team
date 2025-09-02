// Basic Robot Fleet Metrics (Legacy)
// File: lib/robot-fleet-metrics.ts

import { register, Counter, Histogram, Gauge } from 'prom-client';

// Legacy fleet metrics for backward compatibility
export const robotFleetTotal = new Gauge({
  name: 'robot_fleet_total',
  help: 'Total robot fleet count by type',
  labelNames: ['robot_type'],
});

export const robotFleetHealthy = new Gauge({
  name: 'robot_fleet_healthy',
  help: 'Number of healthy robots by type',
  labelNames: ['robot_type'],
});

export const robotFleetDegraded = new Gauge({
  name: 'robot_fleet_degraded',
  help: 'Number of degraded robots by type',
  labelNames: ['robot_type'],
});

export const robotFleetCritical = new Gauge({
  name: 'robot_fleet_critical',
  help: 'Number of critical robots by type',
  labelNames: ['robot_type'],
});

export const robotFleetDown = new Gauge({
  name: 'robot_fleet_down',
  help: 'Number of down robots by type',
  labelNames: ['robot_type'],
});

// Legacy Robot Fleet Instrumentation Class
export class RobotFleetInstrumentation {
  static updateFleetStatus(robotType: string, total: number, healthy: number, degraded: number, critical: number, down: number) {
    // Ensure all values are non-negative with safeguards
    const safeTotal = Math.max(0, total);
    const safeHealthy = Math.max(0, Math.min(healthy, safeTotal));
    const safeDegraded = Math.max(0, Math.min(degraded, safeTotal - safeHealthy));
    const safeCritical = Math.max(0, Math.min(critical, safeTotal - safeHealthy - safeDegraded));
    const safeDown = Math.max(0, Math.min(down, safeTotal - safeHealthy - safeDegraded - safeCritical));
    
    robotFleetTotal.labels(robotType).set(safeTotal);
    robotFleetHealthy.labels(robotType).set(safeHealthy);
    robotFleetDegraded.labels(robotType).set(safeDegraded);
    robotFleetCritical.labels(robotType).set(safeCritical);
    robotFleetDown.labels(robotType).set(safeDown);
  }

  static initializeFleetData() {
    const fleetConfig = [
      { type: 'image_generator', total: 800000 },    // 800K robots
      { type: 'vinyl_researcher', total: 300000 },   // 300K robots  
      { type: 'communications', total: 900000 },     // 900K robots
      { type: 'memorias_ai', total: 1200000 },       // 1.2M robots
      { type: 'fact_checker', total: 400000 },       // 400K robots
      { type: 'finsight_ai', total: 600000 },        // 600K robots
    ]; // Total: 4.2M robots

    fleetConfig.forEach(config => {
      // UiPath Enterprise Status Distribution with safeguards
      const healthyRatio = Math.max(0.88, Math.min(0.96, 0.91 + Math.random() * 0.05));
      const degradedRatio = Math.max(0.02, Math.min(0.06, 0.03 + Math.random() * 0.03));
      const criticalRatio = Math.max(0.005, Math.min(0.02, 0.008 + Math.random() * 0.012));
      const downRatio = Math.max(0, 1 - healthyRatio - degradedRatio - criticalRatio);
      
      const healthy = Math.floor(config.total * healthyRatio);
      const degraded = Math.floor(config.total * degradedRatio);
      const critical = Math.floor(config.total * criticalRatio);
      const down = Math.max(0, config.total - healthy - degraded - critical);

      this.updateFleetStatus(config.type, config.total, healthy, degraded, critical, down);
    });
  }

  // Legacy method for compatibility
  static recordTransaction(robotType: string, success: boolean, duration: number, complexity: string) {
    // This method exists for backward compatibility but doesn't need to do anything
    // The enhanced metrics system handles transactions differently
  }
}

export { register };