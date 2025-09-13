"use client";

import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  agentId: string;
  agentName: string;
  agentType: string;
  taskAssigned: string;
  taskSummary: string;
  status: string;
  executionTimeMs: number;
  outputSummary?: string;
  success?: boolean;
}

interface RealTimeLoggingPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

const RealTimeLoggingPanel: React.FC<RealTimeLoggingPanelProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('latest'); // Default to latest session
  const [showDropdown, setShowDropdown] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new logs are added, but only for latest session and if user hasn't manually scrolled
  useEffect(() => {
    if (logsContainerRef.current && !userHasScrolled && selectedSession === 'latest') {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, userHasScrolled, selectedSession]);

  // Handle scroll events to detect user interaction
  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
      
      // If user scrolled away from bottom, disable auto-scroll
      if (!isAtBottom) {
        setUserHasScrolled(true);
      } else {
        // If user scrolled back to bottom, re-enable auto-scroll
        setUserHasScrolled(false);
      }
    }
  };

  // Function to format coordination details (not the full response)
  const formatCoordinationDetails = (interaction: any): string => {
    const details: string[] = [];
    
    // Add agent assignment information
    if (interaction.assignedBy && interaction.assignedBy !== interaction.agentId) {
      details.push(`📨 Assigned by: ${interaction.assignedBy}`);
    }
    
    // Add task priority and complexity
    if (interaction.taskPriority) {
      details.push(`⚡ Priority: ${interaction.taskPriority}`);
    }
    if (interaction.taskComplexity) {
      details.push(`🎯 Complexity: ${interaction.taskComplexity}`);
    }
    
    // Add coordination info
    if (interaction.coordinatedBy && interaction.coordinatedBy !== interaction.agentId) {
      details.push(`🎛️ Coordinated by: ${interaction.coordinatedBy}`);
    }
    
    // Add execution timing
    if (interaction.executionTimeMs) {
      details.push(`⏱️ Execution: ${interaction.executionTimeMs}ms`);
    }
    
    // Add dependencies if any
    if (interaction.dependencies && interaction.dependencies.length > 0) {
      details.push(`🔗 Dependencies: ${interaction.dependencies.join(', ')}`);
    }
    
    // Add follow-up requirement
    if (interaction.followUpRequired) {
      details.push(`🔄 Follow-up required`);
    }
    
    // Add status-specific information
    if (interaction.success === false && interaction.errorDetails) {
      details.push(`❌ Error: ${interaction.errorDetails.substring(0, 100)}...`);
    }
    
    return details.length > 0 ? details.join('\n') : 'Direct execution';
  };

    // Poll for new logs every 2 seconds when panel is visible
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isVisible) {
      const pollLogs = async () => {
        try {
          // Fetch available sessions first
          const sessionsResponse = await fetch('/api/enhanced-interaction-logs?scope=sessions');
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();
            if (sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
              setAvailableSessions(sessionsData.sessions.slice(0, 10));
              
              // Determine which session to fetch
              let sessionToFetch;
              if (selectedSession === 'latest') {
                // For "This Session", only show logs from truly active current sessions
                if (sessionsData.sessions.length > 0) {
                  const mostRecentSession = sessionsData.sessions[0];
                  
                  // Check if the most recent session is "current" (active within last 30 minutes)
                  // Session IDs contain timestamps, we can use that to determine recency
                  const sessionTimestamp = mostRecentSession.match(/session_(\d+)_/);
                  if (sessionTimestamp) {
                    const sessionTime = parseInt(sessionTimestamp[1]);
                    const currentTime = Date.now();
                    const timeDiffMinutes = (currentTime - sessionTime) / (1000 * 60);
                    
                    console.log(`[LogPanel] Session time check: ${mostRecentSession}, age: ${timeDiffMinutes.toFixed(1)} minutes`);
                    
                    // If session is less than 10 minutes old, consider it "current"
                    if (timeDiffMinutes < 10) {
                      sessionToFetch = mostRecentSession;
                      console.log(`[LogPanel] Using current session: ${mostRecentSession}`);
                    } else {
                      sessionToFetch = null; // Too old, keep "This Session" empty
                      console.log(`[LogPanel] Session too old, keeping This Session empty`);
                    }
                  } else {
                    sessionToFetch = null; // Can't parse timestamp, keep empty
                    console.log(`[LogPanel] Cannot parse session timestamp`);
                  }
                } else {
                  sessionToFetch = null; // No sessions available
                  console.log(`[LogPanel] No sessions available`);
                }
              } else if (selectedSession !== 'latest') {
                sessionToFetch = selectedSession; // Specific historical session
              }
              
              // Fetch the session data if we have a session to fetch
              if (sessionToFetch) {
                const sessionResponse = await fetch(`/api/enhanced-interaction-logs?scope=session&sessionId=${sessionToFetch}&limit=50`);
                if (sessionResponse.ok) {
                  const sessionData = await sessionResponse.json();
                  
                  // Process session interactions into meaningful coordination logs
                  const coordinationLogs: LogEntry[] = [];
                  
                  if (sessionData.sessionSummary) {
                    const session = sessionData.sessionSummary;
                    
                    // Add session overview
                    coordinationLogs.push({
                      id: `${session.sessionId}_overview`,
                      timestamp: session.startTime,
                      sessionId: session.sessionId,
                      agentId: 'system',
                      agentName: 'System',
                      agentType: 'system',
                      taskAssigned: `Session Started: ${session.requestSummary}`,
                      taskSummary: `🎬 Session Initiated
📋 Type: ${session.orchestrationType}
👥 Agents: ${session.totalAgentsUsed} (${session.agentsInvolved.join(', ')})
🎯 Orchestrator: ${session.masterOrchestratorInvolved ? 'Yes' : 'No'}
📊 Coordinator: ${session.projectCoordinatorInvolved ? 'Yes' : 'No'}`,
                      status: session.sessionStatus,
                      executionTimeMs: session.totalExecutionTimeMs,
                      outputSummary: `Session overview`,
                      success: session.sessionStatus === 'completed'
                    });
                    
                    // Process each interaction to show coordination
                    if (session.interactions) {
                      session.interactions.forEach((interaction: any) => {
                        coordinationLogs.push({
                          id: interaction.id,
                          timestamp: interaction.timestamp,
                          sessionId: interaction.sessionId,
                          agentId: interaction.agentId,
                          agentName: interaction.agentName,
                          agentType: interaction.agentType,
                          taskAssigned: interaction.taskAssigned,
                          taskSummary: formatCoordinationDetails(interaction),
                          status: interaction.status,
                          executionTimeMs: interaction.executionTimeMs,
                          outputSummary: interaction.outputSummary ? interaction.outputSummary.substring(0, 200) + '...' : 'No output summary',
                          success: interaction.success
                        });
                      });
                    }
                  }
                  
                  // Sort by timestamp (chronological order for better understanding of flow)
                  coordinationLogs.sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();
                    return timeA - timeB;
                  });
                  
                  setLogs(coordinationLogs);
                  setIsConnected(true);
                } else {
                  setIsConnected(false);
                }
              } else {
                // No session to fetch (This Session mode) - start with empty logs
                setLogs([]);
                setIsConnected(true);
              }
            }
          } else {
            setIsConnected(false);
          }
        } catch (error) {
          console.error('Error polling coordination logs:', error);
          setIsConnected(false);
        }
      };

      pollLogs();
      interval = setInterval(pollLogs, 2000); // Poll every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVisible, selectedSession]);

  // Clear logs when changing sessions and handle scroll position
  useEffect(() => {
    setLogs([]);
    setUserHasScrolled(false);
    
    // Small delay to ensure logs are cleared before setting scroll position
    setTimeout(() => {
      if (logsContainerRef.current) {
        if (selectedSession === 'latest') {
          // For latest session, allow auto-scroll to bottom
          logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        } else {
          // For historical sessions, scroll to top so user sees the beginning
          logsContainerRef.current.scrollTop = 0;
          setUserHasScrolled(true); // Disable auto-scroll for historical sessions
        }
      }
    }, 100);
  }, [selectedSession]);
  
  const clearAllLogs = async () => {
    try {
      // Clear only the selected session, not all logs  
      const sessionToClear = selectedSession === 'latest' ? availableSessions[0] : selectedSession;
      if (!sessionToClear) return;
      
      const response = await fetch('/api/enhanced-interaction-logs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId: sessionToClear })
      });
      
      if (response.ok) {
        setLogs([]);
        // Remove the cleared session from available sessions
        setAvailableSessions(prev => prev.filter(id => id !== sessionToClear));
        if (selectedSession !== 'latest') {
          setSelectedSession('latest');
        }
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };
  
  const formatSessionName = (sessionId: string) => {
    const parts = sessionId.split('_');
    if (parts.length >= 2) {
      const timestamp = parseInt(parts[1]);
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return sessionId.substring(0, 12) + '...';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string, success?: boolean) => {
    if (success === false) return '#ff6b6b';
    if (status === 'completed') return '#51cf66';
    if (status === 'running' || status === 'in_progress') return '#ffd93d';
    return '#74c0fc';
  };

  const getAgentEmoji = (agentType: string, agentId: string) => {
    switch (agentType) {
      case 'management': return '🎯';
      case 'specialist': 
        if (agentId.includes('researcher')) return '🔍';
        if (agentId.includes('coordinator')) return '📋';
        if (agentId.includes('communication')) return '📝';
        return '🤖';
      default: return '🤖';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: '20px',
          right: isVisible ? '420px' : '20px',
          zIndex: 1001,
          background: '#ffb347',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#ffa500';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#ffb347';
        }}
      >
        {isVisible ? '📝 Hide Logs' : '📝 Show Real-Time Logs'}
      </button>

      {/* Logging Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: isVisible ? 0 : '-400px',
        width: '400px',
        height: '100vh',
        background: '#1a1d1f',
        borderLeft: '1px solid #333',
        zIndex: 1000,
        transition: 'right 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isVisible ? '-4px 0 20px rgba(0,0,0,0.5)' : 'none'
      }}>
        {/* Header */}
        <div style={{
          background: '#232526',
          padding: '20px',
          borderBottom: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px'
          }}>
            <h3 style={{
              color: '#ffb347',
              fontSize: '18px',
              fontWeight: '600',
              margin: 0
            }}>
              🚀 Agent Coordination Logs
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#51cf66' : '#ff6b6b'
              }} />
              <span style={{
                color: '#ccc',
                fontSize: '12px'
              }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          {/* Session Selector and Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            {/* Session Dropdown */}
            <div style={{ position: 'relative', flex: 1 }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#333',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  {selectedSession === 'latest' ? '🔥 This Session' : `📋 ${formatSessionName(selectedSession)}`}
                </span>
                <span style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  ▼
                </span>
              </button>
              
              {showDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#333',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  zIndex: 1002,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  <div
                    onClick={() => {
                      setSelectedSession('latest');
                      setShowDropdown(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: selectedSession === 'latest' ? '#444' : 'transparent',
                      fontSize: '12px',
                      color: '#fff',
                      borderBottom: '1px solid #444'
                    }}
                    onMouseOver={(e) => {
                      if (selectedSession !== 'latest') {
                        e.currentTarget.style.backgroundColor = '#3a3a3a';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedSession !== 'latest') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    � Latest Session
                  </div>
                  {availableSessions.map((sessionId) => (
                    <div
                      key={sessionId}
                      onClick={() => {
                        setSelectedSession(sessionId);
                        setShowDropdown(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: selectedSession === sessionId ? '#444' : 'transparent',
                        fontSize: '12px',
                        color: '#fff',
                        borderBottom: '1px solid #444'
                      }}
                      onMouseOver={(e) => {
                        if (selectedSession !== sessionId) {
                          e.currentTarget.style.backgroundColor = '#3a3a3a';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedSession !== sessionId) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      📋 {formatSessionName(sessionId)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Clear All Button */}
            <button
              onClick={clearAllLogs}
              style={{
                padding: '8px 12px',
                background: '#ff6b6b',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ff5252';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ff6b6b';
              }}
            >
              🗑️ Clear Session
            </button>
          </div>
          
          {/* Session Info */}
          {selectedSession === 'latest' && availableSessions.length > 0 && (
            <div style={{
              color: '#aaa',
              fontSize: '12px'
            }}>
              Session: {formatSessionName(availableSessions[0])}
            </div>
          )}
          {selectedSession !== 'latest' && (
            <div style={{
              color: '#aaa',
              fontSize: '12px'
            }}>
              Viewing: {formatSessionName(selectedSession)}
            </div>
          )}
        </div>

        {/* Logs Container */}
        <div 
          ref={logsContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px'
          }}
        >
          {logs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#666',
              padding: '40px 20px',
              fontSize: '14px'
            }}>
              {isConnected ? 
                (selectedSession === 'latest' ? 
                  'This session is empty. Agent coordination activity will appear here when it occurs.' : 
                  'Waiting for agent coordination activity...'
                ) : 
                'No connection to logging service'
              }
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} style={{
                background: '#232526',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                fontSize: '12px'
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>{getAgentEmoji(log.agentType, log.agentId)}</span>
                    <span style={{
                      color: '#ffb347',
                      fontWeight: '600'
                    }}>
                      {log.agentName}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      color: getStatusColor(log.status, log.success),
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {log.status}
                    </span>
                    <span style={{
                      color: '#888',
                      fontSize: '10px'
                    }}>
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Task/Coordination Details */}
                <div style={{
                  color: '#e0e0e0',
                  marginBottom: '8px',
                  lineHeight: '1.5',
                  fontSize: '13px'
                }}>
                  <strong style={{ color: '#b0b0b0' }}>Coordination:</strong> 
                  <div style={{ marginTop: '4px', whiteSpace: 'pre-line' }}>
                    {log.taskSummary}
                  </div>
                </div>

                {/* Brief Output Summary (not full response) */}
                {log.outputSummary && log.agentType !== 'system' && (
                  <div style={{
                    color: '#b8b8b8',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    paddingTop: '8px',
                    borderTop: '1px solid #2a2d2e'
                  }}>
                    <strong style={{ color: '#999' }}>Output Summary:</strong>
                    <div style={{ marginTop: '4px' }}>
                      {log.outputSummary}
                    </div>
                  </div>
                )}

                {/* Execution Time */}
                <div style={{
                  marginTop: '8px',
                  textAlign: 'right',
                  color: '#777',
                  fontSize: '11px'
                }}>
                  ⏱️ {log.executionTimeMs}ms
                </div>
              </div>
            ))
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {userHasScrolled && (
          <button
            onClick={() => {
              if (logsContainerRef.current) {
                logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
                setUserHasScrolled(false);
              }
            }}
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '20px',
              background: '#ffb347',
              color: '#000',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              zIndex: 10
            }}
            title="Scroll to bottom"
          >
            ⬇️
          </button>
        )}

        {/* Footer */}
        <div style={{
          background: '#232526',
          padding: '12px 20px',
          borderTop: '1px solid #333',
          fontSize: '11px',
          color: '#666',
          textAlign: 'center'
        }}>
          {selectedSession === 'latest' ? 
            `Auto-refreshing every 2 seconds • Latest ${logs.length} coordination events` :
            `Historical session • ${logs.length} coordination events`
          }
        </div>
      </div>
    </>
  );
};

export default RealTimeLoggingPanel;
