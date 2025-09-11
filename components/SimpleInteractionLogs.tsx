import React, { useState, useEffect } from 'react';

interface LogEntry {
  sessionId: string;
  timestamp: string;
  agent: string;
  action: string;
  details: string;
  status?: string;
  actionType?: string;
  executionTime?: number;
  errorDetails?: string;
}

interface LogMetadata {
  count: number;
  scope: string;
  limit: number;
  sessionId?: string;
  agentName?: string;
}

interface SimpleInteractionLogsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleInteractionLogs: React.FC<SimpleInteractionLogsProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metadata, setMetadata] = useState<LogMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scope, setScope] = useState<string>('session');
  const [filterAgent, setFilterAgent] = useState<string>('');
  const [filterActionType, setFilterActionType] = useState<string>('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        scope,
        limit: '100'
      });
      
      if (scope === 'agent' && filterAgent) {
        params.append('agent', filterAgent);
      }
      
      if (scope === 'actionType' && filterActionType) {
        params.append('actionType', filterActionType);
      }
      
      // Try enhanced logging first, fallback to simple logging
      let response = await fetch(`/api/enhanced-interaction-logs?${params.toString()}`);
      
      if (!response.ok) {
        // Fallback to simple logging
        response = await fetch('/api/simple-interaction-logs');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to load logs: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
      setMetadata(data.metadata || null);
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
  }, [isOpen, scope, filterAgent, filterActionType]);

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
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ margin: 0, color: '#ffb347' }}>Enhanced Agent Interaction Logs</h2>
              <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '14px' }}>
                {scope === 'session' ? 'Current conversation session' : 
                 scope === 'all' ? 'All recent interactions' :
                 scope === 'errors' ? 'Error logs only' :
                 scope === 'agent' ? `${filterAgent} agent logs` :
                 scope === 'actionType' ? `${filterActionType} actions` : 'Agent interactions'}
                {metadata && ` (${metadata.count} entries)`}
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
          
          {/* Filter Controls */}
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              style={{
                padding: '8px 12px',
                background: '#2a2a2a',
                border: '1px solid #555',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              <option value="session">Current Session</option>
              <option value="all">All Recent</option>
              <option value="errors">Errors Only</option>
              <option value="agent">By Agent</option>
              <option value="actionType">By Action Type</option>
            </select>
            
            {scope === 'agent' && (
              <input
                type="text"
                placeholder="Agent name..."
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#2a2a2a',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px',
                  minWidth: '150px'
                }}
              />
            )}
            
            {scope === 'actionType' && (
              <select
                value={filterActionType}
                onChange={(e) => setFilterActionType(e.target.value)}
                style={{
                  padding: '8px 12px',
                  background: '#2a2a2a',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="">Select action type...</option>
                <option value="task_received">Task Received</option>
                <option value="task_started">Task Started</option>
                <option value="task_completed">Task Completed</option>
                <option value="task_failed">Task Failed</option>
                <option value="collaboration">Collaboration</option>
                <option value="learning">Learning</option>
                <option value="other">Other</option>
              </select>
            )}
            
            <button
              onClick={loadLogs}
              style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Refresh
            </button>
          </div>
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
              {scope === 'session' 
                ? 'No interactions yet in this conversation'
                : scope === 'errors'
                ? 'No errors logged recently'
                : 'No interactions found for the selected filter'
              }
            </div>
          )}

          {logs.length > 0 && (
            <div>
              <div style={{ marginBottom: '20px', color: '#888' }}>
                {logs.length} interaction{logs.length !== 1 ? 's' : ''} found
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {logs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#2a2a2a',
                      border: `1px solid ${log.status === 'error' ? '#ff4444' : 
                                         log.status === 'success' ? '#4CAF50' : 
                                         log.status === 'in_progress' ? '#ffa500' : '#444'}`,
                      borderRadius: '4px',
                      padding: '15px'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                          {log.agent}
                        </span>
                        {log.status && (
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            background: log.status === 'error' ? '#ff4444' : 
                                       log.status === 'success' ? '#4CAF50' : 
                                       log.status === 'in_progress' ? '#ffa500' : '#666',
                            color: '#fff'
                          }}>
                            {log.status}
                          </span>
                        )}
                        {log.actionType && (
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            background: '#333',
                            color: '#ccc'
                          }}>
                            {log.actionType.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#888', fontSize: '12px' }}>
                          {log.timestamp}
                        </span>
                        {log.executionTime && (
                          <div style={{ color: '#888', fontSize: '10px' }}>
                            {log.executionTime}ms
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ color: '#ffb347', marginBottom: '5px' }}>
                      {log.action}
                    </div>
                    
                    <div style={{ color: '#ccc' }}>
                      {log.details}
                    </div>
                    
                    {log.errorDetails && (
                      <div style={{ 
                        color: '#ff6b6b', 
                        fontSize: '12px', 
                        marginTop: '8px',
                        padding: '8px',
                        background: '#331111',
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                      }}>
                        Error: {log.errorDetails}
                      </div>
                    )}
                    
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
