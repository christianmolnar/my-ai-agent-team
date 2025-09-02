#!/bin/bash

# Robot Fleet Metrics Generator - Healthy Datacenter Mode
# Configured for >99.900% healthy robots

# Install bc for calculations
apk add --no-cache bc >/dev/null 2>&1 || echo "bc already available"

PUSHGATEWAY_URL="${PUSHGATEWAY_URL:-http://localhost:9091}"

while true; do
    # Calculate current time for sine wave variations
    CURRENT_TIME=$(date +%s)
    SINE_OFFSET=$((CURRENT_TIME % 3600))  # 1-hour cycle
    
    # Base fleet size per tenant: 856,000
    # 9 tenants total = ~7.7M robots
    # Growth: ~450 robots/day total (~50 per tenant per day)
    
    DAYS_SINCE_START=$(((CURRENT_TIME - 1691971200) / 86400))  # Days since Aug 13, 2023
    GROWTH_TOTAL=$((DAYS_SINCE_START * 450))
    
    # Calculate totals for all tenants
    TOTAL_FLEET=$((9 * 856000 + GROWTH_TOTAL))
    
    # Healthy datacenter bounds (per tenant):
    # Degraded: 150-500, Critical: 50-250, Down: 25-150
    # Max problems per tenant: 900, across 9 tenants = 8,100 max problems
    # Target: >99.900% healthy (less than 0.1% problems)
    
    # Use sine waves for gentle variation within bounds
    SINE_VAL=$(echo "scale=3; s($SINE_OFFSET * 3.14159 / 1800)" | bc -l)
    
    # Calculate problems per tenant (with sine wave variation)
    DEGRADED_PER_TENANT=$(echo "scale=0; 325 + 175 * $SINE_VAL" | bc -l | cut -d. -f1)
    CRITICAL_PER_TENANT=$(echo "scale=0; 150 + 100 * $SINE_VAL" | bc -l | cut -d. -f1)
    DOWN_PER_TENANT=$(echo "scale=0; 87 + 63 * $SINE_VAL" | bc -l | cut -d. -f1)
    
    # Total problems across all tenants
    TOTAL_DEGRADED=$((9 * DEGRADED_PER_TENANT))
    TOTAL_CRITICAL=$((9 * CRITICAL_PER_TENANT))
    TOTAL_DOWN=$((9 * DOWN_PER_TENANT))
    
    # Calculate healthy robots
    TOTAL_PROBLEMS=$((TOTAL_DEGRADED + TOTAL_CRITICAL + TOTAL_DOWN))
    TOTAL_HEALTHY=$((TOTAL_FLEET - TOTAL_PROBLEMS))
    
    # Send metrics to Pushgateway
    echo "robot_fleet_total{instance=\"fleet\"} $TOTAL_FLEET" | curl -X POST --data-binary @- $PUSHGATEWAY_URL/metrics/job/robot_fleet/instance/fleet
    echo "robot_fleet_healthy{instance=\"fleet\"} $TOTAL_HEALTHY" | curl -X POST --data-binary @- $PUSHGATEWAY_URL/metrics/job/robot_fleet/instance/fleet
    echo "robot_fleet_degraded{instance=\"fleet\"} $TOTAL_DEGRADED" | curl -X POST --data-binary @- $PUSHGATEWAY_URL/metrics/job/robot_fleet/instance/fleet
    echo "robot_fleet_critical{instance=\"fleet\"} $TOTAL_CRITICAL" | curl -X POST --data-binary @- $PUSHGATEWAY_URL/metrics/job/robot_fleet/instance/fleet
    echo "robot_fleet_down{instance=\"fleet\"} $TOTAL_DOWN" | curl -X POST --data-binary @- $PUSHGATEWAY_URL/metrics/job/robot_fleet/instance/fleet
    
    # Calculate and log healthy percentage
    HEALTHY_PERCENT=$(echo "scale=3; $TOTAL_HEALTHY * 100 / $TOTAL_FLEET" | bc -l)
    echo "$(date): Fleet: $TOTAL_FLEET, Healthy: $TOTAL_HEALTHY ($HEALTHY_PERCENT%), Problems: $TOTAL_PROBLEMS"
    
    sleep 30
done
