"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ApiStatusSummary {
  total: number;
  valid: number;
  invalid: number;
  rate_limited: number;
  network_error: number;
  health_percentage: number;
  status: string;
}

export default function MasterOrchestratorAgentPage() {
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<ApiStatusSummary | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/api-status-summary');
        if (response.ok) {
          const data = await response.json();
          setApiStatus(data.summary);
        }
      } catch (error) {
        console.error('Failed to load API status:', error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f3f3f3"
      }}>
        <div style={{
          padding: "20px",
          background: "#232526",
          borderRadius: "10px",
          border: "1px solid #444",
          textAlign: "center"
        }}>
          <p style={{ color: "#ffb347", fontSize: "18px" }}>Loading agent details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
      padding: "20px"
    }}>
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#f3f3f3"
      }}>
        <div style={{
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <Link 
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 15px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textDecoration: "none",
              color: "#f3f3f3",
              fontSize: "14px"
            }}
          >
            ← Back to Home
          </Link>
        </div>

        <div style={{
          background: "#232526",
          borderRadius: "20px",
          padding: "30px",
          border: "1px solid #444"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "30px"
          }}>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "600",
              color: "#ffb347",
              marginBottom: "10px"
            }}>
              🎯 Master Orchestrator Agent
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Central coordination hub that manages and orchestrates all other agents.
              The Master Orchestrator ensures seamless collaboration across the AI team.
            </p>
          </div>

          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px",
            marginBottom: "25px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px"
            }}>
              🎯 Core Capabilities
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              {[
                { icon: "🎯", title: "Agent Orchestration", desc: "Coordinate and manage all AI agents" },
                { icon: "📋", title: "Workflow Management", desc: "Design and execute complex workflows" },
                { icon: "📊", title: "Activity Logging", desc: "Central logging and monitoring system" },
                { icon: "🔄", title: "Dynamic Assignment", desc: "Intelligent task assignment and routing" },
                { icon: "📈", title: "Performance Tracking", desc: "Monitor agent performance and metrics" },
                { icon: "⚡", title: "Real-time Coordination", desc: "Live collaboration and synchronization" }
              ].map((capability, index) => (
                <div key={index} style={{
                  padding: "15px",
                  background: "#232526",
                  borderRadius: "8px",
                  border: "1px solid #444"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "18px" }}>{capability.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                      {capability.title}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: "12px", 
                    color: "#ccc", 
                    margin: 0,
                    lineHeight: "1.4"
                  }}>
                    {capability.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px",
            marginBottom: "25px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "15px"
            }}>
              📈 Agent Orchestration Console
            </h2>
            <div style={{
              padding: "20px",
              background: "#232526",
              borderRadius: "8px",
              border: "1px solid #444"
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "15px",
                marginBottom: "20px"
              }}>
                <div style={{
                  padding: "15px",
                  background: "#181a1b",
                  borderRadius: "8px",
                  border: "1px solid #444"
                }}>
                  <h3 style={{ color: "#ffb347", fontSize: "16px", marginBottom: "10px" }}>
                    🤖 Active Agents
                  </h3>
                  <p style={{ color: "#4ade80", fontSize: "24px", fontWeight: "600", margin: 0 }}>21</p>
                  <p style={{ color: "#ccc", fontSize: "12px", margin: 0 }}>All systems operational</p>
                </div>
                <div style={{
                  padding: "15px",
                  background: "#181a1b",
                  borderRadius: "8px",
                  border: "1px solid #444"
                }}>
                  <h3 style={{ color: "#ffb347", fontSize: "16px", marginBottom: "10px" }}>
                    📋 Active Projects
                  </h3>
                  <p style={{ color: "#60a5fa", fontSize: "24px", fontWeight: "600", margin: 0 }}>3</p>
                  <p style={{ color: "#ccc", fontSize: "12px", margin: 0 }}>Music Coach, API Status, Piano Transcription</p>
                </div>
                <div style={{
                  padding: "15px",
                  background: "#181a1b",
                  borderRadius: "8px",
                  border: "1px solid #444"
                }}>
                  <h3 style={{ color: "#ffb347", fontSize: "16px", marginBottom: "10px" }}>
                    🔑 API Health
                  </h3>
                  <p style={{ 
                    color: apiStatus && apiStatus.health_percentage >= 90 ? "#4ade80" : 
                           apiStatus && apiStatus.health_percentage >= 75 ? "#f59e0b" : "#ef4444", 
                    fontSize: "24px", 
                    fontWeight: "600", 
                    margin: 0 
                  }}>
                    {apiStatus ? `${apiStatus.health_percentage}%` : '...'} 
                  </p>
                  <p style={{ color: "#ccc", fontSize: "12px", margin: 0 }}>
                    {apiStatus ? `${apiStatus.valid}/${apiStatus.total} keys valid` : 'Loading...'}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  style={{
                    padding: "12px 24px",
                    background: "#ffb347",
                    color: "#000",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    marginRight: "10px"
                  }}
                  onClick={() => alert('Strategic planning interface coming soon...')}
                >
                  🎯 Create Strategic Plan
                </button>
                <button
                  style={{
                    padding: "12px 24px",
                    background: "#232526",
                    color: "#ffb347",
                    border: "1px solid #ffb347",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                  onClick={() => alert('Agent coordination dashboard coming soon...')}
                >
                  🔄 View Agent Status
                </button>
              </div>
            </div>
          </div>

          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px",
            marginBottom: "25px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "15px"
            }}>
              📈 Recent Activity
            </h2>
            <div style={{
              padding: "20px",
              background: "#232526",
              borderRadius: "8px",
              border: "1px solid #444"
            }}>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}>
                {[
                  { time: "14:58", agent: "Music Coach", action: "Piano transcription service integrated", status: "✅" },
                  { time: "14:45", agent: "Music Coach", action: "Guitar tab service deployed", status: "✅" },
                  { time: "14:30", agent: "Architecture", action: "Cleaned unauthorized agent folders", status: "✅" },
                  { time: "14:15", agent: "Project Coordinator", action: "Page styling updated", status: "✅" }
                ].map((activity, index) => (
                  <div key={index} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    background: "#181a1b",
                    borderRadius: "6px",
                    border: "1px solid #333"
                  }}>
                    <div>
                      <span style={{ color: "#666", fontSize: "12px" }}>{activity.time}</span>
                      <span style={{ color: "#ffb347", fontSize: "14px", fontWeight: "600", marginLeft: "10px" }}>
                        {activity.agent}
                      </span>
                      <span style={{ color: "#ccc", fontSize: "14px", marginLeft: "10px" }}>
                        {activity.action}
                      </span>
                    </div>
                    <span style={{ fontSize: "16px" }}>{activity.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "15px"
            }}>
              �️ Management & Monitoring Tools
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px"
            }}>
              <Link
                href="/api-status"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  background: "#007bff",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  justifyContent: "center"
                }}
              >
                📊 API Status
              </Link>
              <Link
                href="/alert-config"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  background: "#dc3545",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  justifyContent: "center"
                }}
              >
                � Alert Config
              </Link>
              <Link
                href="/executive-alerts"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  background: "#6f42c1",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  justifyContent: "center"
                }}
              >
                ⚠️ Executive Alerts
              </Link>
              <Link
                href="/agents/project-coordinator"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  background: "#28a745",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px",
                  justifyContent: "center"
                }}
              >
                📋 Project Coordinator
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
