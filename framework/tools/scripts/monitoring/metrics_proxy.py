#!/usr/bin/env python3
"""
Metrics Proxy for Dual Region Metrics Server

This script fetches metrics from the dual region metrics server and pushes them to Prometheus Pushgateway.
It handles the deletion of existing metrics before pushing new ones to avoid conflicts.
"""

import requests
import time
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def fetch_metrics(metrics_url):
    """Fetch metrics from the dual region metrics server"""
    try:
        response = requests.get(metrics_url)
        if response.status_code == 200:
            return response.text
        else:
            logger.error(f"Failed to fetch metrics: HTTP {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        return None

def push_metrics(pushgateway_url, job_name, metrics_text):
    """Push metrics to Pushgateway with proper handling of existing metrics"""
    if not metrics_text:
        return False
    
    url = f"{pushgateway_url}/metrics/job/{job_name}/instance/global"
    
    try:
        # Delete existing metrics first
        delete_response = requests.delete(url)
        logger.info(f"Deleted existing metrics: HTTP {delete_response.status_code}")
        
        # Push new metrics
        push_response = requests.post(url, data=metrics_text, headers={'Content-Type': 'text/plain'})
        
        if push_response.status_code == 200:
            logger.info(f"Successfully pushed metrics to {url}")
            return True
        else:
            logger.error(f"Failed to push metrics: HTTP {push_response.status_code}")
            logger.error(f"Response: {push_response.text}")
            return False
    except Exception as e:
        logger.error(f"Error pushing metrics: {e}")
        return False

def main():
    # Configuration
    metrics_url = "http://localhost:8090/metrics"
    pushgateway_url = "http://localhost:9091"
    job_name = "dual_region_robot_fleet"
    interval = 10  # seconds
    
    logger.info(f"Starting metrics proxy")
    logger.info(f"Fetching from: {metrics_url}")
    logger.info(f"Pushing to: {pushgateway_url}/metrics/job/{job_name}")
    logger.info(f"Update interval: {interval} seconds")
    
    while True:
        metrics_text = fetch_metrics(metrics_url)
        if metrics_text:
            push_metrics(pushgateway_url, job_name, metrics_text)
        
        time.sleep(interval)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Stopping metrics proxy")
        sys.exit(0)
