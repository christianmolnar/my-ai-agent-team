'use client';

import { useState, useEffect } from 'react';

interface Alert {
  level: string;
  title: string;
  message: string;
  error: string;
  timestamp: string;
  actionRequired: string;
  impact: string;
}

interface AlertSummary {
  total: number;
  last24Hours: number;
  last7Days: number;
}

export default function ExecutiveAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertSummary>({ total: 0, last24Hours: 0, last7Days: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/executive-alerts');
      const data = await response.json();
      setAlerts(data.alerts);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getAlertAge = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center'
      }}>
        <h1>Loading alerts...</h1>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>🚨 Executive Alerts Dashboard</h1>
        <p style={{ margin: '0', fontSize: '1.1em', opacity: '0.9' }}>
          Critical API failure notifications and system health escalations
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>📊</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#666' }}>Total Alerts</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: summary.total > 0 ? '#dc3545' : '#28a745' }}>
            {summary.total}
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>⏰</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#666' }}>Last 24 Hours</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: summary.last24Hours > 0 ? '#dc3545' : '#28a745' }}>
            {summary.last24Hours}
          </div>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5em', marginBottom: '10px' }}>📅</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#666' }}>Last 7 Days</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: summary.last7Days > 0 ? '#dc3545' : '#28a745' }}>
            {summary.last7Days}
          </div>
        </div>
      </div>

      {/* No Alerts State */}
      {alerts.length === 0 && (
        <div style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '30px',
          textAlign: 'center',
          color: '#155724'
        }}>
          <div style={{ fontSize: '3em', marginBottom: '15px' }}>✅</div>
          <h2 style={{ margin: '0 0 10px 0' }}>No Executive Alerts</h2>
          <p style={{ margin: '0', fontSize: '1.1em' }}>
            Your AI Agent Team is running smoothly! No critical API failures have been detected.
          </p>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Recent Alerts</h2>
          {alerts.map((alert, index) => (
            <div key={index} style={{
              background: 'white',
              border: '2px solid #dc3545',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <h3 style={{ margin: '0', color: '#dc3545', fontSize: '1.3em' }}>
                  {alert.title}
                </h3>
                <div style={{ textAlign: 'right', fontSize: '0.9em', color: '#666' }}>
                  <div>{formatDate(alert.timestamp)}</div>
                  <div style={{ fontWeight: 'bold' }}>{getAlertAge(alert.timestamp)}</div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333' }}>Message:</strong>
                <p style={{ margin: '5px 0', lineHeight: '1.5' }}>{alert.message}</p>
              </div>

              {alert.error && (
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#333' }}>Error Details:</strong>
                  <p style={{ 
                    margin: '5px 0', 
                    background: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.9em'
                  }}>
                    {alert.error}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333' }}>Action Required:</strong>
                <p style={{ margin: '5px 0', lineHeight: '1.5' }}>{alert.actionRequired}</p>
              </div>

              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '10px',
                marginTop: '10px'
              }}>
                <strong style={{ color: '#856404' }}>Business Impact:</strong>
                <span style={{ color: '#856404', marginLeft: '10px' }}>{alert.impact}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        background: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>📋 Alert Response Guide</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li><strong>Immediate Action:</strong> Check if the affected API service is experiencing outages</li>
          <li><strong>API Key Issues:</strong> Verify the API key is valid and has sufficient quota/credits</li>
          <li><strong>Rate Limiting:</strong> Consider implementing backoff strategies or upgrading API tier</li>
          <li><strong>Network Errors:</strong> Check system connectivity and DNS resolution</li>
          <li><strong>Escalation:</strong> If issues persist beyond 30 minutes, contact the AI Team lead</li>
        </ul>
        
        <div style={{ marginTop: '15px', padding: '10px', background: '#e7f3ff', borderRadius: '4px' }}>
          <strong>🔄 Auto-refresh:</strong> This dashboard updates every 30 seconds to show the latest alerts.
        </div>
      </div>
    </div>
  );
}
