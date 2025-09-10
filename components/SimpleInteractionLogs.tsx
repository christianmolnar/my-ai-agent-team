import React, { useState, useEffect } from 'react';

interface LogEntry {
  sessionId: string;
  timestamp: string;
  agent: string;
  action: string;
  details: string;
}

interface SimpleInteractionLogsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleInteractionLogs: React.FC<SimpleInteractionLogsProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/simple-interaction-logs');
      
      if (!response.ok) {
        throw new Error(`Failed to load logs: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs');
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: '8px',
        width: '80%',
        height: '80%',
        maxWidth: '1200px',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#ffb347' }}>Current Conversation Logs</h2>
            <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '14px' }}>
              Live interaction logs from this conversation session
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto'
        }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading logs...
            </div>
          )}

          {error && (
            <div style={{
              color: '#ff4444',
              backgroundColor: '#331111',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              Error: {error}
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
              No interactions yet in this conversation
            </div>
          )}

          {logs.length > 0 && (
            <div>
              <div style={{ marginBottom: '20px', color: '#888' }}>
                {logs.length} interaction{logs.length !== 1 ? 's' : ''} in current conversation
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {logs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      padding: '15px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        {log.agent}
                      </span>
                      <span style={{ color: '#888', fontSize: '12px' }}>
                        {log.timestamp}
                      </span>
                    </div>
                    
                    <div style={{ color: '#ffb347', marginBottom: '5px' }}>
                      {log.action}
                    </div>
                    
                    <div style={{ color: '#ccc' }}>
                      {log.details}
                    </div>
                    
                    <div style={{ color: '#666', fontSize: '10px', marginTop: '5px' }}>
                      Session: {log.sessionId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleInteractionLogs;
