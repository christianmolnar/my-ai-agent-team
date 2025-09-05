'use client';

import { useState, useEffect } from 'react';

interface AlertConfig {
  execNotificationThreshold: number;
  slackWebhook?: string;
  emailEndpoint?: string;
  discordWebhook?: string;
}

export default function AlertConfigPage() {
  const [config, setConfig] = useState<AlertConfig>({
    execNotificationThreshold: 3,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isTestingWebhooks, setIsTestingWebhooks] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/alert-config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/alert-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ Configuration saved successfully! Test messages have been sent to configured channels.');
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const testWebhooks = async () => {
    setIsTestingWebhooks(true);
    
    try {
      const response = await fetch('/api/alert-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, testOnly: true }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ Test messages sent successfully!');
      } else {
        setMessage(`❌ Test failed: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Test failed');
    } finally {
      setIsTestingWebhooks(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>🚨 Alert Configuration</h1>
        <p style={{ margin: '0', fontSize: '1.1em', opacity: '0.9' }}>
          Configure executive notifications for critical API failures
        </p>
      </div>

      {/* Executive Alert Explanation */}
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Executive Alert System</h3>
        <p style={{ margin: '0', color: '#856404', lineHeight: '1.5' }}>
          When an API key fails consecutively (reaching your threshold), executive alerts will be sent 
          to the configured channels. This ensures critical system failures reach the right stakeholders immediately.
        </p>
      </div>

      {/* Failure Threshold */}
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Failure Threshold</h3>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Executive notification after consecutive failures:
        </label>
        <select
          value={config.execNotificationThreshold}
          onChange={(e) => setConfig({ ...config, execNotificationThreshold: Number(e.target.value) })}
          style={{
            width: '200px',
            padding: '8px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          <option value={1}>1 failure (immediate)</option>
          <option value={2}>2 failures</option>
          <option value={3}>3 failures (recommended)</option>
          <option value={4}>4 failures</option>
          <option value={5}>5 failures</option>
        </select>
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
          Recommended: 3 failures to avoid false positives from temporary issues
        </p>
      </div>

      {/* Slack Configuration */}
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>💬 Slack Notifications</h3>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Slack Webhook URL:
        </label>
        <input
          type="url"
          placeholder="https://hooks.slack.com/services/..."
          value={config.slackWebhook || ''}
          onChange={(e) => setConfig({ ...config, slackWebhook: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '12px' }}>
          Create a webhook in your Slack workspace: Settings & administration → Manage apps → Custom Integrations → Incoming Webhooks
        </p>
      </div>

      {/* Discord Configuration */}
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>🎮 Discord Notifications</h3>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Discord Webhook URL:
        </label>
        <input
          type="url"
          placeholder="https://discord.com/api/webhooks/..."
          value={config.discordWebhook || ''}
          onChange={(e) => setConfig({ ...config, discordWebhook: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '12px' }}>
          Create a webhook in Discord: Server Settings → Integrations → Webhooks → New Webhook
        </p>
      </div>

      {/* Email Configuration */}
      <div style={{
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>📧 Email Notifications</h3>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Email Service Endpoint:
        </label>
        <input
          type="url"
          placeholder="https://your-email-service.com/send"
          value={config.emailEndpoint || ''}
          onChange={(e) => setConfig({ ...config, emailEndpoint: e.target.value })}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '12px' }}>
          Configure your own email service endpoint (e.g., SendGrid, Mailgun, or custom service)
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button
          onClick={saveConfig}
          disabled={loading}
          style={{
            flex: 1,
            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : '💾 Save Configuration'}
        </button>
        
        <button
          onClick={testWebhooks}
          disabled={isTestingWebhooks || (!config.slackWebhook && !config.discordWebhook)}
          style={{
            background: isTestingWebhooks ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isTestingWebhooks ? 'not-allowed' : 'pointer'
          }}
        >
          {isTestingWebhooks ? 'Testing...' : '🧪 Test Webhooks'}
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          marginTop: '20px',
          background: message.includes('❌') ? '#f8d7da' : '#d4edda',
          border: `1px solid ${message.includes('❌') ? '#f5c6cb' : '#c3e6cb'}`,
          color: message.includes('❌') ? '#721c24' : '#155724'
        }}>
          {message}
        </div>
      )}

      {/* Documentation */}
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '30px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>📖 How It Works</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Real-time Monitoring:</strong> All agent API calls are automatically monitored for failures</li>
          <li><strong>Intelligent Alerting:</strong> Only sends alerts after consecutive failures to avoid noise</li>
          <li><strong>Executive Escalation:</strong> Critical failures are immediately escalated to configured channels</li>
          <li><strong>Audit Trail:</strong> All alerts are logged for review and analysis</li>
          <li><strong>Performance Tracking:</strong> Response times and success rates are continuously measured</li>
        </ul>
        
        <h4 style={{ margin: '20px 0 10px 0' }}>Alert Content Includes:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Which API key/service failed</li>
          <li>Number of consecutive failures</li>
          <li>Specific error details</li>
          <li>Recommended action to take</li>
          <li>Business impact assessment</li>
        </ul>
      </div>
    </div>
  );
}
