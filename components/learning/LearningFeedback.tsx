/**
 * Learning Feedback Component
 * UI controls for "Internalize" vs "Forget" behavior management
 */

'use client';

import { useState, useEffect } from 'react';
import { LearningHistoryEntry, LearningStats } from '../../types/learning-tracking';
import LearningReversalModal from './LearningReversalModal';

interface LearningFeedbackProps {
  learningId?: string;
  onFeedbackSubmitted?: (learningId: string, action: 'internalize' | 'forget') => void;
  showHistory?: boolean;
}

export default function LearningFeedback({ 
  learningId, 
  onFeedbackSubmitted, 
  showHistory = false 
}: LearningFeedbackProps) {
  const [history, setHistory] = useState<LearningHistoryEntry[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [selectedLearning, setSelectedLearning] = useState<string | null>(learningId || null);
  const [showConfirmation, setShowConfirmation] = useState<{ action: 'internalize' | 'forget'; learningId: string } | null>(null);
  const [showReversalModal, setShowReversalModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  useEffect(() => {
    if (showHistory) {
      loadLearningHistory();
      loadLearningStats();
    }
  }, [showHistory]);

  const loadLearningHistory = async () => {
    try {
      const response = await fetch('/api/learning-management?action=history&limit=50');
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to load learning history:', error);
    }
  };

  const loadLearningStats = async () => {
    try {
      const response = await fetch('/api/learning-management?action=stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load learning stats:', error);
    }
  };

  const submitFeedback = async (learningId: string, action: 'internalize' | 'forget', rating?: number, comments?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/learning-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'feedback',
          learningId,
          feedback: {
            action,
            rating,
            comments,
            wasHelpful: action === 'internalize'
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        // Update the history item status
        setHistory(prev => prev.map(item => 
          item.id === learningId 
            ? { ...item, status: action === 'internalize' ? 'internalized' : 'reverted', userAction: action }
            : item
        ));
        
        // Update stats
        await loadLearningStats();
        
        // Notify parent component
        onFeedbackSubmitted?.(learningId, action);
        
        alert(`✅ Learning ${action === 'internalize' ? 'internalized' : 'forgotten'} successfully!`);
      } else {
        alert(`❌ Failed to ${action} learning: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error submitting feedback: ${error}`);
    } finally {
      setLoading(false);
      setShowConfirmation(null);
    }
  };

  const handleActionClick = (learningId: string, action: 'internalize' | 'forget') => {
    setShowConfirmation({ action, learningId });
  };

  const handleReversalAction = async (learningId: string, action: 'revert' | 'keep', reason?: string) => {
    try {
      const response = await fetch('/api/learning-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'revert' ? 'rollback' : 'enable',
          learningId,
          reason: reason || ''
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadLearningHistory();
        await loadLearningStats();
        setShowReversalModal(null);
        alert(`✅ Learning ${action === 'revert' ? 'reverted' : 'kept active'} successfully!`);
      } else {
        alert(`❌ Failed to ${action} learning: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error ${action}ing learning: ${error}`);
    }
  };

  const rollbackLearning = async (learningId: string, reason: string) => {
    if (!confirm(`Are you sure you want to rollback this learning? This will restore the previous behavior.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/learning-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          learningId,
          reason
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadLearningHistory();
        await loadLearningStats();
        alert('✅ Learning rolled back successfully!');
      } else {
        alert(`❌ Failed to rollback learning: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Error rolling back learning: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = false;
    
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'active') {
      // Active includes both pending and internalized learnings
      matchesStatus = item.status === 'pending' || item.status === 'internalized';
    } else {
      matchesStatus = item.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      pending: { bg: '#ffa500', color: '#000' },
      internalized: { bg: '#4CAF50', color: '#fff' },
      reverted: { bg: '#ff6b6b', color: '#fff' },
      forgotten: { bg: '#888', color: '#fff' }
    };
    
    const config = statusConfig[status] || statusConfig.forgotten;
    
    return (
      <span style={{
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "600",
        background: config.bg,
        color: config.color,
        textTransform: "capitalize"
      }}>
        {status}
      </span>
    );
  };

  if (!showHistory && selectedLearning) {
    // Simple feedback interface for single learning
    return (
      <div style={{
        background: "#232526",
        border: "1px solid #444",
        borderRadius: "10px",
        padding: "20px",
        marginTop: "20px"
      }}>
        <h3 style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#ffb347",
          marginBottom: "15px"
        }}>
          🎓 How was this learning?
        </h3>
        <p style={{
          color: "#ccc",
          marginBottom: "15px",
          lineHeight: "1.4"
        }}>
          The agent has learned a new behavior. Would you like to keep this learning or have it forgotten?
        </p>
        
        <div style={{
          display: "flex",
          gap: "10px"
        }}>
          <button
            onClick={() => handleActionClick(selectedLearning, 'internalize')}
            disabled={loading}
            style={{
              flex: "1",
              background: loading ? "#666" : "#4CAF50",
              color: "#fff",
              border: "none",
              padding: "12px 16px",
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
            ✅ Internalize Behavior
          </button>
          
          <button
            onClick={() => handleActionClick(selectedLearning, 'forget')}
            disabled={loading}
            style={{
              flex: "1",
              background: loading ? "#666" : "#ff6b6b",
              color: "#fff",
              border: "none",
              padding: "12px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#ff5252";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#ff6b6b";
              }
            }}
          >
            🗑️ Forget Behavior
          </button>
        </div>

        {showConfirmation && (
          <div style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "1000"
          }}>
            <div style={{
              background: "#232526",
              borderRadius: "10px",
              border: "1px solid #444",
              padding: "25px",
              maxWidth: "400px",
              margin: "20px"
            }}>
              <h4 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#ffb347",
                marginBottom: "15px"
              }}>
                Confirm {showConfirmation.action === 'internalize' ? 'Internalize' : 'Forget'} Behavior
              </h4>
              <p style={{
                color: "#ccc",
                marginBottom: "20px",
                lineHeight: "1.4"
              }}>
                {showConfirmation.action === 'internalize' 
                  ? 'This will permanently keep this behavior as part of the agent\'s capabilities.'
                  : 'This will remove this behavior and restore the previous state. This action will undo the learning.'}
              </p>
              
              <div style={{
                display: "flex",
                gap: "10px"
              }}>
                <button
                  onClick={() => submitFeedback(showConfirmation.learningId, showConfirmation.action)}
                  disabled={loading}
                  style={{
                    flex: "1",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    color: "#fff",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    background: loading ? "#666" : (showConfirmation.action === 'internalize' ? "#4CAF50" : "#ff6b6b")
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = showConfirmation.action === 'internalize' ? "#45a049" : "#ff5252";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = showConfirmation.action === 'internalize' ? "#4CAF50" : "#ff6b6b";
                    }
                  }}
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
                
                <button
                  onClick={() => setShowConfirmation(null)}
                  disabled={loading}
                  style={{
                    flex: "1",
                    background: loading ? "#555" : "#666",
                    color: loading ? "#888" : "#ccc",
                    border: "none",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = "#777";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = "#666";
                      e.currentTarget.style.color = "#ccc";
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!showHistory) {
    return null;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      {/* Learning Statistics */}
      {stats && (
        <div style={{
          background: "#232526",
          borderRadius: "10px",
          border: "1px solid #444",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <h3 style={{
            color: "#ffb347",
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "15px"
          }}>📊 Learning Statistics</h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "15px",
            marginBottom: "15px"
          }}>
            <div style={{
              textAlign: "center",
              padding: "15px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #555"
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ffb347",
                marginBottom: "5px"
              }}>{stats.totalLearnings}</div>
              <div style={{
                fontSize: "12px",
                color: "#ccc"
              }}>Total Learnings</div>
            </div>
            
            <div style={{
              textAlign: "center",
              padding: "15px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #555"
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#4CAF50",
                marginBottom: "5px"
              }}>{stats.internalized}</div>
              <div style={{
                fontSize: "12px",
                color: "#ccc"
              }}>Internalized</div>
            </div>
            
            <div style={{
              textAlign: "center",
              padding: "15px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #555"
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ff6b6b",
                marginBottom: "5px"
              }}>{stats.forgotten}</div>
              <div style={{
                fontSize: "12px",
                color: "#ccc"
              }}>Forgotten</div>
            </div>
            
            <div style={{
              textAlign: "center",
              padding: "15px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #555"
            }}>
              <div style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ffa500",
                marginBottom: "5px"
              }}>{stats.pending}</div>
              <div style={{
                fontSize: "12px",
                color: "#ccc"
              }}>Pending</div>
            </div>
          </div>

          <div style={{
            textAlign: "center",
            padding: "15px",
            background: "#181a1b",
            borderRadius: "8px",
            border: "1px solid #555"
          }}>
            <div style={{
              fontSize: "16px",
              color: "#ccc"
            }}>
              Success Rate: <span style={{
                color: "#ffb347",
                fontWeight: "600"
              }}>{stats.successRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Learning History Controls */}
      <div style={{
        background: "#232526",
        borderRadius: "10px",
        border: "1px solid #444",
        padding: "20px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px"
        }}>
          <h3 style={{
            color: "#ffb347",
            fontSize: "18px",
            fontWeight: "600",
            margin: "0"
          }}>📚 Learning History</h3>
          <button
            onClick={loadLearningHistory}
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

        {/* Search and Filter */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px"
        }}>
          <input
            type="text"
            placeholder="Search learnings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: "1",
              padding: "10px 12px",
              background: "#181a1b",
              border: "1px solid #555",
              borderRadius: "6px",
              color: "#f3f3f3",
              fontSize: "14px",
              outline: "none"
            }}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 12px",
              background: "#181a1b",
              border: "1px solid #555",
              borderRadius: "6px",
              color: "#f3f3f3",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="active">Active (Pending + Internalized)</option>
            <option value="pending">Pending</option>
            <option value="internalized">Internalized</option>
            <option value="reverted">Forgotten</option>
            <option value="all">All Status</option>
          </select>
        </div>

        {/* Learning History List */}
        <div style={{
          maxHeight: "400px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          {filteredHistory.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#ccc",
              fontSize: "14px"
            }}>
              {searchQuery || statusFilter !== 'all' ? 'No matching learnings found.' : 'No learning history yet.'}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setShowReversalModal(item.id)}
                style={{
                  background: "#181a1b",
                  border: "1px solid #555",
                  borderRadius: "8px",
                  padding: "12px",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#ffb347";
                  e.currentTarget.style.backgroundColor = "#1f2122";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#555";
                  e.currentTarget.style.backgroundColor = "#181a1b";
                }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "15px"
                }}>
                  {/* Learning Info - Now takes full width */}
                  <div style={{ 
                    flex: "1",
                    minWidth: "0"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "5px"
                    }}>
                      <StatusBadge status={item.status} />
                      <span style={{
                        fontSize: "11px",
                        color: "#888"
                      }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span style={{
                        fontSize: "11px",
                        color: "#666",
                        fontStyle: "italic"
                      }}>
                        Files: {item.filesModified?.length || 0}
                      </span>
                    </div>
                    <p style={{
                      color: "#f3f3f3",
                      fontWeight: "500",
                      fontSize: "14px",
                      margin: "0",
                      lineHeight: "1.3"
                    }}>{item.description}</p>
                    <div style={{
                      fontSize: "11px",
                      color: "#888",
                      marginTop: "5px",
                      fontStyle: "italic"
                    }}>
                      Click to view details and manage learning
                    </div>
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    flexShrink: "0",
                    alignItems: "flex-start"
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent modal opening when clicking buttons
                  >
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleActionClick(item.id, 'internalize')}
                          disabled={loading}
                          style={{
                            padding: "6px 12px",
                            background: loading ? "#666" : "#4CAF50",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
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
                          ✅ Internalize
                        </button>
                        
                        <button
                          onClick={() => handleActionClick(item.id, 'forget')}
                          disabled={loading}
                          style={{
                            padding: "6px 12px",
                            background: loading ? "#666" : "#ff6b6b",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseOver={(e) => {
                            if (!loading) {
                              e.currentTarget.style.background = "#ff5252";
                            }
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = "#ff6b6b";
                          }}
                        >
                          🗑️ Forget
                        </button>
                      </>
                    )}

                    {/* Reverse Action button for all learnings */}
                    <button
                      onClick={() => setShowReversalModal(item.id)}
                      disabled={loading}
                      style={{
                        padding: "6px 12px",
                        background: loading ? "#666" : "#ffa500",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background = "#ff8c00";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background = "#ffa500";
                        }
                      }}
                    >
                      🔄 Reverse Action
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          background: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "1000"
        }}>
          <div style={{
            background: "#232526",
            borderRadius: "10px",
            border: "1px solid #444",
            padding: "25px",
            maxWidth: "400px",
            margin: "20px"
          }}>
            <h4 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#ffb347",
              marginBottom: "15px"
            }}>
              Confirm {showConfirmation.action === 'internalize' ? 'Internalize' : 'Forget'} Behavior
            </h4>
            <p style={{
              color: "#ccc",
              marginBottom: "20px",
              lineHeight: "1.4"
            }}>
              {showConfirmation.action === 'internalize' 
                ? 'This will permanently keep this behavior as part of the agent\'s capabilities.'
                : 'This will remove this behavior and restore the previous state. This action will undo the learning.'}
            </p>
            
            <div style={{
              display: "flex",
              gap: "10px"
            }}>
              <button
                onClick={() => submitFeedback(showConfirmation.learningId, showConfirmation.action)}
                disabled={loading}
                style={{
                  flex: "1",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  color: "#fff",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  background: loading ? "#666" : (showConfirmation.action === 'internalize' ? "#4CAF50" : "#ff6b6b")
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = showConfirmation.action === 'internalize' ? "#45a049" : "#ff5252";
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = showConfirmation.action === 'internalize' ? "#4CAF50" : "#ff6b6b";
                  }
                }}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              
              <button
                onClick={() => setShowConfirmation(null)}
                disabled={loading}
                style={{
                  flex: "1",
                  background: loading ? "#555" : "#666",
                  color: loading ? "#888" : "#ccc",
                  border: "none",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#777";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#666";
                    e.currentTarget.style.color = "#ccc";
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Learning Reversal Modal */}
      {showReversalModal && (
        <LearningReversalModal
          isOpen={!!showReversalModal}
          onClose={() => setShowReversalModal(null)}
          learningId={showReversalModal}
          learningData={(() => {
            const item = history.find(item => item.id === showReversalModal);
            if (item) {
              return {
                id: item.id,
                description: item.description,
                status: item.status,
                timestamp: item.timestamp instanceof Date ? item.timestamp.toISOString() : item.timestamp,
                filesModified: item.filesModified || []
              };
            }
            return {
              id: showReversalModal,
              description: 'Loading...',
              status: 'unknown',
              timestamp: new Date().toISOString(),
              filesModified: []
            };
          })()}
          onAction={handleReversalAction}
        />
      )}
    </div>
  );
}
