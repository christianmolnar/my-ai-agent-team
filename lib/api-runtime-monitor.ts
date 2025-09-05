import { writeFile, readFile } from 'fs/promises';
import path from 'path';

interface ApiCallResult {
  success: boolean;
  responseTime: number;
  error?: string;
  timestamp: string;
}

interface AlertConfig {
  slackWebhook?: string;
  emailEndpoint?: string;
  discordWebhook?: string;
  execNotificationThreshold: number; // Number of consecutive failures before exec alert
}

const MONITORING_FILE = path.join(process.cwd(), 'logs', 'api-monitoring.json');
const ALERTS_FILE = path.join(process.cwd(), 'logs', 'alert-config.json');

export class ApiRuntimeMonitor {
  private static instance: ApiRuntimeMonitor;
  private alertConfig: AlertConfig = {
    execNotificationThreshold: 3 // Alert exec after 3 consecutive failures
  };

  private constructor() {
    this.loadAlertConfig();
  }

  public static getInstance(): ApiRuntimeMonitor {
    if (!ApiRuntimeMonitor.instance) {
      ApiRuntimeMonitor.instance = new ApiRuntimeMonitor();
    }
    return ApiRuntimeMonitor.instance;
  }

  private async loadAlertConfig(): Promise<void> {
    try {
      const data = await readFile(ALERTS_FILE, 'utf8');
      this.alertConfig = { ...this.alertConfig, ...JSON.parse(data) };
    } catch (error) {
      // Use default config if file doesn't exist
      console.log('Using default alert configuration');
    }
  }

  /**
   * Record an API call result and update monitoring data
   */
  async recordApiCall(envVar: string, provider: string, result: ApiCallResult): Promise<void> {
    try {
      // Load existing monitoring data
      const monitoringData = await this.loadMonitoringData();
      
      // Update or create key status
      const keyStatus = monitoringData.keys[envVar] || {
        envVar,
        provider,
        status: 'not_verified',
        lastVerified: new Date().toISOString(),
        keyHash: '',
        consecutiveFailures: 0,
        performanceMetrics: {
          avgResponseTime: 0,
          successRate: 100,
          totalCalls: 0
        }
      };

      // Update performance metrics
      const metrics = keyStatus.performanceMetrics!;
      metrics.totalCalls++;
      
      // Update average response time
      metrics.avgResponseTime = (metrics.avgResponseTime * (metrics.totalCalls - 1) + result.responseTime) / metrics.totalCalls;
      
      // Update success rate
      const successCount = Math.round(metrics.successRate * (metrics.totalCalls - 1) / 100);
      const newSuccessCount = result.success ? successCount + 1 : successCount;
      metrics.successRate = Math.round((newSuccessCount / metrics.totalCalls) * 100);

      // Update failure tracking
      if (result.success) {
        keyStatus.consecutiveFailures = 0;
        keyStatus.status = 'valid';
        keyStatus.lastUsed = result.timestamp;
      } else {
        keyStatus.consecutiveFailures = (keyStatus.consecutiveFailures || 0) + 1;
        keyStatus.status = this.classifyError(result.error);
        keyStatus.error = result.error;
        
        // Check if we need to alert
        await this.checkAndSendAlerts(envVar, provider, keyStatus.consecutiveFailures, result.error);
      }

      monitoringData.keys[envVar] = keyStatus;
      monitoringData.lastUpdate = new Date().toISOString();

      // Update system health
      const allStatuses = Object.values(monitoringData.keys) as any[];
      const validKeys = allStatuses.filter((k: any) => k.status === 'valid').length;
      const problemKeys = allStatuses.filter((k: any) => k.status !== 'valid' && k.status !== 'not_verified').length;
      
      monitoringData.systemHealth = {
        overallScore: allStatuses.length > 0 ? Math.round((validKeys / allStatuses.length) * 100) : 100,
        totalKeys: allStatuses.length,
        validKeys,
        problemKeys
      };

      // Save updated data
      await writeFile(MONITORING_FILE, JSON.stringify(monitoringData, null, 2));

    } catch (error) {
      console.error('Failed to record API call:', error);
    }
  }

  /**
   * Classify error type based on error message
   */
  private classifyError(error?: string): 'invalid' | 'rate_limited' | 'network_error' | 'unknown_error' {
    if (!error) return 'unknown_error';
    
    const errorLower = error.toLowerCase();
    if (errorLower.includes('429') || errorLower.includes('rate limit')) return 'rate_limited';
    if (errorLower.includes('401') || errorLower.includes('403') || errorLower.includes('invalid')) return 'invalid';
    if (errorLower.includes('500') || errorLower.includes('502') || errorLower.includes('503') || errorLower.includes('504')) return 'network_error';
    return 'unknown_error';
  }

  /**
   * Check if alerts should be sent and send them
   */
  private async checkAndSendAlerts(envVar: string, provider: string, consecutiveFailures: number, error?: string): Promise<void> {
    if (consecutiveFailures >= this.alertConfig.execNotificationThreshold) {
      const alertMessage = {
        level: 'EXECUTIVE',
        title: '🚨 Critical API Failure',
        message: `API Key ${envVar} (${provider}) has failed ${consecutiveFailures} consecutive times.`,
        error: error,
        timestamp: new Date().toISOString(),
        actionRequired: 'API key may need to be replaced or service may be down.',
        impact: 'Agent functionality may be degraded or unavailable.'
      };

      console.error('EXECUTIVE ALERT:', alertMessage);
      
      // Send alerts through configured channels
      await this.sendAlert(alertMessage);
      
      // Log the alert
      await this.logAlert(alertMessage);
    } else if (consecutiveFailures === 1) {
      // First failure - log for monitoring
      console.warn(`API Warning: ${envVar} (${provider}) failed with: ${error}`);
    }
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alert: any): Promise<void> {
    const promises: Promise<any>[] = [];

    // Slack notification
    if (this.alertConfig.slackWebhook) {
      promises.push(this.sendSlackAlert(alert));
    }

    // Email notification
    if (this.alertConfig.emailEndpoint) {
      promises.push(this.sendEmailAlert(alert));
    }

    // Discord notification
    if (this.alertConfig.discordWebhook) {
      promises.push(this.sendDiscordAlert(alert));
    }

    // Execute all notifications
    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Failed to send some alerts:', error);
    }
  }

  private async sendSlackAlert(alert: any): Promise<void> {
    if (!this.alertConfig.slackWebhook) return;

    const slackMessage = {
      text: `${alert.title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: alert.title
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Message:* ${alert.message}\n*Error:* ${alert.error}\n*Action Required:* ${alert.actionRequired}`
          }
        }
      ]
    };

    try {
      await fetch(this.alertConfig.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private async sendEmailAlert(alert: any): Promise<void> {
    // Implementation depends on your email service
    console.log('Email alert would be sent:', alert);
  }

  private async sendDiscordAlert(alert: any): Promise<void> {
    if (!this.alertConfig.discordWebhook) return;

    const discordMessage = {
      content: `${alert.title}`,
      embeds: [
        {
          title: alert.title,
          description: alert.message,
          color: 0xff0000, // Red color for alerts
          fields: [
            {
              name: 'Error',
              value: alert.error || 'Unknown error',
              inline: false
            },
            {
              name: 'Action Required',
              value: alert.actionRequired,
              inline: false
            }
          ],
          timestamp: alert.timestamp
        }
      ]
    };

    try {
      await fetch(this.alertConfig.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage)
      });
    } catch (error) {
      console.error('Failed to send Discord alert:', error);
    }
  }

  /**
   * Log alert to file for audit trail
   */
  private async logAlert(alert: any): Promise<void> {
    try {
      const alertsLogFile = path.join(process.cwd(), 'logs', 'executive-alerts.json');
      let alerts: any[] = [];
      
      try {
        const existingData = await readFile(alertsLogFile, 'utf8');
        alerts = JSON.parse(existingData);
      } catch {
        // File doesn't exist, start with empty array
      }

      alerts.push(alert);
      
      // Keep only last 100 alerts
      if (alerts.length > 100) {
        alerts = alerts.slice(-100);
      }

      await writeFile(alertsLogFile, JSON.stringify(alerts, null, 2));
    } catch (error) {
      console.error('Failed to log alert:', error);
    }
  }

  private async loadMonitoringData(): Promise<any> {
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
}

// Convenience function for agents to use
export async function recordApiCall(envVar: string, provider: string, success: boolean, responseTime: number, error?: string): Promise<void> {
  const monitor = ApiRuntimeMonitor.getInstance();
  await monitor.recordApiCall(envVar, provider, {
    success,
    responseTime,
    error,
    timestamp: new Date().toISOString()
  });
}

export default ApiRuntimeMonitor;
