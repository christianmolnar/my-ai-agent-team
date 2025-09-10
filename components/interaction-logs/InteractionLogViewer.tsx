import React, { useState, useEffect } from 'react';
import { ChatSession, AgentInteraction, InteractionSummary, InteractionLog } from '../../types/interaction-logging';

interface InteractionLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const InteractionLogViewer: React.FC<InteractionLogViewerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'current' | 'search' | 'stats'>('recent');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<InteractionLog[]>([]);
  const [searchResults, setSearchResults] = useState<AgentInteraction[]>([]);
  const [stats, setStats] = useState<InteractionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRecentSessions();
      loadStats();
    }
  }, [isOpen]);

  const loadRecentSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/interaction-logs?action=recent-sessions&limit=20');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setRecentSessions(data.data);
      } else {
        setError(data.error || 'Failed to load recent sessions');
      }
    } catch (error) {
      console.error('Load recent sessions error:', error);
      setError(`Error loading recent sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/interaction-logs?action=session-details&sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setCurrentSession(data.data);
        setActiveTab('current');
      } else {
        setError(data.error || 'Failed to load session details');
      }
    } catch (error) {
      console.error('Load session details error:', error);
      setError(`Error loading session details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/interaction-logs?action=interaction-stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        console.error('Stats loading failed:', data.error);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const searchInteractions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'search',
        query: searchQuery
      });
      
      if (agentFilter) params.append('agentFilter', agentFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/interaction-logs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      } else {
        setError('Failed to search interactions');
      }
    } catch (error) {
      setError('Error searching interactions');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  };

  const getStatusIcon = (status: AgentInteraction['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'in-progress': return '🔄';
      case 'assigned': return '📋';
      case 'cancelled': return '⏹️';
      default: return '❓';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'complex': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      {/* Header with tabs */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px"
      }}>
        <h3 style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#ffb347",
          margin: "0"
        }}>📋 Agent Interaction Logs</h3>
        <button
          onClick={() => loadRecentSessions()}
          style={{
            color: "#ffb347",
            background: "transparent",
            border: "1px solid #ffb347",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#ffb347";
            e.currentTarget.style.color = "#000";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#ffb347";
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "15px"
      }}>
        {[
          { id: 'recent', label: 'Recent Sessions', icon: '📋' },
          { id: 'current', label: 'Current Session', icon: '🎯' },
          { id: 'search', label: 'Search', icon: '🔍' },
          { id: 'stats', label: 'Statistics', icon: '📊' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "8px 16px",
              background: activeTab === tab.id ? "#ffb347" : "transparent",
              color: activeTab === tab.id ? "#000" : "#ccc",
              border: `1px solid ${activeTab === tab.id ? "#ffb347" : "#555"}`,
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.borderColor = "#ffb347";
                e.currentTarget.style.color = "#ffb347";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.borderColor = "#555";
                e.currentTarget.style.color = "#ccc";
              }
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: "#ff6b6b",
          border: "1px solid #ff5252",
          color: "#fff",
          padding: "12px 20px",
          borderRadius: "6px",
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              padding: "0 0 0 10px"
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Content Area */}
      <div style={{
        background: "#181a1b",
        border: "1px solid #555",
        borderRadius: "8px",
        padding: "15px",
        maxHeight: "500px",
        overflowY: "auto"
      }}>
        {loading && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px",
            color: "#888"
          }}>
            Loading...
          </div>
        )}

        {/* Recent Sessions Tab */}
        {activeTab === 'recent' && !loading && (
          <div>
            {recentSessions.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#888"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "10px" }}>📋</div>
                <p style={{ margin: "0 0 5px 0" }}>No interaction logs found</p>
                <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                  Start a conversation with an agent to see interaction logs here
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recentSessions.map(session => (
                  <div 
                    key={session.sessionId} 
                    style={{
                      background: "#232526",
                      border: "1px solid #444",
                      borderRadius: "8px",
                      padding: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onClick={() => loadSessionDetails(session.sessionId)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "#ffb347";
                      e.currentTarget.style.background = "#2a2d2e";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "#444";
                      e.currentTarget.style.background = "#232526";
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px"
                    }}>
                      <div style={{
                        fontWeight: "500",
                        color: "#f3f3f3",
                        flex: "1"
                      }}>
                        {`Session ${session.sessionId.split('_').pop() || session.sessionId} - ${session.totalInteractions} interactions`}
                      </div>
                      <div style={{
                        fontSize: "11px",
                        color: "#888",
                        marginLeft: "10px"
                      }}>
                        {formatTimestamp(session.createdAt)}
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      gap: "15px",
                      fontSize: "12px",
                      color: "#ccc"
                    }}>
                      <span>{session.totalInteractions} interactions</span>
                      <span>{Object.keys(session.agentBreakdown).length} agents</span>
                      <span style={{
                        color: session.status === 'completed' ? '#4CAF50' : '#ffb347'
                      }}>{session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Session Tab */}
        {activeTab === 'current' && !loading && (
          <div>
            {currentSession ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {/* Session Overview */}
                <div style={{
                  background: "#232526",
                  border: "1px solid #4CAF50",
                  borderRadius: "8px",
                  padding: "15px"
                }}>
                  <h4 style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#4CAF50",
                    margin: "0 0 10px 0"
                  }}>Session Overview</h4>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "14px"
                  }}>
                    <div>
                      <strong style={{ color: "#ffb347" }}>Request:</strong>
                      <span style={{ color: "#f3f3f3", marginLeft: "8px" }}>
                        {currentSession.requestSummary}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: "#ffb347" }}>Status:</strong>
                      <span style={{ color: "#f3f3f3", marginLeft: "8px" }}>
                        {currentSession.sessionStatus}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: "#ffb347" }}>Started:</strong>
                      <span style={{ color: "#f3f3f3", marginLeft: "8px" }}>
                        {formatTimestamp(currentSession.startTime)}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: "#ffb347" }}>Interactions:</strong>
                      <span style={{ color: "#f3f3f3", marginLeft: "8px" }}>
                        {currentSession.totalInteractions}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Interactions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {currentSession.interactions.map(interaction => (
                    <div key={interaction.id} style={{
                      background: "#232526",
                      border: "1px solid #555",
                      borderRadius: "8px",
                      padding: "12px"
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px"
                      }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px"
                        }}>
                          <span style={{ fontSize: "20px" }}>{getStatusIcon(interaction.status)}</span>
                          <div>
                            <div style={{
                              fontWeight: "500",
                              color: "#ffb347"
                            }}>
                              {interaction.agentName}
                            </div>
                            <div style={{
                              fontSize: "11px",
                              color: "#888"
                            }}>
                              #{interaction.sequenceNumber} • {interaction.agentId}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          textAlign: "right",
                          fontSize: "11px",
                          color: "#888"
                        }}>
                          <div>{formatTimestamp(interaction.timestamp)}</div>
                          <div>{interaction.taskComplexity} • {interaction.taskPriority}</div>
                        </div>
                      </div>

                      <div style={{
                        fontSize: "14px",
                        color: "#f3f3f3",
                        marginBottom: "5px"
                      }}>
                        <strong>Task:</strong> {interaction.taskSummary}
                      </div>
                      {interaction.outputSummary && (
                        <div style={{
                          fontSize: "14px",
                          color: "#ccc"
                        }}>
                          <strong>Output:</strong> {interaction.outputSummary}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "40px",
                color: "#888"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎯</div>
                <p style={{ margin: "0" }}>Select a session from Recent Sessions to view details</p>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px"
            }}>
              <input
                type="text"
                placeholder="Search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 12px",
                  background: "#232526",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  color: "#f3f3f3",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              <input
                type="text"
                placeholder="Filter by agent ID..."
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                style={{
                  padding: "10px 12px",
                  background: "#232526",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  color: "#f3f3f3",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>

            <button
              onClick={searchInteractions}
              disabled={loading}
              style={{
                padding: "12px 20px",
                background: loading ? "#666" : "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#45a049";
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "#4CAF50";
                }
              }}
            >
              {loading ? 'Searching...' : '🔍 Search Interactions'}
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {searchResults.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#888"
                }}>
                  {searchQuery ? 'No results found' : 'Enter a search query to find interactions'}
                </div>
              ) : (
                searchResults.map(interaction => (
                  <div key={interaction.id} style={{
                    background: "#232526",
                    border: "1px solid #555",
                    borderRadius: "8px",
                    padding: "12px"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px"
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span>{getStatusIcon(interaction.status)}</span>
                        <span style={{ fontWeight: "500", color: "#ffb347" }}>
                          {interaction.agentName}
                        </span>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          ({interaction.agentId})
                        </span>
                      </div>
                      <div style={{
                        fontSize: "11px",
                        color: "#888"
                      }}>
                        {formatTimestamp(interaction.timestamp)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#f3f3f3",
                      marginBottom: "5px"
                    }}>
                      <strong>Task:</strong> {interaction.taskSummary}
                    </div>
                    {interaction.outputSummary && (
                      <div style={{
                        fontSize: "14px",
                        color: "#ccc"
                      }}>
                        <strong>Output:</strong> {interaction.outputSummary}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Overview Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px"
            }}>
              <div style={{
                background: "#232526",
                border: "1px solid #4CAF50",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#4CAF50"
                }}>{stats.totalSessions}</div>
                <div style={{
                  fontSize: "12px",
                  color: "#ccc"
                }}>Total Sessions</div>
              </div>
              <div style={{
                background: "#232526",
                border: "1px solid #ffb347",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ffb347"
                }}>{stats.totalInteractions}</div>
                <div style={{
                  fontSize: "12px",
                  color: "#ccc"
                }}>Total Interactions</div>
              </div>
              <div style={{
                background: "#232526",
                border: "1px solid #ff6b6b",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#ff6b6b"
                }}>{stats.totalAgentsUsed}</div>
                <div style={{
                  fontSize: "12px",
                  color: "#ccc"
                }}>Agents Used</div>
              </div>
              <div style={{
                background: "#232526",
                border: "1px solid #6c5ce7",
                borderRadius: "8px",
                padding: "15px",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#6c5ce7"
                }}>{stats.successRate.toFixed(1)}%</div>
                <div style={{
                  fontSize: "12px",
                  color: "#ccc"
                }}>Success Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractionLogViewer;
